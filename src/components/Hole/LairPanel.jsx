import { useState } from 'react'
import { getLair, LAIR_TABS, LAIR_SHAPE_ICON } from '../../utils/holeCavernUtils'
import { formatHoleNumber } from '../../utils/holeUtils'

// The Lair (cavern 18, Crystal Glunko Cove): the header stats, the 12 shapes owned, and both upgrade tabs with the
// upgrades grouped by the shape that pays for them (each in-game column).

export default function LairPanel({ snapshot, lead }) {
  const lair = getLair(snapshot)
  const [activeTab, setActiveTab] = useState(LAIR_TABS[0].key)
  const tab = LAIR_TABS.find(entry => entry.key === activeTab)
  // One group per shape: the two upgrades it pays for (top and bottom of one in-game column)
  const groups = lair.shapes.slice(tab.first / 2, tab.first / 2 + 6).map(shape => ({
    shape,
    upgrades: lair.upgrades.filter(upgrade => upgrade.shape === shape.index),
  }))

  return (
    <>
      <div className="hole-stats">
        {lead}
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Drop Rate here</span>
          <span className="hole-stat-card-value">{formatHoleNumber(lair.dropRate)}x</span>
          <span className="hole-stat-card-hint">
            Every Lair DR upgrade multiplied together. Collectors use {lair.blueDigits} blue / {lair.purpDigits} purp
            shape digits, Killionaire {lair.killDigits} digits of Glunko kills, Rich Get Rich {lair.drDigits} digits of normal DR.
          </span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">AFK Gains here</span>
          <span className="hole-stat-card-value">{formatHoleNumber(lair.afkGains)}%</span>
          <span className="hole-stat-card-hint">
            10% base + Sleepy Drops and Sleepy Drops+. The in-game header can show more: AFK boosts from outside the
            Lair aren't counted here yet.
          </span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Multikill per DMG tier</span>
          <span className="hole-stat-card-value">{formatHoleNumber(lair.multikillPerTier)}%</span>
          <span className="hole-stat-card-hint">Big Hit Multkill. The in-game Multikill = base + this × your character's damage tiers.</span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Base Multikill</span>
          <span className="hole-stat-card-value">+{formatHoleNumber(lair.multikillBase)}%</span>
          <span className="hole-stat-card-hint">From the Multikill upgrade.</span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Faster respawn</span>
          <span className="hole-stat-card-value">+{formatHoleNumber(lair.respawn)}%</span>
          <span className="hole-stat-card-hint">Crystal Glunko respawn rate (Reslime).</span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Double Shape chance</span>
          <span className="hole-stat-card-value">{formatHoleNumber(lair.doubleShape)}%</span>
          <span className="hole-stat-card-hint">
            Chance a shape pickup counts double: +10% each from the More Goo, Even More Goo and Increasingly More Goo
            schematics.
          </span>
        </div>
      </div>

      <div className="hole-card">
        <h3 className="hole-card-title">Shapes</h3>
        <div className="hole-icon-tiles hole-icon-tiles--rupies">
          {lair.shapes.map(shape => (
            <div
              key={shape.index}
              className="hole-icon-tile tooltip-anchor"
            >
              <img
                className="hole-lair-shape"
                src={shape.icon}
                alt=""
              />
              <span className="hole-icon-tile-value">{formatHoleNumber(shape.owned)}</span>
              <span className="tooltip">{shape.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="hole-card">
        <h3 className="hole-card-title">Upgrades</h3>
        <div className="page-tabs page-tabs--sub hole-tabs">
          {LAIR_TABS.map(entry => (
            <button
              key={entry.key}
              type="button"
              className={`page-tab-btn${activeTab === entry.key ? ' page-tab-btn--active' : ''}`}
              onClick={() => setActiveTab(entry.key)}
            >
              {entry.label}
            </button>
          ))}
        </div>
        <p className="hole-text hole-text--note">
          Upgrades are grouped by the shape that pays for them (one column in the game). The second upgrade of each
          pair costs 5x more.
          {lair.dailyDiscount && ' Costs include the 15% daily discount (study), like the in-game shop shows right now.'}
          {' '}Green costs = you can afford the next LV.
        </p>
        <div className="hole-lair-groups">
          {groups.map(group => (
            <div
              key={group.shape.index}
              className={`hole-lair-group hole-lair-group--${tab.key}`}
            >
              <div className="hole-lair-group-head">
                <img
                  className="hole-lair-group-icon"
                  src={group.shape.icon}
                  alt=""
                />
                <span className="hole-lair-group-name">{group.shape.name}</span>
                <span className="hole-lair-group-owned">{formatHoleNumber(group.shape.owned)} owned</span>
              </div>
              {group.upgrades.map(upgrade => (
                <div
                  key={upgrade.t}
                  className={`hole-lair-upgrade${upgrade.unlocked ? '' : ' hole-entry--locked'}`}
                >
                  <div className="hole-lair-upgrade-head">
                    <span className="hole-entry-name">{upgrade.name}</span>
                    <span className="hole-lair-upgrade-level">LV {upgrade.level.toLocaleString()}</span>
                  </div>
                  <span className="hole-entry-text">{upgrade.text}</span>
                  <span className={`hole-fountain-cost${upgrade.affordable ? ' hole-fountain-cost--ok' : ''}`}>
                    Cost: {formatHoleNumber(upgrade.cost)}
                    <img
                      className="hole-fountain-cost-icon"
                      src={LAIR_SHAPE_ICON(upgrade.shape)}
                      alt=""
                    />
                  </span>
                  {!upgrade.unlocked && (
                    <span className="hole-entry-meta hole-fountain-needs">Find a {upgrade.shapeName} to unlock</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
