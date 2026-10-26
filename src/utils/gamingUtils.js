import { paletteMap } from '../data'
import { hasSaveLetter } from './saveCodeUtils'
import { getLegendTalentBonus, getLegendTalentLevel } from './legendTalentUtils'

// Gaming (W5), from IdleonToolbox parsers/world-5/gaming.ts.

// Superbits by index, e.g. 62 = Bettah Stickahs
export function isSuperbitUnlocked(gaming, index) {
  return hasSaveLetter(gaming?.superbits, index)
}

// ── Palette ───────────────────────────────────────────────────────────────────
// Superbits that double one colour (superbit index → palette index); Colourier Colours (59)
// raises the doubling to 2.5x
const PALETTE_DOUBLERS = { 49: 25, 51: 13, 52: 31, 54: 18, 58: 3, 61: 12 }
const COLOURIER_COLOURS = 59
const PICASSO_GAMING = 10 // legend talent: }x all palette bonuses
const PALETTE_LORE_BOSS = 8 // spelunking lore boss: 1.5x all palette bonuses

// Bonus of palette colour `index` (game: GamingStatType PaletteBonus)
export function getPaletteBonus(snapshot, index) {
  const gaming = snapshot?.gaming
  const colour = paletteMap[index]
  const level = gaming?.paletteLevels?.[index] ?? 0
  if (!colour || level <= 0) return 0
  let bonus = colour.type === 1
    ? (level / (level + 25)) * colour.multi
    : level * colour.multi
  const doubler = Object.keys(PALETTE_DOUBLERS).find(sb => PALETTE_DOUBLERS[sb] === index)
  if (doubler && isSuperbitUnlocked(gaming, Number(doubler))) {
    bonus *= 2 + 0.5 * (isSuperbitUnlocked(gaming, COLOURIER_COLOURS) ? 1 : 0)
  }
  const legend = getLegendTalentBonus(PICASSO_GAMING, getLegendTalentLevel(snapshot?.legendTalents, PICASSO_GAMING))
  const loreBoss = snapshot?.spelunking?.loreBossesDefeated?.[PALETTE_LORE_BOSS] ? 1 : 0
  // Menagerie black stars: x2 for one, x4 for two
  const stars = gaming?.paletteBlackStars?.[index] ?? 0
  const blackStarMulti = Math.max(1, 1 + stars + Math.floor(stars / 2))
  return bonus * (1 + legend / 100) * (1 + 0.5 * loreBoss) * blackStarMulti
}
