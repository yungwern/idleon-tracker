import { useState } from 'react'
import PremiumGearTab from '../PremiumGear/PremiumGear.jsx'
import AnvilProduction from '../AnvilProduction/AnvilProduction.jsx'
import { CharacterBoard, ObolStatsPanel } from '../Obols/ObolBoard.jsx'
import { getCharacterNotices } from '../../utils/characterNotices.js'
import { getClassMainStat } from '../../utils/characterUtils.js'
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

// ── Overview Notifications ────────────────────────────────────────────────────
// Things on this character that need attention. Add new checks here as
// more notification types are built.
function CharacterNotices({ charIndex, snapshot, obolCheckMode, onViewObols }) {
  const {
    noBonus,
    noBonusTotal,
    emptySlots,
    unspentTalents,
    unspentTotal,
    count,
  } = getCharacterNotices(snapshot?.characters?.[charIndex], obolCheckMode)
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
      <div className="card-tabs" style={{ '--tab-count': 2 }}>
        {['overview', 'obols'].map(tab => (
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
            />
            <section className="char-overview-section">
              <h3 className="char-overview-heading">Premium Gear</h3>
              <PremiumGearTab charIndex={charIndex} snapshot={snapshot} />
            </section>
            {snapshot?.anvil && (
              <section className="char-overview-section">
                <h3 className="char-overview-heading">Anvil</h3>
                <AnvilProduction charIndex={charIndex} snapshot={snapshot} />
              </section>
            )}
          </div>
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