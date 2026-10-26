// ============================================================
// CLASSES
// The save stores each character's class as a number (CharacterClass_0, _1, ...).
// IDs come from IdleOn Toolbox's class list (originally IdleOn Toolbox's website-data.json).
// Missing IDs are unused/filler slots in the game data.
// ============================================================

export const CLASS_NAMES = {
  1: 'Beginner',
  2: 'Journeyman',
  3: 'Maestro',
  4: 'Voidwalker',
  5: 'Infinilyte',
  6: 'Rage Basics',
  7: 'Warrior',
  8: 'Barbarian',
  9: 'Squire',
  10: 'Blood Berserker',
  12: 'Divine Knight',
  14: 'Death Bringer',
  16: 'Royal Guardian',
  18: 'Calm Basics',
  19: 'Archer',
  20: 'Bowman',
  21: 'Hunter',
  22: 'Siege Breaker',
  25: 'Beast Master',
  29: 'Wind Walker',
  30: 'Savvy Basics',
  31: 'Mage',
  32: 'Wizard',
  33: 'Shaman',
  34: 'Elemental Sorcerer',
  35: 'Spiritual Monk',
  36: 'Bubonic Conjuror',
  40: 'Arcane Cultist',
}

export function getClassName(classId) {
  return CLASS_NAMES[classId] ?? 'Unknown Class'
}

// What each class is best used for — shown as pills on the character card
export const CLASS_BEST_FOR = {
  'Death Bringer': [
    'Cooking - Ladles',
    'GMush Kills',
  ],
  'Siege Breaker': [
    'Plunderous Mob Kills',
  ],
  'Arcane Cultist': [
    'Cranium Cooking',
    'Lab',
    'Emperor Boss Kills',
  ],
  'Wind Walker': [
    'Shinies',
    'Pet Breeding',
  ],
  'Divine Knight': [
    'Statue Farming',
    'Minibosses with Orb',
  ],
  'Royal Guardian': [
    'Statue Farming',
    'Minibosses with Orb',
  ],
  'Elemental Sorcerer': [
    'Rare Drops',
    'Card Farming',
  ],
  'Voidwalker': [
    'Carry Capacity',
  ],
}

// ── Class lines and family bonuses ──
// CLASS_TALENT_TABS: every talent tab a class spends points in (its class line), in order.
// CLASS_FAMILY_BONUSES: the family bonus each class grants (Toolbox classFamilyBonuses, by class id):
// growth(func, level - x3, x1, x2) once the character is past level x3. From Toolbox classPromotions.
export const CLASS_TALENT_TABS = {
  'Beginner': ['Beginner'],
  'Journeyman': ['Beginner', 'Journeyman'],
  'Maestro': ['Beginner', 'Journeyman', 'Maestro'],
  'Voidwalker': ['Beginner', 'Journeyman', 'Maestro', 'Voidwalker'],
  'Warrior': ['Rage Basics', 'Warrior'],
  'Barbarian': ['Rage Basics', 'Warrior', 'Barbarian'],
  'Squire': ['Rage Basics', 'Warrior', 'Squire'],
  'Blood Berserker': ['Rage Basics', 'Warrior', 'Barbarian', 'Blood Berserker'],
  'Divine Knight': ['Rage Basics', 'Warrior', 'Squire', 'Divine Knight'],
  'Archer': ['Calm Basics', 'Archer'],
  'Bowman': ['Calm Basics', 'Archer', 'Bowman'],
  'Hunter': ['Calm Basics', 'Archer', 'Hunter'],
  'Beast Master': ['Calm Basics', 'Archer', 'Hunter', 'Beast Master'],
  'Mage': ['Savvy Basics', 'Mage'],
  'Wizard': ['Savvy Basics', 'Mage', 'Wizard'],
  'Shaman': ['Savvy Basics', 'Mage', 'Shaman'],
  'Elemental Sorcerer': ['Savvy Basics', 'Mage', 'Wizard', 'Elemental Sorcerer'],
  'Bubonic Conjuror': ['Savvy Basics', 'Mage', 'Shaman', 'Bubonic Conjuror'],
  'Death Bringer': ['Rage Basics', 'Warrior', 'Barbarian', 'Blood Berserker', 'Death Bringer'],
  'Royal Guardian': ['Rage Basics', 'Warrior', 'Squire', 'Divine Knight', 'Royal Guardian'],
  'Siege Breaker': ['Calm Basics', 'Archer', 'Bowman', 'Siege Breaker'],
  'Wind Walker': ['Calm Basics', 'Archer', 'Hunter', 'Beast Master', 'Wind Walker'],
  'Arcane Cultist': ['Savvy Basics', 'Mage', 'Shaman', 'Bubonic Conjuror', 'Arcane Cultist'],
}

export const CLASS_FAMILY_BONUSES = {
  2: {
    name: '+{_TOTAL_LUK',
    func: 'intervalAdd',
    x1: 1,
    x2: 5,
    x3: 9,
  },
  3: {
    name: '+{%_PRINTER_SAMPLE_SIZE',
    func: 'decay',
    x1: 6,
    x2: 100,
    x3: 29,
  },
  4: {
    name: '+{%_FIGHTING_AFK_GAINS',
    func: 'decay',
    x1: 5,
    x2: 250,
    x3: 69,
  },
  7: {
    name: '+{_TOTAL_STR',
    func: 'intervalAdd',
    x1: 1,
    x2: 5,
    x3: 9,
  },
  8: {
    name: '+{_WEAPON_POWER',
    func: 'decay',
    x1: 25,
    x2: 100,
    x3: 29,
  },
  9: {
    name: '+{%_TOTAL_HP',
    func: 'decay',
    x1: 40,
    x2: 100,
    x3: 29,
  },
  10: {
    name: '+{%_TOTAL_DAMAGE',
    func: 'decay',
    x1: 20,
    x2: 180,
    x3: 69,
  },
  12: {
    name: '+{%_Refinery_Speed',
    func: 'decay',
    x1: 50,
    x2: 150,
    x3: 69,
  },
  19: {
    name: '+{_TOTAL_AGI',
    func: 'intervalAdd',
    x1: 1,
    x2: 5,
    x3: 9,
  },
  20: {
    name: '+{%_EXP_WHEN_FIGHT_MONSTERS_ACTIVELY',
    func: 'decay',
    x1: 38,
    x2: 100,
    x3: 29,
  },
  21: {
    name: '+{%_EFFICIENCY_FOR_ALL_SKILLS',
    func: 'decay',
    x1: 30,
    x2: 100,
    x3: 29,
  },
  25: {
    name: '+{%_ALL_SKILL_AFK_GAINS',
    func: 'decay',
    x1: 5,
    x2: 180,
    x3: 69,
  },
  31: {
    name: '+{_TOTAL_WIS',
    func: 'intervalAdd',
    x1: 1,
    x2: 5,
    x3: 9,
  },
  32: {
    name: '+{_STAR_TAB_TALENT_POINTS',
    func: 'intervalAdd',
    x1: 1,
    x2: 6,
    x3: 29,
  },
  33: {
    name: '{千@HIGHER_BONUSES_FROM_GOLDEN_FOODS',
    func: 'decayMulti',
    x1: 0.4,
    x2: 100,
    x3: 29,
  },
  34: {
    name: '+{_LV_FOR_ALL_TALENTS_ABOVE_LV_1',
    func: 'decay',
    x1: 20,
    x2: 350,
    x3: 69,
  },
  36: {
    name: '+{%_ALL_STAT._STR,_AGI,_WIS,_LUK.',
    func: 'decay',
    x1: 5,
    x2: 180,
    x3: 69,
  },
  14: {
    name: '+{%_KILL_PER_KILL',
    func: 'decay',
    x1: 60,
    x2: 800,
    x3: 129,
  },
  16: {
    name: '+{%_DROP_RATE_MULTIPLIER',
    func: 'decay',
    x1: 10,
    x2: 800,
    x3: 129,
  },
  22: {
    name: '+{%_FASTER_MINIMUM_BOAT_TRAVEL_TIME',
    func: 'decay',
    x1: 20,
    x2: 170,
    x3: 69,
  },
  29: {
    name: '{千_COINS_FROM_MOBS',
    func: 'decayMulti',
    x1: 1.4,
    x2: 800,
    x3: 129,
  },
  40: {
    name: '+{%_TOTAL_DMG_MULTIPLIER',
    func: 'decay',
    x1: 12,
    x2: 800,
    x3: 129,
  },
}
