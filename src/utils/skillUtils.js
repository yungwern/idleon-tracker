import { isRiftBonusUnlocked } from './riftUtils'
import { CLASS_TALENT_TABS } from '../data/classes.js'
import { getClassMainStat } from './characterUtils.js'

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
  spelunking: 19,
  research: 20,
}

// Skill keys in the in-game skill menu's order: 4 columns, filled top to bottom in
// blocks of 3 rows (Mining / Smithing / Chopping down column 1, then Fishing...).
export function getSkillMenuOrder() {
  const keys = Object.keys(SKILLS).sort((a, b) => SKILLS[a] - SKILLS[b])
  const order = []
  for (let block = 0; block * 12 < keys.length; block++) {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const key = keys[block * 12 + col * 3 + row]
        order.push(key ?? null)
      }
    }
  }
  return order
}

export function getSkillLevel(character, skill) {
  return Math.max(0, character?.skillLevels?.[SKILLS[skill]] ?? 0)
}

// EXP toward the next LV, as shown at the top of the in-game skill page.
// null on snapshots imported before skill EXP was parsed.
export function getSkillExp(character, skill) {
  const index = SKILLS[skill]
  const exp = character?.skillExp?.[index]
  const req = character?.skillExpReq?.[index]
  if (exp === undefined || !req) return null
  return {
    exp,
    req,
    percent: Math.min(100, Math.max(0, exp / req * 100)),
  }
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

// ── Maestro hands ─────────────────────────────────────────────────────────────
// Left Hand of Learning (skill EXP) and Right Hand of Action (skill efficiency) boost every other
// character, but only in skills where their LV is strictly LOWER than the Maestro's (a tie gets
// nothing). The game reads the last Maestro-line character in save order, so a Voidwalker counts
// (Toolbox getMaestroHand). Left Hand also covers Smithing EXP; it's left out on purpose (Eli).
export const MAESTRO_HAND_SKILLS = ['mining', 'chopping', 'fishing', 'catching', 'trapping', 'worship']

// Vman leads by this many LVs or fewer → shown as "close" (amber)
export const MAESTRO_LEAD_WARNING = 5

// Hand skills where mages (WIS classes) aren't compared: their huge charge pool levels Worship fast,
// and losing the hands there costs little (charge rate/max charge come from their own LV), so a
// mage passing the Vman isn't worth a warning (Eli)
export const MAESTRO_HAND_SKIPS_MAGES = ['worship']

export function getMaestroIndex(characters) {
  let index = -1
  ;(characters ?? []).forEach((character, i) => {
    if (CLASS_TALENT_TABS[character?.class]?.includes('Maestro')) index = i
  })
  return index
}

// Per hand skill: the Vman's LV, the closest other character, everyone tied with or above the
// Vman (blocked = no hand bonus), and status 'safe' | 'close' | 'blocked'. null with no Maestro.
export function getMaestroHandStatus(characters) {
  const maestroIndex = getMaestroIndex(characters)
  if (maestroIndex < 0) return null
  const maestro = characters[maestroIndex]

  const skills = MAESTRO_HAND_SKILLS.map(skill => {
    const maestroLevel = getSkillLevel(maestro, skill)
    const skipsMages = MAESTRO_HAND_SKIPS_MAGES.includes(skill)
    const others = characters
      .map((character, index) => ({
        index,
        name: character?.name,
        level: getSkillLevel(character, skill),
        isMage: getClassMainStat(character?.class) === 'WIS',
      }))
      .filter(other => other.index !== maestroIndex)
      .filter(other => !(skipsMages && other.isMage))
      .sort((a, b) => b.level - a.level)
    const closest = others[0] ?? null
    const blocked = others.filter(other => other.level >= maestroLevel)
    const lead = closest ? maestroLevel - closest.level : null
    const status = blocked.length > 0
      ? 'blocked'
      : lead !== null && lead <= MAESTRO_LEAD_WARNING ? 'close' : 'safe'
    return {
      skill,
      maestroLevel,
      skipsMages,
      closest,
      blocked,
      lead,
      status,
    }
  })

  return {
    maestroIndex,
    maestroName: maestro?.name,
    skills,
  }
}

// Hand skills someone ties or passes, shown only on the Vman's card. Other characters never get
// this notice: it would read as "stop leveling", and the fix is always leveling the Vman (Eli).
export function getMaestroHandNotices(characters, charIndex) {
  const status = getMaestroHandStatus(characters)
  if (!status || charIndex !== status.maestroIndex) return { skills: [] }
  return {
    skills: status.skills.filter(entry => entry.blocked.length > 0),
  }
}
