// Reset timers for Home (Toolbox components/dashboard/Etc.jsx Resets + utility/helpers getNextResetAt).
// Every time is an absolute ms timestamp rolled forward on the clock, so a reset that has passed
// moves straight to the next one and an old save still counts down correctly.

const SECOND = 1000
const DAY = 864e5
const WEEK = 7 * DAY

// Vote weeks run on fixed weekly offsets from the server clock (seconds), not the server weekly reset
const BALLOT_OFFSET = 197860
const MERITOCRACY_OFFSET = 543460

// Server-wide weekly boundary: floor(clock / week). The same moment for every save (Thursday 00:00 UTC).
export function getServerWeeklyReset(now) {
  return (Math.floor(now / WEEK) + 1) * WEEK
}

// End of the current vote week for a vote's offset
export function getVoteWeekEnd(now, offsetSeconds) {
  const clock = now / SECOND
  const week = WEEK / SECOND
  return (clock + week - ((clock + offsetSeconds) % week)) * SECOND
}

export function getBallotVoteEnd(now) {
  return getVoteWeekEnd(now, BALLOT_OFFSET)
}

export function getMeritocracyVoteEnd(now) {
  return getVoteWeekEnd(now, MERITOCRACY_OFFSET)
}

// The account's daily reset (TimeAway.ShopRestock after the save time), `days` past it, rolled on by
// `period` once the save has outlived it. null when the save has no reset data (re-import).
export function getAccountReset(resets, now, { days = 0, period = DAY } = {}) {
  if (resets?.savedAt == null || resets?.shopRestock == null) return null
  const resetAt = (resets.savedAt + resets.shopRestock) * SECOND + days * DAY
  if (!Number.isFinite(resetAt)) return null
  return resetAt > now ? resetAt : resetAt + (Math.floor((now - resetAt) / period) + 1) * period
}

// Every reset tile, in display order (Daily, Weekly, Server weekly). Each tile: { id, label, icon,
// time (ms or null), needsSave, covers: [label] } where covers lists what else resets then (shown in the
// tile's tooltip). The vote timers live on Home's vote cards.
export function getResetTiles(snapshot, now) {
  const resets = snapshot?.resets
  const tiles = [
    {
      id: 'daily',
      label: 'Daily',
      icon: 'images/home/daily.png',
      time: getAccountReset(resets, now),
      needsSave: true,
      covers: [],
    },
    {
      id: 'weekly',
      label: 'Weekly',
      icon: 'images/home/weekly.png',
      time: getAccountReset(resets, now, { days: resets?.daysUntilWeekly ?? 0, period: WEEK }),
      needsSave: true,
      covers: [],
    },
    {
      id: 'server-weekly',
      label: 'Server weekly',
      icon: 'images/home/server-weekly.png',
      time: getServerWeeklyReset(now),
      covers: ['Weekly Bosses', 'Lab Chips', 'Exotic Market'],
    },
  ]
  return tiles
}

// "1d 18h", "5h 12m", "12m 30s"
export function formatCountdown(ms) {
  const total = Math.max(0, Math.ceil(ms / SECOND))
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m ${seconds}s`
}

// "Wed, Nov 11, 5:00 PM" in the viewer's own time zone
export function formatResetDate(ms) {
  return new Date(ms).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
