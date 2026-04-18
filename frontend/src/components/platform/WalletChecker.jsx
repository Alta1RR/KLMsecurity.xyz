import { useState, useMemo } from 'react'
import './shared.css'

const NETWORK_OPTIONS = [
  { id: 'auto',     label: 'Авто' },
  { id: 'ethereum', label: 'Ethereum' },
  { id: 'bsc',      label: 'BNB Chain' },
  { id: 'polygon',  label: 'Polygon' },
  { id: 'solana',   label: 'Solana' },
]

const NETWORK_LABELS = {
  auto: 'Автоопределение', ethereum: 'Ethereum',
  bsc: 'BNB Chain', polygon: 'Polygon', solana: 'Solana',
}

function buildMockReport(wallet, selectedNetwork) {
  const seed = [...wallet].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  const score = 42 + (seed % 53)
  const riskLevel = score >= 80 ? 'Низкий' : score >= 62 ? 'Средний' : 'Высокий'
  const detected = wallet.startsWith('0x') ? 'EVM (ETH/BSC/Base)' : wallet.length > 40 ? 'Solana' : 'Не определена'
  const network = selectedNetwork === 'auto' ? detected : NETWORK_LABELS[selectedNetwork]

  const pool = [
    'Связь с адресами из watchlist',
    'Подозрительная активность в новых контрактах',
    'Повышенная доля high-risk контрагентов',
    'Резкие пики переводов за 24ч',
    'Взаимодействия с bridge-протоколами',
  ]

  const findings = pool
    .map((text, i) => ({
      text,
      severity: (seed + i) % 3 === 0 ? 'high' : (seed + i) % 2 === 0 ? 'medium' : 'low',
    }))
    .slice(0, 3)

  return {
    wallet, score, riskLevel, network,
    requestedNetwork: NETWORK_LABELS[selectedNetwork],
    txCount: 280 + (seed % 4200),
    exposure: (seed % 39) + 1,
    findings,
  }
}

function severityLabel(s) {
  return s === 'high' ? 'Высокий' : s === 'medium' ? 'Средний' : 'Низкий'
}

export default function WalletChecker() {
  const [wallet,  setWallet]  = useState('')
  const [network, setNetwork] = useState('auto')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [report,  setReport]  = useState(null)

  const checkedAt = useMemo(() => {
    if (!report) return ''
    return new Date().toLocaleString('ru-RU')
  }, [report])

  const handleSubmit = e => {
    e.preventDefault()
    const addr = wallet.trim()
    if (!addr)         { setError('Введите адрес кошелька.'); setReport(null); return }
    if (addr.length < 24) { setError('Адрес слишком короткий.'); setReport(null); return }
    setError(''); setLoading(true); setReport(null)
    setTimeout(() => { setReport(buildMockReport(addr, network)); setLoading(false) }, 1100)
  }

  return (
    <div className="tool-panel">
      <div className="tool-header">
        <div className="tool-eyebrow">Web3 Infrastructure · Core</div>
        <h2 className="tool-title">Проверка кошелька</h2>
        <p className="tool-subtitle">
          Полный анализ адреса: история транзакций, связи со скам-адресами, баланс по всем сетям
          и оценка уровня риска. Поддержка ETH, BSC, SOL, MATIC и ещё 2 сетей.
        </p>
      </div>

      <div className="network-picker">
        <div className="network-picker-label">Сеть</div>
        <div className="network-buttons" role="group">
          {NETWORK_OPTIONS.map(opt => (
            <button
              key={opt.id}
              type="button"
              className={`network-btn${network === opt.id ? ' active' : ''}`}
              onClick={() => setNetwork(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <form className="tool-input-row" onSubmit={handleSubmit}>
        <input
          className="tool-input"
          type="text"
          value={wallet}
          onChange={e => setWallet(e.target.value)}
          placeholder="0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
          autoComplete="off"
        />
        <button className="tool-submit" type="submit" disabled={loading}>
          {loading ? 'Анализ...' : 'Проверить'}
        </button>
      </form>

      {error && <div className="tool-error">{error}</div>}

      <ul className="tool-hints">
        <li>Поддерживаются форматы EVM и Solana.</li>
        <li>Результаты демонстрационные — backend подключается позже.</li>
      </ul>

      <div className="report-card">
        {!loading && !report && (
          <div className="report-empty">
            <h2>Ожидаем адрес</h2>
            <p>После запуска анализа здесь появится score, риск-профиль и найденные сигналы.</p>
          </div>
        )}

        {loading && (
          <div className="skeleton-lines">
            <div className="skel-line w-90" />
            <div className="skel-line w-60" />
            <div className="skel-line w-75" />
            <div className="skel-line w-45" />
          </div>
        )}

        {report && (
          <div>
            <div className="report-head">
              <div className="score-badge-big">{report.score}</div>
              <div>
                <div className="report-label">Security Score</div>
                <div className="report-risk">Риск: {report.riskLevel}</div>
                <div className="report-addr">{report.wallet}</div>
              </div>
            </div>

            <div className="report-grid">
              <div className="report-item"><span>Запрошенная сеть</span><strong>{report.requestedNetwork}</strong></div>
              <div className="report-item"><span>Определённая сеть</span><strong>{report.network}</strong></div>
              <div className="report-item"><span>Транзакций</span><strong>{report.txCount.toLocaleString('ru-RU')}</strong></div>
              <div className="report-item"><span>Exposure</span><strong>{report.exposure}%</strong></div>
              <div className="report-item"><span>Проверено</span><strong>{checkedAt}</strong></div>
            </div>

            <div className="findings">
              <h3>Сигналы риска</h3>
              <ul>
                {report.findings.map(f => (
                  <li key={f.text}>
                    <span className={`severity severity-${f.severity}`}>{severityLabel(f.severity)}</span>
                    {f.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
