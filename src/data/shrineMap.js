// =========================
// SHRINES (World 3 Construction)
// =========================
// Source: IdleonToolbox (Morta1/IdleonToolbox) shared-data.json "shrines" + generalSpelunky[23]/[24].
// Keyed by Construction building index (Tower[18..26]). Images: public/images/shrines/ConTowerB<id>.png
//
// bonus = baseBonus + (shrine Lv - 1) × bonusPerLevel
// coral = World 7 Dancing Coral bonus, unlocked once the shrine's building passes Lv 200:
//   value = coral.perLevel × (building Lv - 200). multi: true shows it as 1 + value / 100 ("x")

export const shrineMap = {
  18: {
    name: 'Woodular',
    bonus: 'Total Damage',
    baseBonus: 12,
    bonusPerLevel: 3,
    coral: {
      bonus: 'Daily Reef Coral',
      perLevel: 2,
    },
  },
  19: {
    name: 'Isaccian',
    bonus: 'Max HP and DEF',
    baseBonus: 12,
    bonusPerLevel: 3,
    coral: {
      bonus: 'Spelunking POW',
      perLevel: 5,
    },
  },
  20: {
    name: 'Crystal',
    bonus: 'Lv Up Rate of all Shrines',
    baseBonus: 20,
    bonusPerLevel: 4,
    coral: {
      bonus: 'Spelunking Amber Gain',
      perLevel: 3,
    },
  },
  21: {
    name: 'Pantheon',
    bonus: 'Carry Capacity',
    baseBonus: 10,
    bonusPerLevel: 2,
    coral: {
      bonus: 'Class EXP Gain',
      perLevel: 4,
      multi: true,
    },
  },
  22: {
    name: 'Clover',
    bonus: 'Drop Rate',
    baseBonus: 15,
    bonusPerLevel: 3,
    coral: {
      bonus: 'Research EXP',
      perLevel: 3,
    },
  },
  23: {
    name: 'Summereading',
    bonus: 'ALL EXP Gain',
    baseBonus: 6,
    bonusPerLevel: 1,
    coral: {
      bonus: 'Minehead DMG & Money',
      perLevel: 5,
    },
  },
  24: {
    name: 'Crescent',
    bonus: 'Crystal and Giant Spawn Chance',
    baseBonus: 50,
    bonusPerLevel: 7.5,
    coral: {
      bonus: 'Lumi Gains',
      perLevel: 1,
    },
  },
  25: {
    name: 'Undead',
    bonus: 'Respawn Rate of Monsters',
    baseBonus: 5,
    bonusPerLevel: 1,
  },
  26: {
    name: 'Primordial',
    bonus: 'AFK Gain Rate',
    baseBonus: 1,
    bonusPerLevel: 0.1,
  },
}

// Account-wide unlocks that make Shrines easier to use, shown in the Shrines buffs panel.
// Unlock state comes from snapshot.shrineBuffs (lib/extractSnapshot.js) and snapshot.legendTalents.
export const shrineBuffMap = {
  architect: {
    name: 'Shrine Architect',
    source: 'World 3 · Star Talent',
    img: 'images/talents/UISkillIcon639.png',
    effect: 'Lets you place Shrines. From the quest "Taking Samples" (Hoggindaz)',
  },
  worldTour: {
    name: 'Shrine World Tour',
    source: 'World 4 · Lab Bonus',
    img: 'images/lab/LabBonus5.png',
    effect: 'A Shrine in a town map applies to every map in that world',
    warning: 'Based on Lab being unlocked. Check in game that a player is connected to it',
  },
  moaiHead: {
    name: 'Moai Head',
    source: 'World 5 · Sailing Artifact',
    img: 'images/sailing/Arti0.png',
    effect: 'Get bonuses from all Shrines on any map (leveling still needs the same map/world)',
  },
  bargaining: {
    name: 'Shrine Collective Bargaining Agreement',
    source: 'World 6 · Jade Emporium',
    img: 'images/sneaking/NjJupg19.png',
    effect: 'Shrines no longer lose EXP when moved',
  },
  worldOrder: {
    name: 'Shrine World Order Bill',
    source: 'World 7 · Legend Talent',
    img: 'images/legend talents/LegendTalentIcon38.png',
    effect: 'Shrines gain EXP from AFK gains no matter what world you\'re in',
  },
}

// Shrine EXP per hour of AFK gains (Toolbox getShrineExpBonus, game "ShrineExpBonus"). Each character adds its
// own rate to every shrine it levels: built shrines on its map, in its world with Shrine World Tour, or anywhere
// with legend talent 38. Level n needs floor(20 (n - 1) + 6 n × 1.63^(n - 1)) EXP.
export const shrineExpSources = {
  crystalShrine: 2, // snapshot.shrines index: +% shrine EXP where it applies
  superbit: 8, // Shrine Speed: 1.5x
  moaiHeadForms: [0, 0, 100, 200, 300, 400, 500, 750], // Moai Head artifact: +% by form (Sailing[3][0])
  skillMasteryBonus: 1, // Construction skill mastery (rift): +15%
  skillMasteryValue: 15,
  postOfficeBox: { index: 17, unlockLevel: 24.9, func: 'decay', x1: 75, x2: 200 }, // Construction Container, 2nd bonus
  starTalent: 639, // Shrine Architect
  vialStat: 'ShrineSpd',
  ballot: 19,
  worldOrderLegendTalent: 38, // shrines level from any world
  buildingPerLevel: 10, // +10% per Construction building level
}
