import { getBellRingOrPing, getHarpSetupCheck } from './holeCavernUtils'

const BELL_CAVERN = 4
const HARP_CAVERN = 5

// The Hole notifications, one source for the sidebar badge, the biome tabs and the cavern tabs.
// Returns { byCavern: { cavernId: [message] }, count }.
//   bell: Ring is charging but a Ping (opal) comes sooner, or the other way around (toss-ups within 10% don't count)
//   harp: the strings (types and pluck order) are under 99.5% of both Best setups (Notes, Level strings)
export function getHoleNotices(snapshot) {
  const byCavern = {}
  if (!snapshot?.caverns) return { byCavern, count: 0 }
  const bell = getBellRingOrPing(snapshot)
  if (bell.swapTo) byCavern[BELL_CAVERN] = [`Swap the bell to ${bell.swapTo}: it's faster than what's charging now`]
  const harp = getHarpSetupCheck(snapshot)
  if (harp && !harp.matches) {
    byCavern[HARP_CAVERN] = [
      `Rearrange the harp strings: they get ${(Math.floor(harp.closest.share * 1000) / 10)}% of the ${harp.closest.label} best setup`,
    ]
  }
  const count = Object.values(byCavern).reduce((sum, messages) => sum + messages.length, 0)
  return { byCavern, count }
}

export function getHoleNoticeCount(snapshot) {
  return getHoleNotices(snapshot).count
}
