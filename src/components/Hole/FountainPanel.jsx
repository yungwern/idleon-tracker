import { useState } from 'react'
import { getFountain, formatFountainTime, FOUNTAIN_COIN_ICON, FOUNTAIN_WATERS } from '../../utils/holeCavernUtils'
import { formatHoleNumber } from '../../utils/holeUtils'

// The Fountain (cavern 16): stat cards, every currency (owned, value per coin, LUCKY bubbles, coins on the ground), the fountain
// bars and their fill times, then one tab per water with its 20 upgrades grouped by unlock tier.

function Cost({ upgrade }) {
  return (
    <span className={`hole-fountain-cost${upgrade.affordable ? ' hole-fountain-cost--ok' : ''}`}>
      Cost: {formatHoleNumber(upgrade.cost)}
      <img
        className="hole-fountain-cost-icon"
        src={FOUNTAIN_COIN_ICON(upgrade.currency)}
        alt=""
      />
    </span>
  )
}

function UpgradeCard({ upgrade }) {
  return (
    <div className={`hole-entry hole-fountain-upgrade${upgrade.unlocked ? '' : ' hole-entry--locked'}`}>
      <img
        className="hole-fountain-upgrade-icon"
        src={upgrade.icon}
        alt=""
      />
      <div className="hole-entry-body">
        <div className="hole-entry-head">
          <span className="hole-entry-name">{upgrade.name}</span>
          {upgrade.marbleTier > 0 && (
            <span className="hole-chip hole-chip--marble tooltip-anchor">
              Marble {upgrade.marbleTier}
              <span className="tooltip tooltip--wrap">Marbleized: bonus × {formatHoleNumber(upgrade.marbleMulti)}</span>
            </span>
          )}
          <span className="hole-list-level">LV {upgrade.level.toLocaleString()}</span>
        </div>
        <span className="hole-entry-text">{upgrade.text}</span>
        <Cost upgrade={upgrade} />
        {!upgrade.unlocked && upgrade.prereq && (
          <span className="hole-entry-meta hole-fountain-needs">
            Needs {upgrade.prereq.name} LV {upgrade.prereq.level} / {upgrade.prereq.needs}
          </span>
        )}
        {upgrade.opens.length > 0 && (
          <span className="hole-entry-meta">Opens at LV 10: {upgrade.opens.join(', ')}</span>
        )}
      </div>
    </div>
  )
}

export default function FountainPanel({ snapshot, lead, tomePoints }) {
  const fountain = getFountain(snapshot, tomePoints)
  const lastUnlocked = fountain.waters.filter(water => water.unlocked).at(-1)?.t ?? 0
  const [activeWater, setActiveWater] = useState(lastUnlocked)
  const water = fountain.waters[activeWater]
  const maxCoins = fountain.spaces * fountain.stackSize

  return (
    <>
      <div className="hole-stats">
        {lead}
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Total currency multi</span>
          <span className="hole-stat-card-value">{formatHoleNumber(fountain.currencyMulti)}x</span>
          <span className="hole-stat-card-hint">
            Multiplies every coin's value. Green water currencies get {formatHoleNumber(Math.sqrt(fountain.currencyMulti))}x (the square root).
          </span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">
            <img
              className="hole-inline-icon"
              src="images/hole/fountain/marble.png"
              alt=""
            />
            Marble
          </span>
          <span className="hole-stat-card-value">{Math.floor(fountain.marble).toLocaleString()}</span>
          <span className="hole-stat-card-hint">Spent on Marbleizing upgrades to multiply their bonus.</span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Coins on ground</span>
          <span className="hole-stat-card-value">{fountain.coinsOnGround.toLocaleString()} / {maxCoins.toLocaleString()}</span>
          <span className="hole-stat-card-hint">
            {fountain.spaces} spaces × {fountain.stackSize} coins per stack. At max, Money Back Guarantee auto collects
            new coins at part of their value.
          </span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">
            <img
              className="hole-inline-icon"
              src="images/hole/fountain/upg_2_12.png"
              alt=""
            />
            Rubber Ducky stacks
          </span>
          <span className="hole-stat-card-value">{fountain.ducks}</span>
          <span className="hole-stat-card-hint">Each stack makes the next one 5x rarer.</span>
        </div>
      </div>

      <div className="hole-card">
        <h3 className="hole-card-title">Currencies</h3>
        <div className="hole-icon-tiles hole-fountain-currencies">
          {fountain.currencies.map(currency => (
            <div
              key={currency.currency}
              className={`hole-icon-tile hole-fountain-currency tooltip-anchor${currency.desired ? ' hole-fountain-currency--desired' : ''}`}
            >
              <span className="hole-fountain-lucky">
                {Array.from({ length: currency.lucky }, (_, i) => (
                  <span
                    key={i}
                    className={`hole-fountain-bubble hole-fountain-bubble--${currency.currency}`}
                  />
                ))}
              </span>
              <img
                className="hole-fountain-coin"
                src={currency.icon}
                alt=""
              />
              <span className="hole-icon-tile-value">{formatHoleNumber(currency.owned)}</span>
              <span className="hole-fountain-currency-value">{formatHoleNumber(currency.baseValue)} each</span>
              {currency.onGround > 0 && (
                <span className="hole-fountain-currency-ground">{currency.onGround.toLocaleString()} on ground</span>
              )}
              <span className="tooltip hole-fountain-tip">
                <span className="hole-fountain-tip-title">{currency.name}</span>
                <span className="hole-fountain-tip-line">{FOUNTAIN_WATERS[currency.water]} water</span>
                <span className="hole-fountain-tip-line">Base value: <strong>{formatHoleNumber(currency.baseValue)}</strong> per coin</span>
                <span className="hole-fountain-tip-line">
                  LUCKY coins: <strong>{currency.lucky}</strong> (+{formatHoleNumber(fountain.luckyPer)}% each)
                </span>
                {currency.water === 2 && <span className="hole-fountain-tip-note">Gets the square root of the currency multi</span>}
                {currency.desired && <span className="hole-fountain-tip-note">Desired currency (Greatest Desire)</span>}
              </span>
            </div>
          ))}
        </div>
        <p className="hole-text hole-text--note">
          Bubbles = LUCKY coins of that currency, like the game shows with Skilluck. Each extra one is 4x rarer to find.
        </p>
      </div>

      <div className="hole-card">
        <h3 className="hole-card-title">Fountain bars</h3>
        <div className="hole-fountain-bars">
          {fountain.bars.map(bar => (
            <div
              key={bar.t}
              className="hole-fountain-bar"
            >
              <div className="hole-fountain-bar-head">
                <span className="hole-entry-name tooltip-anchor">
                  {bar.name}
                  <span className="tooltip tooltip--wrap">{bar.text}</span>
                </span>
                <span className="hole-fountain-bar-count">
                  {Math.floor(bar.progress).toLocaleString()} / {bar.req.toLocaleString()}
                </span>
              </div>
              <progress
                className={`hole-cap-bar hole-fountain-bar--${bar.t}`}
                value={Math.min(bar.progress, bar.req)}
                max={bar.req}
              />
              <div className="hole-fountain-bar-stats">
                <span className="hole-fountain-bar-stat">
                  <span className="hole-fountain-bar-label">Time to full</span>
                  <strong>{formatFountainTime(bar.timeToFull)}</strong>
                </span>
                <span className="hole-fountain-bar-stat">
                  <span className="hole-fountain-bar-label">Full cycle</span>
                  <strong>{formatFountainTime(bar.fullCycle)}</strong>
                </span>
                {bar.activeMulti > 1 && (
                  <span className="hole-fountain-bar-stat tooltip-anchor">
                    <span className="hole-fountain-bar-label">Active fill</span>
                    <strong>x{formatHoleNumber(bar.activeMulti)}</strong>
                    <span className="tooltip tooltip--wrap">
                      Fills this much faster while a character stands in the Fountain (Water Bender). Times shown are AFK.
                    </span>
                  </span>
                )}
                {bar.makes != null && (
                  <span className="hole-fountain-bar-stat">
                    <span className="hole-fountain-bar-label">Makes</span>
                    <strong>{Math.round(bar.makes).toLocaleString()} marble</strong>
                  </span>
                )}
                {bar.duckChance != null && (
                  <span className="hole-fountain-bar-stat tooltip-anchor">
                    <span className="hole-fountain-bar-label">Duck chance</span>
                    <strong>{(bar.duckChance * 100).toPrecision(3)}%</strong>
                    <span className="tooltip tooltip--wrap">
                      1 in {Math.round(1 / bar.duckChance).toLocaleString()} per full bar to get +1 Rubber Ducky stack.
                    </span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hole-card">
        <h3 className="hole-card-title">Upgrades</h3>
        <div className="page-tabs page-tabs--sub hole-tabs">
          {fountain.waters.map(tab => (
            <button
              key={tab.t}
              type="button"
              className={`page-tab-btn${activeWater === tab.t ? ' page-tab-btn--active' : ''}`}
              onClick={() => setActiveWater(tab.t)}
            >
              {tab.name} Water{!tab.unlocked && ' (locked)'}
            </button>
          ))}
        </div>
        <p className="hole-text hole-text--note">
          {water.totalLevels.toLocaleString()} upgrade LVs in {water.name} water. Tiers follow the unlock order: an
          upgrade opens once the one before it reaches LV 10 (Penny Lane and Cosmological Boost open at LV 1). Green
          costs = you can afford the next LV.
        </p>
        <div className="hole-fountain-tiers">
          {water.tiers.map((tier, depth) => (
            <div
              key={depth}
              className="hole-fountain-tier"
            >
              <span className="hole-fountain-tier-label">{depth === 0 ? 'Starting upgrade' : `Tier ${depth + 1}`}</span>
              {tier.map(upgrade => (
                <UpgradeCard
                  key={upgrade.index}
                  upgrade={upgrade}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
