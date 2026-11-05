import { shrineMap, shrineExpSources } from '../data'
import { growth } from './mathUtils'
import { getPassiveCardBonus } from './cardUtils'
import { isSuperbitUnlocked } from './gamingUtils'
import { isSkillMasteryBonusUnlocked } from './skillUtils'
import { getVialBonusByStat } from './alchemyUtils'
import { getBallotBonus } from './voteUtils'
import { getLegendTalentLevel } from './legendTalentUtils'
import { getGoldenFoodBonus } from './foodUtils'
import { isLabBonusOn, LAB_BONUSES } from './labUtils'

// Shrines (W3 Construction), from IdleonToolbox parsers/world-3/shrines.ts (getShrineExpBonus, getShrineBonus).
// Shrine EXP is earned per hour of AFK gains: every character adds its own rate to each shrine it levels.

const SRC = shrineExpSources
const SHRINE_EFFECT_CARD = '+{% Shrine Effects (Passive)' // Chaotic Chizoar
const GOLDEN_CHEESE = 'FoodG8'
const MAPS_PER_WORLD = 50
const MAX_SIM_HOURS = 24 * 365 * 100

// Golden cheese setups the Shrines page compares
export const CHEESE_MODES = {
  current: { label: 'Your setup', options: {} },
  beanstalk: { label: 'Beanstalk only', options: { equipped: false } },
  none: { label: 'No Golden Cheese', options: { equipped: false, beanstalk: false } },
}

// EXP needed for the next level at `level` (game: 20 (L - 1) + 6 L × 1.63^(L - 1))
export function getShrineLevelReq(level) {
  return level > 0 ? Math.floor(20 * (level - 1) + 6 * level * Math.pow(1.63, level - 1)) : 0
}

// A shrine's bonus at `level`, × Chaotic Chizoar card (0 when unbuilt)
export function getShrineEffect(snapshot, shrine, level = shrine?.level) {
  const entry = shrineMap[shrine?.id]
  if (!entry || !(level > 0)) return 0
  const card = getPassiveCardBonus(SHRINE_EFFECT_CARD, snapshot?.cards)
  return (1 + card / 100) * (entry.baseBonus + (level - 1) * entry.bonusPerLevel)
}

const sameWorld = (a, b) => Math.floor(a / MAPS_PER_WORLD) === Math.floor(b / MAPS_PER_WORLD)
// Shrine World Tour (lab bonus, on while connected in the mainframe): the game only compares worlds
const worldTour = (snapshot, shrine, mapIndex) => Boolean(snapshot?.shrineBuffs?.labUnlocked)
  && isLabBonusOn(snapshot, LAB_BONUSES.shrineWorldTour)
  && sameWorld(shrine.mapIndex, mapIndex)

// Does a character on `mapIndex` get this shrine's bonus? (same map, World Tour, or Moai Head anywhere)
export function shrineAppliesOn(snapshot, shrine, mapIndex) {
  return mapIndex === shrine.mapIndex || worldTour(snapshot, shrine, mapIndex) || Boolean(snapshot?.shrineBuffs?.moaiHead)
}

// Does a character on `mapIndex` level this shrine? (same map, World Tour, or Shrine World Order Bill anywhere)
export function shrineLevelsOn(snapshot, shrine, mapIndex) {
  if (!(shrine?.level > 0)) return false
  return mapIndex === shrine.mapIndex
    || worldTour(snapshot, shrine, mapIndex)
    || getLegendTalentLevel(snapshot?.legendTalents, SRC.worldOrderLegendTalent) > 0
}

function getMoaiHeadBonus(snapshot) {
  const form = snapshot?.sailing?.artifactForms?.[0] ?? 0
  return SRC.moaiHeadForms[form] ?? SRC.moaiHeadForms.at(-1)
}

function getPostOfficeBonus(character) {
  const box = SRC.postOfficeBox
  const level = Math.max(0, Math.round((character?.postOfficeBoxes?.[box.index] ?? 0) - box.unlockLevel))
  return growth(box.func, level, box.x1, box.x2)
}

// Everything in each character's shrine EXP rate except the shrine's own building level and the Crystal
// Shrine (both change per shrine / over time). cheeseMode = a CHEESE_MODES key.
// Returns { account, characters: [{ index, name, mapIndex, additive, cheese, crystalApplies }], missing }.
export function getShrineExpModel(snapshot, cheeseMode = 'current') {
  const crystal = snapshot?.shrines?.[SRC.crystalShrine]
  const vial = getVialBonusByStat(snapshot, SRC.vialStat)
  const missing = [...vial.missing]
  const account = (1 + (isSuperbitUnlocked(snapshot?.gaming, SRC.superbit) ? 50 : 0) / 100)
    * (1 + (getMoaiHeadBonus(snapshot)
      + (isSkillMasteryBonusUnlocked(snapshot, 'construction', SRC.skillMasteryBonus) ? SRC.skillMasteryValue : 0)) / 100)
    * (1 + getBallotBonus(snapshot, SRC.ballot) / 100)
  const options = CHEESE_MODES[cheeseMode]?.options ?? {}
  const characters = (snapshot?.characters ?? []).map((character, index) => {
    const cheese = getGoldenFoodBonus(snapshot, index, GOLDEN_CHEESE, options)
    missing.push(...cheese.missing)
    const architect = Number(character?.talentLevels?.[SRC.starTalent]) || 0
    const talent = architect > 0 ? growth('decay', architect, 50, 50) : 0
    return {
      index,
      name: character?.name ?? `Character ${index + 1}`,
      mapIndex: character?.currentMap ?? -1,
      additive: getPostOfficeBonus(character) + talent + vial.value + cheese.value,
      cheese: cheese.value,
      crystalApplies: crystal ? shrineAppliesOn(snapshot, crystal, character?.currentMap ?? -1) : false,
    }
  })
  return {
    account,
    characters,
    missing: [...new Set(missing)],
  }
}

// EXP per hour for `shrine`, with the Crystal Shrine at `crystalLevel`. Returns { value, characters }.
export function getShrineExpRate(snapshot, model, shrine, crystalLevel) {
  const crystal = snapshot?.shrines?.[SRC.crystalShrine]
  const crystalBonus = crystal ? getShrineEffect(snapshot, crystal, crystalLevel ?? crystal.level) : 0
  const building = 1 + (SRC.buildingPerLevel * (shrine?.constructionLevel ?? 0)) / 100
  const characters = model.characters.filter(c => shrineLevelsOn(snapshot, shrine, c.mapIndex))
  const value = characters.reduce((sum, c) => (
    sum + model.account * building * (1 + ((c.crystalApplies ? crystalBonus : 0) + c.additive) / 100)
  ), 0)
  return { value, characters }
}

// Levels every shrine at once for `levels` levels each (Crystal Shrine LV ups speed up the others as they
// happen). Returns per shrine (snapshot.shrines order): { rate, characters, nextHours, targetHours, targetLevel }.
// Hours are hours of AFK gains for the characters where they stand now; Infinity = nobody levels it.
export function simulateShrineLevels(snapshot, model, levels = 1) {
  const shrines = snapshot?.shrines ?? []
  const crystalIndex = SRC.crystalShrine
  const state = shrines.map(s => ({ level: s.level, xp: s.xp, done: 0 }))
  const results = shrines.map(s => ({
    rate: getShrineExpRate(snapshot, model, s, s.level),
    nextHours: Infinity,
    targetHours: Infinity,
    targetLevel: s.level + levels,
  }))
  const active = i => shrines[i].level > 0 && results[i].rate.value > 0
  const pending = () => shrines.some((_, i) => active(i) && state[i].done < levels)

  let hours = 0
  let guard = 0
  while (pending() && hours < MAX_SIM_HOURS && guard++ < 10000) {
    const crystalLevel = state[crystalIndex]?.level
    const rates = shrines.map((s, i) => (active(i) ? getShrineExpRate(snapshot, model, s, crystalLevel).value : 0))
    // Next level-up among shrines still leveling (the Crystal Shrine keeps going so its boost stays right)
    let step = Infinity
    shrines.forEach((s, i) => {
      if (!rates[i] || (state[i].done >= levels && i !== crystalIndex)) return
      step = Math.min(step, Math.max(0, getShrineLevelReq(state[i].level) - state[i].xp) / rates[i])
    })
    if (!Number.isFinite(step)) break
    hours += step
    shrines.forEach((s, i) => {
      if (!rates[i]) return
      state[i].xp += rates[i] * step
      const req = getShrineLevelReq(state[i].level)
      if (state[i].xp >= req - 1e-6) {
        state[i].xp -= req
        state[i].level += 1
        state[i].done += 1
        if (state[i].done === 1) results[i].nextHours = hours
        if (state[i].done === levels) results[i].targetHours = hours
      }
    })
  }
  return results
}
