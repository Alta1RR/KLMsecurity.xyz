import { useState } from 'react'
import './shared.css'
import './CexMonitor.css'
import cexData from '../../jsons/cex_data.json'
import dexData from '../../jsons/DEX.json'

// Merge both JSON files by exchange name
const CIS_MAP = Object.fromEntries(
  dexData.map(d => [d.cex_name.toLowerCase(), d])
)

const EXCHANGES = cexData.exchanges.map(ex => ({
  ...ex,
  cis: CIS_MAP[ex.name.toLowerCase()] ?? null,
}))

function BlockedBadge({ cis }) {
  if (!cis) return null
  return cis.cis_blocking.is_blocked
    ? <span className="cex-badge cex-badge-blocked">РФ/РБ ⛔</span>
    : <span className="cex-badge cex-badge-ok">РФ/РБ ✓</span>
}

function KycBadge({ kyc }) {
  const noKyc = /не нужен|no kyc|optional/i.test(kyc)
  return (
    <span className={`cex-badge ${noKyc ? 'cex-badge-warn' : 'cex-badge-neutral'}`}>
      {noKyc ? 'KYC не требуется' : 'KYC'}
    </span>
  )
}

function HackBadge({ ex }) {
  const hasHack = ex.hack_incidents && ex.hack_incidents !== 'Инцидентов, связанных с безопасностью, не было.' && ex.hack_incidents !== '-'
  return hasHack
    ? <span className="cex-badge cex-badge-hack">Взлом ⚠</span>
    : <span className="cex-badge cex-badge-safe">Взломов нет ✓</span>
}

function ExchangeCard({ ex }) {
  const [open, setOpen] = useState(false)
  const hasHack = ex.hack_incidents && ex.hack_incidents !== 'Инцидентов, связанных с безопасностью, не было.' && ex.hack_incidents !== '-'

  return (
    <div className={`cex-card${open ? ' cex-card-open' : ''}`}>
      <button className="cex-card-header" onClick={() => setOpen(o => !o)}>
        <div className="cex-rank">#{ex.rank}</div>
        <div className="cex-main">
          <div className="cex-name-row">
            <span className="cex-name">{ex.name}</span>
            <div className="cex-badges">
              <KycBadge kyc={ex.kyc_required} />
              <BlockedBadge cis={ex.cis} />
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

          {ex.cis && (
            <div className="cex-section">
              <div className="cex-section-label">Доступность для СНГ</div>
              <p className="cex-text">{ex.cis.cis_blocking.details}</p>
            </div>
          )}

          {ex.cis?.safety_reason && (
            <div className="cex-section">
              <div className="cex-section-label">Репутация безопасности</div>
              <p className="cex-text">{ex.cis.safety_reason}</p>
            </div>
          )}

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
    if (filter === 'accessible') return ex.cis && !ex.cis.cis_blocking.is_blocked
    if (filter === 'blocked')    return !ex.cis || ex.cis.cis_blocking.is_blocked
    if (filter === 'no-kyc')     return /не нужен|no kyc|optional/i.test(ex.kyc_required)
    return true
  })

  return (
    <div className="tool-panel">
      <div className="tool-header">
        <div className="tool-eyebrow">Финансы · CEX · Безопасность</div>
        <h2 className="tool-title">CEX Мониторинг</h2>
        <p className="tool-subtitle">
          Рейтинг надёжности централизованных бирж: защита активов, инциденты безопасности,
          KYC требования и доступность для пользователей из РФ/РБ.
        </p>
      </div>

      <div className="cex-filters">
        {[
          { id: 'all',        label: 'Все биржи' },
          { id: 'accessible', label: 'Доступны в РФ/РБ' },
          { id: 'blocked',    label: 'Заблокированы' },
          { id: 'no-kyc',     label: 'Без KYC' },
        ].map(f => (
          <button key={f.id}
            className={`network-btn${filter === f.id ? ' active' : ''}`}
            onClick={() => setFilter(f.id)}
          >{f.label}</button>
        ))}
      </div>

      <ul className="tool-hints">
        <li>Данные актуальны на 2025–2026 год. Нажмите на биржу для подробностей.</li>
        <li>Блокировки РФ/РБ основаны на официальных заявлениях бирж.</li>
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
