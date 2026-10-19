import { useState, useMemo } from 'react'
import { MASTERCLASSES, itemMap, equipmentMap } from '../../data'
import { stampMap, STAMP_TIERS } from '../../data/'
import { bubbleMap, BUBBLE_TIERS } from '../../data'
import TierList from '../TierList/TierList'
import { mobsMap, mapEnemyData } from '../../data'
import { ROYAL_STATUES, PARCHMENT_KEY, royalStatueOddsN, royalStatueBonus, formatStatueMultiplier } from '../../data'
import InfoPanel from '../InfoPanel/InfoPanel'

import './MasterClasses.css'


// ============================================================
// SUB-COMPONENTS
// ============================================================

// Every character in the save with this masterclass (accounts can have 2-3 of the same one)
function findClassCharIndexes(snapshot, mc) {
  return (snapshot?.characters ?? [])
    .map((c, i) => (c.class === mc?.name ? i : null))
    .filter(i => i !== null)
}

// Account-wide count of an item: every character's inventory plus storage
function accountItemTotal(snapshot, key) {
  const inInventories = (snapshot?.characters ?? [])
    .reduce((sum, c) => sum + (c?.inventory?.[key]?.qty ?? 0), 0)
  return inInventories + (snapshot?.storage?.items?.[key] ?? 0)
}

function ActiveClassItem({ snapshot, mc }) {
  if (!mc?.headerItem) return null

  const name = itemMap[mc.headerItem]
  if (!name) return null

  const qty = accountItemTotal(snapshot, mc.headerItem)

  return (
    <div className="mc-header-pill-wrapper">
      <div className="mc-header-pill">
        <div className="mc-header-pill-row">
          <img src={`images/${mc.imageFolder ?? 'items'}/${mc.headerItem}.png`} alt={name} className="mc-header-pill-icon" />
          <span className="mc-header-pill-label">{name}</span>
          <span className="mc-header-pill-count">{qty.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

function MobProgressionTable({ rows, imageFolder = 'items' }) {

  const mobWorldMap = Object.fromEntries(
  mapEnemyData.map(entry => [entry.mobKey, entry.world])
)

  return (
    <div className="mob-prog-table">
      <InfoPanel
        intro="The mob progression tab shows the best mobs to farm for each Masterclass currency at endgame."
        items={[
          'Only the most relevant endgame mobs are listed — earlier worlds are excluded for clarity.',
          'World 6 mobs should be your primary focus. World 7 mobs are included for reference when they become farmable.',
        ]}
      />
      {rows.length === 0 && (
        <p>Mob progression coming soon.</p>
      )}
      {rows.map((row) => (
        <div key={row.currencyKey} className="mob-prog-row">
          <div className="mob-prog-currency">
            <img
              src={`images/${imageFolder}/${row.currencyKey}.png`}
              alt={row.currencyKey}
              className="mob-prog-currency-img"
            />
          </div>
          <div className="mob-prog-mobs">
            {row.mobs.map((mob) => {
              const isW7 = mobWorldMap[mob.key] === 7
              return (
                <div
                  key={mob.key}
                  className={`mob-prog-chip tooltip-anchor${isW7 ? ' mob-prog-chip--w7' : ''}`}
                >
                  <img
                    src={`images/mobs/${mob.key}.png`}
                    alt={mobsMap[mob.key]?.name ?? mob.key}
                    className="mob-prog-mob-img"
                  />
                  <span className="tooltip">
                    {mobsMap[mob.key]?.replace(/_/g, ' ') ?? mob.key.replace(/_/g, ' ')} — {mob.drop.toLocaleString()}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// One character's masterclass weapons and rings (from their inventory)
function CharacterGear({ keys, inventory, imageFolder }) {
  const weapons = []
  const rings = []

  keys.forEach(key => {
    const name = itemMap[key]
    if (!name) return
    const item = inventory?.[key]
    const instances = Array.isArray(item) ? item : (item ? [item] : [])
    const equipment = equipmentMap[key] ?? {}
    const isRing = key.includes('Rings')

    instances.forEach((instance, idx) => {
      const stats = instance?.stats ?? {}
      const uq1 = equipment.uq1txt && stats.UQ1val != null ? `${stats.UQ1val}${equipment.uq1txt}` : null
      const uq2 = equipment.uq2txt && stats.UQ2val != null ? `${stats.UQ2val}${equipment.uq2txt}` : null
      const card = (
        <div className="mc-item-card" key={`${key}-${idx}`}>
          <div className="mc-item-card-top">
            <img src={`images/${imageFolder}/${key}.png`} alt={name} className="mc-item-img" />
          </div>
          <div className="mc-item-card-body">
            <span className="mc-item-name">{name}</span>
            {uq1 && <span className="mc-item-note">{uq1}</span>}
            {uq2 && <span className="mc-item-note">{uq2}</span>}
          </div>
        </div>
      )
      if (isRing) rings.push(card)
      else weapons.push(card)
    })
  })

  if (weapons.length === 0 && rings.length === 0) return null

  return (
    <div className="mc-equipment-sections">
      {weapons.length > 0 && (
        <div className="mc-equipment-group">
          <span className="mc-equipment-heading">Weapons</span>
          <div className="mc-items-grid">{weapons}</div>
        </div>
      )}
      {rings.length > 0 && (
        <div className="mc-equipment-group">
          <span className="mc-equipment-heading">Rings</span>
          <div className="mc-items-grid">{rings}</div>
        </div>
      )}
    </div>
  )
}

function InventorySection({ inventoryKey, snapshot, charIndexes = [], variant, accountWide, imageFolder = 'items' }) {
  const keys = Array.isArray(inventoryKey) ? inventoryKey : [inventoryKey]

  // Gear belongs to a specific character, so show one group per character of this class
  if (variant === 'weapon') {
    if (charIndexes.length === 0) {
      return <p>No characters with this masterclass.</p>
    }
    return (
      <div className="mc-gear-characters">
        {charIndexes.map(i => {
          const char = snapshot?.characters?.[i]
          return (
            <div key={i} className="mc-gear-character">
              <span className="mc-gear-character-name">{char?.name ?? `Character ${i + 1}`}</span>
              <CharacterGear keys={keys} inventory={char?.inventory} imageFolder={imageFolder} />
              {!keys.some(k => char?.inventory?.[k]) && (
                <p>No masterclass gear in this character's inventory.</p>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="mc-items-grid">
      {keys.map(key => {
        const name = itemMap[key]
        if (!name) return null
        const qty = accountWide
          ? accountItemTotal(snapshot, key)
          : (snapshot?.characters?.[charIndexes[0]]?.inventory?.[key]?.qty ?? 0)
        return (
          <div className="mc-item-card" key={key}>
            <div className="mc-item-card-top">
              <img src={`images/${imageFolder}/${key}.png`} alt={name} className="mc-item-img" />
            </div>
            <div className="mc-item-card-body">
              <span className="mc-item-name">{name}</span>
              <span className="mc-item-note">Owned: {qty.toLocaleString()}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Exalted Stamp Tier List ───────────────────────────────────
// Builds the upgradedIds Set by cross-referencing snapshot.exaltedStamps
// (a Set of compassIndex strings) against stampMap entries.
function ExaltedStampTierList({ snapshot }) {
  const upgradedIds = useMemo(() => {
    const exalted = new Set(snapshot?.exaltedStamps ?? [])
    const ids = new Set()
    Object.entries(stampMap).forEach(([rawName, entry]) => {
      if (exalted.has(entry.compassIndex)) {
        ids.add(rawName)
      }
    })
    return ids
  }, [snapshot?.exaltedStamps])

  return (
    <div>
      <InfoPanel
      intro="This tier list tracks your Exalted Stamp upgrades and provides general guidance on upgrade priority."
      items={[
        'Automatically updates when you import a new save.',
        'Stamps are ordered by priority within each tier.',
        'Priority is intended as general guidance — always consider your own account progression before upgrading.',
        'Exalted Stamps cannot be reset. Upgrade with caution!',
      ]}
      />
      <TierList
        tiers={STAMP_TIERS}
        itemsKey="stamps"
        itemMap={stampMap}
        upgradedIds={upgradedIds}
        getOverlay={() => 'images/stamps/Exalted_Stamp_Frame.png'}
        imagePath="images/stamps"
        variant="stamps"
      />
    </div>
  )
}

// ── Prisma Bubble Tier List ───────────────────────────────────
// Builds the upgradedIds Set by cross-referencing snapshot.prismaBubbles
// (a Set of bubbleIndex strings) against bubbleMap entries.
// Glow overlay is cauldron-specific — derived from the rawName at render time.
const CAULDRON_GLOW_MAP = { O: 0, G: 1, P: 2, Y: 3 }

function PrismaBubbleTierList({ snapshot }) {
  const upgradedIds = useMemo(() => {
    const prisma = new Set(snapshot?.prismaBubbles ?? [])
    const ids = new Set()
    Object.entries(bubbleMap).forEach(([rawName, entry]) => {
      if (prisma.has(entry.bubbleIndex)) {
        ids.add(rawName)
      }
    })
    return ids
  }, [snapshot?.prismaBubbles])

  function getBubbleOverlay(rawName) {
    const letter = rawName[9] // 'aUpgradesX...' — index 10 is the cauldron letter
    const glowIndex = CAULDRON_GLOW_MAP[letter] ?? 0
    return `images/bubbles/aUpgradesGlow${glowIndex}.png`
  }

  return (
    <div>
      <InfoPanel
      intro="This tier list tracks your Prisma Bubble upgrades and provides general guidance on upgrade priority."
      items={[
        'Automatically updates when you import a new save.',
        'Bubbles are ordered by priority within each tier.',
        'Priority is intended as general guidance — always consider your own account progression before upgrading.',
        'Prisma Bubbles cannot be reset. Upgrade with caution!',
      ]}
      />
      <TierList
        tiers={BUBBLE_TIERS}
        itemsKey="bubbles"
        itemMap={bubbleMap}
        upgradedIds={upgradedIds}
        getOverlay={getBubbleOverlay}
        imagePath="images/bubbles"
      />
    </div>
  )
}

// ── Map Bonus Helpers ─────────────────────────────────────────────────────────
const lavaLog  = (n) => Math.log(Math.max(n, 1)) / 2.30259
const lavaLog2 = (n) => Math.log(Math.max(n, 1)) / Math.log(2)

function getMapMulti(kills) {
  return (
    (2 * Math.max(0, lavaLog(kills) - 3.5) + Math.max(0, lavaLog2(kills) - 12)) *
    (lavaLog(kills) / 2.5) +
    (Math.min(2, kills / 1e3) + Math.max(5 * (lavaLog(kills) - 5), 0))
  )
}

function formatMulti(value) {
  return (Math.floor(value * 1000) / 1000).toFixed(3) + 'x'
}

const WORLD_LABELS = {
  1: 'World 1', 2: 'World 2', 3: 'World 3', 4: 'World 4',
  5: 'World 5', 6: 'World 6', 7: 'World 7',
}

const MIN_KILLS = 1000

function MapBonusCard({ entry, mapBonuses }) {
  const bonus = mapBonuses?.[entry.mapIndex]
  const drKills  = bonus?.dr  ?? 0
  const expKills = bonus?.exp ?? 0
  const afkKills = bonus?.afk ?? 0

  if (drKills < MIN_KILLS && expKills < MIN_KILLS && afkKills < MIN_KILLS) return null

  const drMulti  = 1 + getMapMulti(drKills)  / 100
  const expMulti = 1 + getMapMulti(expKills) / 100
  const afkMulti = 1 + getMapMulti(afkKills) / 100

  return (
    <div className="map-bonus-card">
      <div className="map-bonus-card-top">
        <img
          src={`images/mobs/${entry.mobKey}.png`}
          alt={entry.mobKey}
          className="map-bonus-mob-img"
        />
      </div>
      <div className="map-bonus-card-body">
        <span className="map-bonus-mob-name">{mobsMap[entry.mobKey] ?? entry.mobKey}</span>
        <div className="map-bonus-stats">
          <span className="map-bonus-stat" data-type="dr">
            DR <strong>{formatMulti(drMulti)}</strong>
          </span>
          <span className="map-bonus-stat" data-type="exp">
            EXP <strong>{formatMulti(expMulti)}</strong>
          </span>
          <span className="map-bonus-stat" data-type="afk">
            AFK <strong>{formatMulti(afkMulti)}</strong>
          </span>
        </div>
      </div>
    </div>
  )
}

function MapBonusSection({ snapshot }) {
  const mapBonuses = snapshot?.mapBonuses

  // Group entries by world
  const byWorld = useMemo(() => {
    const groups = {}
    for (const entry of mapEnemyData) {
      if (!groups[entry.world]) groups[entry.world] = []
      groups[entry.world].push(entry)
    }
    return groups
  }, [])

  const worldNums = Object.keys(byWorld).map(Number).sort((a, b) => a - b)

  return (
    <div className="map-bonus-section">
      <InfoPanel 
      intro="This section tracks Arcane Crystal Map Bonuses for mobs that have been actively farmed. A few things to keep in mind:"
      items={[
        'Only maps with a meaningful bonus are shown here. A minimum threshold of 1.010x is required to filter out bonuses gained simply from progressing through maps.',
        'DR, EXP, and AFK multipliers are displayed for each mob, giving you a quick overview of where your farming time has paid off.',
        'Recommended mobs to prioritize: Green Mushrooms (AFK), Dedotated Rams (DR), Bored Beans (DR).',
      ]}
      />
      {worldNums.map(world => {
        const entries = byWorld[world]
        // Check if this world has any visible cards before rendering the header
        const hasAny = entries.some(entry => {
          const bonus = mapBonuses?.[entry.mapIndex]
          if (!bonus) return false
          return (bonus.dr ?? 0) >= MIN_KILLS || (bonus.exp ?? 0) >= MIN_KILLS || (bonus.afk ?? 0) >= MIN_KILLS
        })
        if (!hasAny) return null

        return (
          <div
            key={world}
            className="map-bonus-world-group"
            style={{ '--world-color': `var(--world-${world}-color)` }}
          >
            <span className="map-bonus-world-label">{WORLD_LABELS[world]}</span>
            <div className="map-bonus-cards">
              {entries.map(entry => (
                <MapBonusCard
                  key={entry.mapIndex}
                  entry={entry}
                  mapBonuses={mapBonuses}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Royal Statues ─────────────────────────────────────────────
// "1 in 25 (4%)" style chance text
function formatChance(n) {
  const pct = 100 / n
  return `1 in ${n.toLocaleString()} (${pct >= 1 ? pct.toFixed(1) : pct.toFixed(2)}%)`
}

function RoyalStatueCard({ statue, level, royalReverenceLevel, marbles, imageFolder }) {
  const name = itemMap[statue.marble] ?? statue.marble
  const released = statue.bonus !== null
  const locked = level === 0
  const oddsN = royalStatueOddsN(statue, level)
  const current = royalStatueBonus(statue, level, royalReverenceLevel)
  const next = royalStatueBonus(statue, level + 1, royalReverenceLevel)

  return (
    <div className={`mc-statue-card${locked ? ' mc-statue-card--locked' : ''}`}>
      <div className="mc-statue-top">
        <img src={`images/${imageFolder}/${statue.marble}.png`} alt={name} className="mc-item-img" />
        <div className="mc-statue-title">
          <span className="mc-item-name">{name}</span>
          <span className="mc-statue-owned">Owned: {marbles.toLocaleString()}</span>
        </div>
      </div>

      {!released ? (
        <p className="mc-statue-note">Statue not released yet</p>
      ) : (
        <div className="mc-statue-body">
          <div className="mc-statue-row">
            <span className="mc-statue-label">Statue</span>
            <span className={`mc-statue-level${locked ? ' mc-statue-level--locked' : ''}`}>
              {locked ? 'Locked' : `Level ${level}`}
            </span>
          </div>
          <div className="mc-statue-row">
            <span className="mc-statue-label">{locked ? 'Unlocks' : 'Bonus'}</span>
            <span className="mc-statue-value">
              {locked
                ? `${formatStatueMultiplier(next)} ${statue.bonus}`
                : `${formatStatueMultiplier(current)} ${statue.bonus}`}
            </span>
          </div>
          {!locked && (
            <div className="mc-statue-row">
              <span className="mc-statue-label">Next level</span>
              <span className="mc-statue-value">{formatStatueMultiplier(next)}</span>
            </div>
          )}
          <div className="mc-statue-row">
            <span className="mc-statue-label">{locked ? 'Unlock chance' : 'Upgrade chance'}</span>
            <span className="mc-statue-value">{formatChance(oddsN)}</span>
          </div>
          <div className="mc-statue-row">
            <span className="mc-statue-label">Cost per try</span>
            <span className="mc-statue-value">{locked ? `1 ${name}` : '1 Parchment'}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function RoyalStatues({ snapshot, imageFolder }) {
  const rg = snapshot?.royalGuardian
  const parchments = accountItemTotal(snapshot, PARCHMENT_KEY)

  return (
    <div className="mc-statues">
      <InfoPanel
        intro="Each marble restores one Royal Statue. Restoring and upgrading are both a chance per try, not a guarantee."
        items={[
          'Locked statues cost 1 of their marble per try to unlock.',
          'Unlocked statues cost 1 Parchment of Enchantment per try to level up, and the chance drops as the level rises.',
          'Counts include every character plus storage.',
        ]}
      />
      {snapshot && !rg && (
        <p>Re-import your save to see Royal Statue progress.</p>
      )}
      <div className="mc-statue-parchments">
        <img src={`images/${imageFolder}/${PARCHMENT_KEY}.png`} alt="Parchment of Enchantment" className="mc-statue-parchment-img" />
        <span>Parchments of Enchantment: <strong>{parchments.toLocaleString()}</strong></span>
      </div>
      <div className="mc-statue-grid">
        {ROYAL_STATUES.map(statue => (
          <RoyalStatueCard
            key={statue.index}
            statue={statue}
            level={rg?.statueLevels?.[statue.index] ?? 0}
            royalReverenceLevel={rg?.royalReverenceLevel ?? 0}
            marbles={accountItemTotal(snapshot, statue.marble)}
            imageFolder={imageFolder}
          />
        ))}
      </div>
    </div>
  )
}

// imageFolder: the masterclass's image folder; a section can override it with its own imageFolder
function SectionContent({ section, snapshot, charIndexes, imageFolder }) {

  // ── Best Farms ──
  if (section.sectionType === 'mob-progression') {
  return (
    <div className="mc-section-body">
      <MobProgressionTable rows={section.rows} imageFolder={imageFolder} />
    </div>
  )
}

  // ── Exalted Stamps tier list ──
  if (section.sectionType === 'exalted-stamps') {
    return (
      <div className="mc-section-body">
        <ExaltedStampTierList snapshot={snapshot} />
      </div>
    )
  }

  // ── Royal Guardian statues (one per marble) ──
  if (section.sectionType === 'royal-statues') {
    return (
      <div className="mc-section-body">
        <RoyalStatues snapshot={snapshot} imageFolder={imageFolder} />
      </div>
    )
  }

  // ── Prisma Bubbles tier list ──
  if (section.sectionType === 'prisma-bubbles') {
    return (
      <div className="mc-section-body">
        <PrismaBubbleTierList snapshot={snapshot} />
      </div>
    )
  }

  // ── Map Bonuses ──
  if (section.sectionType === 'map-bonuses') {
    return (
      <div className="mc-section-body">
        <MapBonusSection snapshot={snapshot} />
      </div>
    )
  }

  // ── Default section renderer ──
  return (
    <div className="mc-section-body">
      {section.text && <p>{section.text}</p>}
      {section.inventoryKey && (
        <InventorySection
          inventoryKey={section.inventoryKey}
          snapshot={snapshot}
          charIndexes={charIndexes}
          variant={section.variant}
          accountWide={section.accountWide}
          imageFolder={section.imageFolder ?? imageFolder}
        />
      )}
      {section.items && (
        <div className="mc-items-grid">
          {section.items.map((item, i) => (
            <div key={i} className="mc-item-card">
              {item.img
                ? <img src={item.img} alt={item.name} className="mc-item-img" />
                : <div className="mc-item-img-placeholder">{item.icon}</div>
              }
              <span className="mc-item-name">{item.name}</span>
              <span className="mc-item-note">{item.note}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function MasterClasses({ snapshot }) {
  const [activeId, setActiveId] = useState(MASTERCLASSES[0].id)
  const [activeSectionId, setActiveSectionId] = useState(MASTERCLASSES[0].sections[0].id)

  function selectClass(id) {
    setActiveId(id)
    const mc = MASTERCLASSES.find(mc => mc.id === id)
    setActiveSectionId(mc.sections[0].id)
  }

  const activeMc = MASTERCLASSES.find(mc => mc.id === activeId)
  const activeSection = activeMc?.sections.find(s => s.id === activeSectionId)

  return (
    <div className="page masterclasses-page" style={{ '--active-class-color': activeMc?.color }}>
      <h2 className="page-title">Master Classes</h2>

      {/* ── Main Masterclass Info Panel ── */}
      <InfoPanel
      intro="This page breaks down each Masterclass and their unique progression systems. The AFK item for the active class is displayed at the top for a quick overview of your accumulated AFK hours."
      items={[
        'Switch between Masterclasses using the nav below. Each class has its own set of sections tailored to their specific mechanics.',
        'AFK items are tracked per character — the count shown is from your first character with that Masterclass.',
        'Some sections contain tier lists, farm recommendations, and map bonuses that update automatically when you import a new save.',
      ]}
      />

      {/* ── Class Nav ── */}
      <div className="mc-nav">
        {MASTERCLASSES.map(mc => (
          <button
            key={mc.id}
            className={`mc-nav-btn${activeId === mc.id ? ' mc-nav-btn--active' : ''}`}
            onClick={() => selectClass(mc.id)}
            style={{ '--class-color': mc.color }}
          >
            {mc.name}
          </button>
        ))}
      </div>

      {/* ── Active Class Header Item ── */}
      <ActiveClassItem snapshot={snapshot} mc={activeMc} />      

      {/* ── Active Class Content ── */}
      {activeMc && (
        <div className="mc-class-body" style={{ '--class-color': activeMc.color }}>

          {/* ── Section Nav ── */}
          <div className="mc-section-nav">
            {activeMc.sections.map(section => (
              <button
                key={section.id}
                className={`mc-section-nav-btn${activeSectionId === section.id ? ' mc-section-nav-btn--active' : ''}`}
                onClick={() => setActiveSectionId(section.id)}
              >
                {section.title}
              </button>
            ))}
          </div>

          {/* ── Active Section ── */}
          {activeSection && (
            <div className="mc-section">
              <SectionContent
                section={activeSection}
                snapshot={snapshot}
                charIndexes={findClassCharIndexes(snapshot, activeMc)}
                imageFolder={activeMc.imageFolder}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}