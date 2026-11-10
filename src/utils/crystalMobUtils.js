import { getLegendTalentBonus, getLegendTalentLevel } from './legendTalentUtils'
import { getMeritocracyBonus } from './voteUtils'
import { getSigilBonus } from './alchemyUtils'
import { getMeritBonus } from './meritUtils'
import { isAchievementComplete } from './achievementUtils'

// ── Daily guaranteed Crystal Mobs ─────────────────────────────────────────────
// Game "GuaranteedCrystalMobs" (Toolbox parsers/misc.ts): ceil((1 + Meritocracy 15) × (1 + legend talent
// 37 "6 O'Clock Crystals") × (Shiny Beacon sigil + W4 merit 0 + 4 from achievement 285 "The Plateauourist")).
// legendLevel overrides talent 37's LV (default: the save's).
const CRYSTAL_MERITOCRACY = 15
const CRYSTAL_LEGEND_TALENT = 37
const SHINY_BEACON_SIGIL = 7
const SHINY_BEACON_TIERS = [1, 2, 5, 10, 12] // unlock, boost, jade, ethereal, eclectic
const CRYSTAL_MERIT = { world: 3, index: 0 }
const PLATEAUOURIST_ACHIEVEMENT = 285
const PLATEAUOURIST_CRYSTALS = 4

export function getGuaranteedCrystalMobs(snapshot, legendLevel = getLegendTalentLevel(snapshot?.legendTalents, CRYSTAL_LEGEND_TALENT)) {
  const base = getSigilBonus(snapshot, SHINY_BEACON_SIGIL, SHINY_BEACON_TIERS)
    + getMeritBonus(snapshot?.merits, CRYSTAL_MERIT.world, CRYSTAL_MERIT.index)
    + (isAchievementComplete(snapshot?.achievements, PLATEAUOURIST_ACHIEVEMENT) ? PLATEAUOURIST_CRYSTALS : 0)
  return Math.ceil((1 + getMeritocracyBonus(snapshot, CRYSTAL_MERITOCRACY) / 100)
    * (1 + getLegendTalentBonus(CRYSTAL_LEGEND_TALENT, legendLevel) / 100)
    * base)
}
