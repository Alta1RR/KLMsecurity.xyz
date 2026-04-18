const TICKER_DATA = [
  { k: 'Кошельков', v: '48,231', c: '+12.4%', pos: true },
  { k: 'Угроз',     v: '3,847',  c: '+2.1%',  pos: false },
  { k: 'Пользователей', v: '12.4K', c: '+8.1%', pos: true },
  { k: 'Honeypot',  v: '1,203',  c: '+48.7%', pos: false },
  { k: 'Latency',   v: '47ms',   c: '',        pos: true },
  { k: 'Сетей',     v: '6',      c: '',        pos: true },
  { k: 'Rug Pull',  v: '312',    c: '+24.3%',  pos: false },
  { k: 'Scan/день', v: '9,400',  c: '+5.2%',   pos: true },
  { k: 'All Systems', v: 'Nominal', c: '',      pos: true },
]

const items = [...TICKER_DATA, ...TICKER_DATA]

export function TopTicker() {
  return (
    <div className="ticker-bar">
      <div className="ticker-track">
        {items.map((d, i) => (
          <span className="t-item" key={i}>
            <span className="t-k">{d.k}</span>
            <span className="t-v">{d.v}</span>
            {d.c && <span className={d.pos ? 't-up' : 't-down'}>{d.pos ? '↑' : '↑'}{d.c}</span>}
          </span>
        ))}
      </div>
    </div>
  )
}

export function BottomTicker() {
  return (
    <div className="bticker">
      <div className="ticker-track ticker-reverse">
        {items.map((d, i) => (
          <span className="t-item t-item-dim" key={i}>
            <span className="t-k">{d.k}</span>
            <span className="t-v-dim">{d.v}</span>
            {d.c && <span className={d.pos ? 't-up' : 't-down'}>{d.pos ? '↑' : '↑'}{d.c}</span>}
          </span>
        ))}
      </div>
    </div>
  )
}
