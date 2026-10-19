import { MINIBOSSES, getAvailableKills, getOptimalKills } from '../data'

// Sidebar badge for Minibosses: +1 for every spawned miniboss (W3-W6) with its optimal stack ready
export function getMinibossNoticeCount(snapshot) {
  const days = snapshot?.miniBossDays
  if (!days) return 0
  return MINIBOSSES.filter(boss => {
    if (!boss.spawnTimer || days[boss.rawName] == null) return false
    return getAvailableKills(boss.spawnTimer, days[boss.rawName]) >= getOptimalKills(boss.spawnTimer)
  }).length
}
