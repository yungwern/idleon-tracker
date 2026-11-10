import { MINIBOSSES, getAvailableKills, getOptimalKills, getDeathNotePoints, getDeathNoteMission } from '../data'
import { isNoticeOn } from './noticeSettings'

// Sidebar badge for Minibosses: +1 for every spawned miniboss (W3-W6) with its optimal stack ready,
// +1 when the W7 Menagerie "Deathnote Boss PTS" mission can be claimed
export function getMinibossNoticeCount(snapshot) {
  const { ready, deathNoteClaims } = getMinibossNotices(snapshot)
  return ready.length + (deathNoteClaims > 0 ? 1 : 0)
}

// The same checks as a list (Home's To do panel): ready = minibosses with their optimal stack,
// deathNoteClaims = Death Note mission claims waiting. Kinds turned off in Home > Settings come back empty.
export function getMinibossNotices(snapshot) {
  return {
    ready: isNoticeOn('Minibosses', 'spawns') ? getReadyMinibosses(snapshot) : [],
    deathNoteClaims: isNoticeOn('Minibosses', 'deathNote') ? getDeathNoteMissionClaimable(snapshot) : 0,
  }
}

function getReadyMinibosses(snapshot) {
  const days = snapshot?.miniBossDays
  if (!days) return []
  return MINIBOSSES.filter(boss => {
    if (!boss.spawnTimer || days[boss.rawName] == null) return false
    return getAvailableKills(boss.spawnTimer, days[boss.rawName]) >= getOptimalKills(boss.spawnTimer)
  })
}

export function getDeathNoteTotalPoints(kills) {
  return MINIBOSSES.reduce((sum, boss) => sum + getDeathNotePoints(kills?.[boss.index]), 0)
}

export function getDeathNoteMissionClaimable(snapshot) {
  const mission = snapshot?.miniBossMission
  if (!mission || !snapshot?.miniBossesKills) return 0
  return getDeathNoteMission(getDeathNoteTotalPoints(snapshot.miniBossesKills), mission.claims).claimable
}
