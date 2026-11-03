import { useState } from 'react'
import { getJars, formatChance } from '../../utils/holeCavernUtils'
import { formatHoleNumber } from '../../utils/holeUtils'

// The Jars (cavern 11): rupies owned, production stats, the jars being made, every jar type and the 40 collectibles
// (an 8-wide icon grid like the game: click one to read it underneath).

function formatJarTime(hours) {
  if (!Number.isFinite(hours)) return 'never'
  const seconds = hours * 3600
  if (seconds < 60) return `${seconds.toFixed(1)} sec`
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} min`
  if (hours < 48) return `${hours.toFixed(1)} h`
  return `${formatHoleNumber(hours / 24)} days`
}

const SUCCESS_WORDS = { 1: 'opal', 2: 'new collectible', 4: 'enchant' }

export default function JarsPanel({ snapshot, lead, tomePoints }) {
  const jars = getJars(snapshot, tomePoints)
  const extraRupies = 1 + Math.floor(jars.rupieExtraChance / 100)
  const found = jars.collectibles.filter(collectible => collectible.level > 0).length
  // Clicked collectible (shown under the grid); starts on the one picked to be enchanted, like the game's highlight
  const [selectedIndex, setSelectedIndex] = useState(null)
  const selected = jars.collectibles[selectedIndex ?? jars.collectibles.find(item => item.doubled)?.index ?? 0]

  return (
    <>
      <div className="hole-stats">
        {lead}
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Progress per hour</span>
          <span className="hole-stat-card-value">{formatHoleNumber(jars.perHour)}</span>
          <span className="hole-stat-card-hint">
            {formatHoleNumber(jars.perHour / 60)} per minute, in each of your {jars.slots} production slots.
          </span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Rupie value</span>
          <span className="hole-stat-card-value">{formatHoleNumber(jars.rupieValue)}x</span>
          <span className="hole-stat-card-hint">Every rupie found is worth this much.</span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Extra rupie chance</span>
          <span className="hole-stat-card-value">{formatHoleNumber(jars.rupieExtraChance)}%</span>
          <span className="hole-stat-card-hint">
            Each broken jar gives {extraRupies} or {extraRupies + 1} rupies.
          </span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Jars on the shelf</span>
          <span className="hole-stat-card-value">{jars.held} / {jars.shelfSize}</span>
          <span className="hole-stat-card-hint">
            {formatHoleNumber(jars.quantity)} total quantity (a T2 jar counts as 10 T1 jars).
          </span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Enhancing levels</span>
          <span className="hole-stat-card-value">{jars.enhancingLevels.toLocaleString()}</span>
          <span className="hole-stat-card-hint">Every collectible LV past the first. More levels make enchanting harder.</span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Jars destroyed</span>
          <span className="hole-stat-card-value">{formatHoleNumber(jars.destroyed)}</span>
          <span className="hole-stat-card-hint">All jar types together.</span>
        </div>
      </div>

      <div className="hole-card">
        <h3 className="hole-card-title">Rupies</h3>
        <div className="hole-icon-tiles hole-icon-tiles--rupies">
          {jars.rupies.map(rupie => (
            <div
              key={rupie.index}
              className="hole-icon-tile tooltip-anchor"
            >
              <img
                className="hole-icon-tile-img"
                src={rupie.image}
                alt=""
              />
              <span className="hole-icon-tile-value">{formatHoleNumber(rupie.amount)}</span>
              <span className="tooltip">{rupie.kind} rupie</span>
            </div>
          ))}
        </div>
      </div>

      <div className="hole-card">
        <h3 className="hole-card-title">Producing now</h3>
        <div className="hole-jar-slots">
          {jars.producing.map(slot => (
            <div
              key={slot.slot}
              className="hole-jar-slot"
            >
              <img
                className="hole-jar-slot-img"
                src={slot.type?.image}
                alt=""
              />
              <div className="hole-jar-slot-body">
                <span className="hole-entry-name">{slot.type?.name}</span>
                <span className="hole-entry-meta">{formatJarTime(slot.type?.hoursToMake)} each</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hole-card">
        <h3 className="hole-card-title">
          Jars
          {jars.recommended && (
            <span className="hole-card-title-stat">Next ×10 soonest: {jars.recommended.name}</span>
          )}
        </h3>
        {jars.productionLine && (
          <p className="hole-text hole-text--note">
            Jar Production Line: each ×10 jars broken makes the next jar type +5% faster (Simple Jars feed Simple and Tall).
            It grows a little with every jar, so ×10 is a checkpoint. <strong>Make next</strong> = soonest ×10 with
            all {jars.slots} slots on it; a T2 jar counts as 10.
          </p>
        )}
        <div className="hole-entries hole-entries--jars">
          {jars.types.map(jar => (
            <div
              key={jar.index}
              className={`hole-entry${jar.unlocked ? '' : ' hole-entry--locked'}${jar.recommended ? ' hole-entry--recommended' : ''}`}
            >
              <img
                className="hole-entry-icon"
                src={jar.image}
                alt=""
              />
              <div className="hole-entry-body">
                <div className="hole-entry-head">
                  <span className="hole-entry-name">{jar.name}</span>
                  {!jar.unlocked && <span className="hole-chip hole-chip--locked">Locked</span>}
                  {jar.held > 0 && <span className="hole-chip">{jar.held} on shelf</span>}
                  {jar.recommended && <span className="hole-chip hole-chip--active">Make next</span>}
                </div>
                <span className="hole-entry-text">{jar.effect}</span>
                {jar.index === 4 && (
                  <span className="hole-entry-meta">
                    By tier: {jars.enchantTiers.map(tier => `T${tier.tier} ${formatChance(tier.chance)}`).join(' · ')}
                  </span>
                )}
                <span className="hole-entry-meta">
                  {formatJarTime(jar.hoursToMake)} each · {formatHoleNumber(jar.perHour)} / hr · Req {Math.floor(jar.req).toLocaleString()}
                </span>
                {jar.hoursPerSuccess != null && !(jar.index === 2 && found === jars.collectibles.length) && (
                  <span className="hole-entry-meta">
                    ~1 {SUCCESS_WORDS[jar.index]} per {formatJarTime(jar.hoursPerSuccess)} in one slot (T1)
                    {jar.guaranteedTier > 1 && ` · guaranteed at T${jar.guaranteedTier}`}
                  </span>
                )}
                {jar.index === 2 && found === jars.collectibles.length && (
                  <span className="hole-entry-meta">Every collectible found: nothing new to find.</span>
                )}
                {jar.line && (
                  <span className="hole-entry-meta hole-entry-meta--line">
                    +{formatHoleNumber(jar.line.boost)}% speed from {jar.line.feederName}s
                  </span>
                )}
                {!jar.line?.feeds.length && <span className="hole-entry-meta">{jar.destroyed.toLocaleString()} broken</span>}
                {jar.line?.feeds.length > 0 && (
                  <span className="hole-jar-next">
                    <span className="hole-jar-next-head">
                      {formatHoleNumber(jar.destroyed)} / {formatHoleNumber(jar.line.next)} broken
                      <span className="hole-jar-next-time">{formatJarTime(jar.line.hoursToNext)}</span>
                    </span>
                    <progress
                      className="hole-cap-bar"
                      value={jar.line.progress}
                      max={1}
                    />
                    <span className="hole-entry-meta">
                      → {jar.line.feeds.join(' & ')}: +{formatHoleNumber(jar.line.giving)}% → +{formatHoleNumber(jar.line.giving + 5)}%
                    </span>
                  </span>
                )}
                {jar.tiers.length > 0 && (
                  <span className="hole-entry-meta">
                    Shelf: {jar.tiers.map(tier => `T${tier.tier} ×${tier.count}`).join(', ')} ({formatHoleNumber(jar.quantity)} quantity)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hole-card">
        <h3 className="hole-card-title">
          Collectibles
          <span className="hole-card-title-stat">{found} / {jars.collectibles.length} found</span>
        </h3>
        <div className="hole-collectibles">
          {jars.collectibles.map(collectible => (
            <button
              key={collectible.index}
              type="button"
              className={`hole-collectible${collectible.level > 0 ? '' : ' hole-collectible--locked'}${collectible.doubled ? ' hole-collectible--picked' : ''}${collectible.index === selected?.index ? ' hole-collectible--selected' : ''}`}
              aria-label={collectible.name}
              onClick={() => setSelectedIndex(collectible.index)}
            >
              <img
                className="hole-collectible-img"
                src={collectible.image}
                alt=""
              />
            </button>
          ))}
        </div>
        {selected && (
          <div className={`hole-entry hole-collectible-detail${selected.doubled ? ' hole-entry--picked' : ''}`}>
            <img
              className="hole-entry-icon"
              src={selected.image}
              alt=""
            />
            <div className="hole-entry-body">
              <div className="hole-entry-head">
                <span className="hole-entry-name">{selected.name}</span>
                <span className="hole-list-level">{selected.level > 0 ? `LV ${selected.level}` : 'Not found yet'}</span>
              </div>
              <span className="hole-entry-text">{selected.text}</span>
              {selected.doubled && (
                <span className="hole-entry-meta hole-entry-meta--picked">Picked: most likely to be enchanted</span>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
