import { CRYSTAL_WARN_DAYS, CRYSTAL_MAX_DAYS, islandMap } from '../data'
import { formatBigNumber } from './cogBoardUtils'
import {
  isIslandUnlocked,
  getUnlockedIslandCount,
  getBottlePlan,
  getTrashBuyOrder,
  getCheapestRandoCost,
  getCrystalMobs,
  getShimmerShop,
} from './islandUtils'

// Islands notifications, one source for the sidebar badge and the tab badges.
// Returns { byIsland: { islandId: [message] }, count }.
//   bottles: the next island on the guide's path is affordable
//   trash: the next Garbage Tuna buy is affordable
//   rando: an upgrade is affordable, only once every island is unlocked (the guide: save bottles until then)
//   crystal: 13+ unclaimed days (day 14 spawns fewer mobs)
//   shimmer: this week's trial not done, or a shop upgrade is affordable
export function getIslandNotices(snapshot) {
  const islands = snapshot?.islands
  const byIsland = Object.fromEntries(islandMap.map(island => [island.id, []]))
  if (!islands) return { byIsland, count: 0 }

  const nextUnlock = getBottlePlan(snapshot)[0]
  if (nextUnlock?.affordable) {
    byIsland[nextUnlock.island.id].push(`You have the ${nextUnlock.cost} bottles to unlock ${nextUnlock.island.name}`)
  }

  if (isIslandUnlocked(islands, 'trash')) {
    const next = getTrashBuyOrder(snapshot, 1).order[0]
    if (next?.affordable) {
      byIsland.trash.push(`Garbage can buy ${next.item.name} (${formatBigNumber(next.cost)} garbage)`)
    }
  }

  if (isIslandUnlocked(islands, 'rando') && getUnlockedIslandCount(islands) === islandMap.length) {
    const cheapest = getCheapestRandoCost(snapshot)
    if (islands.bottles >= cheapest) byIsland.rando.push(`Bottles can buy a Rando upgrade (${cheapest} bottles)`)
  }

  if (isIslandUnlocked(islands, 'crystal') && islands.crystalDays >= CRYSTAL_WARN_DAYS) {
    byIsland.crystal.push(islands.crystalDays >= CRYSTAL_MAX_DAYS
      ? `Crystal Island is capped: only ${getCrystalMobs(islands.crystalDays)} mobs wait. Visit to restart the count`
      : `Visit Crystal Island today: ${getCrystalMobs(islands.crystalDays)} mobs now, only ${getCrystalMobs(CRYSTAL_MAX_DAYS)} after the next reset`)
  }

  if (isIslandUnlocked(islands, 'shimmer')) {
    if (!islands.shimmerDoneThisWeek) byIsland.shimmer.push('This week\'s Shimmer Trial isn\'t done yet')
    const cheapest = Math.min(...getShimmerShop(snapshot).map(item => item.cost))
    if (islands.shimmer >= cheapest) byIsland.shimmer.push(`Shimmer can buy an upgrade (${cheapest} shimmer)`)
  }

  const count = Object.values(byIsland).reduce((sum, messages) => sum + messages.length, 0)
  return { byIsland, count }
}

export function getIslandNoticeCount(snapshot) {
  return getIslandNotices(snapshot).count
}
