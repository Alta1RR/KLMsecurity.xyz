import { useState } from 'react'
import './shared.css'
import './DexAnalytics.css'
import dexData from '../../jsons/DEX.json'

const FILTERS = [
  { id: 'all', label: 'Все' },
  { id: 'amm', label: 'AMM' },
  { id: 'order', label: 'Order book' },
  { id: 'aggregator', label: 'Агрегаторы' },
]

function getCategory(type) {
  const value = type.toLowerCase()
  if (value.includes('order')) return 'order'
  if (value.includes('агрегатор')) return 'aggregator'
  if (value.includes('amm') || value.includes('bonding')) return 'amm'
  return 'all'
}

function DexCard({ dex }) {
  const [open, setOpen] = useState(false)
  const networks = dex.networks ?? []

  return (
    <div className={`dex-card${open ? ' dex-card-open' : ''}`}>
      <button className="dex-card-header" onClick={() => setOpen(o => !o)}>
        <div className="dex-rank">#{dex.rank}</div>
        <div className="dex-main">
          <div className="dex-name-row">
            <span className="dex-name">{dex.name}</span>
            <div className="dex-badges">
              <span className="cex-badge cex-badge-neutral">{dex.type}</span>
              {networks.slice(0, 3).map(network => (
                <span className="cex-badge cex-badge-neutral" key={network}>{network}</span>
              ))}
            </div>
          </div>
          <div className="dex-meta">
            <span className="dex-tvl">{networks.length} сетей</span>
            <span className="dex-desc-short">{dex.fees}</span>
          </div>
        </div>
        <div className="cex-chevron">{open ? '▲' : '▼'}</div>
      </button>

      {open && (
        <div className="dex-details">
          <div className="cex-section">
            <div className="cex-section-label">Комиссии</div>
            <p className="cex-text">{dex.fees}</p>
          </div>

          <div className="cex-section">
            <div className="cex-section-label">Особенности</div>
            <ul className="dex-points">
              {dex.features.map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>

          <div className="cex-section">
            <div className="cex-section-label">Сильные стороны безопасности</div>
            <ul className="dex-points">
              {dex.security_strengths.map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>

          <div className="cex-footer-links">
            <a className="cex-link" href={dex.url} target="_blank" rel="noopener noreferrer">
              Открыть DEX ↗
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DexAnalytics() {
  const [filter, setFilter] = useState('all')
  const ranking = dexData.ranking ?? []
  const filtered = ranking.filter(dex => filter === 'all' || getCategory(dex.type) === filter)

  return (
    <div className="tool-panel">
      <div className="tool-header">
        <div className="tool-eyebrow">Финансы · DEX · On-chain</div>
        <h2 className="tool-title">Рейтинг DEX</h2>
        <p className="tool-subtitle">{dexData.widget.what_is_dex}</p>
      </div>

      <div className="dex-info-grid">
        <div className="dex-info-card">
          <div className="cex-section-label">Как использовать безопасно и выгодно</div>
          <ul className="dex-points">
            {dexData.widget.how_to_use_safely_and_profitably.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="dex-info-card">
          <div className="cex-section-label">{dexData.recommendations.title}</div>
          <ul className="dex-points">
            {dexData.recommendations.items.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="cex-filters">
        {FILTERS.map(f => (
          <button
            key={f.id}
            className={`network-btn${filter === f.id ? ' active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="cex-list">
        {filtered.map(dex => <DexCard key={dex.name} dex={dex} />)}
      </div>
    </div>
  )
}
