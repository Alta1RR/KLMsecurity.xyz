import { useMemo, useState } from 'react'
import './shared.css'
import './Checker.css'
import { checkAddress, submitReport } from '../../api/security'

const NETWORK_OPTIONS = [
  { id: 'auto', label: 'Авто' },
  { id: 'ethereum', label: 'Ethereum' },
  { id: 'bsc', label: 'BNB Chain' },
  { id: 'polygon', label: 'Polygon' },
  { id: 'solana', label: 'Solana' },
]

const NETWORK_LABELS = {
  auto: 'Автоопределение',
  ethereum: 'Ethereum',
  bsc: 'BNB Chain',
  polygon: 'Polygon',
  solana: 'Solana',
}

const SCAM_TYPES = [
  'Фишинг', 'Скам / Мошенничество', 'Rug Pull', 'Honeypot',
  'Fake Token', 'Drainer', 'Другое',
]

function severityLabel(severity) {
  return severity === 'high' ? 'Высокий' : severity === 'medium' ? 'Средний' : 'Низкий'
}

function riskLabel(level) {
  return level === 'LOW' ? 'Низкий' : level === 'MEDIUM' ? 'Средний' : level === 'HIGH' ? 'Высокий' : 'Не определён'
}

function sourceValue(source) {
  if (!source?.supported) return 'Не поддерживается'
  if (!source?.available) return 'Недоступно'
  if (source.flagged) return 'Риск ⚠'
  return 'Чист ✓'
}

function sourceTone(source) {
  return {
    danger: Boolean(source?.flagged),
    warn: source?.supported === false || source?.available === false,
    ok: Boolean(source?.available) && !source?.flagged,
  }
}

function formatCheckedAt(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('ru-RU')
}

function sectionStatusLabel(status) {
  if (status === 'danger') return 'Риск'
  if (status === 'warn') return 'Проверить'
  if (status === 'ok') return 'Ок'
  return 'Инфо'
}

function ScoreBadge({ report }) {
  const score = report?.score ?? 0
  const style = report?.dangerous
    ? { background: 'linear-gradient(135deg,#b91c1c,#ef4444)' }
    : report?.reviewRequired
      ? { background: 'linear-gradient(135deg,#b45309,#f59e0b)' }
      : { background: 'linear-gradient(135deg,#059669,#10b981)' }

  return <div className="score-badge-big" style={style}>{score}</div>
}

function Skeleton() {
  return (
    <div className="skeleton-lines">
      <div className="skel-line w-90" />
      <div className="skel-line w-60" />
      <div className="skel-line w-75" />
      <div className="skel-line w-45" />
    </div>
  )
}

function ReportGrid({ rows }) {
  return (
    <div className="report-grid">
      {rows.map(row => (
        <div className="report-item" key={row.label}>
          <span>{row.label}</span>
          <strong style={
            row.danger ? { color: 'var(--danger)' } :
            row.warn ? { color: '#f59e0b' } :
            row.ok ? { color: 'var(--accent2)' } : {}
          }>
            {row.value}
          </strong>
        </div>
      ))}
    </div>
  )
}

function Findings({ findings }) {
  if (!findings || findings.length === 0) return null
  return (
    <div className="findings">
      <h3>Сигналы риска</h3>
      <ul>
        {findings.map((finding, index) => (
          <li key={`${finding.text}-${index}`}>
            <span className={`severity severity-${finding.severity}`}>{severityLabel(finding.severity)}</span>
            <span>
              {finding.text}
              {finding.source && finding.source !== 'system' ? ` · ${finding.source}` : ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function VerdictBanner({ report }) {
  if (!report) return null

  if (report.dangerous) {
    return (
      <div className="verdict-banner verdict-danger">
        ⛔ ОПАСНО — адрес отмечен как рискованный. Не используйте его без ручной верификации.
      </div>
    )
  }

  if (report.reviewRequired) {
    return (
      <div className="verdict-banner verdict-review">
        🟡 ТРЕБУЕТ РУЧНОЙ ПРОВЕРКИ — часть источников недоступна или не поддерживается.
      </div>
    )
  }

  if (report.safe) {
    return (
      <div className="verdict-banner verdict-safe">
        🟢 БЕЗОПАСНО — по всем доступным источникам явных угроз не найдено.
      </div>
    )
  }

  return null
}

function DetailedSections({ sections }) {
  if (!sections?.length) return null
  return (
    <div className="report-sections">
      <h3 className="report-sections-title">Подробный отчёт</h3>
      <div className="report-sections-grid">
        {sections.map((section, index) => (
          <div className="report-section-card" key={`${section.title}-${index}`}>
            <div className="report-section-head">
              <div className="report-section-title">{section.title}</div>
              <span className={`report-section-pill report-section-pill-${section.status ?? 'neutral'}`}>
                {sectionStatusLabel(section.status)}
              </span>
            </div>
            <p className="report-section-summary">{section.summary}</p>
            {section.details?.length > 0 && (
              <ul className="report-section-list">
                {section.details.map((detail, detailIndex) => (
                  <li key={`${section.title}-detail-${detailIndex}`}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function WalletPanel() {
  const [wallet, setWallet] = useState('')
  const [network, setNetwork] = useState('auto')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [report, setReport] = useState(null)

  const submit = async e => {
    e.preventDefault()
    const value = wallet.trim()

    if (!value) {
      setError('Введите адрес кошелька.')
      setReport(null)
      return
    }

    if (value.length < 24) {
      setError('Адрес слишком короткий.')
      setReport(null)
      return
    }

    setError('')
    setLoading(true)
    setReport(null)

    try {
      const data = await checkAddress(value, network)
      setReport(data)
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Нет связи с сервером.')
    } finally {
      setLoading(false)
    }
  }

  const checkedAt = useMemo(() => formatCheckedAt(report?.checkedAt), [report])

  const gridRows = useMemo(() => {
    if (!report) return []

    const scorechainTone = sourceTone(report.scorechain)
    const goplusTone = sourceTone(report.goplus)
    const internalTone = sourceTone(report.internalReports)

    return [
      { label: 'Запрошенная сеть', value: NETWORK_LABELS[network] ?? report.requestedNetwork ?? 'Авто' },
      { label: 'Определённая сеть', value: report.network ?? 'Не определена', warn: !report.network },
      {
        label: 'Баланс',
        value: report.balance?.display ?? 'Недоступно',
        warn: report.balance?.available === false,
      },
      {
        label: 'Scorechain AML',
        value: sourceValue(report.scorechain),
        ...scorechainTone,
      },
      {
        label: 'GoPlus',
        value: sourceValue(report.goplus),
        ...goplusTone,
      },
      {
        label: 'Жалобы в БД',
        value: report.internalReports?.flagged
          ? report.internalReports.summary ?? 'Есть жалобы'
          : 'Нет',
        ...internalTone,
      },
      { label: 'Security Score', value: `${report.score}/100` },
      { label: 'Проверено', value: checkedAt || '—' },
      { label: 'Вердикт', value: report.verdictSummary || '—', warn: report.reviewRequired, danger: report.dangerous, ok: report.safe },
    ]
  }, [report, checkedAt, network])

  const findings = useMemo(() => {
    if (!report) return []
    if (report.signals?.length) return report.signals
    if (report.verdictSummary) {
      return [{
        severity: report.dangerous ? 'high' : report.reviewRequired ? 'medium' : 'low',
        text: report.verdictSummary,
        source: 'system',
      }]
    }
    return []
  }, [report])

  return (
    <>
      <div className="checker-network">
        <div className="network-picker-label">Сеть</div>
        <div className="network-buttons">
          {NETWORK_OPTIONS.map(option => (
            <button
              key={option.id}
              type="button"
              className={`network-btn${network === option.id ? ' active' : ''}`}
              onClick={() => setNetwork(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <form className="tool-input-row" onSubmit={submit}>
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
        <li>Проверка криптокошелька (AML-анализ) критична для защиты активов от блокировки на биржах, так как позволяет выявить «грязную» криптовалюту, связанную с мошенничеством, даркнетом или санкциями. Это предотвращает потерю средств, взаимодействие с преступными схемами и помогает соблюдать закон, проверяя контрагента перед сделкой.</li>
      </ul>

      <div className="report-card">
        {!loading && !report && (
          <div className="report-empty">
            <h2>Ожидаем адрес</h2>
            <p>После запуска анализа здесь появятся баланс, статусы источников и развёрнутый отчёт по найденным сигналам.</p>
          </div>
        )}

        {loading && <Skeleton />}

        {report && (
          <div>
            {report.error ? (
              <div className="tool-error" style={{ margin: 0 }}>
                {report.verdictSummary || 'Проверка завершилась ошибкой.'}
              </div>
            ) : (
              <>
                <VerdictBanner report={report} />

                <div className="report-head">
                  <ScoreBadge report={report} />
                  <div>
                    <div className="report-label">Security Score</div>
                    <div className="report-risk">Риск: {riskLabel(report.riskLevel)}</div>
                    <div className="report-addr">{report.wallet || wallet}</div>
                  </div>
                </div>

                <ReportGrid rows={gridRows} />
                <Findings findings={findings} />
                <DetailedSections sections={report.sections} />
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}

function ReportPanel() {
  const [address, setAddress] = useState('')
  const [walletName, setWalletName] = useState('')
  const [scamType, setScamType] = useState(SCAM_TYPES[0])
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const submit = async e => {
    e.preventDefault()

    if (!address.trim()) {
      setResult({ ok: false, message: 'Введите адрес.' })
      return
    }

    if (!description.trim()) {
      setResult({ ok: false, message: 'Опишите проблему.' })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await submitReport({
        address: address.trim(),
        walletName: walletName.trim() || undefined,
        scamType,
        description: description.trim(),
      })
      setResult(response)
      if (response.ok) {
        setAddress('')
        setWalletName('')
        setDescription('')
      }
    } catch {
      setResult({ ok: false, message: 'Нет связи с сервером.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ul className="tool-hints">
        <li>Жалоба сохраняется в базу и сразу влияет на следующий аудит этого адреса.</li>
        <li>Опишите ущерб и схему подробнее: эти детали теперь попадают в развёрнутый отчёт.</li>
      </ul>

      <form className="report-form" onSubmit={submit}>
        <div className="report-form-row">
          <label className="rf-label">Адрес *</label>
          <input
            className="tool-input"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="0x... или Solana адрес"
            autoComplete="off"
          />
        </div>

        <div className="report-form-row">
          <label className="rf-label">Имя кошелька / название проекта</label>
          <input
            className="tool-input"
            value={walletName}
            onChange={e => setWalletName(e.target.value)}
            placeholder="Например: FakeUSDT, ScamBridge"
            autoComplete="off"
          />
        </div>

        <div className="report-form-row">
          <label className="rf-label">Тип скама *</label>
          <div className="network-buttons" style={{ flexWrap: 'wrap' }}>
            {SCAM_TYPES.map(type => (
              <button
                key={type}
                type="button"
                className={`network-btn${scamType === type ? ' active' : ''}`}
                onClick={() => setScamType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="report-form-row">
          <label className="rf-label">Описание *</label>
          <textarea
            className="tool-input report-textarea"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Опишите ситуацию: как был использован адрес, какой ущерб нанесён..."
            rows={4}
          />
        </div>

        {result && (
          <div className={result.ok ? 'report-success' : 'tool-error'}>
            {result.message}
          </div>
        )}

        <button
          className="tool-submit"
          type="submit"
          disabled={loading}
          style={{ alignSelf: 'flex-start', padding: '11px 32px' }}
        >
          {loading ? 'Отправка...' : 'Отправить жалобу'}
        </button>
      </form>
    </>
  )
}

const TABS = [
  {
    id: 'wallet',
    label: 'Проверка кошелька',
    title: 'Аудит кошелька',
    subtitle: 'Комплексный анализ: баланс, AML-санкции, технические сигналы и репорты сообщества в одном отчёте.',
    panel: WalletPanel,
  },
  {
    id: 'report',
    label: 'Сообщить о скаме',
    title: 'Жалоба на адрес',
    subtitle: 'Сообщите о мошенническом адресе. Жалоба попадёт в базу и будет показана в следующих проверках.',
    panel: ReportPanel,
  },
]

export default function Checker() {
  const [tab, setTab] = useState('wallet')
  const active = TABS.find(item => item.id === tab)
  const Panel = active.panel

  return (
    <div className="tool-panel">
      <div className="tool-header">
        <h2 className="tool-title">{active.title}</h2>
        <p className="tool-subtitle">{active.subtitle}</p>
      </div>

      <div className="checker-tabs">
        {TABS.map(item => (
          <button
            key={item.id}
            className={`checker-tab${tab === item.id ? ' active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <Panel />
    </div>
  )
}
