import './CtaBand.css'

export default function CtaBand({ onOpenPlatform, onScrollToDocs }) {
  return (
    <section className="cta-band">
      <div className="cta-orb" />

      <div className="cta-tag">
        <div className="pulse-dot" />
        Платформа активна · 12K пользователей онлайн
      </div>

      <h2 className="cta-title">
        Начни защищать<br />
        активы <span className="it">прямо сейчас</span>
      </h2>

      <p className="cta-desc">
        Бесплатный доступ ко всем инструментам без регистрации.
        Первая проверка — уже через 30 секунд.
      </p>

      <div className="cta-btns">
        <button className="cta-btn-main" onClick={onOpenPlatform}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Открыть платформу
        </button>
        <button className="cta-btn-sec" onClick={onScrollToDocs}>
          Читать документацию →
        </button>
      </div>

      <div className="cta-note">// Без регистрации · Без ограничений · Без оплаты</div>
    </section>
  )
}
