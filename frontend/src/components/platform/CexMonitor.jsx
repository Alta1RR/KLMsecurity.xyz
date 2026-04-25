import { useState } from 'react'
import './shared.css'
import './CexMonitor.css'
import cexData from '../../jsons/cex_data.json'

const EXCHANGES = cexData.exchanges

function KycBadge({ kyc }) {
  const noKyc = /не нужен|no kyc|optional/i.test(kyc)
  return (
    <span className={`cex-badge ${noKyc ? 'cex-badge-warn' : 'cex-badge-neutral'}`}>
      {noKyc ? 'KYC не требуется' : 'KYC'}
    </span>
  )
}

function hasHackIncident(ex) {
  return ex.hack_incidents && ex.hack_incidents !== 'Инцидентов, связанных с безопасностью, не было.' && ex.hack_incidents !== '-'
}

function HackBadge({ ex }) {
  const hasHack = hasHackIncident(ex)
  return hasHack
    ? <span className="cex-badge cex-badge-hack">Взлом ⚠</span>
    : <span className="cex-badge cex-badge-safe">Взломов нет ✓</span>
}

function ExchangeCard({ ex }) {
  const [open, setOpen] = useState(false)
  const hasHack = hasHackIncident(ex)

  return (
    <div className={`cex-card${open ? ' cex-card-open' : ''}`}>
      <button className="cex-card-header" onClick={() => setOpen(o => !o)}>
        <div className="cex-rank">#{ex.rank}</div>
        <div className="cex-main">
          <div className="cex-name-row">
            <span className="cex-name">{ex.name}</span>
            <div className="cex-badges">
              <KycBadge kyc={ex.kyc_required} />
              <HackBadge ex={ex} />
            </div>
          </div>
          <div className="cex-brief">{ex.security_brief}</div>
        </div>
        <div className="cex-chevron">{open ? '▲' : '▼'}</div>
      </button>

      {open && (
        <div className="cex-details">
          <div className="cex-section">
            <div className="cex-section-label">О бирже</div>
            <p className="cex-text">{ex.info}</p>
          </div>

          <div className="cex-section">
            <div className="cex-section-label">Защита пользователей</div>
            <p className="cex-text">{ex.protection_details}</p>
          </div>

          {hasHack && (
            <div className="cex-section cex-section-danger">
              <div className="cex-section-label">Инциденты безопасности</div>
              <p className="cex-text">{ex.hack_details || ex.hack_incidents}</p>
              {ex.hack_sources?.length > 0 && (
                <div className="cex-sources">
                  {ex.hack_sources.map(s => (
                    <a key={s.url} className="cex-source-link" href={s.url} target="_blank" rel="noopener noreferrer">
                      ↗ {s.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="cex-footer-links">
            <a className="cex-link" href={ex.url} target="_blank" rel="noopener noreferrer">
              Открыть биржу ↗
            </a>
            {ex.certik_url && (
              <a className="cex-link cex-link-certik" href={ex.certik_url} target="_blank" rel="noopener noreferrer">
                CertiK Skynet ↗
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CexMonitor() {
  const [filter, setFilter] = useState('all')

  const filtered = EXCHANGES.filter(ex => {
    if (filter === 'kyc')        return !/не нужен|no kyc|optional|не обязательна/i.test(ex.kyc_required)
    if (filter === 'no-kyc')     return /не нужен|no kyc|optional|не обязательна/i.test(ex.kyc_required)
    if (filter === 'incidents')  return hasHackIncident(ex)
    return true
  })

  return (
    <div className="tool-panel">
      <div className="tool-header">
        <div className="tool-eyebrow">Финансы · CEX · Безопасность</div>
        <h2 className="tool-title">Рейтинг CEX</h2>
        <p className="tool-subtitle">
          Рейтинг надёжности централизованных бирж: защита активов, инциденты безопасности,
          KYC требования и ключевые меры защиты пользователей.
        </p>
      </div>

      <div className="cex-filters">
        {[
          { id: 'all',       label: 'Все биржи' },
          { id: 'kyc',       label: 'KYC' },
          { id: 'no-kyc',    label: 'Без/опц. KYC' },
          { id: 'incidents', label: 'С инцидентами' },
        ].map(f => (
          <button key={f.id}
            className={`network-btn${filter === f.id ? ' active' : ''}`}
            onClick={() => setFilter(f.id)}
          >{f.label}</button>
        ))}
      </div>

      <ul className="tool-hints">
        <li>Данные актуальны на 2025–2026 год. Нажмите на биржу для подробностей.</li>
        <li>Рейтинг учитывает защиту активов, историю инцидентов, KYC и публичные механизмы резервов.</li>
      </ul>

      <div className="cex-list">
        {filtered.length === 0 && (
          <div className="report-empty" style={{ border: '1px dashed rgba(255,255,255,0.08)', padding: '48px 24px' }}>
            <h2>Нет результатов</h2>
            <p>Попробуйте другой фильтр.</p>
          </div>
        )}
        {filtered.map(ex => <ExchangeCard key={ex.name} ex={ex} />)}
      </div>
    </div>
  )
}
