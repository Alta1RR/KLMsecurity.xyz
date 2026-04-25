import { useState, useEffect } from 'react'
import Checker from '../components/platform/Checker'
import '../components/platform/Checker.css'
import UrlChecker from '../components/platform/UrlChecker'
import CexMonitor from '../components/platform/CexMonitor'
import DexAnalytics from '../components/platform/DexAnalytics'
import WalletRating from '../components/platform/WalletRating'
import './PlatformPage.css'

const TOOLS = [
  {
    id: 'checker',
    label: 'Проверки',
    tag: 'Кошелёк · Токен · Рейтинг',
    icon: (
      <svg width="16" height="16" viewBox="0 0 34 34" fill="none">
        <circle cx="17" cy="17" r="13" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="17" cy="17" r="5"  stroke="currentColor" strokeWidth="1.5"/>
        <line x1="17" y1="4"  x2="17" y2="9"  stroke="currentColor" strokeWidth="1.5"/>
        <line x1="17" y1="25" x2="17" y2="30" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="4"  y1="17" x2="9"  y2="17" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="25" y1="17" x2="30" y2="17" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: 'dex',
    label: 'Рейтинг DEX',
    tag: 'Финансы',
    icon: (
      <svg width="16" height="16" viewBox="0 0 34 34" fill="none">
        <rect x="3" y="3" width="28" height="28" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <polyline points="7,22 12,15 17,18 22,11 27,8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'cex',
    label: 'Рейтинг CEX',
    tag: 'Финансы',
    icon: (
      <svg width="16" height="16" viewBox="0 0 34 34" fill="none">
        <rect x="4" y="9" width="26" height="19" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="4" y1="15" x2="30" y2="15" stroke="currentColor" strokeWidth="1"/>
        <circle cx="9" cy="22" r="2.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'wallet-rating',
    label: 'Рейтинг кошельков',
    tag: 'Wallets',
    icon: (
      <svg width="16" height="16" viewBox="0 0 34 34" fill="none">
        <rect x="4" y="9" width="26" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="22" cy="18" r="4" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="4" y1="14" x2="30" y2="14" stroke="currentColor" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    id: 'web2',
    label: 'Web2 проверки',
    tag: 'VirusTotal',
    icon: (
      <svg width="16" height="16" viewBox="0 0 34 34" fill="none">
        <circle cx="17" cy="17" r="12" stroke="currentColor" strokeWidth="1.5"/>
        <ellipse cx="17" cy="17" rx="5" ry="12" stroke="currentColor" strokeWidth="1"/>
        <line x1="5" y1="17" x2="29" y2="17" stroke="currentColor" strokeWidth="1"/>
      </svg>
    ),
  },
]

function renderTool(id) {
  switch (id) {
    case 'checker': return <Checker />
    case 'dex':     return <DexAnalytics />
    case 'cex':     return <CexMonitor />
    case 'wallet-rating': return <WalletRating />
    case 'web2':    return <UrlChecker />
    default:        return null
  }
}

export default function PlatformPage() {
  const [active, setActive] = useState('checker')

  useEffect(() => {
    document.title = 'KLMsecurity.xyz — Platform'
  }, [])

  const activeTool = TOOLS.find(t => t.id === active)

  return (
    <div className="platform-page">
      <header className="platform-nav">
        <button className="platform-back" onClick={() => window.location.assign('/')}>
          ← На главную
        </button>
        <div className="platform-brand">
          KLMsecurity<span className="platform-dot">.</span>xyz
        </div>
        <div className="platform-live">
          <span className="live-dot" />
          Live
        </div>
      </header>

      <div className="platform-layout">
        <aside className="platform-sidebar">
          <div className="sidebar-label">Инструменты</div>
          <nav className="sidebar-nav">
            {TOOLS.map(tool => (
              <button
                key={tool.id}
                className={`sidebar-item${active === tool.id ? ' active' : ''}`}
                onClick={() => setActive(tool.id)}
              >
                <span className="sidebar-icon">{tool.icon}</span>
                <span className="sidebar-text">
                  <span className="sidebar-name">{tool.label}</span>
                  <span className="sidebar-tag">{tool.tag}</span>
                </span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="platform-content">
          <div className="platform-breadcrumb">
            <span>Платформа</span>
            <span className="breadcrumb-sep">/</span>
            <span>{activeTool?.label}</span>
          </div>
          {renderTool(active)}
        </main>
      </div>
    </div>
  )
}
