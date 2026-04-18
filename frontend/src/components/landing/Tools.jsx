import { useEffect, useRef } from 'react'
import './Tools.css'

const TOOLS = [
  {
    id: 'wallet',
    featured: true,
    name: 'Проверка кошелька',
    desc: 'Полный анализ адреса: история транзакций, связи со скам-адресами, баланс по всем сетям и оценка уровня риска в режиме реального времени. Поддержка ETH, BSC, SOL, MATIC и ещё 2 сетей.',
    tag: 'Core · Web3 Infrastructure',
    bar: { label: 'SECURITY SCORE', value: 87 },
    icon: (
      <svg className="t-ico" viewBox="0 0 34 34" fill="none">
        <circle cx="17" cy="17" r="13" stroke="#3b82f6" strokeWidth="1.5"/>
        <circle cx="17" cy="17" r="5"  stroke="#3b82f6" strokeWidth="1.5"/>
        <line x1="17" y1="4"  x2="17" y2="9"  stroke="#3b82f6" strokeWidth="1.5"/>
        <line x1="17" y1="25" x2="17" y2="30" stroke="#3b82f6" strokeWidth="1.5"/>
        <line x1="4"  y1="17" x2="9"  y2="17" stroke="#3b82f6" strokeWidth="1.5"/>
        <line x1="25" y1="17" x2="30" y2="17" stroke="#3b82f6" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: 'token',
    name: 'Проверка токена',
    desc: 'Honeypot детектор, аудит смарт-контракта, анализ ликвидности.',
    tag: 'Web3 Infrastructure',
    icon: (
      <svg className="t-ico" viewBox="0 0 34 34" fill="none">
        <circle cx="17" cy="17" r="11" stroke="#3b82f6" strokeWidth="1.5"/>
        <path d="M12 17h10M17 12v10" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'nft',
    name: 'Проверка NFT',
    desc: 'Подлинность коллекции, royalty права, история сделок.',
    tag: 'Web3 Infrastructure',
    icon: (
      <svg className="t-ico" viewBox="0 0 34 34" fill="none">
        <rect x="5" y="5" width="24" height="24" rx="3" stroke="#3b82f6" strokeWidth="1.5"/>
        <rect x="10" y="10" width="14" height="14" stroke="#06b6d4" strokeWidth="1"/>
        <circle cx="17" cy="17" r="2" fill="#3b82f6"/>
      </svg>
    ),
  },
  {
    id: 'dex',
    name: 'DEX Аналитика',
    desc: 'Пулы, объёмы, риски ликвидности в реальном времени.',
    tag: 'Финансы',
    icon: (
      <svg className="t-ico" viewBox="0 0 34 34" fill="none">
        <rect x="3" y="3" width="28" height="28" rx="2" stroke="#3b82f6" strokeWidth="1.5"/>
        <polyline points="7,22 12,15 17,18 22,11 27,8" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'cex',
    name: 'CEX Мониторинг',
    desc: 'Резервы бирж, статус и рейтинг надёжности платформ.',
    tag: 'Финансы',
    icon: (
      <svg className="t-ico" viewBox="0 0 34 34" fill="none">
        <rect x="4" y="9" width="26" height="19" rx="2" stroke="#3b82f6" strokeWidth="1.5"/>
        <line x1="4" y1="15" x2="30" y2="15" stroke="#3b82f6" strokeWidth="1"/>
        <circle cx="9" cy="22" r="2.5" fill="#06b6d4"/>
        <rect x="15" y="20" width="10" height="2.5" rx="1" fill="rgba(59,130,246,0.3)"/>
      </svg>
    ),
  },
  {
    id: 'rating',
    name: 'Рейтинг кошельков',
    desc: 'Сравнение безопасности популярных крипто-кошельков.',
    tag: 'Финансы',
    icon: (
      <svg className="t-ico" viewBox="0 0 34 34" fill="none">
        <rect x="3" y="9" width="28" height="18" rx="2" stroke="#3b82f6" strokeWidth="1.5"/>
        <circle cx="22" cy="18" r="4" stroke="#06b6d4" strokeWidth="1.5"/>
        <line x1="3" y1="14" x2="31" y2="14" stroke="rgba(59,130,246,0.4)" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    id: 'web2',
    name: 'Web2 проверки',
    desc: 'Анализ доменов, фишинговых сайтов, WHOIS и репутация ресурсов.',
    tag: 'Web2 Security',
    icon: (
      <svg className="t-ico" viewBox="0 0 34 34" fill="none">
        <circle cx="17" cy="17" r="12" stroke="#3b82f6" strokeWidth="1.5"/>
        <ellipse cx="17" cy="17" rx="5" ry="12" stroke="#06b6d4" strokeWidth="1"/>
        <line x1="5" y1="17" x2="29" y2="17" stroke="#3b82f6" strokeWidth="1"/>
        <line x1="17" y1="5"  x2="17" y2="29" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 3"/>
      </svg>
    ),
  },
  {
    id: 'other',
    name: 'Прочие инструменты',
    desc: 'Дополнительные утилиты для анализа и мониторинга крипто-активов.',
    tag: 'Утилиты',
    icon: (
      <svg className="t-ico" viewBox="0 0 34 34" fill="none">
        <circle cx="17" cy="17" r="3" fill="#3b82f6"/>
        <circle cx="7"  cy="17" r="2" fill="#06b6d4"/>
        <circle cx="27" cy="17" r="2" fill="#06b6d4"/>
        <circle cx="17" cy="7"  r="2" fill="#06b6d4"/>
        <circle cx="17" cy="27" r="2" fill="#06b6d4"/>
        <line x1="10" y1="17" x2="14" y2="17" stroke="#3b82f6" strokeWidth="1"/>
        <line x1="20" y1="17" x2="24" y2="17" stroke="#3b82f6" strokeWidth="1"/>
        <line x1="17" y1="10" x2="17" y2="14" stroke="#3b82f6" strokeWidth="1"/>
        <line x1="17" y1="20" x2="17" y2="24" stroke="#3b82f6" strokeWidth="1"/>
      </svg>
    ),
  },
]

export default function Tools({ onOpenPlatform }) {
  const ref = useRef(null)
  const done = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !done.current) {
        done.current = true
        ref.current?.querySelectorAll('.t-fill[data-w]').forEach(el => {
          setTimeout(() => { el.style.width = el.dataset.w + '%' }, 200)
        })
      }
    }, { threshold: 0.25 })

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="sect-dark" id="tools" ref={ref}>
      <div className="s-eyebrow-cyan">
        <span className="eyebrow-line-cyan" />
        Инструменты
      </div>
      <h2 className="s-title-light">Полный арсенал<br />Web3 безопасности.</h2>
      <p className="s-sub-light">Не просто сканер — платформа полного цикла защиты активов.</p>

      <div className="bento">
        {TOOLS.map(tool => (
          <div
            key={tool.id}
            className={`b-tile${tool.featured ? ' featured' : ''}`}
            onClick={onOpenPlatform}
          >
            {tool.icon}
            <div className="t-name">{tool.name}</div>
            <div className="t-desc">{tool.desc}</div>
            <div className="t-tag">{tool.tag}</div>
            {tool.bar && (
              <div className="t-bar">
                <div className="t-bar-meta">
                  <span>{tool.bar.label}</span>
                  <span>{tool.bar.value} / 100</span>
                </div>
                <div className="t-track">
                  <div className="t-fill" data-w={tool.bar.value} style={{ width: '0%' }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
