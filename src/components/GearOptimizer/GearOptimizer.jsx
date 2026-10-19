import { useState } from 'react'
import {
  BIS_SETUPS,
  GEAR_BONUSES,
  itemMap,
  equipmentMap,
  premiumGearNames,
  premiumGearMap,
  foodMap,
  labChipMap,
  cardMap,
  cardSetMap,
} from '../../data'
import InfoPanel from '../InfoPanel/InfoPanel'

import './GearOptimizer.css'

// Premium items live in their own sprite folders
function getItemImage(id) {
  if (id.startsWith('EquipmentGown')) return `images/premium gear/armor/${id}.png`
  if (id.startsWith('EquipmentRingsChat')) return `images/premium gear/rings/${id}.png`
  if (id.startsWith('EquipmentCape')) return `images/premium gear/capes/${id}.png`
  return `images/items/${id}.png`
}

// (4, '%_DROP_RATE') or (4, '% DROP RATE') → '+4% Drop Rate'
function formatStat(val, txt) {
  const text = txt
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
  return `+${val}${text}`
}

// Stat lines shown in the tooltip for an equipment id
function getItemStats(id) {
  const gear = GEAR_BONUSES[id]
  if (gear) {
    return Object.entries(gear).map(([cat, bonus]) => `+${bonus.value}% ${cat}`)
  }
  const stats = premiumGearMap[id] ?? equipmentMap[id]
  if (!stats) return []
  return [
    [stats.uq1val, stats.uq1txt],
    [stats.uq2val, stats.uq2txt],
  ]
    .filter(([val, txt]) => val != null && txt)
    .map(([val, txt]) => formatStat(val, txt))
}

function resolveEquipment(id) {
  return {
    name: itemMap[id] ?? premiumGearNames[id] ?? id,
    img: getItemImage(id),
    lines: getItemStats(id),
  }
}

// Food, chips and cards share one shape: { name, img, effect }
function resolveFromMap(map, id) {
  const entry = map[id]
  if (!entry) {
    return {
      name: id,
      img: null,
      lines: ['Missing from data'],
    }
  }
  return {
    name: entry.name,
    img: entry.img,
    lines: entry.effect ? [entry.effect] : [],
  }
}

// ── Slot (icon + hover tooltip) ──────────────────────────────
function Slot({ item, label }) {
  const { name, img, lines } = item

  return (
    <div className={`go-slot tooltip-anchor ${img ? '' : 'go-slot--missing'}`}>
      {img ? (
        <img
          src={img}
          alt={name}
          className="go-slot-img"
          onError={e => { e.currentTarget.style.visibility = 'hidden' }}
        />
      ) : (
        <span className="go-slot-missing">?</span>
      )}
      <span className="tooltip go-tooltip">
        {label && <span className="go-tooltip-slot">{label}</span>}
        <span className="go-tooltip-name">{name}</span>
        {lines.map(line => (
          <span
            key={line}
            className="go-tooltip-line"
          >
            {line}
          </span>
        ))}
      </span>
    </div>
  )
}

// ── Row (label + icons) ──────────────────────────────────────
function SlotRow({ title, children }) {
  return (
    <div className="go-row">
      <span className="go-row-title">{title}</span>
      <div className="go-row-slots">
        {children}
      </div>
    </div>
  )
}

// Equipment-style rows: [{ slot, id }]
function EquipmentRow({ title, entries }) {
  if (!entries?.length) return null
  return (
    <SlotRow title={title}>
      {entries.map((entry, i) => (
        <Slot
          key={i}
          item={resolveEquipment(entry.id)}
          label={entry.slot}
        />
      ))}
    </SlotRow>
  )
}

// Id-list rows (food, chips): ['FoodG2', ...]
function MapRow({ title, ids, map }) {
  if (!ids?.length) return null
  return (
    <SlotRow title={title}>
      {ids.map((id, i) => (
        <Slot
          key={i}
          item={resolveFromMap(map, id)}
        />
      ))}
    </SlotRow>
  )
}

// ── Main Component ───────────────────────────────────────────
export default function GearOptimizer() {
  const [activeKey, setActiveKey] = useState(BIS_SETUPS[0].key)
  const setup = BIS_SETUPS.find(s => s.key === activeKey) ?? BIS_SETUPS[0]

  return (
    <div className="page">
      <h2 className="page-title">BiS Setups</h2>
      <InfoPanel
        intro="Best-in-slot loadouts for common farming setups, including premium gear."
        items={[
          'Hover any icon to see the item name and its bonuses.',
          'These are endgame setups. If you don\'t have a piece yet, use the best one you own for that slot.',
          'Source: AlmostPsycho\'s Sampling Sheet.',
        ]}
      />

      <div className="section-card go-card">
        {/* Setup selector */}
        <div className="go-setup-tabs">
          {BIS_SETUPS.map(s => (
            <button
              key={s.key}
              className={`go-setup-tab ${s.key === activeKey ? 'go-setup-tab--active' : ''}`}
              onClick={() => setActiveKey(s.key)}
            >
              <span className="go-setup-tab-name">{s.name}</span>
              <span className="go-setup-tab-classes">{s.classes}</span>
            </button>
          ))}
        </div>

        <div className="go-columns">
          {/* Gear */}
          <div className="go-column">
            <EquipmentRow
              title="Equipment"
              entries={setup.equipment}
            />
            <EquipmentRow
              title="Tools"
              entries={setup.tools}
            />
            <EquipmentRow
              title="Specials"
              entries={setup.specials}
            />
          </div>

          {/* Consumables & bonuses */}
          <div className="go-column">
            <MapRow
              title="Food"
              ids={setup.food}
              map={foodMap}
            />
            <MapRow
              title="Lab Chips"
              ids={setup.chips}
              map={labChipMap}
            />
            <SlotRow title="Cards">
              <Slot
                item={resolveFromMap(cardSetMap, setup.cards.set)}
                label="Card Set"
              />
              <span className="go-row-divider" />
              {setup.cards.cards.map((id, i) => (
                <Slot
                  key={i}
                  item={resolveFromMap(cardMap, id)}
                />
              ))}
            </SlotRow>
          </div>
        </div>
      </div>
    </div>
  )
}
