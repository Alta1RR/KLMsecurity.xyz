import { useEffect, useRef } from 'react'
import './Stats.css'

function countUp(el, target, dur = 1300) {
  const step = target / (dur / 16)
  let cur = 0
  const t = setInterval(() => {
    cur += step
    if (cur >= target) { cur = target; clearInterval(t) }
    el.textContent = target > 999
      ? Math.floor(cur).toLocaleString('ru')
      : Math.floor(cur)
  }, 16)
}

const CELLS = [
  { value: 48231, suffix: '+',       label: 'Кошельков проверено' },
  { value: 3847,  suffix: '',        label: 'Угроз обнаружено' },
  { value: 6,     suffix: ' сетей',  label: 'Поддерживаемых блокчейнов' },
  { value: 12,    suffix: 'K',       label: 'Активных пользователей' },
]

export default function Stats() {
  const ref = useRef(null)
  const done = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !done.current) {
        done.current = true
        ref.current?.querySelectorAll('.s-cnt').forEach(el => {
          countUp(el, +el.dataset.t)
        })
      }
    }, { threshold: 0.25 })

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="stats-strip" id="analytics" ref={ref}>
      {CELLS.map(cell => (
        <div className="s-cell" key={cell.label}>
          <div className="s-num">
            <span className="s-cnt" data-t={cell.value}>0</span>
            {cell.suffix && <span className="s-unit">{cell.suffix}</span>}
          </div>
          <div className="s-label">{cell.label}</div>
        </div>
      ))}
    </div>
  )
}
