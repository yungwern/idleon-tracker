import {
  deathNoteMobs,
  deathNoteMiniBosses,
  DEATH_NOTE_RANKS,
  MINI_BOSS_DEATH_NOTE_RANKS,
  ECLIPSE_SKULL_KILLS,
  ECLIPSE_SKULL_RANK,
} from '../data'
import { isRiftBonusUnlocked } from './riftUtils'

// Death Note (W3 Workbench), from IdleonToolbox parsers/world-3/deathNote.ts.
// A character's kills on a map = that map's first portal requirement minus KLA_i[map][0] (kills still
// needed, goes negative past the portal), summed over every character.

const rankFromTable = (table, kills) => table.reduce((rank, [threshold, tableRank]) => (kills >= threshold ? tableRank : rank), 0)

// game: WorkbenchStuff("DeathNoteRank")
export function getDeathNoteRank(snapshot, kills, isMiniBoss = false) {
  if (isMiniBoss) return rankFromTable(MINI_BOSS_DEATH_NOTE_RANKS, kills)
  if (kills > ECLIPSE_SKULL_KILLS && isRiftBonusUnlocked(snapshot?.rift, 'eclipseSkulls')) return ECLIPSE_SKULL_RANK
  return rankFromTable(DEATH_NOTE_RANKS, kills)
}

// Account kills on map `mapIndex` (all characters)
export function getAccountMapKills(snapshot, mapIndex, portalKills) {
  return (snapshot?.characters ?? []).reduce((sum, character) => {
    const left = character?.mapKillsLeft?.[mapIndex]
    return left == null ? sum : sum + (portalKills - (Number(left) || 0))
  }, 0)
}

// { worlds: [{ world, rank, mobs }], miniBosses: { rank, mobs }, worldPoints, eclipseSkulls }
// worldPoints = Σ world ranks without the minibosses (the Hole Measurer's "Death Note Pts").
export function getDeathNote(snapshot) {
  const worlds = []
  for (const mob of deathNoteMobs) {
    const kills = mob.mapIndex == null ? 0 : getAccountMapKills(snapshot, mob.mapIndex, mob.portalKills)
    const rank = getDeathNoteRank(snapshot, kills)
    const world = worlds[mob.world] ?? (worlds[mob.world] = { world: mob.world, rank: 0, mobs: [] })
    world.rank += rank
    world.mobs.push({ ...mob, kills, rank })
  }
  const miniMobs = deathNoteMiniBosses.map((boss, i) => {
    const kills = Number(snapshot?.miniBossesKills?.[i]) || 0
    return { ...boss, kills, rank: getDeathNoteRank(snapshot, kills, true) }
  })
  return {
    worlds,
    miniBosses: { rank: miniMobs.reduce((sum, mob) => sum + mob.rank, 0), mobs: miniMobs },
    worldPoints: worlds.reduce((sum, world) => sum + world.rank, 0),
    eclipseSkulls: worlds.reduce((sum, world) => sum + world.mobs.filter(mob => mob.rank >= ECLIPSE_SKULL_RANK).length, 0),
  }
}

export function getDeathNotePoints(snapshot) {
  return getDeathNote(snapshot).worldPoints
}
