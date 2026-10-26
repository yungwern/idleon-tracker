import { lampBonuses, monumentBases, holeMajikBonuses, fountainBonusPerLevel } from '../data'
import { getZenithBonus } from './zenithUtils'

// Caverns (W5 Hole) bonuses, from IdleonToolbox parsers/world-5/caverns
// (the-lamp.ts, bravery.ts, the-fountain.ts). snapshot.caverns holds the Holes save data.

const LAMP_BOOST = 2 // zenith market
const MONUMENTAL_VIBES = 0 // hole majik (cosmo) upgrade
const MONUMENT_MULTI = 9 // the monument bonus that boosts its own monument
const FOUNTAIN_MONUMENT_BOOST = 13 // fountain upgrade per water type

// The Lamp: lampBonuses[t][i] × wishes used on wish min(11, 4 + 2t), × Lamp Boost (zenith)
export function getLampBonus(snapshot, t, i) {
  const wishes = snapshot?.caverns?.wishesUsed?.[Math.min(11, Math.round(4 + 2 * t))] ?? 0
  return (lampBonuses[t]?.[i] ?? 0) * wishes * (1 + getZenithBonus(snapshot?.zenith, LAMP_BOOST) / 100)
}

function getFountainBonus(caverns, t, i) {
  const level = caverns?.fountainLevels?.[t]?.[i] ?? 0
  const marble = caverns?.fountainMarbles?.[t]?.[i] ?? 0
  const marbleMulti = marble === 0 ? 1 : 1.5 + 0.5 * marble
  return Math.round(level * (fountainBonusPerLevel[t]?.[i] ?? 0) * marbleMulti)
}

// Monuments 0-2 (Bravery, Justice, Wisdom) are boosted by their fountain upgrade
function applyMonumentFountain(base, caverns, t) {
  const withFountain = t <= 2 ? base * (1 + getFountainBonus(caverns, t, FOUNTAIN_MONUMENT_BOOST) / 100) : base
  return Math.max(1, withFountain)
}

function getMonumentMultiplier(caverns, t) {
  const cosmo = Math.floor((holeMajikBonuses[MONUMENTAL_VIBES] ?? 0) * (caverns?.holeMajiks?.[MONUMENTAL_VIBES] ?? 0))
  const base = 1 + getMonumentBonus({ caverns }, t, MONUMENT_MULTI) / 100 + cosmo / 100
  return applyMonumentFountain(base, caverns, t)
}

// Monument bonus 10t + i (t: 0 Bravery, 1 Justice, 2 Wisdom)
export function getMonumentBonus(snapshot, t, i) {
  const caverns = snapshot?.caverns
  const multi = i === MONUMENT_MULTI
    ? applyMonumentFountain(1, caverns, t)
    : getMonumentMultiplier(caverns, t)
  const base = monumentBases[Math.round(10 * t + i)] ?? 0
  const level = caverns?.braveryBonuses?.[Math.round(10 * t + i)] ?? 0
  if (base < 30) return level * base * multi
  return 0.1 * Math.ceil((level / (250 + level)) * 10 * base * multi)
}
