// ── Character Notifications ───────────────────────────────────────────────────
// Single source for every Overview notification check, so the character card
// and the sidebar badge always agree. Add new checks here.
import { getObolNotices } from '../components/Obols/ObolUtils.js'
import { getUnspentSuperTalents } from './talentUtils.js'

// snapshotChar: snapshot.characters[i] (obols, superTalentPresets, level)
export function getCharacterNotices(snapshotChar) {
  const level = snapshotChar?.level ?? 0
  const { noBonus, emptySlots } = getObolNotices(snapshotChar?.obols ?? [], level)
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
