import { getCompanionBonus } from './companionUtils'
import { getLegendTalentBonus, getLegendTalentLevel } from './legendTalentUtils'
import { formatBigNumber } from './cogBoardUtils'

// Shared bits of the clicker minigames (Orion, Poppy, Bubba).

const CLICKER_COMPANION = 51 // Santas Little Helper: 3x bonuses from every clicker
const FURRY_FRIENDS = 26 // legend talent: }x Orion and Poppy 'rest-of-the-game' bonuses

// 1 + companion bonus (Toolbox: 1 + companions.list[51].bonus)
export function getClickerCompanionMulti(snapshot) {
  return 1 + getCompanionBonus(snapshot?.companions, CLICKER_COMPANION)
}

// Furry Friends Forever as a multi (Orion and Poppy only)
export function getFurryFriendsMulti(snapshot) {
  const level = getLegendTalentLevel(snapshot?.legendTalents, FURRY_FRIENDS)
  return 1 + getLegendTalentBonus(FURRY_FRIENDS, level) / 100
}

// 'Rest-of-the-game' bonus k: base × multi × one step per `step` Bonuses LVs (game: ceil((LV - k) / step))
export function getClickerBonusValue(base, multi, bonusesLevel, k, step) {
  return base * multi * Math.max(0, Math.ceil((bonusesLevel - k) / step))
}

// Mega i owned (1 / 0); the last one stacks, so it returns its copy count
export function getMegaOwned(total, i, lastIndex) {
  if (!(total > i)) return 0
  return i === lastIndex ? total - lastIndex : 1
}

// Under 1,000: up to 2 decimals; under a million: commas; above: 1.23M / 4.5e21 like the game
export function formatClickerNumber(value) {
  if (!Number.isFinite(value)) return '—'
  if (Math.abs(value) < 1000) return String(Math.round(value * 100) / 100)
  if (Math.abs(value) < 1e6) return Math.round(value).toLocaleString('en-US')
  return formatBigNumber(value)
}

// Commas whatever the size (the game's Orion/Poppy bonus lines never shorten)
export function formatClickerBonus(value) {
  return (Math.round(value * 100) / 100).toLocaleString('en-US')
}

// Mega cards for the shared ClickerMegas grid: { text, owned, copies }
export function buildMegaList(texts, total, totalMulti) {
  const lastIndex = texts.length - 1
  return texts.map((text, i) => {
    const owned = total > i
    const copies = i === lastIndex && owned ? total - lastIndex : 0
    return {
      text: i === lastIndex ? text.replace('{', formatClickerBonus(totalMulti)) : text,
      owned,
      copies,
    }
  })
}
