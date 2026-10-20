import { cardMap, cardSetMap } from '../data'
import { getLegendTalentLevel, getLegendTalentMulti } from './legendTalentUtils'

// Card stars + bonus values, ported from IdleonToolbox parsers/cards.ts + cardMath.ts.
// `cards` is snapshot.cards from extractSnapshot (counts, maxStars, star floor lists).
// Stars are 0-indexed like the game: 0 = owned with no stars, 1-6 = CardEquipBorder1-6.

// Legend talent "Flopping a Full House": equipped cards give higher bonuses
export const FULL_HOUSE_TALENT = 21

export function getCardStars(rawName, cards) {
  const card = cardMap[rawName]
  const amount = cards?.counts?.[rawName] ?? 0
  if (!card || amount <= 0) return 0

  let calco = 0
  for (let i = 0; i < cards.maxStars; i++) {
    const required = rawName === 'Boss3B'
      ? 1.5 * Math.pow(i + 1 + Math.floor(i / 3), 2)
      : card.perTier * Math.pow(i + 1 + Math.floor(i / 3) + 16 * Math.floor(i / 4) + 100 * Math.floor(i / 5), 2)
    if (amount > required) calco = i + 2
  }

  // Cardifier / rift lists raise a card to at least 6 / 5 stars
  if (cards.starFloor6?.includes(rawName) && calco < 7) return 6
  if (cards.starFloor5?.includes(rawName) && calco < 6) return 5
  return calco > 0 ? calco - 1 : 0
}

export function isCardOwned(rawName, cards) {
  return (cards?.counts?.[rawName] ?? 0) > 0
}

// Set level = average card level across every card in the set
export function getCardSetStars(setId, cards) {
  const setCards = Object.keys(cardMap).filter(rawName => cardMap[rawName].set === setId)
  if (!setCards.length) return -1
  const totalLevels = setCards.reduce((sum, rawName) => (
    isCardOwned(rawName, cards) ? sum + getCardStars(rawName, cards) + 1 : sum
  ), 0)
  return Math.floor(totalLevels / setCards.length) - 1
}

export function getFullHouseLevel(legendTalents) {
  return getLegendTalentLevel(legendTalents, FULL_HOUSE_TALENT)
}

export function getActiveCardMulti(legendTalents) {
  return getLegendTalentMulti(FULL_HOUSE_TALENT, getFullHouseLevel(legendTalents))
}

// '+{% Drop Rate Multi' + 3.5 → '+3.5% Drop Rate Multi'
export function formatCardEffect(effect, value) {
  const rounded = Math.round(value * 100) / 100
  return effect.replace('{', rounded.toLocaleString())
}

export function getCardSetBonus(setId, stars) {
  const set = cardSetMap[setId]
  return set ? set.bonus * Math.max(stars + 1, 0) : 0
}
