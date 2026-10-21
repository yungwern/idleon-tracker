import { useState } from 'react'
import {
  BIS_SETUPS,
  BIS_CATEGORIES,
  GEAR_BONUSES,
  itemMap,
  equipmentMap,
  premiumGearNames,
  premiumGearMap,
  foodMap,
  labChipMap,
  cardMap,
  cardSetMap,
  legendTalentMap,
  fishMap,
  fishingWeightMap,
  fishingLineMap,
} from '../../data'
import {
  getCardStars,
  getCardSetStars,
  getCardSetBonus,
  getActiveCardMulti,
  getFullHouseLevel,
  FULL_HOUSE_TALENT,
  isCardOwned,
  formatCardEffect,
} from '../../utils/cardUtils'
import InfoPanel from '../InfoPanel/InfoPanel'
import BuffsPanel from '../BuffsPanel/BuffsPanel'

import './GearOptimizer.css'

// Premium items and fishing rods live in their own sprite folders
function getItemImage(id) {
  if (id.startsWith('FishingRod') || id.startsWith('EquipmentRingsFishing')) return `images/fishing/${id}.png`
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

// ── Cards (levels come from the imported save) ──────────────
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1at-y9t5ohYky33nOLoSxHYeyRX-3T91paj-nTSHrB3c/edit?gid=1826222324#gid=1826222324'
const OMEGA_NANOCHIP = 'ConsoleChip20'
const OMEGA_MOTHERBOARD = 'ConsoleChip21'
const NO_SAVE_LINE = 'Import (or re-import) your save to see card levels'

const starLabel = stars => (stars > 0 ? `${stars}★` : 'No stars yet')

function resolveCard(id, cards, multi = 1) {
  const card = cardMap[id]
  if (!card) return resolveFromMap(cardMap, id)
  const base = {
    name: card.name,
    img: card.img,
    card: true,
  }
  const perLevel = `${formatCardEffect(card.effect, card.bonus)} per level`

  if (!cards) {
    return {
      ...base,
      stars: 0,
      lines: [perLevel, NO_SAVE_LINE],
    }
  }
  if (!isCardOwned(id, cards)) {
    return {
      ...base,
      stars: 0,
      unowned: true,
      lines: [perLevel, 'Not collected yet'],
    }
  }

  const stars = getCardStars(id, cards)
  return {
    ...base,
    stars,
    lines: [
      formatCardEffect(card.effect, card.bonus * (stars + 1) * multi),
      starLabel(stars),
    ],
  }
}

function resolveCardSet(id, cards) {
  const set = cardSetMap[id]
  if (!set) return resolveFromMap(cardSetMap, id)
  const base = {
    name: set.name,
    img: set.img,
    card: true,
  }
  if (!cards) {
    return {
      ...base,
      stars: 0,
      lines: [`${formatCardEffect(set.effect, set.bonus)} per level`, NO_SAVE_LINE],
    }
  }
  const stars = getCardSetStars(id, cards)
  return {
    ...base,
    stars: Math.max(stars, 0),
    lines: [
      formatCardEffect(set.effect, getCardSetBonus(id, stars)),
      stars >= 0 ? `${starLabel(stars)} set (average of every card in it)` : 'Needs every card in the set',
    ],
  }
}

// ── Card buffs ───────────────────────────────────────────────
// Account-wide boosts to equipped cards. A chip counts once it's on any character
// or in chip storage; the legend talent once it has a level.
function getCardBuffs(snapshot) {
  const owned = snapshot?.labChips?.owned
  const fullHouseLevel = getFullHouseLevel(snapshot?.legendTalents)
  const chip = id => ({
    key: id,
    name: labChipMap[id].name,
    img: labChipMap[id].img,
    effect: labChipMap[id].effect,
    active: owned ? owned.includes(id) : null,
  })
  return {
    nanochip: chip(OMEGA_NANOCHIP),
    motherboard: chip(OMEGA_MOTHERBOARD),
    fullHouse: {
      key: 'full-house',
      name: legendTalentMap[FULL_HOUSE_TALENT].name,
      img: legendTalentMap[FULL_HOUSE_TALENT].img,
      effect: fullHouseLevel > 0
        ? `Legend talent Lv ${fullHouseLevel}: equipped cards ×${getActiveCardMulti(snapshot.legendTalents)}`
        : 'Legend talent: equipped cards give higher bonuses',
      active: snapshot?.legendTalents ? fullHouseLevel > 0 : null,
      multi: getActiveCardMulti(snapshot?.legendTalents),
    },
  }
}

// Total multiplier on one equipped card slot: Omega chips double the first / last card
// when the setup runs them, the legend talent boosts every card
function getSlotMulti(index, count, chips, buffs) {
  let multi = 1
  if (index === 0 && chips.includes(OMEGA_NANOCHIP) && buffs.nanochip.active) multi *= 2
  if (index === count - 1 && chips.includes(OMEGA_MOTHERBOARD) && buffs.motherboard.active) multi *= 2
  if (buffs.fullHouse.active) multi *= buffs.fullHouse.multi
  return multi
}

// ── Slot (icon + hover tooltip) ──────────────────────────────
function Slot({ item, label }) {
  const { name, img, lines, card, stars, unowned } = item
  const classes = ['go-slot', 'tooltip-anchor']
  if (card) classes.push('go-slot--card')
  if (unowned) classes.push('go-slot--unowned')
  if (!img) classes.push('go-slot--missing')

  return (
    <div className={classes.join(' ')}>
      {card && img ? (
        <span className="go-card-frame">
          <img
            src={img}
            alt={name}
            className="go-card-img"
          />
          {stars > 0 && (
            <img
              src={`images/cards/CardEquipBorder${stars}.png`}
              alt=""
              className="go-card-border"
            />
          )}
        </span>
      ) : img ? (
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

// ── Fishing spots (card back) ────────────────────────────────
const DEPTH_ZONES = {
  green: 'Green',
  yellow: 'Yellow',
  red: 'Red',
  purple: 'Purple',
  all: 'All',
}

// Weight / line tooltip: its depth bonuses and fishing stats
function resolveFishingKit(map, id) {
  const kit = map[id]
  if (!kit) return resolveFromMap(map, id)
  const depthLines = Object.entries(kit.depth)
    .filter(([, value]) => value > 0)
    .map(([zone, value]) => `+${value} ${DEPTH_ZONES[zone]} Depth`)
  const statLines = [
    [kit.exp, 'Fishing EXP'],
    [kit.speed, 'Fishing Speed'],
    [kit.power, 'Fishing Power'],
  ]
    .filter(([value]) => value > 0)
    .map(([value, label]) => `+${value} ${label}`)
  return {
    name: kit.name,
    img: kit.img,
    lines: [...depthLines, ...statLines],
  }
}

function FishingSpots({ spots }) {
  return (
    <div className="go-spots">
      <div className="go-spots-head">
        <span>Fish</span>
        <span>Location</span>
        <span>Weight</span>
        <span>Line</span>
        <span>Ring</span>
      </div>
      {spots.areas.map(area => (
        <div
          key={area.name}
          className="go-spots-area"
        >
          <span className="go-spots-area-name">{area.name}</span>
          {area.spots.map(spot => (
            <div
              key={spot.fish}
              className="go-spots-row"
            >
              <Slot
                item={{
                  ...resolveFromMap(fishMap, spot.fish),
                  lines: [`${DEPTH_ZONES[spot.zone]} depth zone`],
                }}
              />
              <span className="go-spots-location">
                <span className={`go-zone go-zone--${spot.zone}`}>{DEPTH_ZONES[spot.zone]}</span>
                {spot.location}
              </span>
              <Slot item={resolveFishingKit(fishingWeightMap, spot.weight)} />
              <Slot item={resolveFishingKit(fishingLineMap, spot.line)} />
              {spot.ring ? (
                <Slot item={resolveEquipment(spot.ring)} />
              ) : (
                <span className="go-spots-none">–</span>
              )}
            </div>
          ))}
        </div>
      ))}
      {spots.notes?.map(note => (
        <div
          key={note.text}
          className="go-spots-note"
        >
          {note.icon && <Slot item={resolveFishingKit(fishingLineMap, note.icon)} />}
          <span>{note.text}</span>
        </div>
      ))}
    </div>
  )
}

// ── One setup: gear on the front, optional breakdown on the back ──
function SetupDetails({ setup, cards, buffs }) {
  const [flipped, setFlipped] = useState(false)
  if (!setup.fishingSpots) {
    return (
      <SetupGear
        setup={setup}
        cards={cards}
        buffs={buffs}
      />
    )
  }

  return (
    <>
      <div className="go-flip-bar">
        <button
          className="go-flip-btn"
          onClick={() => setFlipped(f => !f)}
        >
          {flipped ? '← Back to gear' : 'Fishing spots →'}
        </button>
      </div>
      <div className={`go-flip${flipped ? ' go-flip--flipped' : ''}`}>
        <div
          className="go-flip-face"
          aria-hidden={flipped}
        >
          <SetupGear
            setup={setup}
            cards={cards}
            buffs={buffs}
          />
        </div>
        <div
          className="go-flip-face go-flip-face--back"
          aria-hidden={!flipped}
        >
          <FishingSpots spots={setup.fishingSpots} />
        </div>
      </div>
    </>
  )
}

// ── One setup's gear, consumables and cards ──────────────────
function SetupGear({ setup, cards, buffs }) {
  const cardIds = setup.cards.cards
  return (
    <div className="go-setup-body">
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
              item={resolveCardSet(setup.cards.set, cards)}
              label="Card Set"
            />
            <span className="go-row-divider" />
            {cardIds.map((id, i) => (
              <Slot
                key={i}
                item={resolveCard(id, cards, getSlotMulti(i, cardIds.length, setup.chips, buffs))}
              />
            ))}
          </SlotRow>
        </div>
      </div>
      {setup.notes?.length > 0 && (
        <SlotRow title="Notes">
          {setup.notes.map(note => (
            <div
              key={note.text}
              className="go-note"
            >
              <Slot
                item={{
                  name: note.name,
                  img: note.img,
                  lines: [],
                }}
              />
              <span className="go-note-text">{note.text}</span>
            </div>
          ))}
        </SlotRow>
      )}
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────
// Open on the first tab that has setups in it
const DEFAULT_CATEGORY = (
  BIS_CATEGORIES.find(c => BIS_SETUPS.some(s => s.category === c.key)) ?? BIS_CATEGORIES[0]
).key

export default function GearOptimizer({ snapshot }) {
  const [activeCategory, setActiveCategory] = useState(DEFAULT_CATEGORY)
  const categorySetups = BIS_SETUPS.filter(s => s.category === activeCategory)
  const [activeKey, setActiveKey] = useState(categorySetups[0]?.key)
  const setup = categorySetups.find(s => s.key === activeKey) ?? categorySetups[0]
  const cards = snapshot?.cards ?? null
  const buffs = getCardBuffs(snapshot)

  function selectCategory(key) {
    setActiveCategory(key)
    setActiveKey(BIS_SETUPS.find(s => s.category === key)?.key)
  }

  return (
    <div className="page">
      <h2 className="page-title">BiS Setups</h2>
      <InfoPanel
        intro="Best-in-slot loadouts for common farming setups, including premium gear."
        items={[
          'Hover any icon to see the item name and its bonuses.',
          'These are endgame setups. If you don\'t have a piece yet, use this as a goal to work toward.',
          'Card stars, borders and bonus values come from your imported save, including any Card Buffs you\'ve unlocked.',
          'Card Buffs are account-wide boosts to equipped cards. A chip counts once it\'s on any character or in chip storage.',
          'For more in depth information including obols/trophies check the link below.',
          <>
            Source:{' '}
            <a
              href={SHEET_URL}
              target="_blank"
              rel="noreferrer"
            >
              AlmostPsycho&apos;s Sampling Sheet
            </a>
          </>,
        ]}
      />

      <BuffsPanel
        title="Card Buffs"
        buffs={Object.values(buffs)}
      />

      {/* Category tabs */}
      <div className="go-nav">
        {BIS_CATEGORIES.map(category => (
          <button
            key={category.key}
            className={`go-nav-btn ${category.key === activeCategory ? 'go-nav-btn--active' : ''}`}
            onClick={() => selectCategory(category.key)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="section-card go-card">
        {setup ? (
          <>
            {/* Setup selector */}
            <div className="go-setup-tabs">
              {categorySetups.map(s => (
                <button
                  key={s.key}
                  className={`go-setup-tab ${s.key === setup.key ? 'go-setup-tab--active' : ''}`}
                  onClick={() => setActiveKey(s.key)}
                >
                  <span className="go-setup-tab-name">{s.name}</span>
                  <span className="go-setup-tab-classes">{s.classes}</span>
                </button>
              ))}
            </div>

            <SetupDetails
              key={setup.key}
              setup={setup}
              cards={cards}
              buffs={buffs}
            />
          </>
        ) : (
          <p className="go-empty">No setups in this tab yet.</p>
        )}
      </div>
    </div>
  )
}
