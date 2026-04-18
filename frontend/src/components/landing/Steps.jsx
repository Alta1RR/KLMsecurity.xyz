import './Steps.css'

const STEPS = [
  { n: '01', name: 'Введи адрес',     desc: 'Вставь адрес кошелька, токена или NFT. Регистрация не нужна.', note: '⏱ 10 секунд', accent: false },
  { n: '02', name: 'Запусти анализ',  desc: 'Платформа автоматически сканирует блокчейн и базы угроз.',     note: '⏱ 5–30 секунд', accent: false },
  { n: '03', name: 'Получи отчёт',    desc: 'Оценка риска с детальными рекомендациями. Действуй уверенно.', note: '✦ Всегда бесплатно', accent: true },
]

export default function Steps() {
  return (
    <section className="sect-steps">
      <div className="steps-inner">
        <div className="s-eyebrow-muted">Как это работает</div>
        <h2 className="s-title-steps">Три шага до<br />безопасных активов.</h2>
      </div>

      <div className="s-grid">
        {STEPS.map(step => (
          <div className="step" key={step.n}>
            <div className="step-box">{step.n}</div>
            <div className="step-name">{step.name}</div>
            <div className="step-desc">{step.desc}</div>
            <div className={`step-note${step.accent ? ' step-note-accent' : ''}`}>{step.note}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
