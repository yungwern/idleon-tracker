import { GEAR_SETS } from '../data'

// Armor Smithy set bonus (W3) once the set is unlocked (snapshot.armorSmithySets).
// Toolbox also counts a set a character is wearing in full; that isn't read here.
export function getArmorSetBonus(armorSmithySets, setName) {
  return (armorSmithySets ?? []).includes(setName) ? GEAR_SETS[setName]?.bonusValue ?? 0 : 0
}
