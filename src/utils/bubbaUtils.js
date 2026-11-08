import { BUBBA_MEGAFLESH, BUBBA_BONUSES } from '../data'
import { getClickerCompanionMulti, getMegaOwned, formatClickerBonus } from './clickerUtils'

// Bubba the Seal (Clickers): Megaflesh + IdleOn bonuses, from IdleonToolbox parsers/clickers/bubba.ts.
// snapshot.bubba = parseBubba. Matches Toolbox on Eli's save.

const LAST_MEGA = 11
const BUBBA_BOON = 3 // upgrade whose LV unlocks the IdleOn bonuses, one every 7 LVs
const BONUS_STEP = 7
const BOOSTING_MEGAS = [1, 3, 6, 9] // +20% bonuses each; the 12th gives +20% per copy
const UPGRADE_COUNT = 28

const mega = (bubba, i) => getMegaOwned(bubba?.megaflesh ?? 0, i, LAST_MEGA)

// game: TotalQTYofLVs (level + prestige of every upgrade)
function getTotalUpgradeLevels(bubba) {
  let total = 0
  for (let i = 0; i < UPGRADE_COUNT; i++) {
    total += Math.round((bubba?.levels?.[i] ?? 0) + (bubba?.prestige?.[i] ?? 0))
  }
  return total
}

// game: Bubba_RoG_all as a multi
export function getMegafleshBonusMulti(bubba) {
  const count = BOOSTING_MEGAS.reduce((sum, i) => sum + mega(bubba, i), 0) + mega(bubba, LAST_MEGA)
  return 1 + 20 * count / 100
}

// game: BubbaRoG_Bonuses(r), r = 1..7
export function getBubbaBonus(snapshot, r) {
  const bubba = snapshot?.bubba
  const boon = bubba?.levels?.[BUBBA_BOON] ?? 0
  const value = BUBBA_BONUSES[r - 1]?.value ?? 0
  const bonus = getMegafleshBonusMulti(bubba)
    * value
    * Math.ceil((boon - (r - 1)) / BONUS_STEP)
    * getClickerCompanionMulti(snapshot)
  return Math.max(0, bonus)
}

export function getBubba(snapshot) {
  const bubba = snapshot?.bubba
  if (!bubba) return null
  const total = bubba.megaflesh
  const firstBonus = 1 + mega(bubba, 0) * getTotalUpgradeLevels(bubba) / 100
  const lastBonus = 2 + Math.max(0, total - 12) / 5
  return {
    megaCount: total,
    boonLevel: bubba.levels?.[BUBBA_BOON] ?? 0,
    bonusMulti: getMegafleshBonusMulti(bubba) * getClickerCompanionMulti(snapshot),
    megas: BUBBA_MEGAFLESH.map((text, i) => ({
      text: i === 0
        ? text.replace('$', formatClickerBonus(firstBonus))
        : i === LAST_MEGA ? text.replace('$', lastBonus.toFixed(2)) : text,
      owned: total > i,
      copies: i === LAST_MEGA && total > i ? total - LAST_MEGA : 0,
    })),
    bonuses: BUBBA_BONUSES.map((bonus, k) => ({
      name: bonus.name,
      icon: `images/bubba/Bubba_${k + 1}.png`,
      value: getBubbaBonus(snapshot, k + 1) * (bonus.negative ? -1 : 1),
      percent: true,
    })),
  }
}
