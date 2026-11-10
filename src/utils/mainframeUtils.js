import { labBonusMap, labJewelMap, CLASS_TALENT_TABS } from '../data'
import { getSkillLevel } from './skillUtils'
import { isMajorGodActive, GODS } from './divinityUtils'
import { getMealBonusByStat } from './cookingUtils'
import { getShinyPassiveTotal } from './breedingUtils'
import { getAccountTalentBonus } from './talentUtils'
import { getMeritBonus } from './meritUtils'
import { getWinnerBonusByName } from './summoningUtils'
import { getLabJewelValue } from './labUtils'
import { getPassiveCardBonus } from './cardUtils'
import { isNoticeOn } from './noticeSettings'

// Lab mainframe connections (Mainframe tab), from IdleonToolbox parsers/world-4/lab.ts. Separate from
// labUtils because it reads meals/talents/summoning, which themselves read labUtils.
// Tube players = AFK in the Laboratory or under Arctis' major bonus. The chain starts at the prism: the
// first tube player within its own line width of the prism connects, then any tube player within its
// own line width of a connected one. A bonus or owned jewel is on when a connected player is within its
// connection range.

const PRISM = {
  x: 43,
  y: 229,
}
const SAPPHIRE_RHOMBOL = 5 // jewel: +25% line width within 150px, even when off
const SAPPHIRE_RHOMBOL_RADIUS = 150
const PYRITE_RHOMBOL = 9 // jewel: +% connection range
const SPELUNKER_OBOL = 8 // bonus: multiplies jewels
const VIRAL_CONNECTION = 13 // bonus: +50% connection range
const CONDUCTIVE_MOTHERBOARD = 6 // chip: +12% line width
const SOUPED_UP_WIDTH = 30
const LINE_WIDTH_CARD = '+{px Line Width (Passive)' // passive card effect, capped at 50px
const LINE_WIDTH_CARD_CAP = 50
const PET_ARENA_LINE_WIDTH = 20 // Pet Arena bonus 13: +20% line width at wave 150 (Toolbox randomList[53][13])
const PET_ARENA_LINE_WIDTH_WAVE = 150
const PURPLE_TUBE = 535 // Bubonic talent: +% line width for players right of a Bubonic
const GREEN_TUBE = 536 // Bubonic talent: +% Lab EXP for players left of a Bubonic
const BASE_RANGE = 80
const FIXED_RANGE = {
  bonus: { 8: 80, 13: 80 },
  jewel: { 9: 80, 19: 80, 21: 100, 22: 100, 23: 100 },
}
const LAB_RANGE_MERIT = { world: 3, index: 4 } // W4 merit: +1px connection range per level
const LAB_FUSE_EQUINOX = 6 // Equinox Laboratory Fuse: +1px per level

// Game distance: an octagonal approximation of the straight line
export function getLabDistance(a, b) {
  const dx = Math.abs(a.x - b.x)
  const dy = Math.abs(a.y - b.y)
  return 0.9604339 * Math.max(dx, dy) + 0.397824735 * Math.min(dx, dy)
}

function isBubonicLine(className) {
  return (CLASS_TALENT_TABS[className] ?? [className]).includes('Bubonic Conjuror')
}

// Characters whose class line runs through Bubonic Conjuror (Arcane Cultists count), with tube positions
export function getBubonics(snapshot) {
  return (snapshot?.characters ?? [])
    .map((character, index) => ({
      index,
      name: character.name,
      ...(snapshot?.lab?.positions?.[index] ?? { x: 0, y: 0 }),
      bubonic: isBubonicLine(character.class),
    }))
    .filter(entry => entry.bubonic)
}

export function isInLabTube(snapshot, index) {
  const character = snapshot?.characters?.[index]
  return character?.afkTarget === 'Laboratory' || isMajorGodActive(snapshot, index, GODS.Arctis)
}

// Souped Up Tube (gem shop, 2 tubes per purchase): lab-AFK players by their order among lab-AFK
// players, everyone else (Arctis) by save index (Toolbox BonusLineWidth)
function isSouped(snapshot, index) {
  const souped = snapshot?.lab?.soupedUpTubes ?? 0
  const labAfk = (snapshot?.characters ?? [])
    .map((character, i) => (character.afkTarget === 'Laboratory' ? i : -1))
    .filter(i => i >= 0)
  const rank = labAfk.indexOf(index)
  if (rank !== -1) return rank < souped
  return index < souped && isMajorGodActive(snapshot, index, GODS.Arctis)
}

function getLineWidth(snapshot, index, bubonics) {
  const character = snapshot?.characters?.[index]
  const position = snapshot?.lab?.positions?.[index] ?? { x: 0, y: 0 }
  let base = 50 + 2 * getSkillLevel(character, 'lab')
  const rhombol = labJewelMap[SAPPHIRE_RHOMBOL]
  if (snapshot?.lab?.jewelsOwned?.[SAPPHIRE_RHOMBOL] && getLabDistance(rhombol, position) < SAPPHIRE_RHOMBOL_RADIUS) {
    base *= 1.25
  }
  const mealPx = getMealBonusByStat(snapshot, 'PxLine').value
  const mealPct = getMealBonusByStat(snapshot, 'LinePct').value
  const chips = (snapshot?.lab?.chipSlots?.[index] ?? []).filter(chip => chip === CONDUCTIVE_MOTHERBOARD).length * 12
  const shiny = getShinyPassiveTotal(snapshot?.breeding, '+{%_Line_Width_in_Lab')
  const purple = bubonics.some(bubonic => position.x >= bubonic.x) ? getAccountTalentBonus(snapshot, PURPLE_TUBE).value : 0
  const souped = isSouped(snapshot, index) ? SOUPED_UP_WIDTH : 0
  const cards = Math.min(getPassiveCardBonus(LINE_WIDTH_CARD, snapshot?.cards), LINE_WIDTH_CARD_CAP)
  const arena = (snapshot?.lab?.arenaWave ?? 0) >= PET_ARENA_LINE_WIDTH_WAVE ? PET_ARENA_LINE_WIDTH : 0
  return Math.floor((base + mealPx + cards) * (1 + (purple + mealPct + chips + arena + shiny + souped) / 100))
}

function getRange(kind, index, rangeBonus) {
  return FIXED_RANGE[kind][index] ?? rangeBonus.scaled
}

// Results per snapshot. While one is being worked out, calls for it (meals → Black Diamond Rhinestone →
// labUtils) get null, which labUtils reads as "owned / on".
const connectionCache = new WeakMap()
const inProgress = new WeakSet()

// Whole mainframe: players (line width, in tube, connected, linkedFrom), which bonuses/jewels are on,
// and the connection range most nodes use. null while this snapshot's connections are being worked out.
export function getMainframeConnections(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return null
  if (connectionCache.has(snapshot)) return connectionCache.get(snapshot)
  if (inProgress.has(snapshot)) return null
  inProgress.add(snapshot)
  try {
    const result = computeConnections(snapshot)
    connectionCache.set(snapshot, result)
    return result
  } finally {
    inProgress.delete(snapshot)
  }
}

function computeConnections(snapshot) {
  const bubonics = getBubonics(snapshot)
  const players = (snapshot?.characters ?? []).map((character, index) => ({
    index,
    name: character.name,
    className: character.class,
    ...(snapshot?.lab?.positions?.[index] ?? { x: 0, y: 0 }),
    inTube: isInLabTube(snapshot, index),
    lineWidth: getLineWidth(snapshot, index, bubonics),
    connected: false,
    linkedFrom: null,
  }))

  // Player chain from the prism. The game only asks whether a player is within its own line width of the
  // prism or of an already connected player; for the map each new player links to the closest one that
  // reaches it, which draws the daisy chain early accounts have to build (and a short tree late on).
  const tube = players.filter(player => player.inTube)
  const sources = [{ ...PRISM, index: 'prism' }]
  for (;;) {
    let best = null
    tube.forEach(player => {
      if (player.connected) return
      sources.forEach(source => {
        const distance = getLabDistance(source, player)
        if (distance < player.lineWidth && (!best || distance < best.distance)) {
          best = { player, source, distance }
        }
      })
    })
    if (!best) break
    best.player.connected = true
    best.player.linkedFrom = best.source.index
    sources.push(best.player)
  }
  const connected = players.filter(player => player.connected)

  // Bonuses and owned jewels: repeat while a newly connected node (Viral Connection, Pyrite Rhombol,
  // Spelunker Obol) widens the range
  const owned = snapshot?.lab?.jewelsOwned ?? []
  const bonuses = labBonusMap.map(() => false)
  const jewels = labJewelMap.map(() => false)
  const flat = getMeritBonus(snapshot?.merits, LAB_RANGE_MERIT.world, LAB_RANGE_MERIT.index)
    + (snapshot?.equinox?.upgradeLevels?.[LAB_FUSE_EQUINOX] ?? 0)
    + getWinnerBonusByName(snapshot, '+{ Lab Con Range')
  let rangeBonus = { scaled: BASE_RANGE + flat }
  let changed = true
  while (changed) {
    changed = false
    const spelunker = bonuses[SPELUNKER_OBOL] ? 1 : 1 / labBonusMap[SPELUNKER_OBOL].bonusOn
    const pyrite = jewels[PYRITE_RHOMBOL] ? getLabJewelValue(snapshot, labJewelMap[PYRITE_RHOMBOL]) * spelunker : 0
    const viral = bonuses[VIRAL_CONNECTION] ? labBonusMap[VIRAL_CONNECTION].bonusOn : 0
    rangeBonus = {
      scaled: Math.floor(BASE_RANGE * (1 + (pyrite + viral) / 100)) + flat,
      pyrite,
      viral,
      flat,
    }
    labBonusMap.forEach((bonus, i) => {
      if (bonuses[i]) return
      const range = getRange('bonus', i, rangeBonus)
      if (connected.some(player => getLabDistance(player, bonus) < range)) {
        bonuses[i] = true
        changed = true
      }
    })
    labJewelMap.forEach((jewel, i) => {
      if (jewels[i] || !owned[i]) return
      const range = getRange('jewel', i, rangeBonus)
      if (connected.some(player => getLabDistance(player, jewel) < range)) {
        jewels[i] = true
        changed = true
      }
    })
  }

  // How far the nearest connected player is from each node, against the node's range
  const reach = (node, range) => ({
    range,
    nearest: connected.length > 0 ? Math.min(...connected.map(player => getLabDistance(player, node))) : null,
  })
  return {
    players,
    bonuses,
    jewels,
    bonusReach: labBonusMap.map((bonus, i) => reach(bonus, getRange('bonus', i, rangeBonus))),
    jewelReach: labJewelMap.map((jewel, i) => reach(jewel, getRange('jewel', i, rangeBonus))),
    range: rangeBonus,
    prism: PRISM,
  }
}

// Green Tube (Bubonic talent 536): players left of a Bubonic (the Bubonic included) get +% Lab EXP.
// Toolbox: a player gets it when any Bubonic-line character sits further right, so only the
// rightmost Bubonic matters. Returns the bonus and the characters right of it.
export function getGreenTubeCheck(snapshot) {
  const bubonics = getBubonics(snapshot)
  if (bubonics.length === 0) return null
  const rightmost = bubonics.reduce((best, entry) => (entry.x > best.x ? entry : best), bubonics[0])
  const bonus = getAccountTalentBonus(snapshot, GREEN_TUBE).value
  const missing = (snapshot?.characters ?? [])
    .map((character, index) => ({
      index,
      name: character.name,
      x: snapshot?.lab?.positions?.[index]?.x ?? 0,
    }))
    .filter(entry => entry.x > rightmost.x)
  return {
    bonus,
    rightmost,
    missing,
  }
}

// Viaduct of the Gods (bonus 6): x5 liquid capacity but -30% liquid regen. Normally left off (Eli); only
// worth connecting while mass leveling bubbles or saving liquid for alchemy shop upgrades.
export const VIADUCT_OF_THE_GODS = 6

// Everything the Mainframe tab warns about, and the count for the Lab sidebar badge + tab badge:
// each character missing Green Tube, Viaduct of the Gods connected, and every other bonus left off
// (only once someone is connected at all).
export function getMainframeNotices(snapshot) {
  if (!snapshot?.lab) {
    return {
      greenTube: null,
      viaductOn: false,
      offBonuses: [],
      anyConnected: false,
      count: 0,
    }
  }
  // Kinds turned off in Home > Settings read as clear (utils/noticeSettings.js)
  const greenTube = isNoticeOn('Lab', 'greenTube') ? getGreenTubeCheck(snapshot) : null
  const connections = getMainframeConnections(snapshot)
  const anyConnected = connections.players.some(player => player.connected)
  const viaductOn = isNoticeOn('Lab', 'viaduct') && !!connections.bonuses[VIADUCT_OF_THE_GODS]
  const offBonuses = anyConnected && isNoticeOn('Lab', 'offBonuses')
    ? labBonusMap.filter(bonus => bonus.index !== VIADUCT_OF_THE_GODS && !connections.bonuses[bonus.index])
    : []
  return {
    greenTube,
    viaductOn,
    offBonuses,
    anyConnected,
    count: (greenTube?.missing.length ?? 0) + (viaductOn ? 1 : 0) + offBonuses.length,
  }
}
