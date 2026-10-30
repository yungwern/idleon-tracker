import { useState } from 'react'
import {
  obolMap,
  obolByRawName,
  circleTiers,
  squareTiers,
  hexagonTiers,
  sparkleTiers,
  obolFarmMap,
  obolFarmSources,
  mobsMap,
  mapEnemyData,
  familyBoards,
  characterBoards,
} from '../../data'
import TierList from '../TierList/TierList'
import InfoPanel from '../InfoPanel/InfoPanel'
import { AccountBoard, CharacterBoard, ObolStatsPanel } from './ObolBoard'
import {
  OBOL_CHECK_MODES,
  passesObolCheck,
  getEffectiveRolls,
  getObolNoticeTitle,
  getFamilyMainStat,
  obolHasUq,
} from './ObolUtils'
import { getFamilyObolNotices } from '../../utils/obolNotices.js'
import { getCharacterNotices } from '../../utils/characterNotices.js'
import './Obols.css'

// ── Helpers ───────────────────────────────────────────────────────────────────

// Family board obols that pass the roll check (gold glow in the tier list)
function buildUpgradedIds(accountObols = [], checkMode) {
  return new Set(
    accountObols
      .filter(slot => slot.rawName !== 'Blank' && passesObolCheck(getEffectiveRolls(slot.rawName, slot.stoneData), checkMode, getFamilyMainStat(), obolHasUq(slot.rawName)))
      .map(slot => slot.rawName)
  )
}

// ── Roll Check Picker ─────────────────────────────────────────────────────────
// One value for all three modes (each is stricter than the last), so they can't be combined.

function RollCheckPicker({ checkMode, onChange }) {
  const active = OBOL_CHECK_MODES.find(m => m.id === checkMode) ?? OBOL_CHECK_MODES[0]
  return (
    <div className="obols-check">
      <span className="obols-check-label">Roll check</span>
      <div className="segmented-control" role="radiogroup" aria-label="Obol roll check">
        {OBOL_CHECK_MODES.map(mode => (
          <button
            key={mode.id}
            type="button"
            role="radio"
            aria-checked={mode.id === active.id}
            className={`segmented-control-btn${mode.id === active.id ? ' segmented-control-btn--active' : ''}`}
            onClick={() => onChange(mode.id)}
          >
            {mode.label}
          </button>
        ))}
      </div>
      <p className="obols-check-desc">{active.description}</p>
    </div>
  )
}

// ── Family Board Notice ───────────────────────────────────────────────────────

function FamilyObolNotice({ noBonus, noBonusTotal, checkMode }) {
  if (noBonusTotal === 0) {
    return <p className="char-notice-clear obols-notice-clear">✓ Every family obol passes</p>
  }
  return (
    <div className="char-notice obols-notice">
      <div className="char-notice-header">
        <span className="char-notice-title">
          ⚠ {getObolNoticeTitle(noBonusTotal, checkMode)}
        </span>
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
  )
}

// ── Personal Boards Notice ────────────────────────────────────────────────────
// Characters with equipped obols that fail the roll check (same counts as their Overview notices).
// Click a character to open its Obols tab.

function PersonalObolNotice({ failedByCharacter, checkMode, onOpenCharacter }) {
  if (failedByCharacter.length === 0) {
    return <p className="char-notice-clear obols-notice-clear">✓ Every equipped character obol passes</p>
  }
  const total = failedByCharacter.reduce((sum, c) => sum + c.count, 0)
  return (
    <div className="char-notice obols-notice">
      <div className="char-notice-header">
        <span className="char-notice-title">
          ⚠ {getObolNoticeTitle(total, checkMode)} across {failedByCharacter.length}{' '}
          {failedByCharacter.length === 1 ? 'character' : 'characters'}
        </span>
      </div>
      <div className="char-notice-items">
        {failedByCharacter.map(({ name, count }) => (
          <button
            key={name}
            type="button"
            className="char-notice-chip obols-notice-chip"
            title={`Open ${name}'s obols`}
            onClick={() => onOpenCharacter(name)}
          >
            {name}: {count} →
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Setup Picker ──────────────────────────────────────────────────────────────
// Shows one example setup at a time so more setups can be added without crowding the tab.

function SetupPicker({ setups, active, onChange }) {
  return (
    <div className="obols-setup-picker">
      <span className="obols-check-label">Example setup</span>
      <div className="segmented-control" role="radiogroup" aria-label="Example setup">
        {Object.entries(setups).map(([id, setup]) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={id === active}
            className={`segmented-control-btn${id === active ? ' segmented-control-btn--active' : ''}`}
            onClick={() => onChange(id)}
          >
            {setup.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Example Boards Tab ────────────────────────────────────────────────────────
// Sub-tabs: Family Boards (the player's family board, checked, above one example setup) and
// Personal Boards (one character example setup). Each sub-tab shows its notice first.
// Boards stack with their stats beside them (like the character Obols tab); the setup picker sits
// right above the example board so swapping setups doesn't move it.
// Family board save order (ObolEqO1) matches the on-screen layout, so no remap is needed.

const BOARD_TABS = [
  { id: 'family',   label: 'Family Boards' },
  { id: 'personal', label: 'Personal Boards' },
]

function FamilyBoardsTab({ accountObols, familyNotices, checkMode, menagerie, hasSave }) {
  const [setupId, setSetupId] = useState(Object.keys(familyBoards)[0])
  const setup = familyBoards[setupId]
  const hasFamilyBoard = accountObols.length > 0
  const familySlots = accountObols.map(slot => slot.rawName)
  const familyStoneData = Object.fromEntries(accountObols.map((slot, i) => [i, slot.stoneData]))
  const setupObols = setup.slots.map(rawName => ({ rawName }))

  return (
    <>
      {hasFamilyBoard && (
        <FamilyObolNotice
          noBonus={familyNotices.noBonus}
          noBonusTotal={familyNotices.noBonusTotal}
          checkMode={checkMode}
        />
      )}
      {hasFamilyBoard && (
        <div className="obols-board-group">
          <div className="obols-section-label obols-section-label--own">Your Family Board</div>
          <div className="obols-board-row">
            <AccountBoard
              slots={familySlots}
              stoneDataMap={familyStoneData}
              checkMode={checkMode}
              mainStat={getFamilyMainStat()}
            />
            <ObolStatsPanel
              obols={accountObols}
              menagerie={menagerie}
            />
          </div>
        </div>
      )}
      <div className="obols-board-group">
        <SetupPicker
          setups={familyBoards}
          active={setupId}
          onChange={setSetupId}
        />
        <div className="obols-section-label">{setup.label} Board</div>
        <div className="obols-board-row">
          <AccountBoard slots={setup.slots} />
          <ObolStatsPanel
            obols={setupObols}
            menagerie={menagerie}
            note="Base stats, no rerolls"
            showMissing={hasSave}
          />
        </div>
      </div>
    </>
  )
}

function PersonalBoardsTab({ hasSave, failedByCharacter, checkMode, onOpenCharacter }) {
  const [setupId, setSetupId] = useState(Object.keys(characterBoards)[0])
  const setup = characterBoards[setupId]

  return (
    <>
      {hasSave && (
        <PersonalObolNotice
          failedByCharacter={failedByCharacter}
          checkMode={checkMode}
          onOpenCharacter={onOpenCharacter}
        />
      )}
      <SetupPicker
        setups={characterBoards}
        active={setupId}
        onChange={setSetupId}
      />
      <div className="obols-char-boards-row">
        <div className="obols-char-board-group">
          <div className="obols-section-label">{setup.label} Board</div>
          <CharacterBoard slots={setup.slots} />
        </div>
      </div>
    </>
  )
}

function ExampleBoardsTab({ accountObols, familyNotices, hasSave, menagerie, failedByCharacter, boardNotices, checkMode, onOpenCharacter }) {
  const [boardTab, setBoardTab] = useState('family')

  return (
    <div className="obols-example-tab">
      <div className="page-tabs page-tabs--sub">
        {BOARD_TABS.map(tab => (
          <button
            key={tab.id}
            className={`page-tab-btn${boardTab === tab.id ? ' page-tab-btn--active' : ''}`}
            onClick={() => setBoardTab(tab.id)}
          >
            {tab.label}
            {boardNotices[tab.id] > 0 && <span className="notice-badge">{boardNotices[tab.id]}</span>}
          </button>
        ))}
      </div>

      {boardTab === 'family' && (
        <FamilyBoardsTab
          accountObols={accountObols}
          familyNotices={familyNotices}
          checkMode={checkMode}
          menagerie={menagerie}
          hasSave={hasSave}
        />
      )}
      {boardTab === 'personal' && (
        <PersonalBoardsTab
          hasSave={hasSave}
          failedByCharacter={failedByCharacter}
          checkMode={checkMode}
          onOpenCharacter={onOpenCharacter}
        />
      )}
    </div>
  )
}

// ── Farm Tab ──────────────────────────────────────────────────────────────────

function FarmCard({ farmEntry }) {
  const { farmRawName, mobKey } = farmEntry
  const obolInfo = obolByRawName[farmRawName]
  const mobName = mobsMap[mobKey] ?? null
  const shopSource = obolFarmSources[mobKey]
  const mapEntry = mapEnemyData.find(m => m.mobKey === mobKey) ?? null
  // Pre-sized thumbnails (images/obols/farm/) so the browser never resizes them
  const mobImgSrc = mobKey ? `images/obols/farm/${mobKey}.png` : null

  // Where to get it: shop name, then map name, then mob name
  const sourceLabel = shopSource?.label ?? mapEntry?.mapName ?? mobName
  const bottomLabel = sourceLabel
    ? <span className="obols-farm-card-map">{sourceLabel}</span>
    : null

  return (
    <div className="obols-farm-card">
      <div className="obols-farm-card-top">
        <img
          src={`images/obols/${farmRawName}.png`}
          alt={obolInfo?.name ?? farmRawName}
          className="obols-farm-card-obol-img"
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
        {mobImgSrc && (
          <img
            src={mobImgSrc}
            alt={mobName ?? mobKey}
            className="obols-farm-card-mob-img"
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
        )}
      </div>
      <div className="obols-farm-card-body">
        <span className="obols-farm-card-name">{obolInfo?.name ?? farmRawName}</span>
        {bottomLabel}
      </div>
    </div>
  )
}

// ── Farming Tab ──────────────────────────────────────────────────────────────

const FARM_GROUP_LABELS = {
  stat:      'Stat Obols',
  fighting:  'Fighting Obols',
  misc:      'Misc Obols',
  skilling:  'Skilling Obols',
  boss:      'Boss & Event Obols',
  eventboss: 'Boss & Event Obols',
  miniboss:  'Boss & Event Obols',
  gemshop:   'Gem Shop Obols',
}

const FARM_GROUP_ORDER = [
  'Stat Obols',
  'Fighting Obols',
  'Misc Obols',
  'Skilling Obols',
  'Boss & Event Obols',
  'Gem Shop Obols',
]

function FarmingTab() {
  const grouped = {}

  Object.entries(obolFarmMap).forEach(([key, entry]) => {
    const obolEntry = obolMap[key]
    const type = obolEntry?.type ?? 'misc'
    const groupLabel = FARM_GROUP_LABELS[type] ?? 'Misc Obols'
    if (!grouped[groupLabel]) grouped[groupLabel] = []
    grouped[groupLabel].push({ key, ...entry })
  })

  return (
    <div className="obols-farm-tab">
      {FARM_GROUP_ORDER.map(groupLabel => {
        const entries = grouped[groupLabel]
        if (!entries?.length) return null
        return (
          <div key={groupLabel} className="obols-farm-group">
            <div className="obols-section-label">{groupLabel}</div>
            <div className="obols-farm-grid">
              {entries.map(entry => (
                <FarmCard key={entry.key} farmEntry={entry} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

const TIER_LISTS = [
  { label: 'Circle',  tiers: circleTiers },
  { label: 'Square',  tiers: squareTiers },
  { label: 'Hexagon', tiers: hexagonTiers },
  { label: 'Sparkle', tiers: sparkleTiers },
]

const TABS = [
  { id: 'examples', label: 'Example Boards' },
  { id: 'tierlist', label: 'Tier List' },
  { id: 'farming',  label: 'Farming' },
]

export default function Obols({ snapshot, obolCheckMode, onObolCheckModeChange, onOpenCharacterObols }) {
  const [activeTab, setActiveTab] = useState('examples')

  const accountObols = snapshot?.accountObols ?? []
  const upgradedIds = buildUpgradedIds(accountObols, obolCheckMode)
  const familyNotices = getFamilyObolNotices(snapshot, obolCheckMode)
  const failedByCharacter = (snapshot?.characters ?? [])
    .map(c => ({
      name: c.name,
      count: getCharacterNotices(c, obolCheckMode).noBonusTotal,
    }))
    .filter(c => c.count > 0)
  const boardNotices = {
    family: familyNotices.noBonusTotal > 0 ? 1 : 0,
    personal: failedByCharacter.length > 0 ? 1 : 0,
  }
  const tabNotices = {
    examples: boardNotices.family + boardNotices.personal,
  }

  const tierListProps = {
    itemMap: obolByRawName,
    upgradedIds,
    imagePath: 'images/obols',
  }

  return (
    <div className="page obols-page">
      <h2 className="page-title">Obols</h2>

      <InfoPanel
        intro="Obols are equippable items that provide passive bonuses to your characters and account. A few things to keep in mind:"
        items={[
          'Obols come in four shapes (Circle, Square, Hexagon, Sparkle), and each board slot only takes its matching shape.',
          'Tiers go Bronze → Silver → Gold → Platinum → Dementia, so any obol you farm can be upgraded all the way to Dementia.',
          <strong>DO NOT UPGRADE POP OBOLS PAST SILVER!!!</strong>,
          'Obol Fragments reroll bonus stats. Save them mainly for Silver Pop Obols.',
          'Go DR over everything else. Other sets have niche uses, but for most accounts just set everyone to DR and forget about it.',
          'Skilling Obols can boost print sizes, but I wouldn\'t bother. Buy what you can from the Alchemy Shop until you can upgrade each type to max tier for the Slab.',
          'Construction Obols only work on the character you\'re active on. Equip them, open Construction in the Codex to update speeds, then swap back to your DR obols and you keep the bonus.',
        ]}
      />

      <RollCheckPicker
        checkMode={obolCheckMode}
        onChange={onObolCheckModeChange}
      />

      {/* ── Nav Bar ── */}
      <div className="page-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`page-tab-btn${activeTab === tab.id ? ' page-tab-btn--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tabNotices[tab.id] > 0 && <span className="notice-badge">{tabNotices[tab.id]}</span>}
          </button>
        ))}
      </div>

      {/* ── Example Boards Tab ── */}
      {activeTab === 'examples' && (
        <ExampleBoardsTab
          accountObols={accountObols}
          familyNotices={familyNotices}
          hasSave={Boolean(snapshot)}
          menagerie={snapshot?.menagerie}
          failedByCharacter={failedByCharacter}
          boardNotices={boardNotices}
          checkMode={obolCheckMode}
          onOpenCharacter={onOpenCharacterObols}
        />
      )}

      {/* ── Tier List Tab ── */}
      {activeTab === 'tierlist' && (
        <div className="obols-tier-grid">
          {TIER_LISTS.map(({ label, tiers }) => (
            <div key={label} className="obols-tier-group">
              <div className="obols-section-label">{label}</div>
              <TierList tiers={tiers} {...tierListProps} />
            </div>
          ))}
        </div>
      )}

      {/* ── Farming Tab ── */}
      {activeTab === 'farming' && (
        <FarmingTab />
      )}
    </div>
  )
}