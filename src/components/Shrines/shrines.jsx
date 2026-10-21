import { shrineMap, shrineBuffMap } from '../../data'
import { worldMap } from '../../data/worldMap'
import { shrineLevelColor } from '../../utils/appUtils'
import { getLegendTalentLevel } from '../../utils/legendTalentUtils'
import InfoPanel from '../InfoPanel/InfoPanel'
import BuffsPanel from '../BuffsPanel/BuffsPanel'

import './shrines.css'

// Dancing Coral bonuses start once a shrine's building passes this level
const CORAL_START_LEVEL = 200
const WORLD_ORDER_TALENT = 38

function compactNumber(n) {
  if (n >= 1e9) return (Math.floor(n / 1e8) / 10).toFixed(1).replace(/\.0$/, '') + 'B'
  if (n >= 1e6) return (Math.floor(n / 1e5) / 10).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1e3) return (Math.floor(n / 100) / 10).toFixed(1).replace(/\.0$/, '') + 'k'
  return Math.floor(n).toString()
}

function formatBonus(value, isMultiplier = false) {
  if (isMultiplier) return `${(1 + value / 100).toFixed(2)}x`
  return `+${Number.isInteger(value) ? value.toLocaleString() : value.toFixed(1)}%`
}

// Buffs panel: save-backed unlocks, null = unknown (older import or not readable from the save)
function getShrineBuffs(snapshot) {
  const saved = snapshot?.shrineBuffs
  const fromSave = key => (saved ? !!saved[key] : null)
  const active = {
    architect: fromSave('architect'),
    worldTour: fromSave('labUnlocked'),
    moaiHead: fromSave('moaiHead'),
    bargaining: fromSave('bargaining'),
    worldOrder: snapshot?.legendTalents
      ? getLegendTalentLevel(snapshot.legendTalents, WORLD_ORDER_TALENT) > 0
      : null,
  }
  return Object.entries(shrineBuffMap).map(([key, buff]) => ({
    key,
    ...buff,
    active: active[key],
  }))
}

function ShrineCard({ id, level, xp, xpRequired, mapIndex, constructionLevel }) {
  const entry = shrineMap[id]
  const name = entry?.name ?? `Shrine ${id}`
  const location = worldMap[mapIndex] ?? `Map ${mapIndex}`
  const coral = entry?.coral

  const currentBonus = entry
    ? entry.baseBonus + (level - 1) * entry.bonusPerLevel
    : null

  const coralUnlocked = coral && constructionLevel > CORAL_START_LEVEL
  const coralBonus = coralUnlocked
    ? coral.perLevel * (constructionLevel - CORAL_START_LEVEL)
    : null

  const pct = xpRequired > 0 ? Math.min((xp / xpRequired) * 100, 100) : 0
  const levelColor = shrineLevelColor(level)

  return (
    <div className="shrine-card">
      <div className="shrine-card-top">
        <span className="shrine-building tooltip-anchor">
          <img
            src="images/skills/construction.png"
            alt="Construction"
            className="shrine-building-icon"
          />
          {constructionLevel}
          <span className="tooltip shrine-tooltip">
            <span className="shrine-tooltip-name">Building Lv {constructionLevel}</span>
            <span className="shrine-tooltip-line">
              {(1 + constructionLevel / 10).toFixed(1)}x Shrine EXP gain (+10% per level)
            </span>
            {coral && (
              <span className="shrine-tooltip-line">
                Past Lv {CORAL_START_LEVEL}: {coral.multi ? `+${coral.perLevel / 100}x` : `+${coral.perLevel}%`} {coral.bonus} per level
              </span>
            )}
          </span>
        </span>
        <img
          src={`images/shrines/ConTowerB${id}.png`}
          alt={name}
          className="shrine-card-img"
          onError={e => { e.currentTarget.style.opacity = '0.3' }}
        />
      </div>
      <div className="shrine-card-body">
        <span className="shrine-card-name">{name}</span>
        <span className="shrine-card-level" style={{ color: levelColor }}>
          Lv. {level}
        </span>
        {currentBonus !== null && (
          <span className="shrine-card-bonus">
            {formatBonus(currentBonus)} {entry.bonus}
          </span>
        )}
        {coral && (
          <>
            <div className="shrine-bonus-divider" />
            {coralUnlocked ? (
              <span className="shrine-card-bonus shrine-card-coral">
                {formatBonus(coralBonus, coral.multi)} {coral.bonus}
              </span>
            ) : (
              <span className="shrine-card-bonus shrine-card-coral--locked">
                {coral.bonus} at building Lv {CORAL_START_LEVEL + 1}
              </span>
            )}
          </>
        )}
        <div className="shrine-progress-track">
          <div
            className="shrine-progress-fill"
            style={{ width: `${pct}%`, background: levelColor }}
          />
        </div>
        <span className="shrine-card-xp">
          {pct >= 100
            ? 'Maxed!'
            : `${compactNumber(xp)} / ${compactNumber(xpRequired)}`}
        </span>
        <span className="shrine-card-location">{location}</span>
      </div>
    </div>
  )
}

export default function Shrines({ snapshot }) {
  const shrines = snapshot?.shrines

  if (!shrines || shrines.length === 0) {
    return (
      <div className="page">
        <h2 className="page-title">Shrines</h2>
        <p className="page-empty">No shrine data — import a save to see your shrines.</p>
      </div>
    )
  }

  return (
    <div className="page">
      <h2 className="page-title">Shrines</h2>
      <InfoPanel
        intro="This page covers everything you need to know about Shrines — including Shrine Level, Shrine Bonus, required EXP, building level, and Shrine location."
        items={[
          'Shrines grant bonuses to any character on the same map and gain EXP when you collect AFK gains there. Moving a Shrine to a new map resets its progress toward the next level.',
          'Each Shrine is also a Construction building. Its building level (top corner of each card) multiplies its EXP gain by +10% per level.',
          'World 7 – Dancing Coral: once a Shrine\'s building passes Lv 200, every extra level adds a second bonus, shown under the divider on its card.',
          'The buffs below make Shrines much easier to manage. With all of them, Shrines can sit in any world and still level up and apply to every character. Hover each one for details.',
        ]}
      />
      <BuffsPanel
        title="Shrine Buffs"
        buffs={getShrineBuffs(snapshot)}
      />
      <div className="shrine-card-grid">
        {shrines.map(({ id, level, xp, xpRequired, mapIndex, constructionLevel }) => (
          <ShrineCard
            key={id}
            id={id}
            level={level}
            xp={xp}
            xpRequired={xpRequired}
            mapIndex={mapIndex}
            constructionLevel={constructionLevel}
          />
        ))}
      </div>
    </div>
  )
}
