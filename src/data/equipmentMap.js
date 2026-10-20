// Unique stat lines (UQ1/UQ2) per item id.
// Masterclass items only list the stat text — their values roll per item and come from the save.
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

//=========================
// FIXED-STAT EQUIPMENT
//=========================
// Stats from IdleonToolbox items.json. Display as `${uq1val}${uq1txt}`.
// Keychain values are the three roll tiers, e.g. '3 / 4 / 6'.

  // ── Weapons ──
  EquipmentSword5: {
    uq1txt: '% MOB RESPAWN',
    uq1val: 8,
    uq2txt: '% TOTAL DAMAGE',
    uq2val: 6,
  },
  EquipmentSword9: {
    uq1txt: '% TOTAL DAMAGE',
    uq1val: 60,
    uq2txt: '% DROP RATE',
    uq2val: 20,
  },
  EquipmentWands14: {
    uq1txt: '% DAMAGE BONUS',
    uq1val: 30,
    uq2txt: '% CLASS EXP MULTI',
    uq2val: 25,
  },
  EquipmentBows15: {
    uq1txt: '% DAMAGE BONUS',
    uq1val: 30,
    uq2txt: '% CLASS EXP MULTI',
    uq2val: 25,
  },
  EquipmentPunching11: {
    uq1txt: '% TOTAL DAMAGE',
    uq1val: 120,
    uq2txt: '% DROP RATE',
    uq2val: 40,
  },
  EquipmentSword10: {
    uq1txt: '% DAMAGE BONUS',
    uq1val: 30,
    uq2txt: '% CLASS EXP MULTI',
    uq2val: 25,
  },

  // ── Rings / Pendants ──
  EquipmentPendant6: {
    uq1txt: '% AFK GAINS MULTI',
    uq1val: 8,
  },
  EquipmentRings7: {
    uq1txt: '% BOSS DAMAGE',
    uq1val: 20,
  },
  EquipmentRings38: {
    uq1txt: '% CLASS EXP MULTI',
    uq1val: 7,
  },
  EquipmentRings30: {
    uq1txt: '% LAB EXP',
    uq1val: 25,
    uq2txt: '% LAB EFFICIENCY',
    uq2val: 35,
  },
  EquipmentRingsFishing1: {
    uq1txt: ' YELLOW DEPTH',
    uq1val: 20,
  },
  EquipmentRingsFishing2: {
    uq1txt: ' RED DEPTH',
    uq1val: 30,
  },
  EquipmentRingsFishing3: {
    uq1txt: ' PURPLE DEPTH',
    uq1val: 40,
  },
  EquipmentRings35: {
    uq1txt: '% ALL AFK GAIN',
    uq1val: 4,
    uq2txt: '% SKILL EFFICIENCY',
    uq2val: 5,
  },
  EquipmentPendant17: {
    uq1txt: '% TOTAL DAMAGE',
    uq1val: 20,
    uq2txt: '% DROP RATE',
    uq2val: 5,
  },
  EquipmentPendant33: {
    uq1txt: '% BONUS MONEY',
    uq1val: 200,
  },

  // ── Keychains ──
  EquipmentKeychain0: {
    uq1txt: ' BASE DEFENCE',
    uq1val: '1 / 2 / 5',
  },
  EquipmentKeychain1: {
    uq1txt: ' ACCURACY',
    uq1val: '2 / 3 / 5',
  },
  EquipmentKeychain2: {
    uq1txt: '% MOVEMENT SPEED',
    uq1val: '1 / 1.5 / 2',
  },
  EquipmentKeychain3: {
    uq1txt: ' BASE DAMAGE',
    uq1val: '5 / 10 / 20',
  },
  EquipmentKeychain4: {
    uq1txt: '% CARD DROP CHANCE',
    uq1val: '3 / 6 / 10',
  },
  EquipmentKeychain5: {
    uq1txt: '% MONEY',
    uq1val: '4 / 7 / 10',
  },
  EquipmentKeychain6: {
    uq1txt: ' AGI',
    uq1val: '2 / 4 / 6',
  },
  EquipmentKeychain7: {
    uq1txt: ' LUK',
    uq1val: '2 / 4 / 6',
  },
  EquipmentKeychain8: {
    uq1txt: '% DEFENCE',
    uq1val: '1 / 2 / 4',
  },
  EquipmentKeychain9: {
    uq1txt: '% MINING XP GAIN',
    uq1val: '8 / 12 / 20',
  },
  EquipmentKeychain10: {
    uq1txt: '% TOTAL DAMAGE',
    uq1val: '1.5 / 2.5 / 3',
  },
  EquipmentKeychain11: {
    uq1txt: '% DROP RATE',
    uq1val: '3 / 5 / 8',
  },
  EquipmentKeychain12: {
    uq1txt: '% BASIC ATK SPEED',
    uq1val: '3 / 4 / 6',
  },
  EquipmentKeychain13: {
    uq1txt: '% CRIT CHANCE',
    uq1val: '1.5 / 2.5 / 3',
  },
  EquipmentKeychain14: {
    uq1txt: '% FISHING XP GAIN',
    uq1val: '8 / 12 / 20',
  },
  EquipmentKeychain15: {
    uq1txt: '% XP FROM MONSTERS',
    uq1val: '4 / 6 / 10',
  },
  EquipmentKeychain16: {
    uq1txt: '% MULTIKILL',
    uq1val: '5 / 7 / 12',
  },
  EquipmentKeychain17: {
    uq1txt: '% DEFENCE',
    uq1val: '3 / 5 / 8',
  },
  EquipmentKeychain18: {
    uq1txt: '% AGI',
    uq1val: '2 / 4 / 6',
  },
  EquipmentKeychain19: {
    uq1txt: '% ALL AFK GAIN',
    uq1val: '2 / 3 / 5',
  },
  EquipmentKeychain20: {
    uq1txt: '% TOTAL DAMAGE',
    uq1val: '3 / 4 / 7',
  },
  EquipmentKeychain21: {
    uq1txt: '% LUK',
    uq1val: '2 / 4 / 6',
  },
  EquipmentKeychain22: {
    uq1txt: '% MOB RESPAWN',
    uq1val: '3 / 4 / 6',
  },
  EquipmentKeychain23: {
    uq1txt: '% ALL SKILL SPEED',
    uq1val: '1 / 1.5 / 2',
  },
  EquipmentKeychain24: {
    uq1txt: '% ALL STATS',
    uq1val: '1 / 2.5 / 4',
  },
  EquipmentKeychain29: {
    uq1txt: '% MONEY',
    uq1val: '30',
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