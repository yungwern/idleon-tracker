import { cogMap, COG_BORDER_CLASS } from '../data'

// ============================================================
// COG NAMES — same tables IdleonToolbox uses (parsers/world-3/construction.ts)
// ============================================================

const NUMBER_2_LETTER = '_abcdefghijklmnopqrstuvwxyz'
const COG_TIERS = {
  0: 'Nooby',
  1: 'Decent',
  2: 'Superb',
  3: 'Ulti',
}
const COG_SHAPES = {
  ad: 'Adjay',
  di: 'Diggle',
  le: 'Leff',
  ri: 'Rite',
  up: 'Uppy',
  do: 'Downer',
  cn: 'Sniper',
  co: 'Collumm',
  ro: 'Rowow',
}
const COG_GRADES = {
  A0: '',
  A1: 'Average',
  A2: 'Spur',
  A3: 'Stacked',
  A4: 'Deckered',
  B0: 'Double',
  B1: 'Trips',
  B2: 'Trabble',
  B3: 'Quad',
  B4: 'Penta',
}

export function getCogDisplayName(rawName = '') {
  if (!rawName || rawName === 'Blank') return 'Empty Slot'
  if (rawName.startsWith('Player_')) return rawName.slice(7)
  if (cogMap[rawName]) return cogMap[rawName].name
  if (rawName === 'CogY') return 'Yang Cog'
  if (rawName.startsWith('CogZA')) return 'Yin Cog'
  if (!rawName.startsWith('Cog')) return rawName

  const tier = COG_TIERS[rawName.charAt(3)] ?? 'Glitched'
  const pair = rawName.substring(4, 6)
  if (NUMBER_2_LETTER.includes(rawName.charAt(5))) return `${tier} ${COG_SHAPES[pair] ?? 'Omni'} Cog`
  const grade = COG_GRADES[pair] ?? 'Mongo'
  return `${tier}${grade ? ` ${grade}` : ''} Cog`
}

// ============================================================
// BOOST PATTERNS
// ============================================================

export const COG_PATTERN_LABELS = {
  row: 'Boosts entire Row',
  column: 'Boosts entire Column',
  up: 'Boosts 6 cogs above',
  down: 'Boosts 6 cogs below',
  left: 'Boosts 6 cogs to the left',
  right: 'Boosts 6 cogs to the right',
  corners: 'Boosts 4 corner cogs',
  around: 'Boosts surrounding cogs',
  adjacent: 'Boosts adjacent cogs',
  diagonal: 'Boosts diagonal cogs',
  everything: 'Boosts entire board',
}

// Same colour groups as the Optimal Cog Layout legend
export function getCogBorder(cell) {
  const { name = '', pattern, bonusConstructExp, playerConstructExp } = cell
  if (name.startsWith('Player_')) return COG_BORDER_CLASS.white
  if (name === 'CogY' || name.startsWith('CogZA')) return COG_BORDER_CLASS.gemshop
  // Boosters only count when they carry both EXP stats — a directional build rate cog gets no border
  if (!(bonusConstructExp > 0 && playerConstructExp > 0)) return COG_BORDER_CLASS.none
  if (pattern === 'row') return COG_BORDER_CLASS.green
  if (pattern === 'column') return COG_BORDER_CLASS.garnet
  if (pattern && playerConstructExp > 0) return COG_BORDER_CLASS.purple
  return COG_BORDER_CLASS.none
}

export function getCogImage(name = '') {
  if (name.startsWith('Player_')) return 'headBIG'
  if (!name || name === 'Blank') return null
  return name
}

// ============================================================
// NUMBER FORMATTING — the game's default notation (Toolbox notateNumber, 'Big')
// ============================================================

const NOTATION_STEPS = [
  [1e3, 1, ''],
  [1e6, 1e3, 'K'],
  [1e9, 1e6, 'M'],
  [1e12, 1e9, 'B'],
  [1e15, 1e12, 'T'],
  [1e18, 1e15, 'Q'],
  [1e21, 1e18, 'QQ'],
]

// 4646342260705887000 → "4.65QQ", past QQ the game switches to "1.43e22"
export function formatBigNumber(value) {
  const e = value || 0
  if (e < 1000) return String(Math.floor(e))
  for (const [limit, unit, suffix] of NOTATION_STEPS) {
    if (e < limit) {
      const scaled = e / unit
      const decimals = scaled < 10 ? 100 : scaled < 100 ? 10 : 1
      return `${Math.ceil(scaled * decimals) / decimals}${suffix}`
    }
  }
  const power = Math.floor(Math.log10(e))
  return `${Math.floor(e / 10 ** power * 100) / 100}e${power}`
}
