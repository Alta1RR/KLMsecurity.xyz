const CHAIN_NAME_MAP = {
  auto: null,
  ethereum: 'Ethereum',
  bsc: 'BNB',
  polygon: 'Polygon',
  solana: 'Solana',
}

function detectChainByAddress(address) {
  if (address.startsWith('0x')) return 'Ethereum'
  if (!address.startsWith('0x') && address.length >= 32 && address.length <= 44) return 'Solana'
  return 'Ethereum'
}

function emptySource(source) {
  return {
    source,
    supported: true,
    available: false,
    flagged: false,
    status: 'unavailable',
    summary: 'Нет данных',
    details: [],
  }
}

function normalizeWalletReport(payload, chainName) {
  const scorechain = payload.scorechain ?? emptySource('Scorechain AML')
  const goplus = payload.goPlus ?? payload.goplus ?? emptySource('GoPlus')
  const internalReports = payload.internalReports ?? emptySource('Внутренняя БД жалоб')

  return {
    raw: payload,
    ok: true,
    error: payload.verdict === 'ERROR',
    safe: Boolean(payload.safe),
    dangerous: Boolean(payload.dangerous),
    reviewRequired: Boolean(payload.reviewRequired),
    verdict: payload.verdict ?? null,
    verdictSummary: payload.verdictSummary ?? '',
    score: Number.isFinite(payload.score) ? payload.score : 0,
    riskLevel: payload.riskLevel ?? 'UNKNOWN',
    checkedAt: payload.checkedAt ?? null,
    wallet: payload.target ?? '',
    requestedNetwork: payload.requestedChainName ?? chainName,
    network: payload.resolvedChainName ?? payload.network ?? null,
    chainId: payload.chainId ?? null,
    chainSymbol: payload.chainSymbol ?? null,
    balance: payload.balance ?? { available: false, display: 'Недоступно', note: null },
    scorechain,
    goplus,
    internalReports,
    signals: Array.isArray(payload.signals) ? payload.signals : [],
    sections: Array.isArray(payload.sections) ? payload.sections : [],
  }
}

/**
 * Full wallet audit via backend.
 * Returns structured JSON with source statuses, balance and detailed evidence.
 */
export async function checkAddress(target, networkId = 'auto') {
  const chainName = networkId === 'auto'
    ? detectChainByAddress(target)
    : (CHAIN_NAME_MAP[networkId] ?? 'Ethereum')

  const res = await fetch(
    `/api/v1/check/details?target=${encodeURIComponent(target)}&chainName=${encodeURIComponent(chainName)}`
  )

  const contentType = res.headers.get('content-type') || ''
  if (!res.ok) {
    const body = contentType.includes('application/json')
      ? JSON.stringify(await res.json())
      : await res.text()
    throw new Error(body || 'Wallet check failed')
  }

  if (contentType.includes('application/json')) {
    return normalizeWalletReport(await res.json(), chainName)
  }

  return parseLegacyWalletReport(await res.text(), chainName)
}

/**
 * URL safety check via VirusTotal (backend proxy).
 */
export async function checkUrl(url) {
  const res = await fetch(`/api/v1/check-url?url=${encodeURIComponent(url)}`)
  const text = await res.text()
  return parseUrlReport(text, url)
}

/**
 * Submit a scam report to the internal DB.
 * @param {{ address: string, walletName?: string, scamType: string, description: string }} report
 */
export async function submitReport(report) {
  const res = await fetch('/api/v1/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  })
  const text = await res.text()
  return { ok: res.ok, message: text }
}

/**
 * Search chains by partial name.
 */
export async function searchChains(name) {
  const res = await fetch(`/api/v1/chains/search?name=${encodeURIComponent(name)}`)
  if (!res.ok) return []
  return res.json()
}

function parseLegacyWalletReport(text, chainName) {
  const legacy = {
    raw: text,
    ok: false,
    safe: false,
    dangerous: false,
    reviewRequired: false,
    error: false,
    verdict: null,
    verdictSummary: '',
    score: 0,
    riskLevel: 'UNKNOWN',
    checkedAt: new Date().toISOString(),
    wallet: '',
    requestedNetwork: chainName,
    network: null,
    balance: { available: false, display: 'Недоступно', note: null },
    internalReports: emptySource('Внутренняя БД жалоб'),
    scorechain: emptySource('Scorechain AML'),
    goplus: emptySource('GoPlus'),
    signals: [],
    sections: [],
  }

  if (text.startsWith('❌')) {
    legacy.error = true
    legacy.verdict = 'ERROR'
    legacy.verdictSummary = text
    return legacy
  }

  legacy.ok = true

  const walletMatch = text.match(/КОШЕЛЬКА:\s*(.+)/)
  if (walletMatch) legacy.wallet = walletMatch[1].trim()

  const balanceMatch = text.match(/💰 Текущий баланс:\s*(.+)/)
  if (balanceMatch) {
    legacy.balance = {
      available: !balanceMatch[1].includes('Недоступно'),
      display: balanceMatch[1].trim(),
      note: null,
    }
  }

  const networkMatch = text.match(/🌐 Сеть:\s*(.+)/)
  if (networkMatch) legacy.network = networkMatch[1].trim()

  if (text.includes('Найдено жалоб') || text.includes('Найдено репортов')) {
    legacy.internalReports = {
      ...emptySource('Внутренняя БД жалоб'),
      available: true,
      flagged: true,
      status: 'danger',
      summary: 'Адрес найден во внутренней базе жалоб.',
      details: [],
    }
  } else {
    legacy.internalReports = {
      ...emptySource('Внутренняя БД жалоб'),
      available: true,
      status: 'ok',
      summary: 'Жалоб в базе не найдено.',
    }
  }

  if (text.includes('Санкционных ограничений не найдено')) {
    legacy.scorechain = {
      ...emptySource('Scorechain AML'),
      available: true,
      status: 'ok',
      summary: 'Санкционных ограничений не найдено.',
    }
  } else if (text.includes('САНКЦИИ')) {
    legacy.scorechain = {
      ...emptySource('Scorechain AML'),
      available: true,
      flagged: true,
      status: 'danger',
      summary: 'Scorechain отметил риск по адресу.',
    }
  }

  if (text.includes('Технических угроз') || text.includes('Технических уязвимостей не найдено')) {
    legacy.goplus = {
      ...emptySource('GoPlus'),
      available: true,
      status: 'ok',
      summary: 'Технических угроз не найдено.',
    }
  } else if (text.includes('Найдены технические угрозы')) {
    legacy.goplus = {
      ...emptySource('GoPlus'),
      available: true,
      flagged: true,
      status: 'danger',
      summary: 'Найдены технические угрозы.',
      details: [],
    }
  }

  if (text.includes('ОПАСНО') || text.includes('⛔')) {
    legacy.dangerous = true
    legacy.verdict = 'DANGEROUS'
    legacy.verdictSummary = 'Обнаружены сигналы риска.'
    legacy.score = 25
    legacy.riskLevel = 'HIGH'
  } else if (text.includes('РУЧНОЙ ПРОВЕРКИ')) {
    legacy.reviewRequired = true
    legacy.verdict = 'REVIEW'
    legacy.verdictSummary = 'Часть источников недоступна.'
    legacy.score = 60
    legacy.riskLevel = 'MEDIUM'
  } else {
    legacy.safe = true
    legacy.verdict = 'SAFE'
    legacy.verdictSummary = 'Явные сигналы риска не обнаружены.'
    legacy.score = 95
    legacy.riskLevel = 'LOW'
  }

  if (legacy.dangerous) {
    legacy.signals.push({ severity: 'high', text: 'Legacy backend вернул опасный вердикт.', source: 'system' })
  } else if (legacy.safe) {
    legacy.signals.push({ severity: 'low', text: 'Legacy backend не обнаружил явных угроз.', source: 'system' })
  }

  return legacy
}

function parseUrlReport(text, url) {
  const r = {
    raw: text,
    url,
    safe: false,
    dangerous: false,
    error: false,
    malicious: 0,
    suspicious: 0,
  }

  if (text.startsWith('❌') || text.includes('Ошибка')) {
    r.error = true
    return r
  }

  if (text.includes('ОПАСНО') || text.includes('❌')) {
    r.dangerous = true
    const malMatch = text.match(/Вредоносных пометок:\s*(\d+)/)
    if (malMatch) r.malicious = parseInt(malMatch[1], 10)
    const susMatch = text.match(/Подозрительных пометок:\s*(\d+)/)
    if (susMatch) r.suspicious = parseInt(susMatch[1], 10)
  } else {
    r.safe = true
  }

  return r
}
