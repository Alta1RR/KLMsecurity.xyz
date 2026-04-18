import { useState, useMemo } from 'react'
import './shared.css'

function buildMockReport(address) {
  const seed = [...address].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  const isHoneypot = (seed % 3) === 0
  const liquidityUsd = 5000 + (seed % 900000)
  const holders = 120 + (seed % 48000)
  const riskScore = isHoneypot ? 15 + (seed % 20) : 60 + (seed % 35)

  return {
    address,
    isHoneypot,
    riskScore,
    riskLevel: riskScore >= 70 ? 'Низкий' : riskScore >= 45 ? 'Средний' : 'Высокий',
    liquidityUsd,
    holders,
    verified: (seed % 2) === 0,
    mintable: (seed % 4) === 0,
    findings: [
      { text: isHoneypot ? 'Honeypot механизм обнаружен в контракте' : 'Honeypot механизм не обнаружен', severity: isHoneypot ? 'high' : 'low' },
      { text: (seed % 4) === 0 ? 'Функция mint присутствует' : 'Функция mint отсутствует', severity: (seed % 4) === 0 ? 'medium' : 'low' },
      { text: liquidityUsd < 50000 ? 'Низкая ликвидность — риск rug pull' : 'Ликвидность в норме', severity: liquidityUsd < 50000 ? 'medium' : 'low' },
    ],
  }
}

function severityLabel(s) {
  return s === 'high' ? 'Высокий' : s === 'medium' ? 'Средний' : 'Низкий'
}

export default function TokenChecker() {
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [report,  setReport]  = useState(null)

  const checkedAt = useMemo(() => {
    if (!report) return ''
    return new Date().toLocaleString('ru-RU')
  }, [report])

  const handleSubmit = e => {
    e.preventDefault()
    const addr = address.trim()
    if (!addr)           { setError('Введите адрес контракта.'); setReport(null); return }
    if (addr.length < 20){ setError('Адрес слишком короткий.'); setReport(null); return }
    setError(''); setLoading(true); setReport(null)
    setTimeout(() => { setReport(buildMockReport(addr)); setLoading(false) }, 1100)
  }

  return (
    <div className="tool-panel">
      <div className="tool-header">
        <div className="tool-eyebrow">Web3 Infrastructure</div>
        <h2 className="tool-title">Проверка токена</h2>
        <p className="tool-subtitle">
          Honeypot детектор, аудит смарт-контракта, анализ ликвидности и проверка прав владельца.
        </p>
      </div>

      <form className="tool-input-row" onSubmit={handleSubmit}>
        <input
          className="tool-input"
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="Адрес контракта токена (EVM)"
          autoComplete="off"
        />
        <button className="tool-submit" type="submit" disabled={loading}>
          {loading ? 'Анализ...' : 'Проверить'}
        </button>
      </form>

      {error && <div className="tool-error">{error}</div>}

      <ul className="tool-hints">
        <li>Поддерживаются EVM-совместимые контракты (ETH, BSC, Polygon).</li>
        <li>Результаты демонстрационные — backend подключается позже.</li>
      </ul>

      <div className="report-card">
        {!loading && !report && (
          <div className="report-empty">
            <h2>Ожидаем адрес контракта</h2>
            <p>После анализа здесь появится статус honeypot, аудит прав и данные ликвидности.</p>
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
              <div className="score-badge-big" style={report.riskScore < 45 ? { background: 'var(--danger)' } : {}}>
                {report.riskScore}
              </div>
              <div>
                <div className="report-label">Contract Score</div>
                <div className="report-risk">Риск: {report.riskLevel}</div>
                <div className="report-addr">{report.address}</div>
              </div>
            </div>

            <div className="report-grid">
              <div className="report-item"><span>Honeypot</span><strong style={{ color: report.isHoneypot ? 'var(--danger)' : 'var(--accent2)' }}>{report.isHoneypot ? 'Да ⚠' : 'Нет ✓'}</strong></div>
              <div className="report-item"><span>Верифицирован</span><strong>{report.verified ? 'Да' : 'Нет'}</strong></div>
              <div className="report-item"><span>Mint функция</span><strong style={{ color: report.mintable ? '#fb923c' : 'rgba(255,255,255,0.6)' }}>{report.mintable ? 'Есть' : 'Нет'}</strong></div>
              <div className="report-item"><span>Ликвидность</span><strong>${report.liquidityUsd.toLocaleString('ru-RU')}</strong></div>
              <div className="report-item"><span>Холдеры</span><strong>{report.holders.toLocaleString('ru-RU')}</strong></div>
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
