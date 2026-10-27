import { MINIBOSSES, getAvailableKills, getOptimalKills, getDeathNotePoints, getDeathNoteMission } from '../data'

// Sidebar badge for Minibosses: +1 for every spawned miniboss (W3-W6) with its optimal stack ready,
// +1 when the W7 Menagerie "Deathnote Boss PTS" mission can be claimed
export function getMinibossNoticeCount(snapshot) {
  return getSpawnNoticeCount(snapshot) + (getDeathNoteMissionClaimable(snapshot) > 0 ? 1 : 0)
}

function getSpawnNoticeCount(snapshot) {
  const days = snapshot?.miniBossDays
  if (!days) return 0
  return MINIBOSSES.filter(boss => {
    if (!boss.spawnTimer || days[boss.rawName] == null) return false
    return getAvailableKills(boss.spawnTimer, days[boss.rawName]) >= getOptimalKills(boss.spawnTimer)
  }).length
}

export function getDeathNoteTotalPoints(kills) {
  return MINIBOSSES.reduce((sum, boss) => sum + getDeathNotePoints(kills?.[boss.index]), 0)
}

export function getDeathNoteMissionClaimable(snapshot) {
  const mission = snapshot?.miniBossMission
  if (!mission || !snapshot?.miniBossesKills) return 0
  return getDeathNoteMission(getDeathNoteTotalPoints(snapshot.miniBossesKills), mission.claims).claimable
}
