import { getAccountSummary, getTopCoins } from '../../utils/accountSummaryUtils'
import { toClassSlug } from '../../utils/appUtils'

const formatCount = value => Math.floor(value).toLocaleString()

// "1.78e58" for the money tooltip; plain digits below a million
const formatMoney = value => (value >= 1e6 ? value.toExponential(2).replace('e+', 'e') : formatCount(value))

// One tile: icon + value, no title. The tooltip says what the number is.
function Stat({ icon, iconClass, tip, children }) {
  return (
    <div className="home-stat tooltip-anchor">
      {icon && (
        <img
          className="home-stat-icon"
          src={icon}
          alt=""
        />
      )}
      {iconClass && (
        <span
          className="home-stat-icon home-stat-class"
          data-class={iconClass}
        />
      )}
      <span className="home-stat-value">{children}</span>
      <span className="tooltip tooltip--wrap home-stat-tip">{tip}</span>
    </div>
  )
}

// Strip of account totals under the Home header (utils/accountSummaryUtils.js)
export default function AccountSummary({ snapshot }) {
  const summary = getAccountSummary(snapshot)
  const coins = getTopCoins(summary.money)
  const ballLine = (label, value) => (value == null ? null : <span key={label}>{label}: {formatCount(value)}</span>)
  return (
    <div className="home-stats">
      <Stat
        iconClass="beginner"
        tip={`${summary.characterCount} characters`}
      >
        {summary.characterCount}
      </Stat>
      <Stat
        iconClass={summary.highest ? toClassSlug(summary.highest.className) : 'beginner'}
        tip={(
          <>
            <span className="home-stat-tip-title">Total level: {formatCount(summary.totalLevel)}</span>
            {summary.highest && <span>Highest: {summary.highest.name}, Lv {formatCount(summary.highest.level)}</span>}
            {summary.lowest && <span>Lowest: {summary.lowest.name}, Lv {formatCount(summary.lowest.level)}</span>}
          </>
        )}
      >
        {formatCount(summary.totalLevel)}
      </Stat>
      <Stat
        tip={(
          <>
            <span className="home-stat-tip-title">Money: {formatMoney(summary.money)}</span>
            <span>Every character's coins plus the bank, as the three highest coin tiers</span>
          </>
        )}
      >
        {coins.length === 0 && '0'}
        {coins.map(coin => (
          <span
            key={coin.tier}
            className="home-coin"
          >
            <img
              className="home-coin-icon"
              src={`images/coins/Coins${coin.tier}.png`}
              alt=""
            />
            {coin.amount}
          </span>
        ))}
      </Stat>
      <Stat
        icon="images/home/TixCol.png"
        tip={`Colosseum tickets: ${summary.colosseumTickets == null ? 're-import your save' : formatCount(summary.colosseumTickets)}`}
      >
        {summary.colosseumTickets == null ? '?' : formatCount(summary.colosseumTickets)}
      </Stat>
      <Stat
        icon="images/home/PachiBall0.png"
        tip={summary.arcadeBalls == null
          ? 'Arcade balls: re-import your save'
          : (
            <>
              <span className="home-stat-tip-title">Arcade balls</span>
              {ballLine('Balls', summary.arcadeBalls)}
              {ballLine('Gold balls', summary.arcadeGoldBalls)}
              {ballLine('Super balls', summary.arcadeRoyalBalls)}
              {ballLine('Omega balls', summary.arcadeOmegaBalls)}
            </>
          )}
      >
        {summary.arcadeBalls == null ? '?' : formatCount(summary.arcadeBalls)}
      </Stat>
    </div>
  )
}
