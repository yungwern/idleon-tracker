import {
  pristineCharmMap,
  ninjaItemMap,
  ninjaKnowledgeMap,
  NINJA_KNOWLEDGE_ROOT,
  ninjaMasteryPrereqs,
  jadeEmporiumMap,
  gemstoneMap,
  doorBaseHp,
  floorBaseDifficulty,
  fractalBonusMap,
  landRankMap,
  calcRankBonus,
  BEST_NUNCHAKU,
} from '../data'
import { hasSaveLetter } from './saveCodeUtils'
import { formatBigNumber } from './cogBoardUtils'
import { getAccountTalentBonus } from './talentUtils'
import { getLegendTalentBonus, getLegendTalentLevel } from './legendTalentUtils'
import { getSkillLevel } from './skillUtils'
import { getActiveCharacter, getActiveCharacterIndex } from './characterUtils'
import { getRankMulti } from './farmingUtils'
import { getBubbleBonus } from './alchemyUtils'
import { getTomeBubbleMulti } from './tomeUtils'
import { getStarSignBonus } from './starSignUtils'
import { getStatueBonus } from './statueUtils'
import { getPassiveCardBonus } from './cardUtils'
import { isAchievementComplete } from './achievementUtils'
import { getBallotBonus } from './voteUtils'
import { getLampBonus } from './cavernUtils'
import { getGambitBonus } from './holeCavernUtils'
import { getEmperorBonus } from './emperorUtils'
import { getSushiBonus } from './sushiUtils'
import { getJellyBonus } from './jellyUtils'
import { isCompanionActive } from './companionUtils'

// Sneaking (W6) math, ported from IdleonToolbox parsers/world-6/sneaking.ts. snapshot.sneaking comes from
// extractSnapshot parseSneaking. See notes/sneaking.md.

// Pristine Charm bonus by name: its value once unlocked, else 0 (Toolbox getCharmBonus).
// For }x charms the multiplier is 1 + value / 100.
export function getCharmBonus(sneaking, name) {
  const index = pristineCharmMap.findIndex(charm => charm.name === name)
  return index !== -1 && sneaking?.pristineCharms?.[index] ? pristineCharmMap[index].value : 0
}

// Jade Emporium upgrade by index (snapshot.sneaking.jadeUnlocks letters), e.g. 40 = Science Fancy Pen
export function isJadeUnlocked(sneaking, index) {
  return hasSaveLetter(sneaking?.jadeUnlocks, index)
}

// ── Formatting ────────────────────────────────────────────────────────────────

// Under 1,000: up to 2 decimals; under a million: commas; past that 1.23M / 4.5e21 like the game
export function formatSneakingNumber(value) {
  if (!Number.isFinite(value)) return '—'
  if (Math.abs(value) < 1000) return String(Math.round(value * 100) / 100)
  if (Math.abs(value) < 1e6) return Math.round(value).toLocaleString('en-US')
  return formatBigNumber(value)
}

// Game text with { = the value and } = 1 + value / 100 (a multi)
export function fillSneakingText(text, value) {
  return String(text ?? '')
    .replace(/\{/g, formatSneakingNumber(value))
    .replace(/\}/g, formatSneakingNumber(1 + value / 100))
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

export function toRoman(tier) {
  return ROMAN[tier - 1] ?? String(tier)
}

// ── Items and symbols ─────────────────────────────────────────────────────────

// Item stat at a level (Toolbox getItemValue). Gloves (type 1/0) = search rate %, nunchaku/kunai = base damage,
// charms (type 2) = the { of their text. Hats, gemstones and symbols have no stat.
export function getNinjaItemValue(item, level) {
  if (!item) return 0
  const { type, subType, x3 = 0, x5 = 0 } = item
  if (type === 1) {
    if (subType === 0) return 10 * x3 * ((level + 10) / (level + 40))
    if (level < 111) {
      return x3 * Math.pow(1.23, level) * Math.pow(0.92, Math.max(0, level - 80)) * Math.pow(0.94, Math.max(0, level - 110))
    }
    // Past 110 the three terms fold into one factor (1.23 * 0.92 * 0.94), so 1.23^level never overflows
    return x3 * Math.pow(1.23, 110) * Math.pow(0.92, 30) * Math.pow(1.063704, level - 110)
  }
  if (type === 2) {
    return Math.min(x3 + x5 * (level / (level + 50)), x5) + Math.min(x5 * (level / (level + 900)), x5)
  }
  return 0
}

// Symbol slot (Spelunk[14] index) for a Ninja save index: the two charm slots of each character
// (14 + 4t, 15 + 4t → 2t, 2t + 1) and every storage slot (60+ → index - 36). Hats and gloves/weapons have none.
export function getSymbolSlot(saveIndex) {
  if (saveIndex >= 60) return saveIndex - 36
  if (saveIndex >= 14 && (saveIndex - 14) % 4 < 2) return (saveIndex - 14) - 2 * Math.floor((saveIndex - 14) / 4)
  return -1
}

// Each symbol LV makes the charm in that slot give +50% more
export function getSymbolBonus(symbolLevel) {
  return 50 * symbolLevel
}

// One slot, ready to draw: { raw, item, level, value, empty, symbolSlot, symbolLevel, symbolBonus }
function buildSlot(entry, saveIndex, sneaking) {
  const item = ninjaItemMap[entry?.raw] ?? null
  const symbolSlot = getSymbolSlot(saveIndex)
  const symbolLevel = symbolSlot >= 0 ? (sneaking?.symbolLevels?.[symbolSlot] ?? 0) : 0
  return {
    raw: entry?.raw ?? 'Blank',
    item,
    level: entry?.level ?? 0,
    value: getNinjaItemValue(item, entry?.level ?? 0),
    empty: !item,
    symbolSlot,
    symbolLevel,
    symbolBonus: getSymbolBonus(symbolLevel),
  }
}

const GOLD_ITEM_PREFIX = 'Gold '
const STARITE = 3 // gemstone: +% Gold Charm bonus
const GOLDEN_SNEAKING_LEGEND_TALENT = 6 // legend talent: +% Gold Charm bonus

// Every ninja with its 4 slots, and the 39 storage slots. Gold charms only work from storage, where their
// stat is boosted by Starite, the legend talent and the slot's symbol (Toolbox parseNinjaItems).
export function getNinjaLoadouts(snapshot) {
  const sneaking = snapshot?.sneaking
  const gems = getGemstones(snapshot)
  const legendBonus = getLegendTalentBonus(GOLDEN_SNEAKING_LEGEND_TALENT, getLegendTalentLevel(snapshot?.legendTalents, GOLDEN_SNEAKING_LEGEND_TALENT))
  const goldMulti = (1 + gems[STARITE].bonus / 100) * (1 + legendBonus / 100)
  const doors = getDoors(sneaking)

  const ninjas = (sneaking?.ninjas ?? []).map((ninja, i) => {
    const character = snapshot?.characters?.[i]
    const equipment = ninja.equipment.map((entry, slot) => buildSlot(entry, 12 + 4 * i + slot, sneaking))
    return {
      index: i,
      name: character?.name ?? `Ninja ${i + 1}`,
      className: character?.class ?? '',
      sneakingLevel: getSkillLevel(character, 'sneaking'),
      floor: ninja.floor,
      status: getNinjaStatus(ninja, equipment[1], doors[ninja.floor]),
      equipment,
    }
  })

  const storage = (sneaking?.storage ?? []).map((entry, i) => {
    const slot = buildSlot(entry, 60 + i, sneaking)
    const isGold = slot.item?.name?.startsWith(GOLD_ITEM_PREFIX)
    return {
      ...slot,
      value: isGold ? slot.value * goldMulti * (1 + slot.symbolBonus / 100) : slot.value,
    }
  })

  return {
    ninjas,
    storage,
  }
}

// What a ninja is doing. activity < 0 = KO'd, 0 = tied up, else working: gloves search, nunchaku break a
// standing door, kunai untie.
function getNinjaStatus(ninja, weaponSlot, door) {
  if (ninja.activity < 0) return { id: 'ko', label: 'Knocked out', icon: 'KO_Ninja' }
  if (ninja.activity === 0) return { id: 'tied', label: 'Tied up', icon: 'Tied_Ninja' }
  const subType = weaponSlot?.item?.type === 1 ? weaponSlot.item.subType : 0
  if (subType === 1 && door?.standing) return { id: 'breaching', label: 'Breaching door', icon: 'Breaching_Ninja' }
  if (subType === 2) return { id: 'untying', label: 'Untying', icon: 'Untying_Ninja' }
  return { id: 'sneaking', label: 'Sneaking', icon: 'Sneaking_Ninja' }
}

// ── Doors and floors ──────────────────────────────────────────────────────────

// Door max HP per floor (game Ninja("DoorMaxHP")). Playing below your highest mastery leaves every door open;
// a selected mastery rescales the list in place by its row 10 ^ mastery (so floors after 10 use the already
// scaled value) and pins floor 0 to 1.
export function getDoorMaxHps(selectedMastery = 0, highestMastery = 0) {
  const doors = [...doorBaseHp]
  if (selectedMastery < highestMastery) return doors.map(() => 0)
  if (!selectedMastery) return doors
  for (let floor = 0; floor < doors.length; floor++) {
    doors[floor] = 0.01 * doors[floor] * Math.pow(doors[10], selectedMastery)
  }
  doors[0] = 1
  return doors.map(hp => Math.min(hp, Number.MAX_VALUE))
}

// [{ floor, maxHp, hpLeft, standing }] per floor, on the mastery being played (or another one: Ninja[100] holds
// the door damage of your highest mastery, so passing it gives that mastery's progress)
export function getDoors(sneaking, mastery = sneaking?.selectedMastery) {
  const maxHps = getDoorMaxHps(mastery, sneaking?.ninjaMasteryTier)
  return maxHps.map((maxHp, floor) => {
    const hpLeft = Math.max(0, maxHp - (sneaking?.doorDamage?.[floor] ?? 0))
    return {
      floor,
      maxHp,
      hpLeft,
      standing: hpLeft > 0,
    }
  })
}

// Floors open: floor 1 plus one per broken door (Toolbox currentUnlockedFloors). Defaults to your highest
// mastery, since any lower one has every door open. The game's "Reach Floor 12, Currently on N".
export function getOpenFloors(sneaking, mastery = sneaking?.ninjaMasteryTier) {
  const broken = getDoors(sneaking, mastery).filter(door => !door.standing).length
  return Math.min(doorBaseHp.length, 1 + broken)
}

// ── Ninja Knowledge ───────────────────────────────────────────────────────────

function getPrerequisite(index, mastery) {
  return ninjaMasteryPrereqs
    .filter(rewrite => rewrite.upgrade === index && mastery >= rewrite.mastery)
    .reduce((prereq, rewrite) => rewrite.prereq, ninjaKnowledgeMap[index]?.prereq)
}

// Upgrades 17+ are the game's mini Ninja Knowledge upgrades: Coral Reef upgrade 4 ("Adds a new mini 'Ninja
// Knowledge' upgrade", level = Spelunk[13][3]) unlocks one per level, in order.
// Every Ninja Knowledge upgrade: level (+ Omnijade levels on the first 17), value, unlocked and why not
export function getKnowledgeUpgrades(sneaking) {
  const levels = sneaking?.upgradeLevels ?? []
  const mastery = sneaking?.ninjaMasteryTier ?? 0
  return ninjaKnowledgeMap.map((upgrade, index) => {
    const level = levels[index] ?? 0
    const isSpecial = index > 16
    const omnijadeLevels = isSpecial ? 0 : (sneaking?.omnijadeLevels?.[index] ?? 0)
    const omnijadePlaced = !isSpecial && Boolean(sneaking?.omnijadePlaced?.[index])
    const prereq = isSpecial || index === NINJA_KNOWLEDGE_ROOT ? null : getPrerequisite(index, mastery)
    // Centurion Lineage is its own prerequisite until a mastery tier rewrites it
    const unlockMastery = prereq === index
      ? ninjaMasteryPrereqs.find(rewrite => rewrite.upgrade === index)?.mastery ?? null
      : null
    const unlocked = isSpecial
      ? (sneaking?.spelunkingUnlocks ?? 0) > index - 17
      : prereq === null || (levels[prereq] ?? 0) >= 1
    let lockReason = null
    if (!unlocked) {
      if (isSpecial) lockReason = `Needs Coral Reef "mini Ninja Knowledge" LV ${index - 16}`
      else if (unlockMastery !== null) lockReason = `Unlocks at Ninja Mastery ${toRoman(unlockMastery)}`
      else if (prereq !== null) lockReason = `Needs ${ninjaKnowledgeMap[prereq]?.name} LV 1`
    }
    return {
      ...upgrade,
      index,
      level,
      omnijadeLevels,
      omnijadePlaced,
      value: (level + omnijadeLevels) * upgrade.modifier,
      isSpecial,
      unlocked,
      lockReason,
    }
  })
}

// ── Jade Emporium ─────────────────────────────────────────────────────────────

// Game Ninja("EmporiumCost", row): priced by display row, not by upgrade id
export function getEmporiumCost(row) {
  return (300 + 500 * row + Math.pow(row, 3))
    * Math.pow(2.52, row)
    * Math.pow(3.07, Math.max(0, row - 28))
    * Math.pow(160, Math.max(0, row - 38))
    * Math.pow(300, Math.max(0, row - 44))
}

// Emporium rows in game order, with unlocked + cost; under-construction rows are left out
export function getJadeEmporium(sneaking) {
  return jadeEmporiumMap
    .map((upgrade, row) => ({
      ...upgrade,
      row,
      unlocked: isJadeUnlocked(sneaking, upgrade.id),
      cost: getEmporiumCost(row),
    }))
    .filter(upgrade => !upgrade.placeholder)
}

// ── Gemstones ─────────────────────────────────────────────────────────────────

export const GEMSTONE_MAX_COUNTER = 1e7 // gem counters cap at 10M
const MOISSANITE = 5 // boosts every other gemstone
const FIREFROST = 7 // the only flat one: + charm max LV
const GENERATIONAL_GEMSTONES = 432 // Wind Walker talent: }x all gemstone bonuses
// Breakpoints shown on each gem's bar: share of the counter-driven part reached (counter / (1000 + counter))
export const GEMSTONE_BREAKPOINTS = [0.5, 0.75, 0.9, 0.99, 0.999]

function gemBonusAt(gem, counter, moissanite, talentMulti, index) {
  if (counter < 0.5) return 0
  const base = gem.x3 + gem.x5 * (counter / (1000 + counter))
  return index === MOISSANITE ? base : base * (1 + moissanite / 100) * Math.max(1, talentMulti)
}

// Counter needed for the counter-driven part to reach a share: share = c / (1000 + c)
function counterForShare(share) {
  return 1000 * share / (1 - share)
}

// Every gemstone: counter, bonus now, bonus at a full 10M counter, the bar % and breakpoints.
// displayBonus = the number the game shows ($ gems show a diminishing % instead of the raw bonus).
export function getGemstones(snapshot) {
  const sneaking = snapshot?.sneaking
  const counters = sneaking?.gemstoneCounters ?? []
  const found = sneaking?.foundItems ?? []
  const talentMulti = getAccountTalentBonus(snapshot, GENERATIONAL_GEMSTONES).value
  const moissaniteGem = gemstoneMap[MOISSANITE]
  const moissanite = gemBonusAt(moissaniteGem, counters[MOISSANITE] ?? 0, 0, 1, MOISSANITE)
  const maxSaturation = GEMSTONE_MAX_COUNTER / (1000 + GEMSTONE_MAX_COUNTER)

  return gemstoneMap.map((gem, index) => {
    const counter = counters[index] ?? 0
    const bonus = gemBonusAt(gem, counter, moissanite, talentMulti, index)
    const maxBonus = gemBonusAt(gem, GEMSTONE_MAX_COUNTER, moissanite, talentMulti, index)
    const isDiminishing = gem.desc.includes('$')
    const toDisplay = value => (isDiminishing ? 100 * (1 - 1 / (1 + value / 100)) : value)
    const share = counter / (1000 + counter)
    // What the gem boosts, without the number (the card shows the number on its own)
    const label = gem.desc
      .replace(/^[+{}$%]+\s*/, '')
      .replace(/\s*@\s*/g, ' ')
      .trim()
    return {
      ...gem,
      index,
      counter,
      unlocked: found.includes(gem.img) || counter > 0,
      bonus,
      maxBonus,
      displayBonus: toDisplay(bonus),
      displayMaxBonus: toDisplay(maxBonus),
      isFlat: index === FIREFROST,
      label,
      percent: Math.min(100, share / maxSaturation * 100),
      breakpoints: GEMSTONE_BREAKPOINTS.map(target => ({
        share: target,
        counter: counterForShare(target),
        reached: share >= target,
        percent: Math.min(100, target / maxSaturation * 100),
        displayBonus: toDisplay(gemBonusAt(gem, counterForShare(target), moissanite, talentMulti, index)),
      })),
    }
  })
}

// ── Stealth and detection ─────────────────────────────────────────────────────
// Game Ninja("Stealth", t) and DetectionDEC, ported from Toolbox getNinjaStealthParts / getSneakingDetection.
// stealth = base × every source below × floor mates' Smoke Bomb/Lotus Flower × Funeral Flowers on the floor.
// detection = 1 - 1.1 × stealth / (stealth + difficulty), so 0% needs stealth ≥ 10× the floor's difficulty.

const WAY_OF_STEALTH = 13 // knowledge: + base stealth per Sneaking LV
const FUNERAL_FLOWER_UPGRADE = 21 // knowledge: + % stealth per Funeral Flower on the floor
const SHHHH = 23 // knowledge (Coral Reef mini upgrade): }x stealth
const SEED_OF_STEALTH = 4 // land rank: + % stealth per Farming LV
const MOON_OF_SNEAK = 45 // compass: doubles every 50 levels
const GAMBIT_STEALTH = 11
const STEALTH_CHAPTER = 'a29' // Tome bubble
const STEALTH_STATUE = 26
const CRYSTAL_CANDALIGHT = '+{% Sneaking Stealth (Passive)'
const UNTYING_EXTRAORDINAIRE = 368 // achievement
const AMETHYST = 0 // gemstone: + % stealth
const STEALTH_BALLOT = 25
const STEALTH_LAMP = [2, 1]
const NOISE_REDUCTION_THERAPY = 54 // schematic: 1.2x per power of 10 Quaver Notes
const QUAVER_NOTES = 15 // holeResources index
const EMPEROR_STEALTH = 0
const STEALTH_SUSHI = 32
const STEALTH_JELLY = 16
const SMOKE_DEVIL = 163 // companion: 40x stealth

// Charm subTypes (NjTr<subType>)
export const CHARM = {
  YELLOW_BELT: 2,
  SILK_VEIL: 4,
  SHINY_SMOKE: 6,
  SCROLL_OF_POWER: 7,
  SMOKE_BOMB: 8,
  LOTUS_FLOWER: 16,
  ROSARIES: 17,
}
// Worth more when the ninja is alone on its floor: × round(2 + floor(subType / 13)) (Yellow Belt 2x, others 3x)
const SOLO_CHARMS = [2, 13, 14, 19]

const lavaLog = value => Math.log(Math.max(value, 1)) / 2.30259

// Floor difficulty on a mastery (NinjaInfo[9]): from Mastery 1 every floor but the first scales by
// 0.1 × last entry ^ mastery
export function getFloorDifficulty(floor, mastery = 0) {
  const base = floorBaseDifficulty[floor] ?? 0
  if (!mastery || floor === 0) return base
  return 0.1 * base * Math.pow(floorBaseDifficulty[floorBaseDifficulty.length - 1], mastery)
}

export function getDetectionChance(stealth, difficulty) {
  if (!difficulty) return 0
  return Math.max(0, Math.min(1, 1 - 1.1 * stealth / (stealth + difficulty)))
}

// Stealth at which detection falls to `target` (0..1)
export function getStealthForDetection(target, difficulty) {
  return (1 - target) * difficulty / (0.1 + target)
}

// Gold item in storage (NJbonusPerms). The game compares the raw stat against the stored, already multiplied
// value, so which duplicate wins can differ from a plain max; matches Toolbox getInventoryNinjaItem.
function getStorageGoldBonus(storage, name) {
  return storage.reduce((best, slot) => {
    if (slot.item?.name !== name) return best
    return getNinjaItemValue(slot.item, slot.level) > best ? slot.value : best
  }, 0)
}

// Game NinjaBonus(t, subType): the ninja's two charm slots, × Gold Scroll and each slot's symbol
function getCharmTotal(ninja, subType, goldScroll) {
  return ninja.equipment.slice(2, 4).reduce((sum, slot) => (slot.item?.type === 2 && slot.item.subType === subType
    ? sum + slot.value * (1 + goldScroll / 100) * (1 + slot.symbolBonus / 100)
    : sum), 0)
}

// Every ninja's stealth, split into sources so the page can show where it comes from.
// sources: [{ id, label, multi, scope: 'ninja' | 'account', detail?, active }]; base = flat base stealth.
// The game reads Farming LV, star signs and the statue as the logged-in character (newest PTimeAway).
// tomePoints = the Tome total typed into the Import Save modal (Stealth Chapter bubble).
export function getNinjaStealth(snapshot, tomePoints) {
  const sneaking = snapshot?.sneaking
  const { ninjas, storage } = getNinjaLoadouts(snapshot)
  const knowledge = getKnowledgeUpgrades(sneaking)
  const mastery = sneaking?.selectedMastery ?? 0
  const flowers = sneaking?.funeralFlowers ?? []
  const flowerBonus = knowledge[FUNERAL_FLOWER_UPGRADE]?.value ?? 0
  const goldScroll = getStorageGoldBonus(storage, 'Gold Scroll')
  const goldBeads = getStorageGoldBonus(storage, 'Gold Beads')
  const active = getActiveCharacter(snapshot)
  const activeIndex = getActiveCharacterIndex(snapshot)

  // ── Account-wide sources (same for every ninja) ──
  const farmingLevel = getSkillLevel(active, 'farming')
  const seedOfStealth = calcRankBonus(landRankMap[SEED_OF_STEALTH], snapshot?.farming?.upgradesLevels?.[SEED_OF_STEALTH] ?? 0, getRankMulti(snapshot))
  const compassLevel = snapshot?.compassUpgrades?.levels?.[MOON_OF_SNEAK] ?? 0
  const compass = compassLevel * Math.pow(2, Math.floor(compassLevel / 50))
  const tomeMulti = getTomeBubbleMulti(tomePoints)
  const stealthChapter = getBubbleBonus(snapshot, STEALTH_CHAPTER) * tomeMulti
  const ninjaTwin = getStarSignBonus(snapshot, 'Ninja_Twin', activeIndex).value
  const schematicOwned = Number(snapshot?.caverns?.schematics?.[NOISE_REDUCTION_THERAPY]) === 1
  const quaverNotes = snapshot?.caverns?.holeResources?.[QUAVER_NOTES] ?? 0
  const fractalStealth = fractalBonusMap.find(bonus => bonus.effect.includes('Stealth'))
  const hasFractalStealth = Boolean(fractalStealth) && (snapshot?.islands?.fractalHours ?? 0) >= fractalStealth.hours
  const percent = value => 1 + value / 100

  const accountSources = [
    { id: 'landRank', label: 'Land Rank: Seed of Stealth', multi: percent(seedOfStealth * farmingLevel), detail: `${formatSneakingNumber(seedOfStealth)}% per Farming LV (${farmingLevel})` },
    { id: 'compass', label: 'Compass: Moon of Sneak', multi: percent(compass), detail: `LV ${compassLevel}, doubles every 50 LVs` },
    { id: 'gambit', label: 'Gambit (The Hole)', multi: percent(getGambitBonus(snapshot, GAMBIT_STEALTH)) },
    { id: 'goldBeads', label: 'Gold Beads (storage)', multi: percent(goldBeads) },
    {
      id: 'chapterSign',
      label: 'Stealth Chapter bubble + Ninja Twin star sign',
      multi: percent(stealthChapter + ninjaTwin),
      detail: tomePoints
        ? `Bubble ${formatSneakingNumber(stealthChapter)}% (Tome ×${tomeMulti}), star sign ${formatSneakingNumber(ninjaTwin)}%`
        : `Star sign ${formatSneakingNumber(ninjaTwin)}%. Enter your Tome points in Import Save to count the bubble`,
    },
    { id: 'statue', label: 'Stealth Statue', multi: percent(getStatueBonus(snapshot, STEALTH_STATUE).value) },
    { id: 'card', label: 'Card: Crystal Candalight', multi: percent(getPassiveCardBonus(CRYSTAL_CANDALIGHT, snapshot?.cards)) },
    { id: 'achievement', label: 'Achievement: Untying Extraordinaire', multi: percent(isAchievementComplete(snapshot?.achievements, UNTYING_EXTRAORDINAIRE) ? 5 : 0) },
    { id: 'gemstone', label: 'Gemstone: Amethyst', multi: percent(getGemstones(snapshot)[AMETHYST]?.bonus ?? 0) },
    { id: 'ballot', label: 'Bonus Ballot', multi: percent(getBallotBonus(snapshot, STEALTH_BALLOT)), detail: 'Only the week it wins' },
    { id: 'lamp', label: 'The Lamp', multi: percent(getLampBonus(snapshot, ...STEALTH_LAMP)) },
    {
      id: 'schematic',
      label: 'Schematic: Noise Reduction Therapy',
      multi: schematicOwned ? Math.max(1, Math.pow(1.2, Math.floor(lavaLog(quaverNotes)))) : 1,
      detail: '1.2x per power of 10 Quaver Notes',
    },
    { id: 'emperor', label: 'Emperor Showdown', multi: percent(getEmperorBonus(snapshot, EMPEROR_STEALTH)) },
    { id: 'sushi', label: 'Sushi Station', multi: percent(getSushiBonus(snapshot?.sushi, STEALTH_SUSHI)) },
    { id: 'jelly', label: 'Jelly Operator', multi: percent(getJellyBonus(snapshot?.jellyOperator, STEALTH_JELLY)) },
    { id: 'shhhh', label: 'Knowledge: Shhhhhhhhhhh', multi: percent(knowledge[SHHHH]?.value ?? 0) },
    { id: 'smokeDevil', label: 'Companion: Smoke Devil', multi: isCompanionActive(snapshot?.companions, SMOKE_DEVIL) ? 40 : 1 },
  ]

  // ── Per ninja ──
  const parts = ninjas.map(ninja => {
    const charm = subType => getCharmTotal(ninja, subType, goldScroll)
    const sneakingLevel = ninja.sneakingLevel
    const wayOfStealth = (knowledge[WAY_OF_STEALTH]?.value ?? 0) * sneakingLevel
    const ninjaSources = [
      { id: 'scroll', label: 'Charm: Scroll of Power', multi: percent(charm(CHARM.SCROLL_OF_POWER)) },
      { id: 'silkVeil', label: 'Charm: Silk Veil', multi: percent(charm(CHARM.SILK_VEIL)) },
      { id: 'rosaries', label: 'Charm: Rosaries', multi: percent(charm(CHARM.ROSARIES)) },
      { id: 'fractal', label: 'Fractal Island', multi: percent(hasFractalStealth ? 2 * sneakingLevel : 0), detail: '+2% per Sneaking LV' },
    ]
    return {
      ninja,
      base: 10 + wayOfStealth,
      baseDetail: `10 + Way of Stealth ${formatSneakingNumber(knowledge[WAY_OF_STEALTH]?.value ?? 0)} per Sneaking LV (${sneakingLevel})`,
      ninjaSources,
      // Smoke Bomb + Lotus Flower: given to every OTHER ninja on the same floor
      floorMateBonus: charm(CHARM.SMOKE_BOMB) + charm(CHARM.LOTUS_FLOWER),
    }
  })

  const accountMulti = accountSources.reduce((product, source) => product * source.multi, 1)

  return parts.map(part => {
    const { ninja } = part
    const mates = parts.filter(other => other.ninja.index !== ninja.index && other.ninja.floor === ninja.floor)
    const mateBonus = mates.reduce((sum, mate) => sum + mate.floorMateBonus, 0)
    const floorFlowers = flowers[ninja.floor] ?? 0
    const situational = [
      {
        id: 'floorMates',
        label: 'Floor mates: Smoke Bomb + Lotus Flower',
        multi: percent(mateBonus),
        detail: mates.length ? `${mates.length} other ninja${mates.length === 1 ? '' : 's'} on this floor` : 'Alone on this floor',
      },
      {
        id: 'flowers',
        label: 'Funeral Flowers',
        multi: percent(floorFlowers * flowerBonus),
        detail: `${formatSneakingNumber(floorFlowers)} on this floor × ${formatSneakingNumber(flowerBonus)}% each`,
      },
    ]
    const sources = [
      ...part.ninjaSources.map(source => ({ ...source, scope: 'ninja' })),
      ...situational.map(source => ({ ...source, scope: 'floor' })),
      ...accountSources.map(source => ({ ...source, scope: 'account' })),
    ].map(source => ({ ...source, active: source.multi > 1 }))
    const stealth = part.base * sources.reduce((product, source) => product * source.multi, 1)
    const difficulty = getFloorDifficulty(ninja.floor, mastery)
    return {
      index: ninja.index,
      name: ninja.name,
      className: ninja.className,
      floor: ninja.floor,
      sneakingLevel: ninja.sneakingLevel,
      base: part.base,
      baseDetail: part.baseDetail,
      floorMateBonus: part.floorMateBonus,
      sources,
      accountMulti,
      stealth,
      difficulty,
      detection: getDetectionChance(stealth, difficulty),
      stealthForZero: getStealthForDetection(0, difficulty),
    }
  })
}

// Detection as the page shows it: never rounds up to 100% (a 99.9997% door breaker still has a chance),
// and shows enough decimals past 99% to tell the tiers apart
export function formatDetection(detection) {
  const pct = detection * 100
  if (pct <= 0) return '0%'
  if (pct >= 100) return '100%'
  const decimals = pct > 99 ? Math.min(6, Math.ceil(-Math.log10(100 - pct)) + 1) : 2
  const factor = Math.pow(10, decimals)
  return `${(Math.floor(pct * factor) / factor).toFixed(decimals).replace(/\.?0+$/, '')}%`
}

// ── Setups ────────────────────────────────────────────────────────────────────

// How many of each item you own (equipped + storage), your best copy of each (highest LV) and your strongest
// nunchaku
export function getOwnedNinjaItems(snapshot) {
  const { ninjas, storage } = getNinjaLoadouts(snapshot)
  const slots = [...ninjas.flatMap(ninja => ninja.equipment), ...storage].filter(slot => slot.item)
  const counts = {}
  const best = {}
  slots.forEach(slot => {
    counts[slot.raw] = (counts[slot.raw] ?? 0) + 1
    if (!best[slot.raw] || slot.level > best[slot.raw].level) best[slot.raw] = slot
  })
  const bestNunchaku = slots
    .filter(slot => slot.item.type === 1 && slot.item.subType === 1)
    .reduce((best, slot) => (!best || slot.value > best.value ? slot : best), null)
  return { counts, best, bestNunchaku }
}

// An item's text with its { / } filled in: at the level of your best copy, or at LV 0 if you don't own one
export function getNinjaItemText(item, bestSlot) {
  return fillSneakingText(item?.desc, getNinjaItemValue(item, bestSlot?.level ?? 0))
}

// A setup's roles with how many ninjas each one takes ('rest' = whoever is left), and the items it needs in
// total against what you own: [{ raw, needed, owned }]
export function getSetupPlan(setup, characterCount, owned, bestNunchakuRaw) {
  const singles = setup.roles.filter(role => role.count === 'one').length
  const roles = setup.roles.map(role => ({
    ...role,
    ninjas: role.count === 'one' ? 1 : Math.max(0, characterCount - singles),
  }))
  const needed = {}
  roles.forEach(role => role.items.forEach(raw => {
    const key = raw === BEST_NUNCHAKU ? bestNunchakuRaw ?? raw : raw
    needed[key] = (needed[key] ?? 0) + role.ninjas
  }))
  return {
    roles,
    items: Object.entries(needed).map(([raw, count]) => ({
      raw,
      needed: count,
      owned: owned.counts[raw] ?? 0,
    })),
  }
}

// ── Header numbers ────────────────────────────────────────────────────────────

const PRISTINE_ROLLS_PER_DAY = 120
const SYMBOL_ROLLS_PER_DAY = 75

// The always-visible numbers at the top of the Sneaking page
export function getSneakingSummary(snapshot) {
  const sneaking = snapshot?.sneaking
  const knowledge = getKnowledgeUpgrades(sneaking)
  const emporium = getJadeEmporium(sneaking)
  const rolls = sneaking?.charmRollsToday ?? 0
  return {
    jadeCoins: sneaking?.jadeCoins ?? 0,
    mastery: sneaking?.ninjaMasteryTier ?? 0,
    selectedMastery: sneaking?.selectedMastery ?? 0,
    openFloors: getOpenFloors(sneaking),
    nextMasteryFloor: doorBaseHp.length,
    totalFloors: doorBaseHp.length,
    knowledgeLevels: knowledge.reduce((sum, upgrade) => sum + upgrade.level, 0),
    emporiumOwned: emporium.filter(upgrade => upgrade.unlocked).length,
    emporiumTotal: emporium.length,
    charmsFound: (sneaking?.pristineCharms ?? []).filter(Boolean).length,
    charmsTotal: pristineCharmMap.length,
    pristineRollsLeft: Math.max(0, PRISTINE_ROLLS_PER_DAY - rolls),
    symbolRollsLeft: Math.max(0, SYMBOL_ROLLS_PER_DAY - rolls),
  }
}
