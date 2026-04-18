import './Hero.css'

export default function Hero({ onOpenPlatform, guideUrl }) {
  return (
    <section className="hero" id="home">
      <div className="hero-bg">
        <div className="hex-grid" />
        <div className="glow-orb orb1" />
        <div className="glow-orb orb2" />
      </div>

      <div className="hero-left">
        <div className="hero-eyebrow">
          <div className="eyebrow-line" />
          <span className="eyebrow-accent">KLM_FEED</span>
          <span>·</span>
          STATUS: ACTIVE
          <span>·</span>
          УГРОЗ СЕГОДНЯ: 3,847
        </div>

        <h1 className="h-title">
          Защита<br />
          <span className="blue-word">крипто-активов</span><br />
          в реальном времени
        </h1>

        <p className="hero-sub">
          Профессиональные инструменты Web3 безопасности.<br />
          Кошельки, токены, NFT — под полным контролем.<br />
          Бесплатно. Без регистрации.
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
        <div className="widget">
          <div className="w-head">
            <span className="w-label">SECURITY_SCORE</span>
            <span className="w-live"><div className="w-live-dot" />LIVE</span>
          </div>
          <div className="w-body">
            <div className="score-display">
              <div className="score-circle">
                <svg width="60" height="60" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                  <circle cx="30" cy="30" r="24" fill="none" stroke="url(#sg)" strokeWidth="3"
                    strokeDasharray="150.8" strokeDashoffset="28" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="sg" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="score-text">87</div>
              </div>
              <div className="score-info">
                <div className="score-val">87<span className="score-denom">/100</span></div>
                <div className="score-lbl">Индекс безопасности</div>
              </div>
            </div>
          </div>
          <div className="w-footer">◆ <span className="w-accent">ETH · BSC · SOL · MATIC</span> и ещё 2 сети</div>
        </div>

        <div className="widget">
          <div className="w-head">
            <span className="w-label">THREAT_MONITOR</span>
            <span className="w-live"><div className="w-live-dot" />LIVE</span>
          </div>
          <div className="w-body">
            <div className="bars">
              {[30,50,38,68,42,80,56,88,48,72,60,84,70,92,65,78].map((h, i, arr) => (
                <div key={i} className={`bar${i === arr.length - 1 ? ' hi' : ''}`} style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="chart-stat">
              <span className="chart-big">34.2%</span>
              <span className="chart-tag">УРОВЕНЬ УГРОЗ</span>
            </div>
          </div>
        </div>

        <div className="widget">
          <div className="w-head">
            <span className="w-label">LIVE_FEED</span>
            <span className="w-live"><div className="w-live-dot" />LIVE</span>
          </div>
          <div className="w-body">
            {[
              { name: 'Honeypot токены', count: '1,203', change: '↑ 48.7%', up: true },
              { name: 'Скам кошельки',  count: '487',   change: '↑ 2.1%',  up: false },
              { name: 'Rug pull NFT',   count: '312',   change: '↑ 24.3%', up: true },
            ].map(row => (
              <div className="feed-row" key={row.name}>
                <span className="feed-name">{row.name}</span>
                <span className="feed-count">{row.count}</span>
                <span className={row.up ? 'feed-up' : 'feed-down'}>{row.change}</span>
              </div>
            ))}
          </div>
          <div className="w-footer">◆ Avg response: <span className="w-accent">47ms</span></div>
        </div>
      </div>
    </section>
  )
}
