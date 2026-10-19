import { useState } from 'react'
import PremiumGearTab from '../PremiumGear/PremiumGear.jsx'
import { CharacterBoard } from '../Obols/ObolBoard.jsx'
import { getObolNotices } from '../Obols/ObolUtils.js'
import { getUnspentSuperTalents } from '../../utils/talentUtils.js'
import { prayerMap } from '../../data/prayerMap'
import { obolByRawName } from '../../data'
import './CharacterCard.css'

import { toClassSlug } from '../../utils/appUtils.js'

// Save stores slots in a mixed order — this maps visual position to save index
const CHAR_OBOL_VISUAL_TO_SAVE = [
  0, 2, 4,   // Row 1 large: save[0], save[2], save[4]
  1, 3,      // Section 1 top pair: save[1], save[3]
  5, 7,      // Section 1 mid pair: save[5], save[7]
  6, 8,      // Section 1 bot pair: save[6], save[8]
  9, 10, 11, // Row 2 large: save[9], save[10], save[11]
  12, 13,    // Section 2 top pair: save[12], save[13]
  14, 16,    // Section 2 mid pair: save[14], save[16]
  15, 17,    // Section 2 bot pair: save[15], save[17]
  18, 19, 20 // Row 3 large: save[18], save[19], save[20]
]

function CharacterObolsTab({ charIndex, snapshot }) {
  const obols = snapshot?.characters?.[charIndex]?.obols ?? []

  if (!obols.length) {
    return <div className="obols-empty-state">No obol data available — import a save to see equipped obols.</div>
  }

  // Remap from save order to visual order
  const remapped = CHAR_OBOL_VISUAL_TO_SAVE.map(saveIdx => obols[saveIdx] ?? { rawName: 'Blank', stoneData: {} })

  const slots = remapped.map(s => s.rawName)
  const stoneDataMap = {}
  remapped.forEach((slot, idx) => {
    stoneDataMap[idx] = slot.stoneData
  })

  return (
    <div className="char-obols-tab">
      <CharacterBoard slots={slots} stoneDataMap={stoneDataMap} />
    </div>
  )
}

// ── Overview Notifications ────────────────────────────────────────────────────
// Things on this character that need attention. Add new checks here as
// more notification types are built.
function CharacterNotices({ character, charIndex, snapshot, onViewObols }) {
  const obols = snapshot?.characters?.[charIndex]?.obols ?? []
  const { noBonus, emptySlots } = getObolNotices(obols, character.level ?? 0)
  const noBonusTotal = noBonus.reduce((sum, o) => sum + o.count, 0)
  const unspentTalents = getUnspentSuperTalents(character.superTalentPresets, character.level ?? 0)
  const unspentTotal = unspentTalents.reduce((sum, t) => sum + t.unspent, 0)
  const hasNotices = noBonusTotal > 0 || emptySlots > 0 || unspentTotal > 0

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
              ⚠ {noBonusTotal} {noBonusTotal === 1 ? 'obol has' : 'obols have'} no bonus stat
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

export default function CharacterCard({ character, charIndex, snapshot }) {
  const [activeTab, setActiveTab] = useState('overview')
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

      {/* ── Best For Bar ── */}
      {character.bestFor.length > 0 && (
        <div className="best-for-bar">
          {character.bestFor.map(b => (
            <span key={b} className="best-for-pill">{b}</span>
          ))}
        </div>
      )}

      {/* ── Prayers ── */}
      {snapshot?.characters?.[charIndex]?.prayers?.length > 0 && (
        <div className="prayers-bar">
          <span className="prayers-label">Prayers:</span>
          {snapshot.characters[charIndex].prayers.map(id => (
            <div key={id} className="prayer-icon-wrap tooltip-anchor">
              <img
                src={`images/prayers/Prayer${id}.png`}
                alt={prayerMap[id]?.name ?? `Prayer ${id}`}
                className="prayer-icon"
              />
              <span className="tooltip">{prayerMap[id]?.name ?? `Prayer ${id}`}</span>
            </div>
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
              character={character}
              charIndex={charIndex}
              snapshot={snapshot}
              onViewObols={() => setActiveTab('obols')}
            />
            <section className="char-overview-section">
              <h3 className="char-overview-heading">Premium Gear</h3>
              <PremiumGearTab charIndex={charIndex} snapshot={snapshot} />
            </section>
          </div>
        )}

        {activeTab === 'obols' && (
          <CharacterObolsTab charIndex={charIndex} snapshot={snapshot} />
        )}

      </div>
    </div>
  )
}