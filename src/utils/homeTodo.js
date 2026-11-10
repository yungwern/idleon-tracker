// ── Home "To do" panel ────────────────────────────────────────────────────────
// Every active notification across the site as readable lines, grouped by sidebar page.
// It reads the same notice utils as the badges (so it follows Home > Settings automatically);
// the count shown per group comes from App's own badge numbers, so the two always agree.
import { MASTERCLASSES, islandMap, holeCaverns } from '../data'
import { getCharacterNotices } from './characterNotices.js'
import { getMasterclassNotices } from './masterclassNotices.js'
import { getMinibossNotices } from './minibossNotices.js'
import { getFamilyObolNotices } from './obolNotices.js'
import { getIslandNotices } from './islandNotices.js'
import { getMainframeNotices } from './mainframeUtils.js'
import { getHoleNotices } from './holeNotices.js'
import { getLegendTalentNoticeCount } from './legendTalentNotices.js'

const plural = (n, word, many = `${word}s`) => `${n} ${n === 1 ? word : many}`

function characterLines(snapshot, obolCheckMode) {
  return (snapshot?.characters ?? []).flatMap((character, i) => {
    const n = getCharacterNotices(character, obolCheckMode, snapshot.characters, i)
    const lines = []
    if (n.noBonusTotal > 0) lines.push(`${plural(n.noBonusTotal, 'obol')} missing their bonus`)
    if (n.emptySlots > 0) lines.push(`${plural(n.emptySlots, 'empty obol slot')}`)
    if (n.unspentTotal > 0) lines.push(`${plural(n.unspentTotal, 'unspent super talent point')}`)
    if (n.maestroHand.skills.length > 0) {
      lines.push(`Maestro hand bonus lost in ${plural(n.maestroHand.skills.length, 'skill')}`)
    }
    return lines.length > 0
      ? [{ page: character.name, label: character.name, className: character.class, count: n.count, lines }]
      : []
  })
}

// Section pages, in sidebar order. Each returns its lines (empty = nothing to do).
const SECTION_LINES = {
  MasterClasses: snapshot => Object.entries(getMasterclassNotices(snapshot)).flatMap(([id, counts]) => {
    const name = MASTERCLASSES.find(mc => mc.id === id)?.name ?? id
    const lines = []
    if (counts.outposts > 0) lines.push(`${name}: ${plural(counts.outposts, 'outpost change')}`)
    if (counts.resources > 0) lines.push(`${name}: ${plural(counts.resources, 'Resource Depot')} to reconnect`)
    return lines
  }),
  Minibosses: snapshot => {
    const { ready, deathNoteClaims } = getMinibossNotices(snapshot)
    const lines = ready.map(boss => `${boss.displayName} has its best stack ready`)
    if (deathNoteClaims > 0) lines.push(`Death Note mission: ${plural(deathNoteClaims, 'claim')} waiting`)
    return lines
  },
  Obols: (snapshot, obolCheckMode) => {
    const { noBonusTotal } = getFamilyObolNotices(snapshot, obolCheckMode)
    return noBonusTotal > 0 ? [`Family board: ${plural(noBonusTotal, 'obol')} missing their bonus`] : []
  },
  Islands: snapshot => {
    const { byIsland } = getIslandNotices(snapshot)
    return islandMap.flatMap(island => (byIsland[island.id] ?? []).map(message => `${island.name}: ${message}`))
  },
  Lab: snapshot => {
    const { greenTube, viaductOn, offBonuses } = getMainframeNotices(snapshot)
    const lines = []
    if (greenTube?.missing.length > 0) {
      lines.push(`Green Tube: ${plural(greenTube.missing.length, 'player')} missing +${greenTube.bonus.toFixed(1)}% Lab EXP`)
    }
    if (viaductOn) lines.push('Viaduct of the Gods is connected')
    if (offBonuses.length > 0) {
      lines.push(`${offBonuses.length} mainframe ${offBonuses.length === 1 ? 'bonus isn\'t' : 'bonuses aren\'t'} connected`)
    }
    return lines
  },
  'The Hole': snapshot => {
    const { byCavern } = getHoleNotices(snapshot)
    return holeCaverns.flatMap(cavern => (byCavern[cavern.id] ?? []).map(message => `${cavern.name}: ${message}`))
  },
  'Legend Talents': snapshot => {
    const points = getLegendTalentNoticeCount(snapshot)
    return points > 0 ? [`${plural(points, 'legend talent point')} to spend`] : []
  },
}

// [{ page, label, className?, count?, lines }] — page = what the sidebar opens (character name or section)
export function getTodoGroups(snapshot, obolCheckMode, sectionNotices) {
  if (!snapshot) return []
  const sections = Object.entries(SECTION_LINES).flatMap(([section, getLines]) => {
    const lines = getLines(snapshot, obolCheckMode)
    return lines.length > 0
      ? [{ page: section, label: section, count: sectionNotices?.[section] ?? lines.length, lines }]
      : []
  })
  return [...characterLines(snapshot, obolCheckMode), ...sections]
}
