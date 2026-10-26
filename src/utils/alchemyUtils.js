import { bubbleMap, vialMap } from '../data'
import { getExoticBonus } from './exoticUtils'
import { growth } from './mathUtils'
import { getLegendTalentBonus, getLegendTalentLevel } from './legendTalentUtils'
import { getSushiBonus } from './sushiUtils'
import { getUpgradeVaultBonus } from './upgradeVaultUtils'
import { isRiftBonusUnlocked } from './riftUtils'
import { isMeritocracyBonusSelected } from './voteUtils'
import { getTesseractBonus } from './tesseractUtils'
import { getArcadeBonus } from './arcadeUtils'
import { getCompanionBonus } from './companionUtils'
import { getJellyBonus } from './jellyUtils'
import { getAssumedLabBonus, LAB_BONUSES } from './labUtils'
import { getPaletteBonus } from './gamingUtils'

// Alchemy (W2) bonus math, ported from IdleonToolbox parsers/world-2/alchemy.ts.
// Each function returns { value, missing } where `missing` lists the parts of the
// game's formula the app can't read yet, so pages can show the value as partial.

const BUBBLE_BY_INDEX = Object.fromEntries(Object.values(bubbleMap).map(bubble => [bubble.bubbleIndex, bubble]))

// ── Prisma ────────────────────────────────────────────────────────────────────

export const MAX_PRISMA_MULTI = 5
const PRISMA_EXOTIC = 48 // Prisma Petal
const PRISMA_LEGEND_TALENT = 36 // Wowa Woowa
const PRISMA_SUSHI = 23
const PINNACLE_OF_PRISMA = 45 // tesseract
const RIFT_HIVEMIND = 88 // companion: +50% (+75% upgraded)
const PRISMA_JELLY = 36
const PRISMA_TROPHY = 'Trophy23' // +10% once dropped
const ETHEREAL_SIGIL_PRISMA = 0.2 // % per ethereal sigil
const PRISMA_PALETTE = 28 // Violet

export function isPrismaBubble(snapshot, bubbleIndex) {
  return (snapshot?.prismaBubbles ?? []).includes(bubbleIndex)
}

// Multiplier on Prisma bubbles: 2x base + additive bonuses, capped at 5x (Toolbox getPrismaMulti)
export function getPrismaMulti(snapshot) {
  const exotic = getExoticBonus(snapshot?.farming, PRISMA_EXOTIC)
  const legend = getLegendTalentBonus(PRISMA_LEGEND_TALENT, getLegendTalentLevel(snapshot?.legendTalents, PRISMA_LEGEND_TALENT))
  const sushi = getSushiBonus(snapshot?.sushi, PRISMA_SUSHI)
  const tesseract = getTesseractBonus(snapshot?.tesseract, PINNACLE_OF_PRISMA)
  const arcade = getArcadeBonus(snapshot, 'Prisma Bonuses')
  const companion = 50 * getCompanionBonus(snapshot?.companions, RIFT_HIVEMIND)
  const jelly = getJellyBonus(snapshot?.jellyOperator, PRISMA_JELLY)
  const trophy = (snapshot?.droppedTrophies ?? []).includes(PRISMA_TROPHY) ? 10 : 0
  const sigils = ETHEREAL_SIGIL_PRISMA * (snapshot?.alchemy?.etherealSigils ?? 0)
  const palette = getPaletteBonus(snapshot, PRISMA_PALETTE)
  return Math.min(MAX_PRISMA_MULTI, 2 + (exotic + legend + sushi + tesseract + arcade + companion + jelly + trophy + sigils + palette) / 100)
}

// ── Bubbles ───────────────────────────────────────────────────────────────────

// Bubbles boosted by their cauldron's 16th bubble (power, quicc and high-iq only)
const CAULDRON_BOOSTED = {
  _: new Set([0, 2, 4, 7, 14]),
  a: new Set([0, 6, 9, 12, 14]),
  b: new Set([0, 2, 6, 12, 14]),
}

function rawBubbleValue(snapshot, bubbleIndex, prisma) {
  const bubble = BUBBLE_BY_INDEX[bubbleIndex]
  if (!bubble) return 0
  const level = snapshot?.alchemy?.bubbleLevels?.[bubbleIndex] ?? 0
  const value = growth(bubble.func, level, bubble.x1, bubble.x2)
  return isPrismaBubble(snapshot, bubbleIndex) ? value * prisma : value
}

// A bubble's bonus as the game applies it account-wide (no class bubble multiplier)
export function getBubbleBonus(snapshot, bubbleIndex) {
  const prisma = getPrismaMulti(snapshot)
  let value = rawBubbleValue(snapshot, bubbleIndex, prisma)
  const prefix = bubbleIndex[0]
  if (CAULDRON_BOOSTED[prefix]?.has(Number(bubbleIndex.slice(1)))) {
    value *= rawBubbleValue(snapshot, `${prefix}16`, prisma)
  }
  return value
}

// ── Vials ─────────────────────────────────────────────────────────────────────

export const MAX_VIAL_LEVEL = 13
const VIAL_VAULT_UPGRADE = 42
const VIAL_MERITOCRACY = 20

// Multiplier on every vial (Toolbox getVialMultiplier). My 1st Chemistry Set (lab) doubles
// vials while it's connected.
export function getVialMultiplier(snapshot) {
  const chemistrySet = getAssumedLabBonus(LAB_BONUSES.myFirstChemistrySet)
  const vialMastery = isRiftBonusUnlocked(snapshot?.rift, 'vialMastery')
    ? 2 * Object.values(snapshot?.alchemy?.vialLevels ?? {}).filter(level => level >= MAX_VIAL_LEVEL).length
    : 0
  const vault = getUpgradeVaultBonus(snapshot?.upgradeVault, VIAL_VAULT_UPGRADE)
  const missing = [...chemistrySet.missing]
  if (isMeritocracyBonusSelected(snapshot?.voteBallot, VIAL_MERITOCRACY)) missing.push('Meritocracy')
  return {
    value: chemistrySet.value * (1 + (vialMastery + vault) / 100),
    missing,
  }
}

// Total bonus from vials with the given stat (e.g. '6FarmEvo')
export function getVialBonusByStat(snapshot, stat) {
  const multi = getVialMultiplier(snapshot)
  const value = Object.entries(vialMap).reduce((sum, [index, vial]) => {
    if (vial.stat !== stat) return sum
    const level = snapshot?.alchemy?.vialLevels?.[index] ?? 0
    return sum + growth(vial.func, level, vial.x1, vial.x2) * multi.value
  }, 0)
  return {
    value,
    missing: value > 0 ? multi.missing : [],
  }
}
