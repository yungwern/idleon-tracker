import { meritMap } from '../data'

// Merit shop bonus: level × bonusPerLevel for merit [world][index] (Tasks)
export function getMeritBonus(merits, world, index) {
  const level = merits?.levels?.[world]?.[index] ?? 0
  return level * (meritMap[world]?.[index]?.bonusPerLevel ?? 0)
}
