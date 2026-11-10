import {
  holeVillagers,
  holeCaverns,
  holeMajiks,
  holeMeasurements,
  holeStudies,
  holeSchematics,
  holeSchematicOrder,
  lampWishes,
  jarCollectibles,
  godMap,
  bellRingBonuses,
} from '../data'
import { getFountainBonus, getMonumentBonus } from './cavernUtils'
import { getLegendTalentBonus, getLegendTalentLevel } from './legendTalentUtils'
import { formatBigNumber } from './cogBoardUtils'
import { getGemShopPurchases } from './gemShopUtils'
import { getGrimoireBonus } from './grimoireUtils'
import { isCompanionActive } from './companionUtils'
import { getEmperorBonus } from './emperorUtils'
import { getTesseractBonus } from './tesseractUtils'
import { getSushiBonus } from './sushiUtils'
import { isSuperbitUnlocked } from './gamingUtils'
import { getStampBonusByEffect } from './stampUtils'
import { getMeasurementBaseBonus, getMeasurementStat, getMeasurementTotal } from './measureUtils'
import { getPassiveCardBonus } from './cardUtils'
import { getEventShopBonus } from './eventShopUtils'
import { getArcadeBonus } from './arcadeUtils'
import { getCharmBonus } from './sneakingUtils'
import { getExoticBonus } from './exoticUtils'
import { isBundleOwned } from './bundleUtils'
import { getUpgradeVaultBonus } from './upgradeVaultUtils'
import { getWinnerBonusByName } from './summoningUtils'
import { getLoreTomeBonus } from './spelunkingUtils'
import { getStatueBonus } from './statueUtils'

// The Hole (World 5 caverns): villagers and per-cavern numbers for components/Hole.
// Formulas reimplemented from IdleonToolbox parsers/world-5/hole.ts and parsers/world-5/caverns/*.
// snapshot.caverns = parseCaverns in extractSnapshot (raw Holes arrays).

export const CAVERN_COUNT = 18
const EXPLORER = 0
const ENGINEER = 1
const CONJUROR = 2
const MEASURER = 3
const MAX_SCHEMATICS = 105

// Holes[11] (snapshot.caverns.extra) slots used here
export const HOLE_EXTRA = {
  layerProgress: 0, // + 2t for Motherlode / Hive / Evertree / Trench (t = 0..3), layers destroyed at 1 + 2t
  denBestScore: 8,
  bellCharging: 19, // bell action charging now: 0 Ring, 1 Ping, 2 Clean, 3 Renew (Eli's Ring/Ping saves)
  harpPower: 22,
  lampWishes: 25,
  grottoColony: 26,
  grottoKills: 27,
  jarTypes: 37,
  templeLayer: 55,
  templeTorches: 56,
  activeStudy: 61,
  gambitTimes: 65, // 6 trials, 65..70
}

// Motherlode-style caverns: t index into HOLE_EXTRA.layerProgress, cavern id, what you collect
export const LAYER_CAVERNS = {
  1: { t: 0, unit: 'Ores', skill: 'Mining' },
  7: { t: 1, unit: 'Bugs', skill: 'Catching' },
  11: { t: 2, unit: 'Logs', skill: 'Choppin\'' },
  16: { t: 3, unit: 'Fish', skill: 'Fishing' },
}

const LAYER_STUDIES = [1, 7, 11, 16] // each lowers the other layer caverns' requirement per layer destroyed
const LAYER_JAR = 5 // Amethyst Heartstone: all skilling caverns need {% less
const JAR_LEGEND_TALENT = 29

// Under 1,000: up to 2 decimals; under a million: whole number with commas (like the game's bonus lists);
// above: 1.23M / 4.5e21 notation
export function formatHoleNumber(value) {
  if (!Number.isFinite(value)) return '—'
  if (Math.abs(value) < 1000) return String(Math.round(value * 100) / 100)
  if (Math.abs(value) < 1e6) return Math.round(value).toLocaleString('en-US')
  return formatBigNumber(value)
}

// Fill a game text: { = bonus, } = 1 + bonus / 100 as a multi. Leftover placeholders become '?'.
export function fillHoleText(text, bonus) {
  return (text ?? '')
    .replace('{', formatHoleNumber(bonus))
    .replace('}', formatHoleNumber(1 + bonus / 100))
    .replace(/[{}$#~]/g, '?')
}

// ── Villagers ──

// game: VillagerExpReq (Toolbox getVillagerExpReq)
export function getVillagerExpReq(level, id) {
  if (id === 0) {
    if (level === 1) return 5
    return 10 * (-1.5 + (10 + 7 * level ** 2.1)
      * 2.1 ** level
      * (1 + 0.75 * Math.max(0, level - 4))
      * 3.4 ** Math.max(0, level - 12))
  }
  if (id === 1) return 30 * (10 + 6 * level ** 1.8) * 1.57 ** level
  if (id === 2) return 50 * (10 + 5 * level ** 1.7) * 1.4 ** level
  if (id === 3) return 120 * (30 + 10 * level ** 2) * 2 ** level
  if (id === 4) return 500 * (10 + 5 * level ** 1.3) * 1.13 ** level
  return 1e21
}

export function getVillagers(snapshot) {
  const caverns = snapshot?.caverns
  return holeVillagers.map(villager => {
    const level = caverns?.villagerLevels?.[villager.id] ?? 0
    const exp = caverns?.villagerExp?.[villager.id] ?? 0
    const expReq = getVillagerExpReq(level, villager.id)
    return {
      ...villager,
      level,
      exp,
      expReq,
      progress: expReq > 0 ? Math.min(1, exp / expReq) : 0,
      readyToLevel: level > 0 && exp >= expReq,
      opals: caverns?.opalsInvested?.[villager.id] ?? 0,
      parallel: (caverns?.parallelVillagers?.[villager.id] ?? 0) > 0,
    }
  })
}

// ── Villager EXP / hr ── (game VillagerExpPerHour, Toolbox hole.ts getVillagerExpPerHour)
// rate = base × shared multi × villager multi × opals
//   × (1 + Equal Spread × floor(least opals / 5) / 100)
//   × (1 + (additive + Opal Enthusiasm × floor(opals / 10)) / 100)
// Split out like this so the opal optimizer (utils/opalOptimizer.js) can try other opal counts.

const OPAL_DIVIDENDS = 0 // schematic: 125 EXP/hr per opal instead of 100
const OPAL_DIVIDENDS_BONUS = 25
const GLOOMIE_OPIE = 48 // schematic: +10% per Grotto colony conquered
const GLOOMIE_OPIE_PER_COLONY = 10
const VILLAGER_COMPASS = 59 // Villagerz Learnz: +1% per LV
const VILLAGER_LEGEND_TALENT = 12
const VILLAGER_CHARM = 'Candy Cache'
const VILLAGER_COMPANION = 13 // 3x
const VILLAGER_STATUE = 28
const VILLAGER_JARS = [4, 10, 12, 22, 29, 35]
const VILLAGER_EVENT_SHOP = 6 // +25%
const VILLAGER_LORE_BONUS = 1 // Tome lore bonus (needs Tome points)
const VILLAGER_BUNDLE = 'bun_u' // +50%
const VILLAGER_EXOTIC = 51 // Grapevine
const VILLAGER_ARCADE = 'Villager XP multi'
const VILLAGER_GRIMOIRE = 29
const VILLAGER_TESSERACT = 32
const VILLAGER_MONUMENT = 3 // + 10t: one per monument (Bravery, Justice, Wisdom)
const VILLAGER_MEASUREMENTS = [0, 7]
const VILLAGER_CARD = '+{% Villager EXP (Passive)'
const VILLAGER_BELL_RING = 1
const VILLAGER_SUMMONING = '+{% Villager EXP'
const VILLAGER_VAULT = 73
const EXPLORER_CATCH_UP_CAVERNS = 13 // Explorer gets 1.5^OptLacc[355] until 13 caverns are unlocked
const CONJUROR_FOUNTAIN = [0, 14]
export const OPAL_ENTHUSIASM = 0 // villager majik: +x% per 10 opals in that villager
export const EQUAL_SPREAD = 5 // villager majik: +x% per 5 opals in the villager with the fewest
const CONTENTED_CREATOR = 1 // villager majik: +x% per schematic created
const COSMO_ENHANCE = 2 // villager majik: flat +x%

const majik = (caverns, i) => getMajikBonus(1, i, Number(caverns?.villageMajiks?.[i]) || 0)
const isBuilt = (caverns, i) => Number(caverns?.schematics?.[i]) === 1

// Unlocked = LV 1+. The least opals among them feeds Equal Spread.
export function getLeastOpals(opals, unlocked) {
  const counts = opals.filter((_, t) => unlocked[t])
  return counts.length ? Math.min(...counts) : 0
}

export function getVillagerExpModel(snapshot, tomePoints) {
  const caverns = snapshot?.caverns
  const missing = []
  const statue = getStatueBonus(snapshot, VILLAGER_STATUE)
  missing.push(...statue.missing)
  const loreUnlocked = (snapshot?.spelunking?.loreBonusesUnlocked ?? 0) > VILLAGER_LORE_BONUS
  if (loreUnlocked && !(Number(tomePoints) > 0)) missing.push('Tome points (Tome lore bonus: add them in Home > Settings)')
  const jars = VILLAGER_JARS.reduce((sum, i) => sum + getJarBonus(snapshot, i), 0)
  const legend = getLegendTalentBonus(VILLAGER_LEGEND_TALENT, getLegendTalentLevel(snapshot?.legendTalents, VILLAGER_LEGEND_TALENT))

  const multis = [
    { label: 'Compass', value: 1 + (snapshot?.compassUpgrades?.levels?.[VILLAGER_COMPASS] ?? 0) / 100 },
    { label: 'Legend Talent', value: 1 + legend / 100 },
    { label: 'Charm', value: 1 + getCharmBonus(snapshot?.sneaking, VILLAGER_CHARM) / 100 },
    { label: 'Companion', value: isCompanionActive(snapshot?.companions, VILLAGER_COMPANION) ? 3 : 1 },
    { label: 'Statue', value: 1 + statue.value / 100 },
    { label: 'Jars', value: 1 + jars / 100 },
    { label: 'Event shop', value: 1 + (25 * getEventShopBonus(snapshot?.eventShop, VILLAGER_EVENT_SHOP)) / 100 },
    { label: 'Tome', value: 1 + getLoreTomeBonus(snapshot, VILLAGER_LORE_BONUS, tomePoints) / 100 },
    { label: 'Bundle', value: isBundleOwned(snapshot?.bundles, VILLAGER_BUNDLE) ? 1.5 : 1 },
  ]
  const lateMultis = [
    { label: 'Exotic Market', value: 1 + getExoticBonus(snapshot?.farming, VILLAGER_EXOTIC) / 100 },
    { label: 'Arcade', value: 1 + getArcadeBonus(snapshot, VILLAGER_ARCADE) / 100 },
    { label: 'Grimoire', value: 1 + getGrimoireBonus(snapshot?.grimoire, VILLAGER_GRIMOIRE) / 100 },
    { label: 'Tesseract', value: 1 + getTesseractBonus(snapshot?.tesseract, VILLAGER_TESSERACT) / 100 },
  ]
  const built = (caverns?.schematics ?? []).filter(value => Number(value) === 1).length
  const additives = [
    { label: 'Monuments', value: [0, 1, 2].reduce((sum, t) => sum + getMonumentBonus(snapshot, t, VILLAGER_MONUMENT), 0) },
    { label: 'Measurements', value: VILLAGER_MEASUREMENTS.reduce((sum, t) => sum + getMeasurementTotal(snapshot, t, tomePoints), 0) },
    { label: 'Village Majiks', value: majik(caverns, CONTENTED_CREATOR) * built + majik(caverns, COSMO_ENHANCE) },
    { label: 'Gloomie Opie', value: isBuilt(caverns, GLOOMIE_OPIE) ? GLOOMIE_OPIE_PER_COLONY * (caverns?.extra?.[HOLE_EXTRA.grottoColony] ?? 0) : 0 },
    { label: 'Cards', value: getPassiveCardBonus(VILLAGER_CARD, snapshot?.cards) },
    { label: 'Bell', value: (caverns?.bellRingLevels?.[VILLAGER_BELL_RING] ?? 0) * (bellRingBonuses[VILLAGER_BELL_RING]?.perLevel ?? 0) },
    { label: 'Summoning', value: getWinnerBonusByName(snapshot, VILLAGER_SUMMONING) },
    { label: 'Upgrade Vault', value: getUpgradeVaultBonus(snapshot?.upgradeVault, VILLAGER_VAULT) },
  ]

  const unlockedCaverns = getUnlockedCaverns(snapshot)
  const villagerMultis = holeVillagers.map(villager => {
    const t = villager.id
    const own = t === 0 && unlockedCaverns < EXPLORER_CATCH_UP_CAVERNS
      ? 1.5 ** (Number(caverns?.rupieSlug) || 0)
      : t === 2
        ? 1 + getFountainBonus(caverns, ...CONJUROR_FOUNTAIN) / 100
        : 1
    return own * (1 + (Number(caverns?.parallelVillagers?.[t]) || 0))
  })

  return {
    base: 100 + (isBuilt(caverns, OPAL_DIVIDENDS) ? OPAL_DIVIDENDS_BONUS : 0),
    sharedMulti: Math.max(1, multis.reduce((product, m) => product * m.value, 1))
      * lateMultis.reduce((product, m) => product * m.value, 1),
    multis: [...multis, ...lateMultis],
    additive: additives.reduce((sum, a) => sum + a.value, 0),
    additives,
    villagerMultis,
    enthusiasm: majik(caverns, OPAL_ENTHUSIASM),
    equalSpread: majik(caverns, EQUAL_SPREAD),
    unlocked: holeVillagers.map(villager => (caverns?.villagerLevels?.[villager.id] ?? 0) >= 1),
    missing,
  }
}

// EXP / hr for villager t holding `opals`, with `leastOpals` in the emptiest unlocked villager
export function getVillagerExpRate(model, t, opals, leastOpals) {
  return model.base
    * model.sharedMulti
    * model.villagerMultis[t]
    * opals
    * (1 + (model.equalSpread * Math.floor(leastOpals / 5)) / 100)
    * (1 + (model.additive + model.enthusiasm * Math.floor(opals / 10)) / 100)
}

// Every villager's EXP / hr with the opals they hold now
export function getVillagerExpRates(snapshot, tomePoints) {
  const model = getVillagerExpModel(snapshot, tomePoints)
  const opals = holeVillagers.map(villager => snapshot?.caverns?.opalsInvested?.[villager.id] ?? 0)
  const least = getLeastOpals(opals, model.unlocked)
  return {
    model,
    rates: holeVillagers.map((villager, t) => getVillagerExpRate(model, t, opals[t], least)),
  }
}

// Explorer LV = caverns unlocked (Toolbox: min(18, LV))
export function getUnlockedCaverns(snapshot) {
  return Math.min(CAVERN_COUNT, snapshot?.caverns?.villagerLevels?.[EXPLORER] ?? 0)
}

export function getTotalOpalsFound(snapshot) {
  return (snapshot?.caverns?.opalsPerCavern ?? []).reduce((sum, opals) => sum + opals, 0)
}

// Opals that don't come from a cavern: game Stuff2("TotalOpalsEarned") (Toolbox menagerie.ts
// getTotalOpalsEarned) adds these flat amounts to the per-cavern finds
const OPAL_GEM_SHOP = 5
const OPAL_GRIMOIRE = 11
const OPAL_COMPANION = 13
const OPAL_COMPANION_AMOUNT = 25
const OPAL_COMPASS = 52 // Opa Opa Opa!: +1 opal per LV
const OPAL_EMPEROR = 3
const OPAL_SCHEMATIC = 102
const OPAL_TESSERACT = 25
const OPAL_SUSHI = 56

// { found, sources: [{ label, value }], total, invested, unspent }
export function getOpalSources(snapshot) {
  const caverns = snapshot?.caverns
  const sources = [
    { label: 'Gem shop', value: getGemShopPurchases(snapshot?.gemShop, OPAL_GEM_SHOP) },
    { label: 'Grimoire', value: getGrimoireBonus(snapshot?.grimoire, OPAL_GRIMOIRE) },
    { label: 'Companion', value: isCompanionActive(snapshot?.companions, OPAL_COMPANION) ? OPAL_COMPANION_AMOUNT : 0 },
    { label: 'Compass (Opa Opa Opa!)', value: snapshot?.compassUpgrades?.levels?.[OPAL_COMPASS] ?? 0 },
    {
      label: 'Emperor + schematic',
      value: Math.floor(getEmperorBonus(snapshot, OPAL_EMPEROR) + (Number(caverns?.schematics?.[OPAL_SCHEMATIC]) === 1 ? 1 : 0)),
    },
    { label: 'Tesseract', value: getTesseractBonus(snapshot?.tesseract, OPAL_TESSERACT) },
    { label: 'Sushi', value: getSushiBonus(snapshot?.sushi, OPAL_SUSHI) },
  ].map(source => ({ ...source, value: Number(source.value) || 0 }))
  const found = getTotalOpalsFound(snapshot)
  const total = Math.round(found + sources.reduce((sum, source) => sum + source.value, 0))
  const invested = (caverns?.opalsInvested ?? []).reduce((sum, opals) => sum + opals, 0)
  return {
    found,
    sources,
    total,
    invested,
    unspent: Math.max(0, total - invested),
  }
}

// Hole resource sprite (trimmed, public/images/hole/resources): 0-9 well, 10-19 harp notes, 20-29 rupies, 30+ coins
export function getHoleResourceImage(index) {
  return `images/hole/resources/${index}.png`
}

export function getHoleResourceOwned(snapshot, index) {
  return Math.max(0, snapshot?.caverns?.holeResources?.[index] ?? 0)
}

// ── Engineer ──

const DISCOUNT_WISH = 5 // Lamp wish: 15% off the next Engineer schematics, per use

// game: schematic cost (Toolbox getEngineerUpgradeCost); order = position in the in-game list
export function getSchematicCost(snapshot, schematic, order) {
  const discount = Math.max(0.01, 0.85 ** (Number(snapshot?.caverns?.wishesUsed?.[DISCOUNT_WISH]) || 0))
  if (schematic.fixedCost) return discount * schematic.cost
  if (schematic.resource < 10) return 50 * discount * 1.28 ** (order + Math.floor(order / 2.7))
  if (schematic.resource < 20) {
    return 50 * discount * 1.28 ** (order - 16 + Math.floor((order - 16) / 2.7))
      * 1.23 ** Math.min(Math.max(0, (order - 16) / 2), 14)
  }
  return 40 * discount * 1.34 ** (order - 54 + Math.floor((order - 54) / 2.7))
    * 1.26 ** Math.min(Math.max(0, (order - 54) / 2), 14)
}

// Engineer LV that unlocks list position `order` (inverse of 1 + 3 LV + floor(LV / 5))
function getSchematicUnlockLevel(order) {
  let level = 0
  while (Math.round(1 + 3 * level + Math.floor(level / 5)) <= order) level++
  return level
}

export function getSchematics(snapshot) {
  const level = snapshot?.caverns?.villagerLevels?.[ENGINEER] ?? 0
  const unlocked = Math.min(MAX_SCHEMATICS, holeSchematicOrder.length, Math.round(1 + 3 * level + Math.floor(level / 5)))
  const built = snapshot?.caverns?.schematics ?? []
  const list = holeSchematicOrder.slice(0, MAX_SCHEMATICS).map((index, order) => ({
    index,
    order,
    ...holeSchematics[index],
    available: order < unlocked,
    built: Number(built[index]) === 1,
    unlockLevel: getSchematicUnlockLevel(order),
    costValue: getSchematicCost(snapshot, holeSchematics[index], order),
    owned: getHoleResourceOwned(snapshot, holeSchematics[index].resource),
  }))
  return {
    list,
    unlocked,
    total: list.length,
    built: list.filter(schematic => schematic.built).length,
  }
}

// ── Conjuror ──

// Toolbox getCosmoBonus: floor(x0 × LV), except IdleOn majik 1 = max(1, 3^LV)
export function getMajikBonus(group, i, level) {
  if (group === 2 && i === 1) return Math.floor(Math.max(1, 3 ** level))
  return Math.floor((holeMajiks[group]?.[i]?.x0 ?? 0) * level)
}

const POCKET_DIVINITY = 0 // IdleOn majik: links the gods in Holes[11][29..30] (text Y / Z)

function majikText(caverns, g, i, majik, bonus) {
  if (g === 2 && i === POCKET_DIVINITY) {
    const [first, second] = (caverns?.pocketGods ?? []).map(slot => godMap[slot]?.name ?? 'none')
    return majik.description.replace(' Y ', ` ${first ?? 'none'} & `).replace(/ Z$/, ` ${second ?? 'none'}`)
  }
  // | = bonus × schematics built, $ = bonus per 5 opals in the villager with the fewest (Toolbox Bonuses.jsx)
  const built = (caverns?.schematics ?? []).filter(value => Number(value) === 1).length
  const unlockedOpals = holeVillagers
    .filter(villager => (caverns?.villagerLevels?.[villager.id] ?? 0) >= 1)
    .map(villager => caverns?.opalsInvested?.[villager.id] ?? 0)
  const leastOpals = unlockedOpals.length ? Math.min(...unlockedOpals) : 0
  return fillHoleText(
    majik.description
      .replace('|', formatHoleNumber(Math.round(bonus * built)))
      .replace('$', formatHoleNumber(Math.floor(leastOpals / 5) * bonus)),
    bonus,
  )
}

// Placeholder majiks the game hasn't filled in yet
const isPlaceholderMajik = majik => majik.name === 'Confused Bonus'

const MAJIK_GROUPS = [
  { key: 'holeMajiks', label: 'Hole Majiks' },
  { key: 'villageMajiks', label: 'Villager Majiks' },
  { key: 'idleonMajiks', label: 'IdleOn Majiks' },
]

export function getMajiks(snapshot) {
  const caverns = snapshot?.caverns
  const groups = MAJIK_GROUPS.map((group, g) => ({
    label: group.label,
    majiks: holeMajiks[g].map((majik, i) => {
      const level = Number(caverns?.[group.key]?.[i]) || 0
      const bonus = getMajikBonus(g, i, level)
      return {
        ...majik,
        level,
        bonus,
        text: majikText(caverns, g, i, majik, bonus),
      }
    }).filter(majik => !isPlaceholderMajik(majik)),
  }))
  const spent = groups.reduce((sum, group) => sum + group.majiks.reduce((s, m) => s + m.level, 0), 0)
  return {
    groups,
    spent,
    conjurorLevel: caverns?.villagerLevels?.[CONJUROR] ?? 0,
  }
}

// ── Measurer ── (base / stat multi in measureUtils, shared with the Gambit points math)

const MEASURE_COST_FOUNTAIN = [2, 14] // green water upgrade: cheaper measurements

// Next LV cost (Toolbox hole.ts measurements cost)
export function getMeasurementCost(snapshot, t) {
  const level = snapshot?.caverns?.measurementLevels?.[t] ?? 0
  const fountain = getFountainBonus(snapshot?.caverns, ...MEASURE_COST_FOUNTAIN)
  return (1 / (1 + fountain / 100)) * (250 + 50 * level) * 1.6 ** (t - 6 * Math.floor(t / 10)) * 1.1 ** level
}

// Total = base × stat multi (Toolbox getMeasurementBonus); falls back to the base when the stat isn't tracked
export function getMeasurements(snapshot, tomePoints) {
  const measurerLevel = snapshot?.caverns?.villagerLevels?.[MEASURER] ?? 0
  return holeMeasurements.map((measure, t) => {
    const base = getMeasurementBaseBonus(snapshot, t)
    const stat = getMeasurementStat(snapshot, measure.stat, tomePoints)
    const total = stat.multi == null ? null : base * stat.multi
    const isMulti = measure.description.includes('}')
    return {
      ...measure,
      index: t,
      name: titleCaseMeasure(measure.description),
      stat,
      total,
      valueText: formatMeasureValue(total ?? base, isMulti),
      cost: getMeasurementCost(snapshot, t),
      owned: getHoleResourceOwned(snapshot, measure.resource),
      level: snapshot?.caverns?.measurementLevels?.[t] ?? 0,
      unlocked: t < measurerLevel,
      base,
      baseText: formatMeasureValue(base, isMulti),
    }
  })
}

const MEASURE_UPPER_WORDS = new Set(['EXP', 'DMG'])

// "+{% VILLAGER EXP GAIN" → "Villager EXP Gain"
function titleCaseMeasure(description) {
  return description
    .replace(/^[+]?[{}][%x]?\s*/, '')
    .split(' ')
    .map(word => (MEASURE_UPPER_WORDS.has(word) ? word : word.charAt(0) + word.slice(1).toLowerCase()))
    .join(' ')
}

function formatMeasureValue(value, isMulti) {
  return isMulti ? `${formatHoleNumber(1 + value / 100)}x` : `+${formatHoleNumber(value)}%`
}

// ── Librarian (studies) ──

// Toolbox getStudyBonus (i = 0 path)
export function getStudyBonus(snapshot, t) {
  const level = Number(snapshot?.caverns?.studyLevels?.[t]) || 0
  const perLevel = holeStudies[t]?.perLevel ?? 0
  if (t === 9) return level >= 1 ? 50 + level * perLevel : 0
  if (t === 3) return level >= 1 ? Math.min(32, 12 + level * perLevel) : 0
  return level * perLevel
}

// Studies with a hard cap: Bravery's minimum damage stops at 32% (Eli: LV 35 still shows 32%)
const STUDY_CAPS = { 3: { value: 32, base: 12 } }

// The LV where a capped study stops gaining anything, or null
export function getStudyMaxLevel(t) {
  const cap = STUDY_CAPS[t]
  if (!cap) return null
  return Math.ceil((cap.value - cap.base) / (holeStudies[t]?.perLevel || 1))
}

export function getStudyReq(snapshot, t) {
  const level = Number(snapshot?.caverns?.studyLevels?.[t]) || 0
  return 4000 * 1.25 ** level * 1.5 ** Math.floor(t / 5)
}

const PERIPHERAL_VISION = 43 // superbit: also study the caverns either side of the active one

// Study rate per hour for each studied cavern (Toolbox getStudies studyPerHour)
const STUDY_FOUNTAIN = [1, 14]
const STUDY_SCHEMATICS = { 85: 2, 87: 3, 88: 5, 99: 5 } // +% study rate per Librarian LV once created
const STUDY_JAR = 16 // Rosemerald
const STUDY_MAJIK = 4 // villager majik Study All Nighter
const STUDY_BASE_PER_LEVEL = 5

export function getStudyRate(snapshot) {
  const caverns = snapshot?.caverns
  const librarianLevel = caverns?.villagerLevels?.[4] ?? 0
  const schematics = Object.entries(STUDY_SCHEMATICS)
    .reduce((sum, [index, bonus]) => sum + (Number(caverns?.schematics?.[index]) === 1 ? bonus : 0), 0)
  const majik = getMajikBonus(1, STUDY_MAJIK, Number(caverns?.villageMajiks?.[STUDY_MAJIK]) || 0)
  const stamp = getStampBonusByEffect(snapshot, '+{% Study rate for Bolaia')
  return 100
    * (1 + getFountainBonus(caverns, ...STUDY_FOUNTAIN) / 100)
    * (1 + ((STUDY_BASE_PER_LEVEL + schematics) * librarianLevel) / 100)
    * (1 + (getJarBonus(snapshot, STUDY_JAR) + (Number(stamp?.value ?? stamp) || 0) + majik) / 100)
}

export function getStudies(snapshot) {
  const rate = getStudyRate(snapshot)
  const active = snapshot?.caverns?.extra?.[HOLE_EXTRA.activeStudy]
  const peripheral = isSuperbitUnlocked(snapshot?.gaming, PERIPHERAL_VISION)
  return holeStudies.map((study, t) => {
    const bonus = getStudyBonus(snapshot, t)
    const progress = snapshot?.caverns?.studyProgress?.[t] ?? 0
    const req = getStudyReq(snapshot, t)
    return {
      ...study,
      index: t,
      cavern: holeCaverns[t],
      level: Number(snapshot?.caverns?.studyLevels?.[t]) || 0,
      bonus,
      text: fillHoleText(study.description, bonus),
      progress,
      req,
      active: active === t,
      peripheral: peripheral && active >= 0 && Math.abs(active - t) === 1,
      maxLevel: getStudyMaxLevel(t),
      maxed: getStudyMaxLevel(t) != null && (Number(snapshot?.caverns?.studyLevels?.[t]) || 0) >= getStudyMaxLevel(t),
      hoursToLevel: rate > 0 ? Math.max(0, req - progress) / rate : Infinity,
    }
  })
}

// ── Jars ──

export function getJarBonus(snapshot, i) {
  const level = Number(snapshot?.caverns?.jarLevels?.[i]) || 0
  const talent = getLegendTalentBonus(JAR_LEGEND_TALENT, getLegendTalentLevel(snapshot?.legendTalents, JAR_LEGEND_TALENT))
  return level * (jarCollectibles[i]?.perLevel ?? 0) * (1 + talent / 100)
}

// ── Layer caverns (Motherlode, Hive, Evertree, Trench) ──

const layerScale = t => 1 + 99 * Math.floor(t / 3)

// game: Holes("TotalOreREQ", t) (Toolbox getTotalOreReq)
export function getLayerReq(snapshot, t) {
  const extra = snapshot?.caverns?.extra ?? []
  const reduction = getJarBonus(snapshot, LAYER_JAR)
    + LAYER_STUDIES.reduce((sum, study, s) => sum + getStudyBonus(snapshot, study) * (extra[1 + 2 * s] ?? 0), 0)
  return layerScale(t) * 200 * 2.2 ** (1 + (extra[1 + 2 * t] ?? 0)) / (1 + reduction / 100)
}

// The efficiency the cavern screen shows: a quarter of MotherlodeEffBase
export function getLayerEfficiency(snapshot, t) {
  const layers = snapshot?.caverns?.extra?.[1 + 2 * t] ?? 0
  return 0.25 * 2e4 * layerScale(t) * 1.8 ** (1 + layers)
}

// ── The Lamp ──

// game: LampWishCost. Wish 0 caps at 11 uses.
export function getWishCost(uses, t) {
  if (t === 0) return uses < 11 ? Math.floor(1 + 2 * uses + uses ** 2) : null
  if (t === 2) return Math.floor(1 + 2 * uses + uses ** 1.7)
  return Math.floor(uses * (lampWishes[t]?.x2 ?? 0) + (lampWishes[t]?.x1 ?? 0))
}
