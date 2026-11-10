import {
  getLegendTalentList,
  getLegendPointsOwned,
  getLegendPointsSpent,
} from './legendTalentUtils'
import { isNoticeOn } from './noticeSettings'

// Legend Talents notification, one source for the sidebar badge and the Board tab badge.
// count = points available to spend, capped at the LVs still left to buy (so 7 points with only
// 2 LVs left shows 2). 0 when there are no points or every talent is at its current max LV.
export function getLegendTalentNoticeCount(snapshot) {
  if (!snapshot?.legendTalents?.length || !isNoticeOn('Legend Talents', 'points')) return 0
  const available = getLegendPointsOwned(snapshot).value - getLegendPointsSpent(snapshot.legendTalents)
  if (available <= 0) return 0
  const levelsLeft = getLegendTalentList(snapshot)
    .reduce((sum, talent) => sum + Math.max(0, talent.maxLevel.value - talent.level), 0)
  return Math.min(available, levelsLeft)
}
