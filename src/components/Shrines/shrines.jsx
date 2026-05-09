import { shrineMap } from '../../data'
import { worldMap } from '../../data/worldMap'
import { shrineLevelColor } from '../../utils/appUtils'
import InfoPanel from '../InfoPanel/InfoPanel'

import './Shrines.css'

function compactNumber(n) {
  if (n >= 1e9) return (Math.floor(n / 1e8) / 10).toFixed(1).replace(/\.0$/, '') + 'B'
  if (n >= 1e6) return (Math.floor(n / 1e5) / 10).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1e3) return (Math.floor(n / 100) / 10).toFixed(1).replace(/\.0$/, '') + 'k'
  return Math.floor(n).toString()
}

function formatBonus(value, isMultiplier = false) {
  if (isMultiplier) return `${value.toFixed(2)}x`
  return `+${Number.isInteger(value) ? value : value.toFixed(1)}%`
}

function ShrineCard({ id, level, xp, xpRequired, mapIndex, constructionLevel }) {
  const entry = shrineMap[id]
  const name = entry?.name ?? `Shrine ${id}`
  const location = worldMap[mapIndex] ?? `Map ${mapIndex}`

  const currentBonus = entry
    ? entry.baseBonus + (level - 1) * entry.bonusPerLevel
    : null

  let currentBonus2 = null
  if (entry?.bonus2 && constructionLevel > 200) {
    const levelsAbove200 = constructionLevel - 200
    if (id === 21) {
      currentBonus2 = 1 + (entry.bonusPerLevel2 - 1) * levelsAbove200
    } else {
      currentBonus2 = entry.bonusPerLevel2 * levelsAbove200
    }
  }

  const pct = xpRequired > 0 ? Math.min((xp / xpRequired) * 100, 100) : 0
  const levelColor = shrineLevelColor(level)

  return (
    <div className="shrine-card">
      <div className="shrine-card-top">
        <img
          src={`/images/shrines/ConTowerB${id}.png`}
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
        {currentBonus2 !== null && (
          <>
            <div className="shrine-bonus-divider" />
            <span className="shrine-card-bonus shrine-card-bonus2">
              {formatBonus(currentBonus2, id === 21)} {entry.bonus2}
            </span>
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
      intro="This page helps you keep track of everything you need to know about shrines. Shrine Level, Shrine Bonus, Required EXP and Shrine location are all included."
      items={[
        'To place shrines in your map, use the Star Talent called "Shrine Architect." This talent is unlocked by completing the quest "Taking Samples" from Hoggindaz in World 3.',
        'Shrines will give bonuses to any character in the same map. Shrines will gain EXP when you collect AFK time on that same map. You will also lose all of your progress towards the next level if you move the shrine to a new map.',
        'There are a few bonuses throughout IdleOn that give quality of life to gaining access to shrine bonuses.',
        'World 4 - Lab Bonus "Shrine World Tour" - If a shrine is placed within town, instead of in a monster map, it will act as though it is placed in EVERY map in that entire world!',
        'World 5 - Sailing Artifact "Moai Head" - Get bonuses from all shrines from any map! You must be in same map/world to level them up though., Ancient: All shrines level up +100% faster!',
        'World 6 - Jade Emporium "Shrine Collective Bargaining Agreement" - Shrines no longer lose EXP when moved around, so you can finally bring those baddies out of retirement!',
      ]}
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