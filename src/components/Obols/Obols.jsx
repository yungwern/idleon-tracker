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
  idealAccountBoard,
  endgameAccountBoard,
  characterBoards,
} from '../../data'
import TierList from '../TierList/TierList'
import InfoPanel from '../InfoPanel/InfoPanel'
import { AccountBoard, CharacterBoard } from './ObolBoard'
import { isUpgraded } from './ObolUtils'
import './Obols.css'

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildUpgradedIds(accountObols = []) {
  return new Set(
    accountObols
      .filter(slot => slot.rawName !== 'Blank' && isUpgraded(slot.stoneData))
      .map(slot => slot.rawName)
  )
}

// ── Example Boards Tab ────────────────────────────────────────────────────────

function ExampleBoardsTab() {
  return (
    <div className="obols-example-tab">
      {/* Account board comparison */}
      <div className="obols-comparison">
        <div className="obols-comparison-col">
          <div className="obols-section-label">Ideal Board</div>
          <AccountBoard slots={idealAccountBoard} />
        </div>
        <div className="obols-comparison-divider" />
        <div className="obols-comparison-col">
          <div className="obols-section-label">Endgame Ideal Board</div>
          <AccountBoard slots={endgameAccountBoard} />
        </div>
      </div>

      {/* Character example boards */}
      <div className="obols-section-label">Character Example Boards</div>
      <div className="obols-char-boards-row">
        {Object.entries(characterBoards).map(([key, board]) => (
          <div key={key} className="obols-char-board-group">
            <div className="obols-section-label">{board.label}</div>
            <CharacterBoard slots={board.slots} />
          </div>
        ))}
      </div>
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

export default function Obols({ snapshot }) {
  const [activeTab, setActiveTab] = useState('examples')

  const accountObols = snapshot?.accountObols ?? []
  const upgradedIds = buildUpgradedIds(accountObols)

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

      {/* ── Nav Bar ── */}
      <div className="page-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`page-tab-btn${activeTab === tab.id ? ' page-tab-btn--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Example Boards Tab ── */}
      {activeTab === 'examples' && (
        <ExampleBoardsTab />
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