// ── Character Notifications ───────────────────────────────────────────────────
// Single source for every Overview notification check, so the character card
// and the sidebar badge always agree. Add new checks here.
import { getObolNotices } from '../components/Obols/ObolUtils.js'
import { getUnspentSuperTalents } from './talentUtils.js'
import { getClassMainStat } from './characterUtils.js'
import { getMaestroHandNotices } from './skillUtils.js'
import { isNoticeOn } from './noticeSettings.js'

// snapshotChar: snapshot.characters[i] (obols, superTalentPresets, level, class)
// obolCheckMode: Obols page roll check (ObolUtils OBOL_CHECK_MODES)
// characters + charIndex: snapshot.characters and this character's index (Maestro hand check)
export function getCharacterNotices(snapshotChar, obolCheckMode, characters, charIndex) {
  const level = snapshotChar?.level ?? 0
  const mainStat = getClassMainStat(snapshotChar?.class)
  const obols = getObolNotices(snapshotChar?.obols ?? [], level, obolCheckMode, mainStat)
  // Kinds turned off in Home > Settings read as clear (utils/noticeSettings.js)
  const noBonus = isNoticeOn('Characters', 'obolBonus') ? obols.noBonus : []
  const emptySlots = isNoticeOn('Characters', 'obolEmpty') ? obols.emptySlots : 0
  const noBonusTotal = noBonus.reduce((sum, o) => sum + o.count, 0)
  const unspentTalents = isNoticeOn('Characters', 'superTalents')
    ? getUnspentSuperTalents(snapshotChar?.superTalentPresets, level)
    : []
  const unspentTotal = unspentTalents.reduce((sum, t) => sum + t.unspent, 0)

  // Number of notifications shown in the Overview (one per kind of issue)
  const maestroHand = isNoticeOn('Characters', 'maestroHands')
    ? getMaestroHandNotices(characters, charIndex)
    : { skills: [] }
  const count = [
    noBonusTotal > 0,
    emptySlots > 0,
    unspentTotal > 0,
    maestroHand.skills.length > 0,
  ].filter(Boolean).length

  return {
    noBonus,
    noBonusTotal,
    emptySlots,
    unspentTalents,
    unspentTotal,
    maestroHand,
    count,
  }
}
