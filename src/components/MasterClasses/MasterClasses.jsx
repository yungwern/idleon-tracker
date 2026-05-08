import { useState, useMemo } from 'react'
import { MASTERCLASSES, itemMap, equipmentMap } from '../../data'
import { stampMap, STAMP_TIERS } from '../../data/'
import { bubbleMap, BUBBLE_TIERS } from '../../data'
import TierList from '../TierList/TierList'
import { mobsMap, mapEnemyData } from '../../data'

import './MasterClasses.css'

// ============================================================
// SUB-COMPONENTS
// ============================================================

function HeaderItem({ itemKey, snapshot, charIndex }) {
  const name = itemMap[itemKey]
  if (!name) return null
  const qty = snapshot?.characters?.[charIndex]?.inventory?.[itemKey]?.qty ?? 0
  return (
    <div className="mc-header-item">
      <img src={`/images/items/${itemKey}.png`} alt={name} className="mc-header-item-img" />
      <span className="mc-header-item-qty">{qty.toLocaleString()}</span>
    </div>
  )
}

function MobProgressionTable({ rows }) {
  return (
    <div className="mob-prog-table">
      {rows.map((row) => (
        <div key={row.currencyKey} className="mob-prog-row">
          <div className="mob-prog-currency">
            <img
              src={`/images/items/${row.currencyKey}.png`}
              alt={row.currencyKey}
              className="mob-prog-currency-img"
            />
          </div>
          <div className="mob-prog-mobs">
            {row.mobs.map((mob) => (
              <div key={mob.key} className="mob-prog-chip tooltip-anchor">
                <img
                  src={`/images/mobs/${mob.key}.png`}
                  alt={mobsMap[mob.key] ?? mob.key}
                  className="mob-prog-mob-img"
                />
                <span className="tooltip">
                  {mobsMap[mob.key] ?? mob.key} — {mob.drop.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function InventorySection({ inventoryKey, snapshot, charIndex, variant }) {
  const keys = Array.isArray(inventoryKey) ? inventoryKey : [inventoryKey];

  return (
    <div className="mc-items-grid">
      {keys.map((key) => {
        const name = itemMap[key];
        if (!name) return null;
        const item = snapshot?.characters?.[charIndex]?.inventory?.[key];

        if (variant === 'weapon') {
          const instances = Array.isArray(item) ? item : (item ? [item] : []);
          const equipment = equipmentMap[key] ?? {};
          return instances.map((instance, idx) => {
            const stats = instance?.stats ?? {};
            const uq1 = equipment.uq1txt && stats.UQ1val != null ? `${stats.UQ1val}${equipment.uq1txt}` : null;
            const uq2 = equipment.uq2txt && stats.UQ2val != null ? `${stats.UQ2val}${equipment.uq2txt}` : null;
            return (
              <div className="mc-item-card" key={`${key}-${idx}`}>
                <img src={`/images/items/${key}.png`} alt={name} className="mc-item-img" />
                <span className="mc-item-name">{name}</span>
                {uq1 && <span className="mc-item-note">{uq1}</span>}
                {uq2 && <span className="mc-item-note">{uq2}</span>}
              </div>
            );
          });
        }

        const qty = item?.qty ?? 0;
        return (
          <div className="mc-item-card" key={key}>
            <img src={`/images/items/${key}.png`} alt={name} className="mc-item-img" />
            <span className="mc-item-name">{name}</span>
            <span className="mc-item-note">Owned: {qty.toLocaleString()}</span>
          </div>
        );
      })}
    </div>
  );
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
    <TierList
      tiers={STAMP_TIERS}
      itemsKey="stamps"
      itemMap={stampMap}
      upgradedIds={upgradedIds}
      getOverlay={() => '/images/stamps/Exalted_Stamp_Frame.png'}
      imagePath="/images/stamps"
      variant="stamps"
    />
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
    return `/images/bubbles/aUpgradesGlow${glowIndex}.png`
  }

  return (
    <TierList
      tiers={BUBBLE_TIERS}
      itemsKey="bubbles"
      itemMap={bubbleMap}
      upgradedIds={upgradedIds}
      getOverlay={getBubbleOverlay}
      imagePath="/images/bubbles"
    />
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

const MIN_KILLS = 400

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
          src={`/images/mobs/${entry.mobKey}.png`}
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

function SectionContent({ section, snapshot, charIndex }) {
  
  // ── Best Farms ──
  if (section.sectionType === 'mob-progression') {
  return (
    <div className="mc-section-body">
      <MobProgressionTable rows={section.rows} />
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
          charIndex={charIndex}
          variant={section.variant}
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
            {mc.headerItem && (
              <HeaderItem
                itemKey={mc.headerItem}
                snapshot={snapshot}
                charIndex={mc.charIndex}
              />
            )}
          </button>
        ))}
      </div>

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
                charIndex={activeMc.charIndex}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}