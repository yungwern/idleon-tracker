import { formatClickerNumber } from '../../utils/clickerUtils'
import './Clicker.css'

// Upgrade cards: [{ name, icon, desc, level, cost, unlocked, lockedText }]. Cost shows in the clicker's currency
// (currencyIcon), green when `have` covers it.
export default function ClickerUpgrades({ title, upgrades, currencyIcon, currencyName, have }) {
  return (
    <div className="clicker-panel">
      <div className="clicker-panel-head">
        <span className="clicker-panel-title">{title}</span>
      </div>
      <div className="clicker-upgrades">
        {upgrades.map(upgrade => {
          const affordable = upgrade.unlocked && have >= upgrade.cost
          return (
            <div
              key={upgrade.name}
              className={`clicker-upgrade${upgrade.unlocked ? '' : ' clicker-upgrade--locked'}`}
            >
              <div className="clicker-upgrade-top">
                <span className="clicker-upgrade-icon-box">
                  <img
                    src={upgrade.icon}
                    alt=""
                    className="clicker-upgrade-icon"
                  />
                </span>
                <span className="clicker-upgrade-name">{upgrade.name}</span>
                <span className="clicker-upgrade-level">LV {upgrade.level.toLocaleString('en-US')}</span>
              </div>
              <p className="clicker-upgrade-desc">{upgrade.desc}</p>
              <div className="clicker-upgrade-foot">
                {upgrade.unlocked ? (
                  <span className={`clicker-upgrade-cost${affordable ? ' clicker-upgrade-cost--ok' : ''}`}>
                    <img
                      src={currencyIcon}
                      alt={currencyName}
                      className="clicker-upgrade-cost-icon"
                    />
                    {formatClickerNumber(upgrade.cost)}
                  </span>
                ) : (
                  <span className="clicker-upgrade-lock">🔒 {upgrade.lockedText}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
