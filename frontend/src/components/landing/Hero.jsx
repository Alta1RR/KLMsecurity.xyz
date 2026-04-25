import './Hero.css'

function SecurityPulse() {
  return (
    <div className="security-pulse" aria-label="Live security feed">
      <div className="pulse-head">
        <span>Live security feed</span>
        <span className="pulse-live"><span />LIVE</span>
      </div>

      <div className="pulse-stage">
        <svg className="pulse-map" viewBox="0 0 360 360" aria-hidden="true">
          <defs>
            <pattern id="security-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M24 0H0V24" fill="none" stroke="rgba(255,255,255,0.055)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="360" height="360" fill="url(#security-grid)" />
          <g className="pulse-links">
            <line x1="180" y1="180" x2="96" y2="112" />
            <line x1="180" y1="180" x2="265" y2="102" />
            <line x1="180" y1="180" x2="278" y2="244" />
            <line x1="180" y1="180" x2="104" y2="260" />
            <line x1="96" y1="112" x2="265" y2="102" />
            <line x1="104" y1="260" x2="278" y2="244" />
          </g>
          <g className="pulse-nodes">
            <circle cx="96" cy="112" r="3" />
            <circle cx="265" cy="102" r="3" />
            <circle cx="278" cy="244" r="3" />
            <circle cx="104" cy="260" r="3" />
            <circle cx="180" cy="180" r="4" />
          </g>
        </svg>

        <div className="pulse-core">
          <span className="core-ring ring-one" />
          <span className="core-ring ring-two" />
          <span className="core-dot" />
        </div>

        <div className="pulse-orbit orbit-one">
          <span className="pulse-particle particle-one" />
          <span className="pulse-particle particle-two" />
        </div>
        <div className="pulse-orbit orbit-two">
          <span className="pulse-particle particle-three" />
          <span className="pulse-particle particle-four" />
        </div>

        <span className="signal-blip blip-one" />
        <span className="signal-blip blip-two" />
        <span className="signal-blip blip-three" />
      </div>

      <div className="pulse-metrics">
        <div>
          <span>12</span>
          active signals
        </div>
        <div>
          <span>3</span>
          suspicious contracts
        </div>
        <div>
          <span>98.4%</span>
          network health
        </div>
      </div>
    </div>
  )
}

export default function Hero({ onOpenPlatform, guideUrl }) {
  return (
    <section className="hero" id="home">
      <div className="hero-bg">
        <div className="hex-grid" />
      </div>

      <div className="hero-left">
        <div className="hero-eyebrow">
          <div className="eyebrow-line" />
          <span className="eyebrow-accent">KLM_FEED</span>
          <span>·</span>
          STATUS: ACTIVE
        </div>

        <h1 className="h-title">
          Защита<br />
          <span className="blue-word">крипто-активов</span><br />
          в реальном времени
        </h1>

        <p className="hero-sub">
          Все нужные инструменты для Web3 безопасности в одном месте.<br />
          Кошельки, токены, NFT — под полным контролем.<br />
          Всё в одном месте. Удобно. Понятно.
        </p>

        <div className="hero-actions">
          <button className="btn-cta-main" onClick={onOpenPlatform}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Запустить инструменты
          </button>
          <a
            className="btn-cta-ghost"
            href={guideUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Бесплатный гайд по безопасности
          </a>
        </div>

        <div className="hero-proof">
          <span className="proof-item">Бесплатно</span>
          <span className="proof-item">6 блокчейнов</span>
          <span className="proof-item">12K пользователей</span>
        </div>
      </div>

      <div className="hero-right">
        <SecurityPulse />
      </div>
    </section>
  )
}
