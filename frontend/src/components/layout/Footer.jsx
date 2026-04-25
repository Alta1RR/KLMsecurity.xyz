import './Footer.css'

const TOOLS_LINKS = [
  'Проверка кошелька',
  'Проверка токена',
  'Проверка NFT',
  'Рейтинг DEX',
  { label: 'Рейтинг CEX', badge: 'New' },
  'Рейтинг кошельков',
]

const WHY_LINKS = [
  'Контроль кошельков',
  'AML-анализ',
  'Риски токенов',
  'Проверка NFT',
  'Мониторинг бирж',
]

const SUPPORT_LINKS = [
  'FAQ — частые вопросы',
  'Telegram-сообщество',
  'Сообщить об ошибке',
  'Предложить функцию',
  'Написать в поддержку',
]

const ABOUT_LINKS = [
  'О нас',
  'Безопасность данных',
  'Политика конфиденц.',
  'Условия использования',
  'Партнёрство',
]

function FooterCol({ title, links }) {
  return (
    <div className="f-col">
      <div className="f-col-title">{title}</div>
      <ul>
        {links.map((item, i) => {
          const label = typeof item === 'string' ? item : item.label
          const badge = typeof item === 'object' ? item.badge : null
          return (
            <li key={i}>
              <a href="#">
                {label}
                {badge && (
                  <span className={`f-badge${badge === 'New' ? ' new' : ''}`}>{badge}</span>
                )}
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function Footer() {
  return (
    <footer id="docs" className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="f-logo">
            KLMsecurity<span className="f-logo-dot">.</span>xyz
          </div>
          <p className="f-tagline">
            Профессиональная платформа безопасности для Web3 пользователей и трейдеров.
          </p>
          <div className="f-status">
            <div className="pulse-dot" />
            All systems nominal
          </div>
        </div>

        <div className="footer-links">
          <FooterCol title="Инструменты"  links={TOOLS_LINKS} />
          <FooterCol title="Зачем мы вам?" links={WHY_LINKS} />
          <FooterCol title="Поддержка"    links={SUPPORT_LINKS} />
          <FooterCol title="О проекте"    links={ABOUT_LINKS} />
        </div>
      </div>

      <div className="footer-bottom">
        <div className="f-copy">© 2025 KLMsecurity.xyz · Web3 Security Platform · v2.4.1</div>
        <div className="f-links-bottom">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Cookies</a>
          <a href="#">Sitemap</a>
        </div>
      </div>
    </footer>
  )
}
