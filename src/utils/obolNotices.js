// ── Obol Notifications ────────────────────────────────────────────────────────
// Family board (ObolEqO1) checks for the Obols page and its sidebar badge, so both agree.
// Character obols are checked in characterNotices.js. Storage is never checked.
import { getFailedObols, getFamilyMainStat } from '../components/Obols/ObolUtils.js'

// The family board has no character: it's checked with STR as its main stat (getFamilyMainStat)
export function getFamilyObolNotices(snapshot, mode) {
  const noBonus = getFailedObols(snapshot?.accountObols ?? [], mode, getFamilyMainStat())
  return {
    noBonus,
    noBonusTotal: noBonus.reduce((sum, o) => sum + o.count, 0),
  }
}

// Number of notifications on the Obols page (one per kind of issue)
export function getObolNoticeCount(snapshot, mode) {
  return getFamilyObolNotices(snapshot, mode).noBonusTotal > 0 ? 1 : 0
}
