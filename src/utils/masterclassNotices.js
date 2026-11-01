import { buildOutpostSummary } from '../data'
import { getCommanderAdvice, getPriestAdvice } from './outpostOptimizer'
import { planOvernightSetup, isWorldComplete } from './resourcePlanner'

// Every masterclass notification, keyed by masterclass id, then section id: { 'royal-guardian': { outposts: 2 } }.
// The sidebar badge and the masterclass/section nav badges all read from here, so they always agree.
export function getMasterclassNotices(snapshot) {
  const notices = {}
  const rg = snapshot?.royalGuardian
  if (rg?.deployments) {
    const summary = buildOutpostSummary(rg)
    // Outposts: +1 per world for each of: Commanders to move, Priests to move, Support Camps to relink to the Priests
    const priestAdvice = [...getPriestAdvice(rg, summary.outposts).values()]
    const outposts = [...getCommanderAdvice(rg, summary.outposts).values()].filter(a => a.needsMove).length
      + priestAdvice.filter(a => a.needsMove).length
      + priestAdvice.filter(a => a.campsToLink.length > 0).length
    // Resources: +1 for every fully unlocked world with a Resource Depot to reconnect
    const resources = rg.resourceStorage
      ? planOvernightSetup(rg, summary.outposts).worlds
        .filter(w => w.changes > 0 && isWorldComplete(summary, w.world))
        .length
      : 0
    notices['royal-guardian'] = { outposts, resources }
  }
  return notices
}

export function countNotices(sectionCounts) {
  return Object.values(sectionCounts ?? {}).reduce((sum, n) => sum + n, 0)
}

export function getMasterclassNoticeCount(snapshot) {
  return Object.values(getMasterclassNotices(snapshot)).reduce((sum, mc) => sum + countNotices(mc), 0)
}
