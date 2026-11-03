// Shared math for the premium collections (Hat Rack, Cape Vine): each stored item gives its base stats
// and UQ lines × a share (Hat Rack multi, or the cape's vine share), summed into grouped bonus lists.

const BASE_STAT_LABELS = {
  weaponPower: 'Weapon Power',
  str: 'STR',
  agi: 'AGI',
  wis: 'WIS',
  luk: 'LUK',
  defence: 'Defence',
}

const BASE_STAT_ORDER = Object.keys(BASE_STAT_LABELS)

// Total Bonuses groups, in display order within their column (column 0 = left, 1 = right). Each lists its
// bonus keys in display order: UQ text without the '%_' (DROP_RATE) or a base stat key (str).
// Anything not listed lands in Other, A-Z.
const BONUS_GROUPS = [
  {
    id: 'loot',
    label: 'Drop Rate & Loot',
    column: 0,
    keys: ['DROP_RATE', 'DROP_RATE_MULTI', 'MONEY', 'BONUS_MONEY', 'MASTERCLASS_DROPS', 'MARBLE_DROP', 'EXTRA_BONES', 'EXTRA_TACHYONS', 'DUST_MULTI'],
  },
  {
    id: 'exp',
    label: 'Experience',
    column: 1,
    keys: ['CLASS_EXP_MULTI', 'XP_FROM_MONSTERS', 'SKILL_EXP', 'DIVINITY_EXP'],
  },
  {
    id: 'combat',
    label: 'Damage & Kills',
    column: 0,
    keys: ['DAMAGE_MULTI', 'TOTAL_DAMAGE', 'BIGGER_DAMAGE', 'BONUS_KILLS', 'MORE_KILLS', 'MULTIKILL'],
  },
  {
    id: 'afk',
    label: 'AFK & Skilling',
    column: 0,
    keys: ['ALL_AFK_GAIN', 'AFK_GAINS_MULTI', 'SKILL_EFFICIENCY'],
  },
  {
    id: 'stats',
    label: 'Stats',
    column: 1,
    keys: ['ALL_STATS', 'DEFENCE', ...BASE_STAT_ORDER],
  },
]

const OTHER_GROUP = {
  id: 'other',
  label: 'Other',
  column: 0,
}

// Right column first: Stats on top, then Experience
const COLUMN_ORDER = {
  stats: 0,
  exp: 1,
}

// '%_DROP_RATE' → '% DROP RATE'
export const cleanBonusText = txt => String(txt).replace(/_/g, ' ').trim()

// '%_CRIT_CHANCE_' → 'CRIT_CHANCE' (the key BONUS_GROUPS uses)
const uqKey = txt => String(txt).replace(/^%_?/, '').replace(/_+$/, '')

// Up to 2 decimals, no trailing zeros, thousands separators
export function formatBonusValue(value) {
  return Number(value.toFixed(2)).toLocaleString(undefined, { maximumFractionDigits: 2 })
}

// One item's lines at a given share: [{ key, text }]. Base stats read '+12 STR', UQ lines '+25% MONEY'.
// includeStats false = UQ lines only (Cape Vine: base stats don't count there).
export function getItemBonusLines(item, share = 1, includeStats = true) {
  const statLines = !includeStats ? [] : BASE_STAT_ORDER
    .filter(stat => item.stats?.[stat])
    .map(stat => ({
      key: stat,
      text: `+${formatBonusValue(item.stats[stat] * share)} ${BASE_STAT_LABELS[stat]}`,
    }))
  const uqLines = (item.uq ?? []).map(({ txt, val }) => {
    const label = cleanBonusText(txt)
    const value = formatBonusValue(val * share)
    return {
      key: txt,
      text: label.startsWith('%') ? `+${value}${label}` : `+${value} ${label}`,
    }
  })
  return [...uqLines, ...statLines]
}

// Totals over [{ item, share }], grouped: [{ id, label, column, bonuses: [{ key, value, label, percent }] }].
// Empty groups are left out. includeStats false = UQ lines only.
export function sumCollectionBonuses(entries, { includeStats = true } = {}) {
  const totals = new Map()
  const add = (key, bonus, value) => {
    const current = totals.get(key) ?? { ...bonus, value: 0 }
    current.value += value
    totals.set(key, current)
  }
  for (const { item, share } of entries) {
    for (const stat of BASE_STAT_ORDER) {
      const value = includeStats ? item.stats?.[stat] : 0
      if (value) {
        add(stat, {
          key: stat,
          label: BASE_STAT_LABELS[stat],
          percent: false,
        }, value * share)
      }
    }
    for (const { txt, val } of item.uq ?? []) {
      const label = cleanBonusText(txt)
      const percent = label.startsWith('%')
      add(percent ? uqKey(txt) : txt, {
        key: txt,
        label: label.replace(/^%\s*/, ''),
        percent,
      }, val * share)
    }
  }

  const grouped = new Set()
  const groups = BONUS_GROUPS.map(group => {
    const bonuses = group.keys
      .filter(key => totals.has(key))
      .map(key => {
        grouped.add(key)
        return totals.get(key)
      })
    return {
      id: group.id,
      label: group.label,
      column: group.column,
      bonuses,
    }
  })
  const other = [...totals.entries()]
    .filter(([key]) => !grouped.has(key))
    .map(([, bonus]) => bonus)
    .sort((a, b) => a.label.localeCompare(b.label))
  groups.push({
    ...OTHER_GROUP,
    bonuses: other,
  })

  return groups.filter(group => group.bonuses.length > 0)
}

// Groups split into [left, right] columns; the right column runs Stats then Experience
export function getBonusColumns(groups) {
  const left = groups.filter(group => group.column === 0)
  const right = groups
    .filter(group => group.column === 1)
    .sort((a, b) => (COLUMN_ORDER[a.id] ?? 9) - (COLUMN_ORDER[b.id] ?? 9))
  return [left, right].filter(column => column.length > 0)
}
