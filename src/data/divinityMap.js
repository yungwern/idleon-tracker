// ============================================================
// DIVINITY (W5)
// Gods by slot (their position in the Divinity screen, which is what the save's links store).
// godIndex is the game's own god id; the game reads minorBonusMultiplier by godIndex, not by
// slot (see utils/divinityUtils.js). From IdleonToolbox shared-data `gods`.
// Blessing: LV × blessingMultiplier ({ in blessing), next LV costs blessingCost[0] × blessingCost[1]^LV
// (bits for Snehebatu, Nobisect, Goharut and Kattlekruk, see utils/gamingUtils.js getBitSpending).
// ============================================================

export const godMap = [
  {
    name: 'Snehebatu',
    godIndex: 0,
    minorBonusMultiplier: 70,
    blessing: '+{% Divinity PTS Gain',
    blessingMultiplier: 2,
    blessingCost: [10, 1.75],
  },
  {
    name: 'Arctis',
    godIndex: 2,
    minorBonusMultiplier: 150,
    blessing: '+{% Divinity PTS Gain',
    blessingMultiplier: 3,
    blessingCost: [10, 1.15],
  },
  {
    name: 'Nobisect',
    godIndex: 7,
    minorBonusMultiplier: 15,
    blessing: '+{ All Skill Efficiency',
    blessingMultiplier: 50,
    blessingCost: [10000, 2.25],
  },
  {
    name: 'Harriep',
    godIndex: 3,
    minorBonusMultiplier: 100,
    blessing: '+{% Divinity PTS Gain',
    blessingMultiplier: 3,
    blessingCost: [50000000, 1.3],
  },
  {
    name: 'Goharut',
    godIndex: 5,
    minorBonusMultiplier: 100,
    blessing: '+{% Sailing Speed',
    blessingMultiplier: 4,
    blessingCost: [1000000, 2.6],
  },
  {
    name: 'Omniphau',
    godIndex: 4,
    minorBonusMultiplier: 5,
    blessing: '+{% Divinity PTS Gain',
    blessingMultiplier: 4,
    blessingCost: [5, 1.12],
  },
  {
    name: 'Purrmep',
    godIndex: 6,
    minorBonusMultiplier: 50,
    blessing: '+{% Sailing Speed',
    blessingMultiplier: 3,
    blessingCost: [1000000000, 1.35],
  },
  {
    name: 'Flutterbis',
    godIndex: 1,
    minorBonusMultiplier: 200,
    blessing: '+{% Total Damage',
    blessingMultiplier: 1,
    blessingCost: [10, 1.15],
  },
  {
    name: 'Kattlekruk',
    godIndex: 8,
    minorBonusMultiplier: 10,
    blessing: '+{% Total Damage',
    blessingMultiplier: 1,
    blessingCost: [1000000000, 3],
  },
  {
    name: 'Bagur',
    godIndex: 9,
    minorBonusMultiplier: 1,
    blessing: '+{% Sailing Speed',
    blessingMultiplier: 5,
    blessingCost: [20, 1.18],
  },
]
