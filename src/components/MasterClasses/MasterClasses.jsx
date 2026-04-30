import { useState, useMemo } from 'react'
import { MASTERCLASSES, itemMap, equipmentMap } from '../../data'
import { stampMap, STAMP_TIERS } from '../../data/stampsMap'
import { bubbleMap, BUBBLE_TIERS } from '../../data/bubblesMap'
import TierList from '../TierList/TierList'
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

function SectionContent({ section, snapshot, charIndex }) {
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

function ClassDropdown({ mc, isOpen, onToggle, snapshot }) {
  return (
    <div className={`mc-class-dropdown ${isOpen ? 'open' : ''}`} style={{ '--class-color': mc.color }}>
      {/* ── Class Header (main toggle) ── */}
      <button className="mc-class-header" onClick={onToggle}>
        {typeof mc.icon === 'string' && mc.icon.match(/\.(png|jpg|webp|gif)$/)
          ? <img src={mc.icon} alt={mc.name} className="mc-class-icon-img" />
          : <span className="mc-class-icon">{mc.icon}</span>
        }
        <span className="mc-class-name">{mc.name}</span>
        {mc.headerItem && (
          <HeaderItem
            itemKey={mc.headerItem}
            snapshot={snapshot}
            charIndex={mc.charIndex}
          />
        )}
        <span className="mc-class-chevron">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* ── Class Body ── */}
      {isOpen && (
        <div className="mc-class-body">
          {mc.sections.map(section => (
            <div key={section.id} className="mc-section">
              <h3 className="mc-section-title">{section.title}</h3>
              <SectionContent
                section={section}
                snapshot={snapshot}
                charIndex={mc.charIndex}
              />
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
  const [openClass, setOpenClass] = useState('blood-berserker')

  function toggleClass(id) {
    setOpenClass(prev => (prev === id ? null : id))
  }

  return (
    <div className="page masterclasses-page">
      <h2 className="page-title">Master Classes</h2>

      <div className="mc-list">
        {MASTERCLASSES.map(mc => (
          <ClassDropdown
            key={mc.id}
            mc={mc}
            isOpen={openClass === mc.id}
            onToggle={() => toggleClass(mc.id)}
            snapshot={snapshot}
          />
        ))}
      </div>
    </div>
  )
}