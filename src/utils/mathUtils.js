// The game's shared growth curves (ArbitraryCode5Inputs), ported from IdleonToolbox
// utility/wiki/growth.mjs. Bubbles, vials, stamps and talents all store their bonus
// as one of these: bonus = growth(func, level, x1, x2). Unknown funcs give 0, like the game.
export function growth(func, level, x1, x2) {
  switch (func) {
    case 'add':
      return x2 !== 0
        ? (((x1 + x2) / x2 + 0.5 * (level - 1)) / (x1 / x2)) * level * x1
        : x1 * level
    case 'addLower':
      return x1 + x2 * (level + 1)
    case 'addDECAY':
      return level < 50001
        ? x1 * level
        : x1 * Math.min(50000, level) + ((level - 50000) / (level - 50000 + 150000)) * x1 * 50000
    case 'decay':
      return (x1 * level) / (level + x2)
    case 'decayLower':
    case 'decayMultiLower':
      return (x1 * (level + 1)) / (level + 1 + x2) - (x1 * level) / (level + x2)
    case 'decayMulti':
      return 1 + (x1 * level) / (level + x2)
    case 'bigBase':
      return x1 + x2 * level
    case 'bigBaseLower':
      return x2
    case 'intervalAdd':
      return x1 + Math.floor(level / x2)
    case 'intervalAddLower':
      return Math.max(Math.floor((level + 1) / x2), 0) - Math.max(Math.floor(level / x2), 0)
    case 'reduce':
      return x1 - x2 * level
    case 'reduceLower':
      return x1 - x2 * (level + 1)
    case 'special1':
      return 100 - (level * x1) / (level + x2)
    default:
      return 0
  }
}
