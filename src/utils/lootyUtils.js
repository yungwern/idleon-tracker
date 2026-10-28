import { isSuperbitUnlocked } from './gamingUtils'
import { getAssumedMainframeBonus, LAB_BONUSES } from './labUtils'
import { getLegendTalentBonus, getLegendTalentLevel } from './legendTalentUtils'
import { getUpgradeVaultBonus } from './upgradeVaultUtils'
import { isMeritocracyBonusSelected } from './voteUtils'

// The Slab (Looty), from IdleonToolbox getSlabBonus (parsers/world-5/sailing.ts).
// snapshot.lootedItemCount = different items ever looted. Returns { value, missing }.

const SLABBY_SPELUNKING = 25 // superbit: Spelunking POW slab bonus (slab bonus 6)
const SLAB_MERITOCRACY = 23
const SLAB_LEGEND_TALENT = 28
const SLAB_VAULT = 74

export const SLAB_BONUSES = {
  spelunkingPow: 6,
}

function getSlabMulti(snapshot) {
  const sovereignty = getAssumedMainframeBonus(snapshot, LAB_BONUSES.slabSovereignty)
  const legend = getLegendTalentBonus(SLAB_LEGEND_TALENT, getLegendTalentLevel(snapshot?.legendTalents, SLAB_LEGEND_TALENT))
  const missing = [...sovereignty.missing]
  if (isMeritocracyBonusSelected(snapshot?.voteBallot, SLAB_MERITOCRACY)) {
    missing.push('Meritocracy slab bonus (winning pick this week)')
  }
  return {
    value: (1 + sovereignty.value / 100)
      * (1 + legend / 100)
      * (1 + getUpgradeVaultBonus(snapshot?.upgradeVault, SLAB_VAULT) / 100),
    missing,
  }
}

export function getSlabBonus(snapshot, index) {
  const looted = snapshot?.lootedItemCount ?? 0
  if (index === SLAB_BONUSES.spelunkingPow && isSuperbitUnlocked(snapshot?.gaming, SLABBY_SPELUNKING)) {
    const multi = getSlabMulti(snapshot)
    return {
      value: 3 * multi.value * Math.floor(Math.max(0, looted - 1300) / 5),
      missing: multi.missing,
    }
  }
  return { value: 0, missing: [] }
}
