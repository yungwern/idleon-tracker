import { useState } from 'react'
import PremiumGearTab from '../PremiumGear/PremiumGear.jsx'
import Keychains from '../Keychains/Keychains.jsx'
import AnvilProduction from '../AnvilProduction/AnvilProduction.jsx'
import { CharacterBoard, ObolStatsPanel } from '../Obols/ObolBoard.jsx'
import { getCharacterNotices } from '../../utils/characterNotices.js'
import { getClassMainStat } from '../../utils/characterUtils.js'
import {
  getSkillMenuOrder,
  getSkillLevel,
  getSkillExp,
  getMaestroHandStatus,
} from '../../utils/skillUtils.js'
import { formatBigNumber } from '../../utils/cogBoardUtils.js'
import { getObolNoticeTitle } from '../Obols/ObolUtils.js'
import { prayerMap } from '../../data/prayerMap'
import { obolByRawName, CHAR_OBOL_SAVE_TO_DISPLAY } from '../../data'
import './CharacterCard.css'

import { toClassSlug } from '../../utils/appUtils.js'
import {
  getPrayerValues,
  formatPrayerText,
  sortPrayers,
} from '../../utils/prayerUtils.js'

// ── Prayer icon ──────────────────────────────────────────────────────────────
// level = PrayOwned[id]; undefined on snapshots imported before prayer levels were parsed
function PrayerIcon({ prayerId, level }) {
  const prayer = prayerMap[prayerId]
  const name = prayer?.name ?? `Prayer ${prayerId}`
  const { bonus, curse } = getPrayerValues(prayerId, level)

  return (
    <div className="prayer-icon-wrap tooltip-anchor">
      <img
        src={`images/prayers/Prayer${prayerId}.png`}
        alt={name}
        className="prayer-icon"
      />
      <span className="tooltip tooltip--wrap buff-tooltip prayer-tooltip">
        <span className="buff-tooltip-name">{name}</span>
        {level !== undefined && (
          <span className="buff-tooltip-source">
            Lv {level}{prayer ? ` / ${prayer.maxLevel}` : ''}
          </span>
        )}
        {prayer && (
          <>
            <span className="prayer-tooltip-bonus">{formatPrayerText(prayer.effect, bonus)}</span>
            <span className="prayer-tooltip-curse">Curse: {formatPrayerText(prayer.curse, curse)}</span>
          </>
        )}
        {level === undefined && (
          <span className="buff-tooltip-warning">Re-import your save to see this prayer's values</span>
        )}
      </span>
    </div>
  )
}

// Obols tab: the board at in-game positions with its totals ("What it gives") on the right.
// The save's slot order differs from reading order on the bottom half (CHAR_OBOL_SAVE_TO_DISPLAY).
function CharacterObolsTab({ charIndex, snapshot, obolCheckMode }) {
  const obols = snapshot?.characters?.[charIndex]?.obols ?? []
  const mainStat = getClassMainStat(snapshot?.characters?.[charIndex]?.class)

  if (!obols.length) {
    return <div className="char-obols-empty">No obol data available — import a save to see equipped obols.</div>
  }

  const slots = []
  const stoneDataMap = {}
  obols.forEach((slot, saveIdx) => {
    const displayIdx = CHAR_OBOL_SAVE_TO_DISPLAY[saveIdx] ?? saveIdx
    slots[displayIdx] = slot.rawName
    stoneDataMap[displayIdx] = slot.stoneData
  })

  return (
    <div className="char-obols-tab">
      <CharacterBoard
        slots={slots}
        stoneDataMap={stoneDataMap}
        checkMode={obolCheckMode}
        mainStat={mainStat}
      />
      <ObolStatsPanel
        obols={obols}
        menagerie={snapshot?.menagerie}
      />
    </div>
  )
}

// Hover details for one skill, like the top of its in-game skill page
function SkillTooltip({ character, skill, hand }) {
  const level = getSkillLevel(character, skill)
  const exp = getSkillExp(character, skill)

  return (
    <span className="tooltip tooltip--wrap buff-tooltip char-skill-tooltip">
      <span className="buff-tooltip-name char-skill-tooltip-name">{skill}</span>
      <span className="buff-tooltip-source">LV {level}</span>
      {exp
        ? (
          <>
            <span className="char-skill-exp-bar">
              <span
                className="char-skill-exp-fill"
                style={{ '--exp-percent': `${exp.percent}%` }}
              />
            </span>
            <span className="char-skill-exp-text">
              EXP {formatBigNumber(exp.exp)} / {formatBigNumber(exp.req)} ({Math.floor(exp.percent)}%)
            </span>
          </>
        )
        : <span className="buff-tooltip-warning">Re-import your save to see skill EXP</span>}
      {hand && <MaestroHandLine hand={hand} />}
    </span>
  )
}

// Tooltip line for a Maestro hand skill. hand = { entry, isMaestro, maestroName, level }
function MaestroHandLine({ hand }) {
  const { entry, isMaestro, maestroName, level } = hand

  if (isMaestro) {
    if (entry.blocked.length > 0) {
      return (
        <span className={`char-skill-hand-line char-skill-hand-line--${entry.status}`}>
          Maestro hands: {entry.blocked.map(other => `${other.name} (${other.level})`).join(', ')}
          {entry.blocked.length === 1 ? ' is' : ' are'} tied or above, so no bonus for them
        </span>
      )
    }
    return (
      <span className={`char-skill-hand-line char-skill-hand-line--${entry.status}`}>
        Maestro hands: {entry.lead} LV ahead of {entry.closest?.name} ({entry.closest?.level})
        {entry.skipsMages && ' · mages not counted'}
      </span>
    )
  }

  const gets = level < entry.maestroLevel
  return (
    <span className={`char-skill-hand-line char-skill-hand-line--${gets ? 'safe' : 'blocked'}`}>
      {gets
        ? `Below ${maestroName} (${entry.maestroLevel}): gets the Maestro hand bonus`
        : `Tied or above ${maestroName} (${entry.maestroLevel}): no Maestro hand bonus`}
    </span>
  )
}

// Corner marker on a hand skill: the Vman's lead (+19 / -25) or ✓ / ✗ for everyone else
function MaestroHandMarker({ hand }) {
  const { entry, isMaestro, level } = hand
  if (isMaestro) {
    const lead = entry.blocked.length > 0
      ? entry.maestroLevel - entry.blocked[0].level
      : entry.lead
    return (
      <span className={`char-skill-hand char-skill-hand--${entry.status}`}>
        {lead > 0 ? `+${lead}` : lead}
      </span>
    )
  }
  const gets = level < entry.maestroLevel
  return (
    <span className={`char-skill-hand char-skill-hand--${gets ? 'safe' : 'blocked'}`}>
      {gets ? '✓' : '✗'}
    </span>
  )
}

// Skills tab: every skill's icon and level, laid out like the in-game skill menu
function CharacterSkillsTab({ charIndex, snapshot }) {
  const character = snapshot?.characters?.[charIndex]
  const handStatus = getMaestroHandStatus(snapshot?.characters)
  const getHand = skill => {
    const entry = handStatus?.skills.find(item => item.skill === skill)
    if (!entry) return null
    return {
      entry,
      isMaestro: charIndex === handStatus.maestroIndex,
      maestroName: handStatus.maestroName,
      level: getSkillLevel(character, skill),
    }
  }

  if (!character?.skillLevels?.length) {
    return <div className="char-skills-empty">No skill data available — import a save to see skill levels.</div>
  }

  return (
    <div className="char-skills-grid">
      {getSkillMenuOrder().map((skill, i) => {
        if (!skill) return <div key={`empty-${i}`} />
        const hand = getHand(skill)
        return (
          <div
            key={skill}
            className="char-skill tooltip-anchor"
          >
            {hand && <MaestroHandMarker hand={hand} />}
            <img
              src={`images/skills/${skill}.png`}
              alt={skill}
              className="char-skill-icon"
            />
            <span className="char-skill-level">LV {getSkillLevel(character, skill)}</span>
            <SkillTooltip
              character={character}
              skill={skill}
              hand={hand}
            />
          </div>
        )
      })}
    </div>
  )
}

// ── Overview Notifications ────────────────────────────────────────────────────
// Things on this character that need attention. Add new checks here as
// more notification types are built.
function CharacterNotices({ charIndex, snapshot, obolCheckMode, onViewObols, onViewSkills }) {
  const {
    noBonus,
    noBonusTotal,
    emptySlots,
    unspentTalents,
    unspentTotal,
    maestroHand,
    count,
  } = getCharacterNotices(snapshot?.characters?.[charIndex], obolCheckMode, snapshot?.characters, charIndex)
  const hasNotices = count > 0

  if (!snapshot) return null

  return (
    <section className="char-overview-section">
      <h3 className="char-overview-heading">Notifications</h3>

      {!hasNotices && (
        <p className="char-notice-clear">✓ Nothing needs attention</p>
      )}

      {noBonusTotal > 0 && (
        <div className="char-notice">
          <div className="char-notice-header">
            <span className="char-notice-title">
              ⚠ {getObolNoticeTitle(noBonusTotal, obolCheckMode)}
            </span>
            <button className="char-notice-link" onClick={onViewObols}>
              View obols →
            </button>
          </div>
          <div className="char-notice-items">
            {noBonus.map(({ rawName, count }) => (
              <div key={rawName} className="char-notice-item tooltip-anchor">
                <img
                  src={`images/obols/${rawName}.png`}
                  alt={obolByRawName[rawName]?.name ?? rawName}
                  className="char-notice-item-img"
                />
                {count > 1 && <span className="char-notice-item-count">×{count}</span>}
                <span className="tooltip">{obolByRawName[rawName]?.name ?? rawName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {unspentTotal > 0 && (
        <div className="char-notice">
          <div className="char-notice-header">
            <span className="char-notice-title">
              ⚠ {unspentTotal} unspent super talent {unspentTotal === 1 ? 'point' : 'points'}
            </span>
          </div>
          <div className="char-notice-items">
            {unspentTalents.map(({ tab, unspent }) => (
              <span key={tab} className="char-notice-chip">
                Tab {tab}: {unspent} {unspent === 1 ? 'point' : 'points'}
              </span>
            ))}
          </div>
        </div>
      )}

      {maestroHand.skills.length > 0 && (
        <div className="char-notice">
          <div className="char-notice-header">
            <span className="char-notice-title">
              ⚠ Maestro hand bonus lost in {maestroHand.skills.length} {maestroHand.skills.length === 1 ? 'skill' : 'skills'}
            </span>
            <button className="char-notice-link" onClick={onViewSkills}>
              View skills →
            </button>
          </div>
          <div className="char-notice-items">
            {maestroHand.skills.map(entry => (
              <span key={entry.skill} className="char-notice-chip char-notice-chip--skill">
                <img
                  src={`images/skills/${entry.skill}.png`}
                  alt={entry.skill}
                  className="char-notice-chip-icon"
                />
                {entry.blocked.map(other => `${other.name} ${other.level}`).join(', ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {emptySlots > 0 && (
        <div className="char-notice">
          <div className="char-notice-header">
            <span className="char-notice-title">
              ⚠ {emptySlots} empty obol {emptySlots === 1 ? 'slot' : 'slots'}
            </span>
            <button className="char-notice-link" onClick={onViewObols}>
              View obols →
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default function CharacterCard({ character, charIndex, snapshot, obolCheckMode, initialTab = 'overview' }) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const slug = toClassSlug(character.class)

  return (
    <div className="character-card" data-class={slug}>

      {/* ── Header ── */}
      <div className="card-header">
        <div className="card-header-left">
          <div className="class-label">Character — Lv {character.level || '?'}</div>
          <h2>{character.name}</h2>
          {character.trophy && (
            <div className="trophy-icon-wrapper">
              <img
                src={character.trophy.src}
                alt={character.trophy.label}
                className="trophy-icon"
                title={character.trophy.label}
              />
            </div>
          )}
        </div>
        <div className="card-header-right">
          {character.nametag && (
            <img
              src={character.nametag.src}
              alt={character.nametag.label}
              className="nametag-image"
              title={character.nametag.label}
            />
          )}
          <div className="class-badge">{character.class}</div>
        </div>
      </div>

      {/* ── Class Roles ── */}
      {character.roles.length > 0 && (
        <div className="class-roles-bar">
          {character.roles.map(role => (
            <span
              key={`${role.source}-${role.label}`}
              className="class-role-pill tooltip-anchor"
            >
              {role.label}
              {role.allChars && <span className="class-role-account" aria-label="Works for all characters">✦</span>}
              <span className="tooltip tooltip--wrap buff-tooltip class-role-tooltip">
                <span className="buff-tooltip-name">{role.label}</span>
                <span className="buff-tooltip-source">
                  {role.own ? role.source : `From ${role.source} tab`}
                </span>
                <span className="buff-tooltip-line">{role.text}</span>
                <span className="class-role-talents">{role.talents.join(' · ')}</span>
                <span className={`class-role-scope${role.allChars ? ' class-role-scope--account' : ''}`}>
                  {role.allChars ? '✦ Works for all characters' : 'This character only'}
                </span>
              </span>
            </span>
          ))}
        </div>
      )}

      {/* ── Prayers ── */}
      {snapshot?.characters?.[charIndex]?.prayers?.length > 0 && (
        <div className="prayers-bar">
          <span className="prayers-label">Prayers</span>
          {sortPrayers(snapshot.characters[charIndex].prayers).map(id => (
            <PrayerIcon
              key={id}
              prayerId={id}
              level={snapshot.worship?.prayerLevels?.[id]}
            />
          ))}
        </div>
      )}

      {/* ── Tab Navigation ── */}
      <div className="card-tabs" style={{ '--tab-count': 3 }}>
        {['overview', 'skills', 'obols'].map(tab => (
          <button
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="card-body">

        {activeTab === 'overview' && (
          <div className="char-overview">
            <CharacterNotices
              charIndex={charIndex}
              snapshot={snapshot}
              obolCheckMode={obolCheckMode}
              onViewObols={() => setActiveTab('obols')}
              onViewSkills={() => setActiveTab('skills')}
            />
            <section className="char-overview-section">
              <h3 className="char-overview-heading">Premium Gear</h3>
              <PremiumGearTab charIndex={charIndex} snapshot={snapshot} />
            </section>
            <section className="char-overview-section">
              <h3 className="char-overview-heading">Keychains</h3>
              <Keychains charIndex={charIndex} snapshot={snapshot} />
            </section>
            {snapshot?.anvil && (
              <section className="char-overview-section">
                <h3 className="char-overview-heading">Anvil</h3>
                <AnvilProduction charIndex={charIndex} snapshot={snapshot} />
              </section>
            )}
          </div>
        )}

        {activeTab === 'skills' && (
          <CharacterSkillsTab
            charIndex={charIndex}
            snapshot={snapshot}
          />
        )}

        {activeTab === 'obols' && (
          <CharacterObolsTab
            charIndex={charIndex}
            snapshot={snapshot}
            obolCheckMode={obolCheckMode}
          />
        )}

      </div>
    </div>
  )
}