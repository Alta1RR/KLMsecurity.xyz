import { useState } from 'react'
import './shared.css'
import './DexAnalytics.css'

const DEX_LIST = [
  {
    rank: 1,
    name: 'Uniswap',
    chain: 'Ethereum / L2',
    type: 'AMM',
    url: 'https://app.uniswap.org',
    tvl: '$4.2B+',
    audited: true,
    openSource: true,
    description: 'Крупнейший децентрализованный обменник на Ethereum. Пионер AMM-модели (Automated Market Maker). Версия V4 поддерживает кастомные хуки и концентрированную ликвидность.',
    risks: [
      { text: 'Impermanent Loss для провайдеров ликвидности', level: 'medium' },
      { text: 'Риск смарт-контракта (атаки на пулы)', level: 'low' },
    ],
    security: 'Многократно аудирован (Trail of Bits, ABDK, OpenZeppelin). Программа Bug Bounty $15M+. Код полностью открытый.',
    certik_url: 'https://skynet.certik.com/projects/uniswap',
  },
  {
    rank: 2,
    name: 'dYdX',
    chain: 'dYdX Chain (Cosmos)',
    type: 'Order Book',
    url: 'https://dydx.exchange',
    tvl: '$400M+',
    audited: true,
    openSource: true,
    description: 'Децентрализованная биржа деривативов и бессрочных контрактов. Использует собственный Layer-1 блокчейн на базе Cosmos SDK. Поддерживает до 20x кредитное плечо.',
    risks: [
      { text: 'Ликвидационные риски при высоком плече', level: 'high' },
      { text: 'Зависимость от собственного чейна (Cosmos)', level: 'medium' },
    ],
    security: 'Аудиты Peckshield, Certora, ABDK. Open-source протокол. Децентрализованное управление через токен DYDX.',
    certik_url: 'https://skynet.certik.com/projects/dydx',
  },
  {
    rank: 3,
    name: 'Curve Finance',
    chain: 'Ethereum / Multichain',
    type: 'AMM (Stableswap)',
    url: 'https://curve.fi',
    tvl: '$1.8B+',
    audited: true,
    openSource: true,
    description: 'Специализированный DEX для торговли стейблкоинами и pegged-активами с минимальным slippage. Алгоритм StableSwap обеспечивает экстремально низкое проскальзывание между схожими активами.',
    risks: [
      { text: 'Риск депега стейблкоина в пуле', level: 'high' },
      { text: 'Сложность протокола — выше поверхность атаки', level: 'medium' },
    ],
    security: 'Reentrancy-уязвимость в Vyper 2023 ($70M). После инцидента усилены аудиты. Curve имеет Insurance Fund.',
    certik_url: 'https://skynet.certik.com/projects/curve-dao-token',
  },
  {
    rank: 4,
    name: 'PancakeSwap',
    chain: 'BNB Chain / Ethereum',
    type: 'AMM',
    url: 'https://pancakeswap.finance',
    tvl: '$1.5B+',
    audited: true,
    openSource: true,
    description: 'Крупнейший DEX на BNB Chain. Форк Uniswap V2/V3 с дополнительными функциями: лотереи, NFT маркет, фарминг. Токен CAKE используется для governance.',
    risks: [
      { text: 'Многочисленные rug pull токены в листинге', level: 'high' },
      { text: 'Централизация управления (мультисиг команды)', level: 'medium' },
    ],
    security: 'Аудиты CertiK, PeckShield, Hacken. Однако экосистема BNB Chain исторически содержит большое число скам-токенов.',
    certik_url: 'https://skynet.certik.com/projects/pancakeswap',
  },
  {
    rank: 5,
    name: 'Raydium',
    chain: 'Solana',
    type: 'AMM + Order Book',
    url: 'https://raydium.io',
    tvl: '$800M+',
    audited: true,
    openSource: true,
    description: 'Основной AMM на Solana. Интегрирован с OpenBook (бывший Serum) для on-chain order book ликвидности. Поддерживает концентрированную ликвидность (CLMM).',
    risks: [
      { text: 'Зависимость от стабильности сети Solana', level: 'medium' },
      { text: 'Риски быстрых pump-and-dump токенов (meme coins)', level: 'high' },
    ],
    security: 'Аудиты Kudelski Security, Neodyme. Взлом $4.4M декабрь 2022 (скомпрометированный ключ разработчика). Инфраструктура усилена.',
    certik_url: 'https://skynet.certik.com/projects/raydium',
  },
  {
    rank: 6,
    name: 'Aerodrome',
    chain: 'Base (L2)',
    type: 'AMM + veNFT',
    url: 'https://aerodrome.finance',
    tvl: '$600M+',
    audited: true,
    openSource: true,
    description: 'Главный DEX экосистемы Base (L2 от Coinbase). Форк Velodrome с механикой ve(3,3) для голосования и распределения эмиссии. Быстро стал доминирующим в экосистеме.',
    risks: [
      { text: 'Молодой протокол — меньше проверена временем', level: 'medium' },
      { text: 'Зависимость от роста экосистемы Base', level: 'medium' },
    ],
    security: 'Аудиты Spearbit, Velodrome Security. Open-source. Унаследованная безопасность от Velodrome (форк Solidly).',
    certik_url: null,
  },
]

function RiskTag({ level, text }) {
  return (
    <div className="dex-risk-item">
      <span className={`severity severity-${level}`}>
        {level === 'high' ? 'Высокий' : level === 'medium' ? 'Средний' : 'Низкий'}
      </span>
      {text}
    </div>
  )
}

function DexCard({ dex }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`dex-card${open ? ' dex-card-open' : ''}`}>
      <button className="dex-card-header" onClick={() => setOpen(o => !o)}>
        <div className="dex-rank">#{dex.rank}</div>
        <div className="dex-main">
          <div className="dex-name-row">
            <span className="dex-name">{dex.name}</span>
            <div className="dex-badges">
              <span className="cex-badge cex-badge-neutral">{dex.type}</span>
              <span className="cex-badge cex-badge-neutral">{dex.chain}</span>
              {dex.audited && <span className="cex-badge cex-badge-safe">Аудит ✓</span>}
            </div>
          </div>
          <div className="dex-meta">
            <span className="dex-tvl">TVL {dex.tvl}</span>
            <span className="dex-desc-short">{dex.description.slice(0, 80)}…</span>
          </div>
        </div>
        <div className="cex-chevron">{open ? '▲' : '▼'}</div>
      </button>

      {open && (
        <div className="dex-details">
          <div className="cex-section">
            <div className="cex-section-label">О протоколе</div>
            <p className="cex-text">{dex.description}</p>
          </div>

          <div className="cex-section">
            <div className="cex-section-label">Безопасность</div>
            <p className="cex-text">{dex.security}</p>
          </div>

          <div className="cex-section">
            <div className="cex-section-label">Риски</div>
            <div className="dex-risks">
              {dex.risks.map(r => <RiskTag key={r.text} level={r.level} text={r.text} />)}
            </div>
          </div>

          <div className="cex-footer-links">
            <a className="cex-link" href={dex.url} target="_blank" rel="noopener noreferrer">
              Открыть DEX ↗
            </a>
            {dex.certik_url && (
              <a className="cex-link cex-link-certik" href={dex.certik_url} target="_blank" rel="noopener noreferrer">
                CertiK Skynet ↗
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function DexAnalytics() {
  const [filter, setFilter] = useState('all')

  const filtered = DEX_LIST.filter(dex => {
    if (filter === 'evm')    return dex.chain.toLowerCase().includes('ethereum') || dex.chain.toLowerCase().includes('bnb') || dex.chain.toLowerCase().includes('base')
    if (filter === 'solana') return dex.chain.toLowerCase().includes('solana')
    if (filter === 'deriv')  return dex.type.toLowerCase().includes('order')
    return true
  })

  return (
    <div className="tool-panel">
      <div className="tool-header">
        <div className="tool-eyebrow">Финансы · DEX · On-chain</div>
        <h2 className="tool-title">DEX Аналитика</h2>
        <p className="tool-subtitle">
          Обзор ведущих децентрализованных бирж: TVL, тип протокола, аудиты безопасности
          и ключевые риски для трейдеров и провайдеров ликвидности.
        </p>
      </div>

      <div className="cex-filters">
        {[
          { id: 'all',    label: 'Все' },
          { id: 'evm',    label: 'EVM' },
          { id: 'solana', label: 'Solana' },
          { id: 'deriv',  label: 'Деривативы' },
        ].map(f => (
          <button key={f.id}
            className={`network-btn${filter === f.id ? ' active' : ''}`}
            onClick={() => setFilter(f.id)}
          >{f.label}</button>
        ))}
      </div>

      <ul className="tool-hints">
        <li>TVL и данные актуальны на 2025 год. Нажмите на протокол для подробностей.</li>
        <li>DEX не хранят ваши средства — риски связаны со смарт-контрактами и ликвидностью.</li>
      </ul>

      <div className="cex-list">
        {filtered.map(dex => <DexCard key={dex.name} dex={dex} />)}
      </div>
    </div>
  )
}
