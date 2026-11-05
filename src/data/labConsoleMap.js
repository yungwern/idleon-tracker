// =========================
// LAB CONSOLE (World 4)
// =========================
// Console chip slots and the values the Chip Planner (utils/consoleOptimizer.js) uses to place chips.

// Lab LV needed for each of the 7 console slots (Toolbox Chips.jsx chipSlotReq)
export const CHIP_SLOT_LEVELS = [5, 10, 15, 25, 35, 50, 75]

// What a character's console is set up for. The planner guesses Fighting or Skilling from the AFK target
// (a monster = Fighting); a role picked on the page is saved and wins.
// fallback = the role whose chips fill slots once this role's own chips run out (Eli: a Fighting setup
// without enough fighting chips fills up with skilling ones). valuesFrom = role whose CHIP_VALUES this
// one uses where it has no entry of its own. single = only one character at a time (Eli: Active is your
// main; picking another moves the old one to Fighting) and left out of "Set all".
export const CONSOLE_ROLES = [
  {
    id: 'fighting',
    label: 'Fighting',
    blurb: 'AFK fighting: respawn, Fighting AFK, Poker/Potato. Spare slots get skilling chips.',
    fallback: 'skilling',
  },
  {
    id: 'skilling',
    label: 'Skilling',
    blurb: 'AFK skilling: Skilling AFK and skill efficiency. Spare slots get fighting chips.',
    fallback: 'fighting',
  },
  {
    id: 'crystals',
    label: 'Crystals',
    blurb: 'A fighting setup that always gets a Chocolatey Chip (crystal mob farming).',
    fallback: 'skilling',
    valuesFrom: 'fighting',
  },
  {
    id: 'active',
    label: 'Active',
    blurb: 'Your main character: first pick of every black and orange chip, a Chocolatey Chip, and a fighting setup.',
    fallback: 'skilling',
    valuesFrom: 'fighting',
    single: true,
  },
]

// Fallback role for a character that loses Active to another character
export const ACTIVE_REPLACED_ROLE = 'fighting'

// Black (Omega) and orange (Silkrode) chips are stacked onto as few characters as possible instead of
// spread out (Eli): characters take full sets in this order before the next one gets any. Role order
// first (Active = Eli's main: 2 black + 4 orange + Chocolatey, then Crystals, Fighting, Skilling), then
// whoever already holds the most of them (fewer moves), then save order. Each character keeps one slot
// free for its best other chip (Chocolatey on Active/Crystals). Stats from labChipMap.
export const PRIORITY_CHIP_STATS = ['card1', 'card2', 'star', 'troph', 'key1', 'pend']
export const DOUBLER_ROLE_ORDER = ['active', 'crystals', 'fighting', 'skilling']
export const DOUBLER_FREE_SLOTS = 1

// After black/orange, these chips fill every free slot of a character on these roles, one character at a
// time, instead of being spread out. Galvanic Nanochip (respawn) is the best AFK fighting chip after
// black/orange, worth more than one Conductive Software + Poker Chip (Eli). Exception: when stacking leaves
// another Fighting character short of fighting chips, copies spread out (consoleOptimizer planWithStacks).
export const STACKED_CHIPS = [
  {
    chip: 'ConsoleChip10',
    roles: ['fighting'],
  },
]

// Planner column order, top to bottom: black chips, orange chips, everything else, Chocolatey last (Eli)
export const CHIP_DISPLAY_GROUPS = [
  ['card1', 'card2'],
  ['star', 'troph', 'key1', 'pend'],
]
export const CHIP_DISPLAY_LAST = 'crys'

// How much one chip is worth on a character, by chip stat (labChipMap stat) and role, on a 0-100 scale,
// from Eli's chip tier list. `all` = the same on every role. The planner only compares these, so the
// order is what matters. Doubling chips (card1/card2/key1/pend/troph) are worth 0 when the thing they
// double isn't equipped (consoleOptimizer getChipValue).
//   S: Chocolatey (Active / Crystals only), black Omega chips (double cards: best chips in the game), orange
//      Silkrode chips (a bit less: more common), Conductive Processor (skilling must equip)
//   A: Galvanic Nanochip (fighting), Galvanic Motherboard (skilling), Conductive Software (fighting)
//   B: Poker, Potato (fighting), Wood Chip (below one each of Poker/Potato)
//   C: Galvanic Processor (skilling), Galvanic Software (fighting), only if nothing better
//   F: Conductive Nanochip/Motherboard (lab only), green Grounded chips (last fillers)
export const CHIP_VALUES = {
  card1: { all: 100 },
  card2: { all: 100 },
  star: { all: 90 },
  troph: { all: 90 },
  key1: { all: 90 },
  pend: { all: 90 },
  crys: {
    active: 100,
    crystals: 100,
  },
  safk: { skilling: 95 },
  resp: {
    fighting: 80,
    crystals: 75,
    active: 75,
  },
  fafk: { fighting: 74 },
  toteff: { skilling: 75 },
  weppow: { fighting: 55 },
  // Potato Chip: attack speed breakpoints are easy to hit while AFK, so it only helps active play (Eli).
  // Just above Conductive Software there, since Fighting AFK gain does nothing while playing actively.
  atkspd: {
    active: 74.5,
    crystals: 74.5,
  },
  mkill: { fighting: 40 },
  eff: { skilling: 25 },
  dmg: { fighting: 25 },
  labexp: { all: 2 },
  linewidth: { all: 2 },
  def: { all: 3 },
  move: { all: 3 },
  acc: { all: 3 },
  dr: { all: 3 },
}

// A chip from the role's fallback (see CONSOLE_ROLES) is worth this share of its value there, so it
// only fills slots the role's own chips can't (Conductive Processor 95 → 19 on a Fighting setup,
// below Galvanic Software's 25)
export const CHIP_FALLBACK_SHARE = 0.2

// Each extra copy of a stackable chip on one character is worth this much of the copy before it
export const CHIP_STACK_DECAY = 0.75

// Bonus per chip that stays where it is, so equal setups keep your current chips (fewer moves)
export const CHIP_KEEP_BONUS = 1
