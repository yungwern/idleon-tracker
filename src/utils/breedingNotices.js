import { getShinyRate, getShinyFencePlan } from './shinyPlanner'
import { isNoticeOn } from './noticeSettings'

// Breeding notices: Shiny Planner swap ready = shiny species in the fence that the plan takes out (they levelled
// past the plan or maxed). An empty fence isn't a notice. Feeds the sidebar badge, the Shiny Planner tab badge
// and Home's To do. Turned off in Home > Settings → 0.
export function getBreedingNotices(snapshot) {
  if (!snapshot?.breeding?.fenceShiny || !isNoticeOn('Breeding', 'shinySwap')) return { shinySwap: 0 }
  const plan = getShinyFencePlan(snapshot, getShinyRate(snapshot).value)
  return { shinySwap: plan.takeOut }
}

export function getBreedingNoticeCount(snapshot) {
  return getBreedingNotices(snapshot).shinySwap
}
