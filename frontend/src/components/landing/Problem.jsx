import { useEffect, useRef } from 'react'
import './Problem.css'

function countUp(el, target, dur = 800) {
  const step = target / (dur / 16)
  let cur = 0
  const t = setInterval(() => {
    cur += step
    if (cur >= target) { cur = target; clearInterval(t) }
    el.textContent = Math.floor(cur)
  }, 16)
}

const COLS = [
  {
    value: 73,
    prefix: null,
    suffix: '%',
    name: 'Токенов содержат скам-код',
    desc: 'Большинство новых токенов имеют honeypot-механизм или rug pull в контракте.',
    badge: 'Honeypot Risk',
  },
  {
    value: 68,
    prefix: null,
    suffix: '%',
    name: 'NFT без верификации',
    desc: 'Подделки и NFT с украденными правами — норма без правильного аудита коллекции.',
    badge: 'Auth Failure',
  },
  {
    value: 4200,
    prefix: '$',
    suffix: null,
    name: 'Средний убыток в год',
    desc: 'Без регулярной проверки активов средний трейдер теряет тысячи долларов ежегодно.',
    badge: 'Revenue Leak',
  },
]

export default function Problem() {
  const ref = useRef(null)
  const done = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !done.current) {
        done.current = true
        ref.current?.querySelectorAll('.cnt2').forEach(el => {
          countUp(el, +el.dataset.t, 800)
        })
      }
    }, { threshold: 0.25 })

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="sect-problem" id="why" ref={ref}>
      <div className="s-eyebrow-dark">Проблема</div>
      <h2 className="s-title-dark">Крипта полна<br />скрытых угроз.</h2>
      <p className="s-sub-dark">Каждый час без проверки — это риск потерять всё нажитое.</p>

      <div className="prob-grid">
        {COLS.map(col => (
          <div className="prob-col" key={col.badge}>
            <div className="prob-big">
              {col.prefix && <span className="prob-prefix">{col.prefix}</span>}
              <span className="cnt2" data-t={col.value}>0</span>
              {col.suffix && <span className="sup-accent">{col.suffix}</span>}
            </div>
            <div className="prob-name">{col.name}</div>
            <div className="prob-desc">{col.desc}</div>
            <div className="prob-badge">{col.badge}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
