// Map clears, from each character's KLA_i (snapshot.characters[i].mapKillsLeft).
// A map counts as cleared once it needs less than 1 more kill.
export const WORLD_6_FIRST_MAP = 251
export const WORLD_6_MAP_COUNT = 13

export function isMapCleared(character, mapIndex) {
  return (character?.mapKillsLeft?.[mapIndex] ?? Infinity) < 1
}

// Cleared maps in [first, first + count), counted once per character
export function countClearedMaps(characters, first, count) {
  return (characters ?? []).reduce((sum, character) => {
    for (let map = first; map < first + count; map++) {
      if (isMapCleared(character, map)) sum++
    }
    return sum
  }, 0)
}
