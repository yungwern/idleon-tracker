import { useState } from 'react'
import { BIS_SETUPS } from '../../data/bisSetups'
import { GEAR_BONUSES } from '../../data/gearBonuses'
import { itemMap } from '../../data/itemMap'
import { premiumGearNames, premiumGearMap } from '../../data/premiumGear'
import InfoPanel from '../InfoPanel/InfoPanel'

import './GearOptimizer.css'

// Premium items live in their own sprite folders
function getItemImage(id) {
  if (id.startsWith('EquipmentGown')) return `images/premium gear/armor/${id}.png`
  if (id.startsWith('EquipmentRingsChat')) return `images/premium gear/rings/${id}.png`
  if (id.startsWith('EquipmentCape')) return `images/premium gear/capes/${id}.png`
  return `images/items/${id}.png`
}

// '%_BONUS_DROP_RATE' → 'Bonus Drop Rate'
function formatStatText(txt) {
  return txt
    .replace(/^%_/, '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
}

// Stat lines shown in the tooltip for an equipment id
function getItemStats(id) {
  const gear = GEAR_BONUSES[id]
  if (gear) {
    return Object.entries(gear).map(([cat, bonus]) => `+${bonus.value}% ${cat}`)
  }
  const premium = premiumGearMap[id]
  if (premium) {
    return [
      [premium.uq1val, premium.uq1txt],
      [premium.uq2val, premium.uq2txt],
    ]
      .filter(([val, txt]) => val != null && txt)
      .map(([val, txt]) => `+${val}% ${formatStatText(txt)}`)
  }
  return []
}

// Turns a data entry into what the slot needs to render
function resolveEntry(entry) {
  if (entry.todo) {
    return {
      name: 'Not identified yet',
      img: null,
      lines: [entry.todo],
    }
  }
  if (entry.id) {
    return {
      name: itemMap[entry.id] ?? premiumGearNames[entry.id] ?? entry.id,
      img: getItemImage(entry.id),
      lines: getItemStats(entry.id),
    }
  }
  return {
    name: entry.name,
    img: entry.img,
    lines: entry.desc ? [entry.desc] : [],
  }
}

// ── Slot (icon + hover tooltip) ──────────────────────────────
function Slot({ entry, label }) {
  const { name, img, lines } = resolveEntry(entry)
  const slotLabel = label ?? entry.slot

  return (
    <div className={`go-slot tooltip-anchor ${img ? '' : 'go-slot--todo'}`}>
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
        {slotLabel && <span className="go-tooltip-slot">{slotLabel}</span>}
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
function SlotRow({ title, entries }) {
  if (!entries?.length) return null
  return (
    <div className="go-row">
      <span className="go-row-title">{title}</span>
      <div className="go-row-slots">
        {entries.map((entry, i) => (
          <Slot
            key={i}
            entry={entry}
          />
        ))}
      </div>
    </div>
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
            <SlotRow
              title="Equipment"
              entries={setup.equipment}
            />
            <SlotRow
              title="Tools"
              entries={setup.tools}
            />
            <SlotRow
              title="Specials"
              entries={setup.specials}
            />
          </div>

          {/* Consumables & bonuses */}
          <div className="go-column">
            <SlotRow
              title="Food"
              entries={setup.food}
            />
            <SlotRow
              title="Lab Chips"
              entries={setup.chips}
            />
            <div className="go-row">
              <span className="go-row-title">Cards</span>
              <div className="go-row-slots">
                <Slot
                  entry={setup.cards.set}
                  label="Card Set"
                />
                <span className="go-row-divider" />
                {setup.cards.cards.map((entry, i) => (
                  <Slot
                    key={i}
                    entry={entry}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
