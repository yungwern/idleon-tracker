import { isRiftBonusUnlocked } from './riftUtils'

// Skill indexes in Lv0_i (index 0 is class level, so skill i is at Lv0_i[i])
export const SKILLS = {
  mining: 1,
  smithing: 2,
  chopping: 3,
  fishing: 4,
  alchemy: 5,
  catching: 6,
  trapping: 7,
  construction: 8,
  worship: 9,
  cooking: 10,
  breeding: 11,
  lab: 12,
  sailing: 13,
  divinity: 14,
  gaming: 15,
  farming: 16,
  sneaking: 17,
  summoning: 18,
}

export function getSkillLevel(character, skill) {
  return Math.max(0, character?.skillLevels?.[SKILLS[skill]] ?? 0)
}

export function getTotalSkillLevel(characters, skill) {
  return (characters ?? []).reduce((sum, character) => sum + getSkillLevel(character, skill), 0)
}

// Skill rank from the account's total level in a skill (Toolbox getSkillRank)
export function getSkillRank(totalLevel) {
  const thresholds = [150, 200, 300, 400, 500, 750, 1000]
  const rank = thresholds.findIndex(threshold => totalLevel < threshold)
  return rank === -1 ? thresholds.length : rank
}

// Rift Skill Mastery: bonus n of a skill is active once its rank is above n
export function isSkillMasteryBonusUnlocked(snapshot, skill, bonusIndex) {
  if (!isRiftBonusUnlocked(snapshot?.rift, 'skillMastery')) return false
  return getSkillRank(getTotalSkillLevel(snapshot?.characters, skill)) > bonusIndex
}
