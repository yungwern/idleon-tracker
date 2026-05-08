export const equipmentMap = {
//=========================
// MASTERCLASS ITEMS
//=========================
  // ── Beast Master ──
  EquipmentBowsTempest0: {
    uq1txt: '% EXTRA DUST',
    uq2txt: null,
  },
  EquipmentBowsTempest1: {
    uq1txt: '% ICE ELEMENT DMG',
    uq2txt: null,
  },
  EquipmentBowsTempest2: {
    uq1txt: '% FIRE ELEMENT DMG',
    uq2txt: null,
  },
  EquipmentBowsTempest3: {
    uq1txt: '% WIND ELEMENT DMG',
    uq2txt: null,
  },
  EquipmentBowsTempest4: {
    uq1txt: '% GRASS ELEMENT DMG',
    uq2txt: null,
  },
  EquipmentRingsTempest4: {
    uq1txt: '% TEMPEST DAMAGE',
    uq2txt: null,
  },
  EquipmentRingsTempest6: {
    uq1txt: '% EXTRA DUST',
    uq2txt: null,
  },
  EquipmentRingsTempest7: {
    uq1txt: '% TEMPEST CRIT DMG',
    uq2txt: null,
  },

  // ── Arcane Cultist ──
  EquipmentWandsArc0: {
    uq1txt: '% ARCANIST DMG',
    uq2txt: '% EXTRA TACHYONS',
  },
  EquipmentRingsArc0: {
    uq1txt: '% ARCANIST ACC',
    uq2txt: '% EXTRA TACHYONS',
  },
}

export const GEAR_SETS = {
  COPPER_SET: {
    name: 'Copper Set',
    description: '+60% Mining and Chopping Efficiency',
    bonusValue: 60,
  },
  IRON_SET: {
    name: 'Iron Set',
    description: '+25% Class EXP Gain',
    bonusValue: 25,
  },
  AMAROK_SET: {
    name: 'Amarok Set',
    description: '+40% Accuracy and Defence',
    bonusValue: 40,
  },
  GOLD_SET: {
    name: 'Gold Set',
    description: '1.50x Coins Dropped by Monsters',
    bonusValue: 50,
  },
  PLATINUM_SET: {
    name: 'Platinum Set',
    description: '+60% Fishing and Catching Efficiency',
    bonusValue: 60,
  },
  EFAUNT_SET: {
    name: 'Efaunt Set',
    description: '+25% Drop Rate',
    bonusValue: 25,
  },
  DEMENTIA_SET: {
    name: 'Dementia Set',
    description: '+50% Critters and Souls Gained',
    bonusValue: 50,
  },
  VOID_SET: {
    name: 'Void Set',
    description: '+10% AFK Gains',
    bonusValue: 10,
  },
  CHIZOAR_SET: {
    name: 'Chizoar Set',
    description: '+40% All Skill EXP Gain',
    bonusValue: 40,
  },
  LUSTRE_SET: {
    name: 'Lustre Set',
    description: '+75% Total Damage',
    bonusValue: 75,
  },
  DIABOLICAL_SET: {
    name: 'Diabolical Set',
    description: '+20% Faster Monster Respawning',
    bonusValue: 20,
  },
  TROLL_SET: {
    name: 'Troll Set',
    description: '1.25x Higher Bonuses from Tome',
    bonusValue: 25,
  },
  SECRET_SET: {
    name: 'Secret Set',
    description: '1.25x Gold Food Effect',
    bonusValue: 25,
  },
  MAGMA_SET: {
    name: 'Magma Set',
    description: '+100% Lab and Divinity EXP Gain',
    bonusValue: 100,
  },
  KATTLEKRUK_SET: {
    name: 'Kattlekruk Set',
    description: '+5 LV for all Talents',
    bonusValue: 5,
  },
  MARBIGLASS_SET: {
    name: 'Marbiglass Set',
    description: '+10% All Stat',
    bonusValue: 10,
  },
  GODSHARD_SET: {
    name: 'Godshard Set',
    description: '1.15x Higher Winners Bonuses from Summoning',
    bonusValue: 15,
  },
  EMPEROR_SET: {
    name: 'Emperor Set',
    description: 'Ribbons and Exalted Stamps give 1.20x more multi',
    bonusValue: 20,
  },
  PREHISTORIC_SET: {
    name: 'Prehistoric Set',
    description: '1.00x EXP Gain in all World 7 Skills',
    bonusValue: 100,
  },
}

export const GEAR_SET_PIECES = {
  IRON_SET: {
    armors: ['EquipmentHats18', 'EquipmentShirts12', 'EquipmentPants3'],
    tools: ['EquipmentTools3', 'EquipmentToolsHatchet1', 'FishingRod3', 'CatchingNet3', 'WorshipSkull2'],
    weapons: [],
    requiredTools: 1,
    requiredWeapon: 0,
  },
  COPPER_SET: {
    armors: ['EquipmentHats17', 'EquipmentShirts11', 'EquipmentPants2'],
    tools: ['EquipmentTools2', 'EquipmentToolsHatchet3', 'FishingRod2', 'CatchingNet2', 'TrapBoxSet2', 'WorshipSkull2'],
    weapons: [],
    requiredTools: 1,
    requiredWeapon: 0,
  },
  GOLD_SET: {
    armors: ['EquipmentHats28', 'EquipmentShirts13', 'EquipmentPants4', 'EquipmentShoes3'],
    tools: ['EquipmentTools5', 'EquipmentToolsHatchet2', 'FishingRod4', 'CatchingNet4', 'WorshipSkull2'],
    weapons: ['EquipmentPunching3', 'TestObj3', 'EquipmentBows5', 'EquipmentWands5'],
    requiredTools: 1,
    requiredWeapon: 1,
  },
  PLATINUM_SET: {
    armors: ['EquipmentHats19', 'EquipmentShirts14', 'EquipmentPants5', 'EquipmentShoes4'],
    tools: ['EquipmentTools6', 'EquipmentToolsHatchet4', 'FishingRod5', 'CatchingNet5', 'TrapBoxSet3', 'WorshipSkull3'],
    weapons: ['EquipmentSword1', 'EquipmentBows6', 'EquipmentWands6'],
    requiredTools: 1,
    requiredWeapon: 1,
  },
  AMAROK_SET: {
    armors: ['EquipmentHats22', 'EquipmentShirts18', 'EquipmentPants17', 'EquipmentShoes20'],
    tools: [],
    weapons: [],
    requiredTools: 0,
    requiredWeapon: 0,
  },
  EFAUNT_SET: {
    armors: ['EquipmentHats52', 'EquipmentShirts26', 'EquipmentPants20', 'EquipmentShoes21'],
    tools: [],
    weapons: [],
    requiredTools: 0,
    requiredWeapon: 0,
  },
  DEMENTIA_SET: {
    armors: ['EquipmentHats53', 'EquipmentShirts15', 'EquipmentPants6', 'EquipmentShoes5'],
    tools: ['EquipmentTools7', 'EquipmentToolsHatchet5', 'FishingRod6', 'CatchingNet6', 'TrapBoxSet4', 'WorshipSkull4'],
    weapons: ['EquipmentPunching4', 'EquipmentSword2', 'EquipmentBows7', 'EquipmentWands3'],
    requiredTools: 2,
    requiredWeapon: 1,
  },
  VOID_SET: {
    armors: ['EquipmentHats54', 'EquipmentShirts27', 'EquipmentPants21', 'EquipmentShoes22'],
    tools: ['EquipmentTools11', 'EquipmentToolsHatchet7', 'FishingRod7', 'CatchingNet7', 'TrapBoxSet5', 'WorshipSkull5'],
    weapons: ['EquipmentPunching5', 'EquipmentSword3', 'EquipmentBows8', 'EquipmentWands7'],
    requiredTools: 2,
    requiredWeapon: 1,
  },
  CHIZOAR_SET: {
    armors: ['EquipmentHats68', 'EquipmentShirts6', 'EquipmentPants9', 'EquipmentShoes23'],
    tools: [],
    weapons: [],
    requiredTools: 0,
    requiredWeapon: 0,
  },
  LUSTRE_SET: {
    armors: ['EquipmentHats70', 'EquipmentShirts32', 'EquipmentPants24', 'EquipmentShoes24'],
    tools: ['EquipmentTools8', 'EquipmentToolsHatchet6', 'FishingRod8', 'CatchingNet8', 'TrapBoxSet6', 'WorshipSkull6'],
    weapons: ['EquipmentPunching6', 'EquipmentSword4', 'EquipmentBows9', 'EquipmentWands8'],
    requiredTools: 2,
    requiredWeapon: 1,
  },
  DIABOLICAL_SET: {
    armors: ['EquipmentHats71', 'EquipmentShirts33', 'EquipmentPants25', 'EquipmentShoes25'],
    tools: ['EquipmentTools12', 'EquipmentToolsHatchet8', 'FishingRod9', 'CatchingNet9', 'TrapBoxSet7', 'WorshipSkull7'],
    weapons: ['EquipmentPunching7', 'EquipmentSword5', 'EquipmentBows10', 'EquipmentWands9'],
    requiredTools: 2,
    requiredWeapon: 1,
  },
  TROLL_SET: {
    armors: ['EquipmentHats74', 'EquipmentShirts34', 'EquipmentPants8', 'EquipmentShoes34'],
    tools: [],
    weapons: [],
    requiredTools: 0,
    requiredWeapon: 0,
  },
  MAGMA_SET: {
    armors: ['EquipmentHats77', 'EquipmentShirts35', 'EquipmentPants26', 'EquipmentShoes35'],
    tools: ['EquipmentTools9', 'EquipmentToolsHatchet9', 'FishingRod10', 'CatchingNet10', 'TrapBoxSet8', 'WorshipSkull9'],
    weapons: ['EquipmentPunching8', 'EquipmentSword6', 'EquipmentBows11', 'EquipmentWands10'],
    requiredTools: 3,
    requiredWeapon: 1,
  },
  KATTLEKRUK_SET: {
    armors: ['EquipmentHats83', 'EquipmentShirts36', 'EquipmentPants27', 'EquipmentShoes36', 'EquipmentCape13'],
    tools: [],
    weapons: ['EquipmentPunching9', 'EquipmentSword7', 'EquipmentBows12', 'EquipmentWands11'],
    requiredTools: 0,
    requiredWeapon: 1,
  },
  MARBIGLASS_SET: {
    armors: ['EquipmentHats105', 'EquipmentShirts37', 'EquipmentPants29', 'EquipmentShoes37'],
    tools: ['EquipmentTools14', 'EquipmentToolsHatchet12', 'FishingRod11', 'CatchingNet11', 'TrapBoxSet9', 'WorshipSkull10'],
    weapons: ['EquipmentPunching10', 'EquipmentSword8', 'EquipmentBows13', 'EquipmentWands12'],
    requiredTools: 4,
    requiredWeapon: 1,
  },
  GODSHARD_SET: {
    armors: ['EquipmentHats106', 'EquipmentShirts38', 'EquipmentPants30', 'EquipmentShoes38'],
    tools: ['EquipmentTools15', 'EquipmentToolsHatchet10', 'FishingRod12', 'CatchingNet12', 'TrapBoxSet10', 'WorshipSkull11'],
    weapons: ['EquipmentPunching11', 'EquipmentSword9', 'EquipmentBows14', 'EquipmentWands13'],
    requiredTools: 6,
    requiredWeapon: 1,
  },
  EMPEROR_SET: {
    armors: ['EquipmentHats119', 'EquipmentShirts39', 'EquipmentPants31', 'EquipmentShoes40', 'EquipmentRings36', 'EquipmentPendant35', 'EquipmentCape17'],
    tools: [],
    weapons: [],
    requiredTools: 0,
    requiredWeapon: 0,
  },
  PREHISTORIC_SET: {
    armors: ['EquipmentHats123', 'EquipmentShirts41', 'EquipmentPants32', 'EquipmentShoes41'],
    tools: ['EquipmentTools16', 'EquipmentToolsHatchet13', 'FishingRod13', 'CatchingNet13', 'TrapBoxSet11', 'WorshipSkull12'],
    weapons: ['EquipmentPunching12', 'EquipmentSword10', 'EquipmentBows15', 'EquipmentWands14'],
    requiredTools: 6,
    requiredWeapon: 1,
  },
  SECRET_SET: {
    armors: ['EquipmentHats61', 'EquipmentPunching11', 'EquipmentShirts31', 'Trophy3', 'EquipmentNametag4'],
    tools: [],
    weapons: [],
    requiredTools: 0,
    requiredWeapon: 0,
  },
}