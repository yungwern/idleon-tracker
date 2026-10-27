// ============================================================
// THE BUTTON (W7)
// Every 5 presses fill the next bonus in order (9 bonuses, then it loops), each adding its
// bonusPerPress. OptLacc[594] = total presses. From IdleonToolbox shared-data ButtonBonusNames/PerPress.
// The names don't line up with what the game's formulas read for slots 5-7: crop evo reads 5,
// Spelunking 6 and cooking 7 (Toolbox parsers, confirmed for crop evo in game).
// ============================================================

export const buttonBonusMap = [
  {
    name: '}x Res. XP',
    bonusPerPress: 2,
  },
  {
    name: '}x Minehead',
    bonusPerPress: 3,
  },
  {
    name: '}x Sushi',
    bonusPerPress: 2,
  },
  {
    name: '}x Arti. Odds',
    bonusPerPress: 2,
  },
  {
    name: '}x Xtra',
    bonusPerPress: 4,
  },
  {
    name: '}x Spelunk',
    bonusPerPress: 5,
  },
  {
    name: '}x Cooking SPD',
    bonusPerPress: 4,
  },
  {
    name: '}x Crop Evo',
    bonusPerPress: 25,
  },
  {
    name: '+{% Class XP',
    bonusPerPress: 5,
  },
]
