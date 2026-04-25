import { useState, useEffect } from 'react'
import './Navbar.css'

const NAV_LINKS = [
  { label: 'Главная',      id: 'home' },
  { label: 'Инструменты', id: 'tools' },
  { label: 'Зачем мы вам?', id: 'why' },
]

const LANGS = [
  { id: 'eng', label: 'ENG' },
  { id: 'rus', label: 'RUS' },
]

const SCROLL_OFFSET = 84

function scrollToSection(id) {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET
  window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' })
}

export default function Navbar({ onOpenPlatform }) {
  const [active, setActive] = useState('home')
  const [lang, setLang] = useState('rus')

  useEffect(() => {
    const onScroll = () => {
      const ids = NAV_LINKS.map(l => l.id)
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i])
        if (el && el.getBoundingClientRect().top <= SCROLL_OFFSET + 20) {
          setActive(ids[i])
          return
        }
      }
      setActive('home')
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className="navbar">
      <a
        className="nav-logo"
        href="#home"
        onClick={e => { e.preventDefault(); scrollToSection('home') }}
      >
        KLMsecurity<span className="nav-logo-dot">.</span>xyz
      </a>

      <ul className="nav-links">
        {NAV_LINKS.map(link => (
          <li key={link.id}>
            <a
              href={`#${link.id}`}
              className={active === link.id ? 'active' : ''}
              onClick={e => {
                e.preventDefault()
                setActive(link.id)
                scrollToSection(link.id)
              }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="nav-right">
        <div className="lang-switch" aria-label="Переключить язык">
          {LANGS.map(item => (
            <button
              key={item.id}
              type="button"
              className={`lang-btn${lang === item.id ? ' active' : ''}`}
              aria-pressed={lang === item.id}
              onClick={() => setLang(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button className="btn-nav" onClick={onOpenPlatform}>
          Открыть платформу →
        </button>
      </div>
    </nav>
  )
}
