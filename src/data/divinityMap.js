// ============================================================
// DIVINITY (W5)
// Gods by slot (their position in the Divinity screen, which is what the save's links store).
// godIndex is the game's own god id; the game reads minorBonusMultiplier by godIndex, not by
// slot (see utils/divinityUtils.js). From IdleonToolbox shared-data `gods`.
// ============================================================

export const godMap = [
  {
    name: 'Snehebatu',
    godIndex: 0,
    minorBonusMultiplier: 70,
  },
  {
    name: 'Arctis',
    godIndex: 2,
    minorBonusMultiplier: 150,
  },
  {
    name: 'Nobisect',
    godIndex: 7,
    minorBonusMultiplier: 15,
  },
  {
    name: 'Harriep',
    godIndex: 3,
    minorBonusMultiplier: 100,
  },
  {
    name: 'Goharut',
    godIndex: 5,
    minorBonusMultiplier: 100,
  },
  {
    name: 'Omniphau',
    godIndex: 4,
    minorBonusMultiplier: 5,
  },
  {
    name: 'Purrmep',
    godIndex: 6,
    minorBonusMultiplier: 50,
  },
  {
    name: 'Flutterbis',
    godIndex: 1,
    minorBonusMultiplier: 200,
  },
  {
    name: 'Kattlekruk',
    godIndex: 8,
    minorBonusMultiplier: 10,
  },
  {
    name: 'Bagur',
    godIndex: 9,
    minorBonusMultiplier: 1,
  },
]
