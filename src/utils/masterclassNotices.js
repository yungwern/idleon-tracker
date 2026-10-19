import { buildOutpostSummary } from '../data'
import { getCommanderAdvice } from './outpostOptimizer'

// Sidebar badge for MasterClasses: +1 for every world whose Commanders should move to another outpost
export function getMasterclassNoticeCount(snapshot) {
  const rg = snapshot?.royalGuardian
  if (!rg?.deployments) return 0
  const summary = buildOutpostSummary(rg)
  return [...getCommanderAdvice(rg, summary.outposts).values()].filter(a => a.needsMove).length
}
