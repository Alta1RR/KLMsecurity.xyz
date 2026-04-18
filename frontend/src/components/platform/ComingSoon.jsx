import './shared.css'

export default function ComingSoon({ title, description, eyebrow }) {
  return (
    <div className="tool-panel">
      <div className="tool-header">
        <div className="tool-eyebrow">{eyebrow}</div>
        <h2 className="tool-title">{title}</h2>
        <p className="tool-subtitle">{description}</p>
      </div>

      <div className="coming-soon">
        <div className="coming-soon-icon">⚙</div>
        <h3>В разработке</h3>
        <p>Этот инструмент будет доступен после подключения backend. Функциональность уже спроектирована.</p>
        <div className="coming-badge">Coming soon</div>
      </div>
    </div>
  )
}
