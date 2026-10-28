// ── Character Notifications ───────────────────────────────────────────────────
// Single source for every Overview notification check, so the character card
// and the sidebar badge always agree. Add new checks here.
import { getObolNotices } from '../components/Obols/ObolUtils.js'
import { getUnspentSuperTalents } from './talentUtils.js'
import { getClassMainStat } from './characterUtils.js'

// snapshotChar: snapshot.characters[i] (obols, superTalentPresets, level, class)
// obolCheckMode: Obols page roll check (ObolUtils OBOL_CHECK_MODES)
export function getCharacterNotices(snapshotChar, obolCheckMode) {
  const level = snapshotChar?.level ?? 0
  const mainStat = getClassMainStat(snapshotChar?.class)
  const { noBonus, emptySlots } = getObolNotices(snapshotChar?.obols ?? [], level, obolCheckMode, mainStat)
  const noBonusTotal = noBonus.reduce((sum, o) => sum + o.count, 0)
  const unspentTalents = getUnspentSuperTalents(snapshotChar?.superTalentPresets, level)
  const unspentTotal = unspentTalents.reduce((sum, t) => sum + t.unspent, 0)

  // Number of notifications shown in the Overview (one per kind of issue)
  const count = [noBonusTotal > 0, emptySlots > 0, unspentTotal > 0].filter(Boolean).length

  return {
    noBonus,
    noBonusTotal,
    emptySlots,
    unspentTalents,
    unspentTotal,
    count,
  }
}
