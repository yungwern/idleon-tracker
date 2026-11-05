import { useMemo, useState } from 'react'
import { shrineMap, shrineBuffMap } from '../../data'
import { worldMap } from '../../data/worldMap'
import { shrineLevelColor } from '../../utils/appUtils'
import { getLegendTalentLevel } from '../../utils/legendTalentUtils'
import { CHEESE_MODES, getShrineExpModel, simulateShrineLevels } from '../../utils/shrineUtils'
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

// Hours of AFK gains → '45m', '6h 12m', '3d 4h', '206d', '3.3y'
function formatHours(hours) {
  if (!Number.isFinite(hours)) return 'Never'
  const minutes = Math.round(hours * 60)
  if (minutes < 60) return `${Math.max(1, minutes)}m`
  if (minutes < 48 * 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
  const wholeHours = Math.round(hours)
  if (wholeHours < 240) return `${Math.floor(wholeHours / 24)}d ${wholeHours % 24}h`
  const days = Math.round(hours / 24)
  if (days < 365) return `${days}d`
  return `${(hours / 24 / 365).toFixed(1)}y`
}

function formatSpeedup(ratio) {
  if (!Number.isFinite(ratio)) return '—'
  return ratio >= 10 ? `${Math.round(ratio).toLocaleString()}x` : `${ratio.toFixed(2)}x`
}

const SIM_LEVELS = [1, 2, 3, 5, 10]
const MODE_KEY = 'idleon_shrine_cheese_mode'
const LEVELS_KEY = 'idleon_shrine_sim_levels'

function readStored(key, fallback, isValid) {
  try {
    const value = localStorage.getItem(key)
    return value !== null && isValid(value) ? value : fallback
  } catch {
    return fallback
  }
}

function writeStored(key, value) {
  try {
    localStorage.setItem(key, String(value))
  } catch {
    // storage blocked: the choice just isn't remembered
  }
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

function ShrineCard({ id, level, xp, xpRequired, mapIndex, constructionLevel, sim, compare, compareLabel, levels }) {
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
        {sim && level > 0 && (
          <div className="shrine-sim tooltip-anchor">
            <span className="shrine-sim-rate">{compactNumber(sim.rate.value)} EXP/hr</span>
            <span className="shrine-sim-label">{levels === 1 ? 'Next LV in' : `LV ${sim.targetLevel} in`}</span>
            <span className="shrine-sim-time">{formatHours(sim.targetHours)}</span>
            {compare && (
              <span className="shrine-sim-compare">
                {compareLabel}: {formatHours(compare.targetHours)}
              </span>
            )}
            <span className="tooltip tooltip--wrap shrine-tooltip">
              <span className="shrine-tooltip-name">Levelled by</span>
              {sim.rate.characters.length > 0
                ? sim.rate.characters.map(c => (
                  <span key={c.index} className="shrine-tooltip-line">
                    {c.name}{c.cheese > 0 ? ` (cheese +${compactNumber(c.cheese)}%)` : ''}
                  </span>
                ))
                : <span className="shrine-tooltip-line">Nobody: no character stands where it levels</span>}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// Golden Cheese toggle, levels picker and the setup comparison
function CheeseSimulator({ mode, onMode, levels, onLevels, modes, results, beanstalkCheese }) {
  const total = id => results[id].rateTotal
  const speedup = total('current') / total('none')
  const cheeseShare = 1 - total('none') / total('current')
  const characters = results.current.model.characters
  return (
    <div className="shrine-sim-panel">
      <div className="shrine-sim-controls">
        <div className="page-tabs page-tabs--sub shrine-sim-tabs">
          {modes.map(id => (
            <button
              key={id}
              type="button"
              className={`page-tab-btn${mode === id ? ' page-tab-btn--active' : ''}`}
              onClick={() => onMode(id)}
            >
              {CHEESE_MODES[id].label}
            </button>
          ))}
        </div>
        <label className="shrine-sim-levels">
          Simulate
          <select
            className="styled-select"
            value={levels}
            onChange={e => onLevels(Number(e.target.value))}
          >
            {SIM_LEVELS.map(n => (
              <option key={n} value={n}>
                {n === 1 ? 'Next level' : `+${n} levels`}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="shrine-sim-stats">
        <div className="shrine-sim-stat">
          <span className="shrine-sim-stat-value">{formatSpeedup(speedup)}</span>
          <span className="shrine-sim-stat-label">faster with your Golden Cheese than without</span>
        </div>
        <div className="shrine-sim-stat">
          <span className="shrine-sim-stat-value">{(cheeseShare * 100).toFixed(1)}%</span>
          <span className="shrine-sim-stat-label">of your shrine EXP comes from Golden Cheese</span>
        </div>
        {beanstalkCheese && (
          <div className="shrine-sim-stat">
            <span className="shrine-sim-stat-value">{formatSpeedup(total('current') / total('beanstalk'))}</span>
            <span className="shrine-sim-stat-label">faster than Beanstalk cheese alone (equipped stacks on top)</span>
          </div>
        )}
      </div>
      <details className="dropdown-panel shrine-sim-chars">
        <summary className="dropdown-panel-head">
          <span className="dropdown-panel-title">Golden Cheese per character</span>
        </summary>
        <div className="dropdown-panel-body">
          <div className="shrine-sim-char-row shrine-sim-char-row--head">
            <span>Character</span>
            <span>Equipped stack</span>
            <span>Shrine EXP bonus</span>
          </div>
          {characters.map(c => {
            const equipped = results.current.equippedStacks[c.index]
            return (
              <div key={c.index} className="shrine-sim-char-row">
                <span>{c.name}</span>
                <span className={equipped ? '' : 'shrine-sim-muted'}>
                  {equipped ? compactNumber(equipped) : beanstalkCheese ? 'Beanstalk only' : 'None'}
                </span>
                <span>+{compactNumber(c.cheese)}%</span>
              </div>
            )
          })}
        </div>
      </details>
    </div>
  )
}

const GOLDEN_CHEESE = 'FoodG8'

export default function Shrines({ snapshot }) {
  const shrines = snapshot?.shrines
  const [mode, setMode] = useState(() => readStored(MODE_KEY, 'current', value => value in CHEESE_MODES))
  const [levels, setLevels] = useState(() => Number(readStored(LEVELS_KEY, '1', value => SIM_LEVELS.includes(Number(value)))))

  const results = useMemo(() => {
    if (!shrines?.length) return null
    return Object.fromEntries(Object.keys(CHEESE_MODES).map(id => {
      const model = getShrineExpModel(snapshot, id)
      const sims = simulateShrineLevels(snapshot, model, levels)
      return [id, {
        model,
        sims,
        rateTotal: sims.reduce((sum, sim) => sum + sim.rate.value, 0),
        equippedStacks: (snapshot?.characters ?? []).map(c => (c?.food ?? [])
          .filter(slot => slot.item === GOLDEN_CHEESE)
          .reduce((sum, slot) => sum + slot.qty, 0)),
      }]
    }))
  }, [snapshot, shrines, levels])

  // Beanstalk only is the same as Your setup when nobody equips cheese, and the same as none without a stalk copy
  const beanstalkCheese = results ? results.beanstalk.rateTotal > results.none.rateTotal : false
  const modes = Object.keys(CHEESE_MODES).filter(id => id !== 'beanstalk' || beanstalkCheese)
  const activeMode = modes.includes(mode) ? mode : 'current'
  const compareMode = activeMode === 'current' ? 'none' : 'current'

  const changeMode = id => {
    setMode(id)
    writeStored(MODE_KEY, id)
  }
  const changeLevels = n => {
    setLevels(n)
    writeStored(LEVELS_KEY, n)
  }

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
          'Golden Cheese simulator: each card shows its EXP per hour and how long the next level (or more) takes with every character AFK where it stands now. Switch between your setup, Beanstalk cheese only, and no Golden Cheese at all to compare. Crystal Shrine level ups along the way are included. Hover the times to see who levels each shrine.',
        ]}
      />
      <BuffsPanel
        title="Shrine Buffs"
        buffs={getShrineBuffs(snapshot)}
      />
      {results && (
        <CheeseSimulator
          mode={activeMode}
          onMode={changeMode}
          levels={levels}
          onLevels={changeLevels}
          modes={modes}
          results={results}
          beanstalkCheese={beanstalkCheese}
        />
      )}
      <div className="shrine-card-grid">
        {shrines.map(({ id, level, xp, xpRequired, mapIndex, constructionLevel }, i) => (
          <ShrineCard
            key={id}
            id={id}
            level={level}
            xp={xp}
            xpRequired={xpRequired}
            mapIndex={mapIndex}
            constructionLevel={constructionLevel}
            sim={results?.[activeMode].sims[i]}
            compare={results?.[compareMode].sims[i]}
            compareLabel={compareMode === 'none' ? 'No cheese' : 'Your setup'}
            levels={levels}
          />
        ))}
      </div>
    </div>
  )
}
