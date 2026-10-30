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

// ── Class roles (character card pills) ──
// What a class is used for, keyed by TALENT TAB, so a class also gets the roles of every tab in
// its class line (CLASS_TALENT_TABS): a Death Bringer is still the Blood Berserker you cook on.
// Every role comes from that tab's talents (Toolbox website-data/talents.json, names as in game),
// cross-checked with the wiki's class specialties. allChars = the main talents work for every
// character on the account, not just this one. Base tabs (Beginner, Warrior, Archer, Mage, the
// Basics tabs) have no role talents, except Beginner's Extra Bags.
// A few roles are tips and tricks rather than a talent's text (e.g. Arcane Cultist's Emperor skulls);
// their text says so. Journeyman's drop/card talents are left out on purpose: nobody plays the
// Beginner line for them.
export const CLASS_TAB_ROLES = {
  'Beginner': [
    {
      label: 'Carry Capacity',
      text: 'Up to +200% material carry capacity. Essential for being able to hold the massive material costs of upgrading Stamps later on.',
      talents: ['Extra Bags'],
      allChars: false,
    },
  ],
  'Maestro': [
    {
      label: 'Skilling',
      text: "Other characters get extra skill EXP and efficiency in any skill where they're level is below the Maestro.",
      talents: ['Left Hand of Learning', 'Right Hand of Action'],
      allChars: true,
    },
    {
      label: '3D Printer',
      text: 'Prints hours of printer samples instantly, with a chance of no cooldown. Can also use speedruns to take some big samples due to the multikill and mob respawn bonuses.',
      talents: ['Printer Go Brrr'],
      allChars: true,
    },
  ],
  'Voidwalker': [
    {
      label: 'Speedruns',
      text: 'Void Trial Rerun starts a timed speedrun. Every portal you open during the run gives Tab 4 talent points. Killing Nightmare bosses counts as 3 portals. Master of the System gives every character more multikill per tier for every 5 maps in your best speedrun.',
      talents: ['Void Trial Rerun', 'Master of the System', 'Bossing Vain', 'Void Radius'],
      allChars: true,
    },
    {
      label: 'Account Buffs',
      text: 'Boosts every character on the account: base STR, AGI, WIS and LUK, more Class EXP, statue bonuses, and more damage for every 50 class levels a character has above 200. Enhancement Eclipse also provides various talents on other characters very strong bonuses.',
      talents: ['Eternal STR/AGI/WIS/LUK', 'EXP Cultivation', 'Voodoo Statufication', 'Power Orb', 'Enhancement Eclipse'],
      allChars: true,
    },
    {
      label: 'Meal Speed',
      text: 'Strongest Cooking speed multi in the game. The bonus caps at talent level 300 even though you can keep leveling it, so it\'s best to put points into other Void talents once you reach that level.',
      talents: ['Blood Marrow'],
      allChars: true,
    },
  ],
  'Barbarian': [
    {
      label: 'Fishing',
      text: 'Fishing EXP and Fishing AFK gains, extra Fishing Power from your fishing minigame highscore, and a chance to catch fish instantly.',
      talents: ['Worming Undercover', "Bobbin' Bobbers", 'All Fish Diet', "Catching Some ZZZ's"],
      allChars: false,
    },
  ],
  'Squire': [
    {
      label: 'Refinery',
      text: 'Refinery Throttle runs extra refinery cycles instantly (they still use materials). Precision Power gives this character more damage for each refinery rank, but only while its accuracy is at least 1.5x what it needs for a 100% hit chance.',
      talents: ['Refinery Throttle', 'Precision Power'],
      allChars: true,
    },
    {
      label: 'Construction',
      text: 'Build speed per POW 10 Redox Salts in storage and Construction EXP gains.',
      talents: ['Redox Rates', 'Sharper Saws'],
      allChars: false,
    },
  ],
  'Blood Berserker': [
    {
      label: 'Cooking',
      text: 'Cooking EXP and Eff for each mob you\'ve killed over 1m times, Cooking AFK gains, and ladles used on this character give extra AFK time. Also, Taste Test instantly finishes every recipe in progress and chance to get an extra ribbon every day.',
      talents: ['Taste Test', 'Apocalypse Chow', 'Waiting to Cool', 'Overflowing Ladle', 'Ribbon Winning'],
      allChars: false,
    },
  ],
  'Divine Knight': [
    {
      label: 'Orb Farming',
      text: 'Orb of Remembrance: +1% active EXP and drop rate per kill shown above the orb. Good for active statue and miniboss farming; stack high kills on your orb before spawning minibosses. ',
      talents: ['Orb of Remembrance', 'King of the Remembered'],
      allChars: false,
    },
    {
      label: 'Gaming',
      text: 'Gaming EXP for every character, bits per Gaming LV, and gaming progress from AFK claims.',
      talents: ['1000 Hours Played', 'Bitty Litty', 'Undying Passion'],
      allChars: true,
    },
  ],
  'Death Bringer': [
    {
      label: 'Wraith Form',
      text: 'Collect bones in Wraith Form for Grimoire upgrades. Wraith Overlord also gives every character a damage multiplier per POW 10 wraith bones ever collected.',
      talents: ['Wraith Form', 'Grimoire', 'Graveyard Shift', 'Wraith Overlord'],
      allChars: true,
    },
    {
      label: 'Farming',
      text: 'Crop evolution chance, stronger insta grows, Farming and Land Rank EXP, and bigger Land Rank bonuses.',
      talents: ['Mass Irrigation', "Agricultural 'Preciation", 'Dank Ranks'],
      allChars: true,
    },
    {
      label: 'Gold Food',
      text: 'Gold food effect for each monster killed 1 billion times on this class.',
      talents: ['Apocalypse Wow'],
      allChars: true,
    },
  ],
  'Royal Guardian': [
    {
      label: 'Royal Outposts',
      text: 'Royal Castle and Armory: outpost resource rate, faster outpost clearing and more Marble.',
      talents: ['Castle Convene', 'Royal Armory', 'Industrial Politics', 'Warbound Politics', 'Aesthetic Politics'],
      allChars: true,
    },
    {
      label: 'Spelunking',
      text: 'Cheaper Spelunking shop, max stamina, Spelunking EXP, page finding and Grand Discovery chance. Pit o\' Pages is currently bugged and only works on the character with the talent.',
      talents: ['Amber Hoard', 'Spelunking Specialty', "Pit o' Pages", 'Grand Vein'],
      allChars: true,
    },
  ],
  'Bowman': [
    {
      label: 'Catching',
      text: 'More Catching efficiency (from Oak Logs in storage and AGI), more Catching EXP, and higher Catching AFK gains.',  
      talents: ["Teleki'net'ic Logs", 'Briar Patch Runner', 'Bug Enthusiast', 'Sunset on the Hives'],
      allChars: false,
    },
  ],
  'Hunter': [
    {
      label: 'Trapping',
      text: 'Eagle Eye collects every trap and shares EXP with everyone. Trapping Eff per POW 10 Froge critters, Trapping EXP gains, and shiny critter multi per 10 Trapping LVs.',
      talents: ['Eagle Eye', 'Invasive Species', 'Shroom Bait', 'Reflective Eyesight'],
      allChars: true,
    },
  ],
  'Siege Breaker': [
    {
      label: 'Plunderous Mobs',
      text: 'Kills can spawn Plunderous mobs, which have more HP but give extra EXP and drops. Archlord of the Pirates gives every character more EXP and drop rate based on your lifetime Plunderous kills, growing each time that total reaches the next power of 10.',
      talents: ['Pirate Flag', 'Plunder Ye Deceased', 'Archlord of the Pirates'],
      allChars: true,
    },
    {
      label: 'Sailing',
      text: 'More Sailing EXP for every character and more EXP for all your captains. When the Loot Pile is almost full, returning ships upgrade chests already in the pile instead of adding new ones.',
      talents: ['Expertly Sailed', 'Captain Peptalk', 'Unending Loot Search'],
      allChars: true,
    },
  ],
  'Beast Master': [
    {
      label: 'Breeding',
      text: 'Extra eggs from AFK claims. Breeding EXP and mob power, even when you hatch eggs on another character. Arena Spirit gives unlimited Mob Arena entries for a few minutes. ',
      talents: ['I Dream of Peace and Egg', 'Shining Beacon of Egg', 'Curviture of the Paw', 'Arena Spirit'],
      allChars: true,
    },
  ],
  'Wind Walker': [
    {
      label: 'Tempest Form',
      text: 'Collect Dust in Tempest Form for Compass upgrades. Dustwalker also gives every character more coins from mobs per POW 10 dust ever collected.',
      talents: ['Tempest Form', 'Compass', 'Eternal Hunt', 'Dustwalker'],
      allChars: true,
    },
    {
      label: 'Sneaking',
      text: 'Cheaper Ninja Knowledge, Sneaking EXP for every ninja, two extra gemstones, and boost to all gemstone bonuses.',
      talents: ['Price Recession', 'Sneaky Skilling', 'Generational Gemstones'],
      allChars: true,
    },
    {
      label: 'Class EXP',
      text: 'Class EXP for everyone from owned medallions and abomination kills.',
      talents: ['Shiny Medallions', 'Slayer Abominator'],
      allChars: true,
    },
  ],
  'Wizard': [
    {
      label: 'Worship',
      text: ' Faster Worship charge rate, more Worship EXP, and more Worship efficiency per POW 10 Forest Souls in storage.',
      talents: ['Soooouls', 'Bless Up', 'Nearby Outlet'],
      allChars: false,
    },
  ],
  'Shaman': [
    {
      label: 'Alchemy',
      text: 'Cranium Cooking makes every kill give instant alchemy progress. Also faster brewing, more Alchemy EXP and better odds of finding new bubbles on this character, plus extra Alchemy EXP for anyone in the same cauldron.',
      talents: ['Cranium Cooking', "Busy Brewin'", 'Bubble Breakthrough', 'Sharing Some Smarts'],
      allChars: false,
    },
  ],
  'Elemental Sorcerer': [
    {
      label: 'Divinity',
      text: "Links a second god (set by Polytheism's talent level; not needed with Doot pet.) Divinity EXP multi and DMG for all characters per GOD Rank.",
      talents: ['Polytheism', 'Shared Beliefs', 'Gods Chosen Children'],
      allChars: true,
    },
    {
      label: 'Wormhole Mobs',
      text: 'Wormhole kills stacks more EXP and drop rate, which makes it good for farming items from the first page of a mob\'s drop pool. Usually only worth it in niche cases. Wormhole Emperor gives every character DMG per POW 10 kills of Wormhole mobs.',
      talents: ['Dimensional Wormhole', 'Wormhole Emperor'],
      allChars: true,
    },
  ],
  'Bubonic Conjuror': [
    {
      label: 'Lab',
      text: 'Lab EXP and Eff gains, extra line width and Lab EXP for other characters depending on positioning in Lab, and Lab EXP is shared with your lowest Lab player.',
      talents: ['Purple Tube', 'Green Tube', 'Essence Transferral', 'Upload Squared'],
      allChars: true,
    },
  ],
  'Arcane Cultist': [
    {
      label: 'Arcanist Form',
      text: 'Collect tachyons in Arcanist Form for Tesseract upgrades. Arcane mobs perma-buff drop rate, EXP or AFK on each map.',
      talents: ['Arcanist Form', 'Tesseract', 'Arcane Crystals', 'Overwhelming Energy'],
      allChars: true,
    },
    {
      label: 'Summoning',
      text: 'Cheaper Summoning upgrades, Summoning EXP, double familiar chance and stronger Gambit doublers.',
      talents: ['Essential Essence', 'Passion of the Summon', 'Absolute Stardom'],
      allChars: true,
    },
    {
      label: 'Emperor Boss',
      text: 'Damage trick for the W6 Emperor fight: stand on the highest platform so your skulls travel a much shorter distance. This leads to a massive damage increase, making AC by far the best class for the fight.',
      talents: ['Arcane Skulls', 'Sizzling Skull'],
      allChars: false,
    },
    {
      label: 'Prisma Bubbles',
      text: 'Arcane mobs are much more likely to drop Prisma bubbles. No Bubble Left Behind has a chance to give +3 levels instead of +1, per POW 10 tacyons collected.',
      talents: ['Primo Prisma', 'Tachyon Truth'],
      allChars: true,
    },
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

// CLASS_MAIN_STATS: main stat by the first tab of a class line (CLASS_TALENT_TABS[class][0])
export const CLASS_MAIN_STATS = {
  'Beginner': 'LUK',
  'Rage Basics': 'STR',
  'Calm Basics': 'AGI',
  'Savvy Basics': 'WIS',
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
