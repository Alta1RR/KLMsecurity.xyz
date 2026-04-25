import './shared.css'
import './Checker.css'
import walletsData from '../../jsons/wallets.json'

function WalletRatingCard({ wallet, index }) {
  return (
    <div className="wallet-rating-card">
      <div className="wallet-rating-rank">#{index + 1}</div>
      <div className="wallet-rating-main">
        <div className="wallet-rating-head">
          <span className="wallet-rating-name">{wallet.name}</span>
          <a className="wallet-rating-link" href={wallet.website} target="_blank" rel="noopener noreferrer">
            Сайт ↗
          </a>
        </div>
        <p className="wallet-rating-desc">{wallet.description}</p>
        <div className="wallet-rating-meta">
          <div>
            <span>Сети</span>
            {wallet.networks}
          </div>
          <div>
            <span>Платформы</span>
            {wallet.platforms}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WalletRating() {
  const wallets = walletsData.slice().sort((a, b) => a.id - b.id)

  return (
    <div className="tool-panel">
      <div className="tool-header">
        <div className="tool-eyebrow">Wallets · Security · Web3</div>
        <h2 className="tool-title">Рейтинг кошельков</h2>
        <p className="tool-subtitle">
          Подборка популярных криптокошельков: назначение, поддерживаемые сети и доступные платформы.
        </p>
      </div>

      <div className="wallet-rating-list">
        {wallets.map((wallet, index) => (
          <WalletRatingCard key={wallet.id} wallet={wallet} index={index} />
        ))}
      </div>
    </div>
  )
}
