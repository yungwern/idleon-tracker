import {
  foodMap,
  FOOD_SLOT_COUNT,
  FOOD_SLOT_MERIT,
  FOOD_SLOT_GEM_SHOP,
  foodSlotUnlocks,
  foodCarryCap,
  talentGrowthMap,
  shrineMap,
  cardMap,
  goldenFoodEffects,
  GOLD_FOOD_BEANSTALK_JADE,
  beanstalkFoods,
  goldenFoodMultiSources,
  deathNoteMobs,
} from '../data'
import { growth } from './mathUtils'
import { getAccountFamilyBonuses, getAddedTalentLevels } from './talentUtils'
import { isAchievementComplete } from './achievementUtils'
import { getBubbleBonus, getSigilBonus } from './alchemyUtils'
import { isLabBonusOn, LAB_BONUSES } from './labUtils'
import { getCharmBonus, isJadeUnlocked } from './sneakingUtils'
import { getMealBonusByStat } from './cookingUtils'
import { getBallotBonus } from './voteUtils'
import { getLegendTalentBonus, getLegendTalentLevel } from './legendTalentUtils'
import { getCardStars, isCardOwned } from './cardUtils'
import { getJellyBonus } from './jellyUtils'
import { getArmorSetBonus } from './armorSetUtils'
import { getClassMainStat } from './characterUtils'
import { getGemShopPurchases } from './gemShopUtils'
import { getUpgradeVaultBonus } from './upgradeVaultUtils'
import { isBundleOwned } from './bundleUtils'
import { getStampBonusByEffect } from './stampUtils'
import { getStarSignBonus } from './starSignUtils'
import { getCompanionBonus } from './companionUtils'
import { getPassiveCardBonus } from './cardUtils'
import { getEffectivePrayer, getNoPrayerMulti } from './prayerUtils'

const ZERG_RUSHOGEN = 4
const RUCK_SACK = 12

// ── Food slots ───────────────────────────────────────────────────────────────

export function isGoldenFood(item) {
  return Boolean(foodMap[item]?.img?.includes('/golden/'))
}

// Unlocked food slots for the account: 2 + W3 merit (2nd and 4th purchase) + gem shop Food Slot (max 2)
export function getFoodSlotCount(snapshot) {
  const meritLevel = snapshot?.merits?.levels?.[FOOD_SLOT_MERIT.world]?.[FOOD_SLOT_MERIT.index] ?? 0
  const gemPurchases = getGemShopPurchases(snapshot?.gemShop, FOOD_SLOT_GEM_SHOP)
  return Math.min(FOOD_SLOT_COUNT, foodSlotUnlocks.filter(unlock => (
    unlock.source === 'start'
    || (unlock.source === 'merit' && meritLevel >= unlock.meritLevel)
    || (unlock.source === 'gem' && gemPurchases >= unlock.purchases)
  )).length)
}

// The character's 6 food slots in game order: { slot, item, qty, food, golden, unlocked, unlockLabel }.
// Slots unlock in order, so slot i is open once i < getFoodSlotCount (the label says which source opens it).
export function getFoodSlots(snapshot, charIndex) {
  const saved = snapshot?.characters?.[charIndex]?.food ?? []
  const unlockedCount = getFoodSlotCount(snapshot)
  return Array.from({ length: FOOD_SLOT_COUNT }, (_, slot) => {
    const entry = saved[slot] ?? { item: 'Blank', qty: 0 }
    const item = entry.item && entry.item !== 'Blank' ? entry.item : null
    return {
      slot,
      item,
      qty: item ? entry.qty : 0,
      food: item ? foodMap[item] ?? null : null,
      golden: item ? isGoldenFood(item) : false,
      unlocked: slot < unlockedCount || Boolean(item),
      unlockLabel: foodSlotUnlocks[slot]?.label ?? '',
    }
  })
}

// How many of a food the account holds outside this character's slot (storage chest)
export function getStoredFood(snapshot, item) {
  return Number(snapshot?.storage?.items?.[item]) || 0
}

// ── Golden food stack size ───────────────────────────────────────────────────
// Golden food bonus = Amount × golden food multi × stack factor (Toolbox getGoldenFoodBonus), so the
// ratio of two stack factors is exactly how much a bigger stack raises that food's bonus.
const lavaLog = n => Math.log(Math.max(n, 1)) / 2.30259

export function getGoldenFoodStackFactor(qty) {
  if (!qty) return 0
  const log = lavaLog(1 + qty)
  return 0.05 * log * (1 + log / 2.14)
}

// ── Golden food multi ────────────────────────────────────────────────────────
// Every golden food bonus × this (Toolbox getGoldenFoodMulti). Character parts: Shaman family factor,
// Haungry for Gold, star signs, Apocalypse Wow (account's best × last Death Bringer's wows).
// Equipment and obol "% Gold Food Effect" lines aren't read. Returns { value, parts, missing }.
const GF = goldenFoodMultiSources

function talentBonus(id, level) {
  const stats = talentGrowthMap[id]
  return stats && level > 0 ? growth(stats.func, level, stats.x1, stats.x2) : 0
}

// Talent level with the played character's added levels (Toolbox flatTalents; per-character added levels
// aren't ported, so every character gets the played one's)
function talentLevelWithAdded(snapshot, character, id, added) {
  const base = Number(character?.talentLevels?.[id]) || 0
  return base > 0 ? base + added : 0
}

// Wows: maps where this character has 1B+ kills (Toolbox getBarbarianZowChow: the Death Note maps plus a few
// other fighting maps). 107 on Eli's save, = Toolbox.
export function getWowCount(character) {
  const seen = new Set()
  return [...deathNoteMobs, ...GF.wowExtraMaps].reduce((count, mob) => {
    if (mob.mapIndex == null || seen.has(mob.mapIndex)) return count
    seen.add(mob.mapIndex)
    const left = character?.mapKillsLeft?.[mob.mapIndex]
    if (left == null) return count
    return Math.abs(mob.portalKills - (Number(left) || 0)) >= GF.wowKills ? count + 1 : count
  }, 0)
}

function getApocalypseWowBonus(snapshot, added) {
  const characters = snapshot?.characters ?? []
  const best = Math.max(0, ...characters.map(c => talentBonus(GF.apocalypseWow, talentLevelWithAdded(snapshot, c, GF.apocalypseWow, added))))
  const deathBringer = characters.filter(c => c?.class === 'Death Bringer').at(-1)
  return best * (deathBringer ? getWowCount(deathBringer) : 0)
}

const cardBonus = (rawName, cards) => (
  isCardOwned(rawName, cards)
    ? Math.min(GF.cardCap, (cardMap[rawName]?.bonus ?? 0) * (getCardStars(rawName, cards) + 1))
    : 0
)

export function getGoldenFoodMulti(snapshot, charIndex) {
  const character = snapshot?.characters?.[charIndex]
  const added = getAddedTalentLevels(snapshot).value
  const family = Math.max(getAccountFamilyBonuses(snapshot)[GF.familyClass] ?? 0, 1)
  const meal = getMealBonusByStat(snapshot, GF.mealStat)
  const stamp = getStampBonusByEffect(snapshot, GF.stampEffect)
  const starSign = getStarSignBonus(snapshot, GF.starSignEffect, charIndex)
  const companions = snapshot?.companions
  const verminous = getCompanionBonus(companions, GF.verminous)
  const parts = {
    talent: talentBonus(GF.talent, talentLevelWithAdded(snapshot, character, GF.talent, added)),
    stamp: stamp.value,
    achievements: (isAchievementComplete(snapshot?.achievements, GF.achievement.index) ? GF.achievement.value : 0)
      + GF.achievements.reduce((sum, a) => sum + (isAchievementComplete(snapshot?.achievements, a.index) ? a.value : 0), 0),
    bubble: getBubbleBonus(snapshot, GF.bubble, { mainStat: getClassMainStat(character?.class) }),
    sigil: getSigilBonus(snapshot, GF.sigil.index, GF.sigil.tiers),
    meal: meal.value,
    starSign: starSign.value,
    bribe: snapshot?.bribes?.[GF.bribe.index] ? GF.bribe.value : 0,
    charm: getCharmBonus(snapshot?.sneaking, GF.charm),
    ballot: getBallotBonus(snapshot, GF.ballot),
    apocalypseWow: getApocalypseWowBonus(snapshot, added),
    companions: GF.companions.reduce((sum, index) => sum + getCompanionBonus(companions, index), 0) + 1e4 * verminous,
    legendTalent: getLegendTalentBonus(GF.legendTalent, getLegendTalentLevel(snapshot?.legendTalents, GF.legendTalent)),
    cards: GF.cards.reduce((sum, rawName) => sum + cardBonus(rawName, snapshot?.cards), 0),
    vault: getUpgradeVaultBonus(snapshot?.upgradeVault, GF.vault),
    jelly: GF.jelly.reduce((sum, index) => sum + getJellyBonus(snapshot?.jellyOperator, index), 0),
  }
  const additive = Object.values(parts).reduce((sum, value) => sum + value, 0)
  const multi = 1 + (getArmorSetBonus(snapshot?.armorSmithySets, GF.armorSet) + 50 * verminous) / 100
  return {
    value: multi * (family + additive / 100),
    parts: { family, multi, ...parts },
    missing: [...new Set([...meal.missing, ...stamp.missing, ...starSign.missing])],
  }
}

// ── Golden food bonus ────────────────────────────────────────────────────────
// Bonus of one golden food effect for a character (Toolbox getGoldenFoodBonus): every equipped golden food
// with that effect, plus its Beanstalk copy (stack 1000 × 10^rank) once the Jade upgrade is bought.
// options.equipped / options.beanstalk = false leave that part out (shrine golden cheese comparisons).
// Returns { value, equipped, beanstalk, multi, missing }.
export function getGoldenFoodBonus(snapshot, charIndex, foodId, options = {}) {
  const food = goldenFoodEffects[foodId]
  if (!food) return { value: 0, equipped: 0, beanstalk: 0, multi: 0, missing: [] }
  const multi = getGoldenFoodMulti(snapshot, charIndex)
  const bonus = (amount, qty) => amount * multi.value * getGoldenFoodStackFactor(qty)
  const sameEffect = item => goldenFoodEffects[item]?.effect === food.effect

  const equipped = options.equipped === false ? 0 : (snapshot?.characters?.[charIndex]?.food ?? [])
    .reduce((sum, slot) => (sameEffect(slot.item) ? sum + bonus(goldenFoodEffects[slot.item].amount, slot.qty) : sum), 0)

  let beanstalk = 0
  if (options.beanstalk !== false && isJadeUnlocked(snapshot?.sneaking, GOLD_FOOD_BEANSTALK_JADE)) {
    // The game stops at the first stalk food with this effect
    const index = beanstalkFoods.findIndex(sameEffect)
    const rank = snapshot?.sneaking?.beanstalk?.[index] ?? 0
    if (index !== -1 && rank > 0) beanstalk = bonus(goldenFoodEffects[beanstalkFoods[index]].amount, 1000 * Math.pow(10, rank))
  }
  return {
    value: equipped + beanstalk,
    equipped,
    beanstalk,
    multi: multi.value,
    missing: multi.missing,
  }
}

// ── Food carry capacity ──────────────────────────────────────────────────────
// Most a food slot (or inventory slot) can hold, for a set of equipped prayer ids
// (Toolbox getItemCapacity('cFood') with getAllCap). Returns { value, missing, parts }.
export function getFoodCarryCap(snapshot, charIndex, prayerIds) {
  const character = snapshot?.characters?.[charIndex]
  const cfg = foodCarryCap
  const missing = []

  const bag = Number(character?.carryBags?.Foods) || 0
  const vault = getUpgradeVaultBonus(snapshot?.upgradeVault, cfg.vaultUpgrade)
  const bundles = 1000 * cfg.bundles.filter(name => isBundleOwned(snapshot?.bundles, name)).length
  const gemShop = getGemShopPurchases(snapshot?.gemShop, cfg.gemShopCarry)
  const stamps = getStampBonusByEffect(snapshot, cfg.allCarryStampEffect)
  missing.push(...stamps.missing)
  const starSign = getStarSignBonus(snapshot, cfg.starSignEffect, charIndex)
  missing.push(...starSign.missing)

  let guild = 0
  if (snapshot?.guildBonusLevels) {
    const { func, x1, x2, index } = cfg.guildBonus
    guild = growth(func, snapshot.guildBonusLevels[index] ?? 0, x1, x2)
  } else {
    missing.push('Guild Rucksack bonus (cloud saves have no guild data: export from Toolbox)')
  }
  const talentStats = talentGrowthMap[cfg.starTalent]
  const talent = growth(talentStats.func, Number(character?.talentLevels?.[cfg.starTalent]) || 0, talentStats.x1, talentStats.x2)
  const shrine = getFoodShrineBonus(snapshot, character)
  const companion = getCompanionBonus(snapshot?.companions, cfg.companion)
  const ram = (snapshot?.companions?.owned?.[cfg.ramCompanion] ?? -1) >= 1 ? cfg.ramBonus : 0
  const bribe = snapshot?.bribes?.[cfg.bribe.index] ? cfg.bribe.value : 0
  const zergCurse = getEffectivePrayer(snapshot, prayerIds, ZERG_RUSHOGEN).curse
  const ruckBonus = getEffectivePrayer(snapshot, prayerIds, RUCK_SACK).bonus

  const prayerMulti = Math.max(1 - zergCurse / 100, cfg.prayerCurseFloor) * (1 + (ruckBonus + bribe + ram) / 100)
  const otherMulti = (1 + (guild + talent) / 100) * (1 + companion / 100) * (1 + shrine / 100)
  const value = Math.floor(Math.min(
    cfg.hardCap,
    (vault + bundles + bag)
      * (1 + 25 * gemShop / 100)
      * (1 + (stamps.value + starSign.value) / 100)
      * otherMulti
      * prayerMulti,
  ))
  return {
    value,
    missing: [...new Set(missing)],
    parts: {
      zergCurse,
      ruckBonus,
      prayerMulti,
    },
  }
}

// Pantheon shrine: counts on its own map, everywhere with the Moai Head artifact, or in its world with
// Shrine World Tour (lab bonus, on while connected in the mainframe). × Chaotic Chizoar passive card.
function getFoodShrineBonus(snapshot, character) {
  const shrine = snapshot?.shrines?.[foodCarryCap.shrine]
  if (!shrine || !shrine.level) return 0
  const buffs = snapshot?.shrineBuffs
  const playerMap = character?.currentMap ?? -1
  const sameWorld = Math.floor(playerMap / 50) === Math.floor(shrine.mapIndex / 50)
  const applies = buffs?.moaiHead || playerMap === shrine.mapIndex || (buffs?.labUnlocked && sameWorld && isLabBonusOn(snapshot, LAB_BONUSES.shrineWorldTour))
  if (!applies) return 0
  const entry = shrineMap[shrine.id]
  if (!entry) return 0
  const card = getPassiveCardBonus(foodCarryCap.shrinePassiveCard, snapshot?.cards)
  return (1 + card / 100) * (entry.baseBonus + (shrine.level - 1) * entry.bonusPerLevel)
}

// ── Stack planner ────────────────────────────────────────────────────────────
// Prayer setups worth comparing for golden food stacks. Stacks stay when a prayer comes off, so a
// setup only has to be on while topping the stacks up (Eli's Ruck Sack swap).
export function getFoodCapSetups(snapshot, charIndex) {
  const equipped = snapshot?.characters?.[charIndex]?.prayers ?? []
  const hasZerg = equipped.includes(ZERG_RUSHOGEN)
  const hasRuck = equipped.includes(RUCK_SACK)
  const setups = [{ id: 'now', label: 'Equipped prayers', prayers: equipped }]
  if (hasZerg) {
    setups.push({ id: 'noZerg', label: 'Zerg Rushogen off', prayers: equipped.filter(id => id !== ZERG_RUSHOGEN) })
  }
  if (!hasRuck) {
    const swapped = [...equipped.filter(id => id !== ZERG_RUSHOGEN), RUCK_SACK]
    setups.push({
      id: 'ruck',
      label: hasZerg ? 'Ruck Sack in Zerg Rushogen\'s slot' : 'Ruck Sack added',
      prayers: swapped,
    })
  }
  if (equipped.length > 0 && getNoPrayerMulti(snapshot) > 0) {
    setups.push({ id: 'none', label: 'No prayers (superbits)', prayers: [] })
  }
  return setups.map(setup => ({
    ...setup,
    cap: getFoodCarryCap(snapshot, charIndex, setup.prayers),
  }))
}

// Per equipped golden food: stack now, how many the account has (slot + storage) and, per setup, the
// stack it could reach (min of cap and owned, never below today's stack) and the bonus change in %.
export function getGoldenFoodStackPlan(snapshot, charIndex) {
  const setups = getFoodCapSetups(snapshot, charIndex)
  const foods = getFoodSlots(snapshot, charIndex)
    .filter(slot => slot.item && slot.golden)
    .map(slot => {
      const owned = slot.qty + getStoredFood(snapshot, slot.item)
      const factorNow = getGoldenFoodStackFactor(slot.qty)
      return {
        ...slot,
        owned,
        reach: setups.map(setup => {
          const stack = Math.max(slot.qty, Math.min(setup.cap.value, owned))
          return {
            id: setup.id,
            stack,
            gain: factorNow > 0 ? (getGoldenFoodStackFactor(stack) / factorNow - 1) * 100 : 0,
          }
        }),
      }
    })
  const best = setups.reduce((top, setup) => (setup.cap.value > top.cap.value ? setup : top), setups[0])
  return {
    setups,
    foods,
    best,
  }
}
