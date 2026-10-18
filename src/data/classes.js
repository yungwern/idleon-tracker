// ============================================================
// CLASSES
// The save stores each character's class as a number (CharacterClass_0, _1, ...).
// IDs come from IdleOn Toolbox's class list (IdleOn Resources/website-data.json).
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
