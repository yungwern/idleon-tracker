import { useState } from 'react'
import {
  obolMap,
  obolByRawName,
  circleTiers,
  squareTiers,
  hexagonTiers,
  sparkleTiers,
  obolFarmMap,
  mobsMap,
  mapEnemyData,
  idealAccountBoard,
  endgameAccountBoard,
  characterBoards,
} from '../../data'
import TierList from '../TierList/TierList'
import InfoPanel from '../InfoPanel/InfoPanel'
import { AccountBoard, CharacterBoard } from './ObolBoard'
import { isUpgraded } from './obolUtils'
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

// These keys use larger image files and need to be scaled down
const SCALED_MOB_KEYS = new Set([
  // World bosses
  'Amarok', 'Efaunt', 'Chizoar', 'Massive_Troll', 'Kattlekruk', 'Emperor',
  // Minibosses
  'Glunko_The_Massive', 'Baba_Yaga', 'Dr_Defacus', 'Biggie_Hours', 'King_Doot',
  'Dilapidated_Slush', 'Mutated_Mush', 'Domeo_Magmus', 'Demented_Spiritlord',
  // Event bosses
  'Grandfrogger', 'Ice_Guard', 'Grumblo', 'Snakenhotep', 'Fallen_Meteor',
  // Shop currencies
  'PremiumGem', 'Liquid1_x1',
])

function getMobImageSrc(mobKey) {
  if (!mobKey) return null
  if (mobKey === 'PremiumGem') return '/images/gem shop/PremiumGem.png'
  if (mobKey === 'Liquid1_x1') return '/images/alchemy/Liquid1_x1.png'
  return `/images/mobs/${mobKey}.png`
}

function FarmCard({ farmEntry }) {
  const { farmRawName, mobKey, notes } = farmEntry
  const obolInfo = obolByRawName[farmRawName]
  const mobName = mobsMap[mobKey] ?? null
  const mapEntry = mapEnemyData.find(m => m.mobKey === mobKey) ?? null
  const mobImgSrc = getMobImageSrc(mobKey)
  const isScaled = SCALED_MOB_KEYS.has(mobKey)

  // Determine bottom label based on source type
  let bottomLabel = null
  if (mobKey === 'Liquid1_x1') {
    bottomLabel = <span className="obols-farm-card-map">Alchemy Shop</span>
  } else if (mobKey === 'PremiumGem') {
    bottomLabel = <span className="obols-farm-card-map">Gem Shop</span>
  } else if (mapEntry) {
    bottomLabel = <span className="obols-farm-card-map">{mapEntry.mapName}</span>
  } else if (mobName) {
    bottomLabel = <span className="obols-farm-card-map">{mobName}</span>
  }

  return (
    <div className="obols-farm-card">
      <div className="obols-farm-card-top">
        <img
          src={`/images/obols/${farmRawName}.png`}
          alt={obolInfo?.name ?? farmRawName}
          className="obols-farm-card-obol-img"
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
        {mobImgSrc && (
          <img
            src={mobImgSrc}
            alt={mobName ?? mobKey}
            className={`obols-farm-card-mob-img${isScaled ? ' obols-farm-card-mob-img--scaled' : ''}`}
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

export default function Obols({ snapshot }) {
  const [activeTab, setActiveTab] = useState('examples')

  const accountObols = snapshot?.accountObols ?? []
  const upgradedIds = buildUpgradedIds(accountObols)

  const tierListProps = {
    itemMap: obolByRawName,
    upgradedIds,
    imagePath: '/images/obols',
  }

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

  return (
    <div className="page obols-page">
      <h2 className="page-title">Obols</h2>

      <InfoPanel
        intro="Obols are equippable items that provide passive bonuses to your characters and account. A few things to keep in mind:"
        items={[
          'Obols come in four shapes: Circle, Square, Hexagon, and Sparkle. Each slot on your obol board only accepts the matching shape.',
          'Upgrade order for obols is Bronze → Silver → Gold → Platinum → Dementia. Farming a lower tier obol can eventually be upgraded all the way to Dementia.',
          <strong>DO NOT UPGRADE POP OBOLS PAST SILVER!!!</strong>,
          'Obols can be rerolled using Obol Fragments to add or improve bonus stats. Save your Fragments for mainly rerolling Silver Pop Obols.',
          'Your main goal with Obols should be DR over everything else. There are niche scenarios where other sets can be useful but for the most part just set everyone to DR and forget about it.',
          'Skilling Obols can be used to increase print sizes but I honestly wouldn\'t even bother. Buy what you can from the alchemy shop until you get enough to upgrade each type to max tier for the Slab.',
          'Construction Obols are the other set that people will often times recommend. However, construction obols only work while ACTIVE on a character. There is a strategy to swap the construction set to the character you\'re active on and then open the Construction tab in the Codex. After updating construction speeds you can swap back to your main DR obols and keep the bonus.',
        ]}
      />

      {/* ── Nav Bar ── */}
      <div className="obols-nav">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`obols-nav-btn${activeTab === tab.id ? ' obols-nav-btn--active' : ''}`}
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