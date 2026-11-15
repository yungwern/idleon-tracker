import { getAffordableBigPurchases } from './poppyUtils'
import { isNoticeOn } from './noticeSettings'

// Poppy notices: Greatest Catch (next Megafish) or Fisheroo Reset affordable with the Reset Planner's big purchase
// split (all-in green/red). Feeds the sidebar badge, the Reset Planner tab badge and Home's To do.
// Kinds turned off in Home > Settings come back false.
export function getPoppyNotices(snapshot) {
  const affordable = getAffordableBigPurchases(snapshot)
  return {
    greatestCatch: isNoticeOn('Poppy', 'greatestCatch') && affordable.greatestCatch,
    fisherooReset: isNoticeOn('Poppy', 'fisherooReset') && affordable.fisherooReset,
  }
}

export function getPoppyNoticeCount(snapshot) {
  const { greatestCatch, fisherooReset } = getPoppyNotices(snapshot)
  return (greatestCatch ? 1 : 0) + (fisherooReset ? 1 : 0)
}
