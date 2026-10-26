// ── Seed Info ─────────────────────────────────────────────────────────────────
export const seedInfo = [
  { name: 'Basic',  seedId: 0, cropIdMin: 0,   cropIdMax: 20,  lvlReq: 1,   nextCropChance: 0.3,       nextCropDecay: 0.75  },
  { name: 'Earthy', seedId: 1, cropIdMin: 21,  cropIdMax: 45,  lvlReq: 10,  nextCropChance: 0.12,      nextCropDecay: 0.63  },
  { name: 'Bulbo',  seedId: 2, cropIdMin: 46,  cropIdMax: 60,  lvlReq: 25,  nextCropChance: 0.04,      nextCropDecay: 0.3   },
  { name: 'Sushi',  seedId: 3, cropIdMin: 61,  cropIdMax: 83,  lvlReq: 50,  nextCropChance: 0.01,      nextCropDecay: 0.4   },
  { name: 'Mushie', seedId: 4, cropIdMin: 84,  cropIdMax: 106, lvlReq: 80,  nextCropChance: 0.003,     nextCropDecay: 0.2   },
  { name: 'Glassy', seedId: 5, cropIdMin: 107, cropIdMax: 229, lvlReq: 120, nextCropChance: 0.0005,    nextCropDecay: 0.05  },
  { name: 'Medal',  seedId: 6, cropIdMin: 230, cropIdMax: 329, lvlReq: 120, nextCropChance: 0.00006942, nextCropDecay: 0.003 },
]

export const getSeedByCropId = (cropId) =>
  seedInfo.find(s => cropId >= s.cropIdMin && cropId <= s.cropIdMax) ?? null

// ── Day Market (indices 0–7) & Night Market (indices 8–15) ───────────────────
export const marketMap = [
  { index: 0,  name: 'LAND_PLOTS',     label: 'Land Plots',     bonusText: 'You get {% extra plots of land to plant crops in',         cropId: 0,  cropIdIncrement: 2,    cost: 2,   costExponent: 2,     cropReq: 0,   maxLvl: 20,  bonusPerLvl: 1,    isLinear: true  },
  { index: 1,  name: 'STRONGER_VINES', label: 'Stronger Vines', bonusText: '+{% chance for +1 crop when fully grown',                  cropId: 1,  cropIdIncrement: 0.18, cost: 2,   costExponent: 1.13,  cropReq: 3,   maxLvl: 500, bonusPerLvl: 2,    isLinear: true  },
  { index: 2,  name: 'NUTRITIOUS_SOIL',label: 'Nutritious Soil',bonusText: '+{% growth speed for all land',                            cropId: 7,  cropIdIncrement: 0.15, cost: 3,   costExponent: 1.12,  cropReq: 8,   maxLvl: 500, bonusPerLvl: 1,    isLinear: true  },
  { index: 3,  name: 'SMARTER_SEEDS',  label: 'Smarter Seeds',  bonusText: '+{% farming EXP gain from all sources',                   cropId: 21, cropIdIncrement: 0.14, cost: 6,   costExponent: 1.1,   cropReq: 14,  maxLvl: 500, bonusPerLvl: 3,    isLinear: true  },
  { index: 4,  name: 'BIOLOGY_BOOST',  label: 'Biology Boost',  bonusText: '+{% chance of crop evolution',                            cropId: 46, cropIdIncrement: 0.09, cost: 10,  costExponent: 1.1,   cropReq: 31,  maxLvl: 500, bonusPerLvl: 15,   isLinear: true  },
  { index: 5,  name: 'PRODUCT_DOUBLER',label: 'Product Doubler',bonusText: '+{% chance for crops to be worth 2x when collected',      cropId: 30, cropIdIncrement: 0.12, cost: 15,  costExponent: 1.2,   cropReq: 42,  maxLvl: 500, bonusPerLvl: 3,    isLinear: true  },
  { index: 6,  name: 'MORE_BEENZ',     label: 'More Beenz',     bonusText: '+{% magic beans gained when trading in crops',            cropId: 61, cropIdIncrement: 0.11, cost: 25,  costExponent: 1.15,  cropReq: 53,  maxLvl: 500, bonusPerLvl: 2,    isLinear: true  },
  { index: 7,  name: 'RANK_BOOST',     label: 'Rank Boost',     bonusText: 'Plots earn +{% more Rank XP when a crop is collected',    cropId: 84, cropIdIncrement: 0.11, cost: 30,  costExponent: 1.2,   cropReq: 80,  maxLvl: 500, bonusPerLvl: 3,    isLinear: true  },
  { index: 8,  name: 'OVERGROWTH',     label: 'Overgrowth',     bonusText: 'Unlocks Overgrowth (OG). Each OG doubles crop value & EXP', cropId: 2, cropIdIncrement: 0.1, cost: 10, costExponent: 1.1,  cropReq: 19,  maxLvl: 1,   bonusPerLvl: 1,    isLinear: true  },
  { index: 9,  name: 'EVOLUTION_GMO',  label: 'Evolution GMO',  bonusText: '}x crop evolution chance per crop you have 200 of',       cropId: 2,  cropIdIncrement: 0.1,  cost: 15,  costExponent: 1.08,  cropReq: 25,  maxLvl: 500, bonusPerLvl: 0.8,  isLinear: false },
  { index: 10, name: 'SPEED_GMO',      label: 'Speed GMO',      bonusText: '+{% growth speed per crop you have 1000 of',              cropId: 2,  cropIdIncrement: 0.1,  cost: 25,  costExponent: 1.155, cropReq: 36,  maxLvl: 500, bonusPerLvl: 0.3,  isLinear: true  },
  { index: 11, name: 'OG_FERTILIZER',  label: 'OG Fertilizer',  bonusText: '}x higher chance for Overgrowth to occur',               cropId: 2,  cropIdIncrement: 0.1,  cost: 40,  costExponent: 1.06,  cropReq: 48,  maxLvl: 500, bonusPerLvl: 1,    isLinear: false },
  { index: 12, name: 'EXP_GMO',        label: 'EXP GMO',        bonusText: '+{% farming EXP gain per crop you have 2500 of',         cropId: 2,  cropIdIncrement: 0.1,  cost: 60,  costExponent: 1.095, cropReq: 57,  maxLvl: 100, bonusPerLvl: 1,    isLinear: true  },
  { index: 13, name: 'LAND_RANK',      label: 'Land Rank',      bonusText: 'Each plot now gets Rank XP when a crop is collected.',   cropId: 2,  cropIdIncrement: 0.1,  cost: 80,  costExponent: 1.05,  cropReq: 61,  maxLvl: 1,   bonusPerLvl: 1,    isLinear: true  },
  { index: 14, name: 'VALUE_GMO',      label: 'Value GMO',      bonusText: '+{% crop value per crop you have 10,000 of',             cropId: 2,  cropIdIncrement: 0.1,  cost: 150, costExponent: 1.125, cropReq: 95,  maxLvl: 500, bonusPerLvl: 0.02, isLinear: true  },
  { index: 15, name: 'SUPER_GMO',      label: 'Super GMO',      bonusText: "+{% all 'GMO' bonuses per crop you have 100K",           cropId: 2,  cropIdIncrement: 0.1,  cost: 250, costExponent: 1.2,   cropReq: 109, maxLvl: 50,  bonusPerLvl: 0.5,  isLinear: true  },
]

// ── Exotic Market ─────────────────────────────────────────────────────────────
export const exoticMarketMap = [
  { index: 0,  name: 'SPROUTLUCK_I',    label: 'Sproutluck I',    bonusText: '}x crop evolution chance',                              cropCostId: 3,  baseValue: 500,  type: 1 },
  { index: 1,  name: 'SPROUTLUCK_II',   label: 'Sproutluck II',   bonusText: '}x crop evolution chance',                              cropCostId: 5,  baseValue: 600,  type: 1 },
  { index: 2,  name: 'SPROUTLUCK_III',  label: 'Sproutluck III',  bonusText: '}x crop evolution chance',                              cropCostId: 6,  baseValue: 700,  type: 1 },
  { index: 3,  name: 'SPROUTLUCK_IV',   label: 'Sproutluck IV',   bonusText: '}x crop evolution chance',                              cropCostId: 7,  baseValue: 800,  type: 1 },
  { index: 4,  name: 'GENEOLOGY_I',     label: 'Geneology I',     bonusText: '+{% crop evolution chance per Farming LV above 50',     cropCostId: 9,  baseValue: 6,    type: 1 },
  { index: 5,  name: 'GENEOLOGY_II',    label: 'Geneology II',    bonusText: '+{% crop evolution chance per Farming LV above 100',    cropCostId: 11, baseValue: 12,   type: 1 },
  { index: 6,  name: 'GENEOLOGY_III',   label: 'Geneology III',   bonusText: '+{% crop evolution chance per Farming LV above 150',    cropCostId: 13, baseValue: 20,   type: 1 },
  { index: 7,  name: 'GENEOLOGY_IV',    label: 'Geneology IV',    bonusText: '+{% crop evolution chance per Farming LV above 200',    cropCostId: 15, baseValue: 28,   type: 1 },
  { index: 8,  name: 'GENEOLOGY_V',     label: 'Geneology V',     bonusText: '+{% crop evolution chance per Farming LV above 250',    cropCostId: 16, baseValue: 50,   type: 1 },
  { index: 9,  name: 'STABLEROOT_I',    label: 'Stableroot I',    bonusText: '+{% Land Rank EXP gain for all plots',                  cropCostId: 17, baseValue: 350,  type: 1 },
  { index: 10, name: 'STABLEROOT_II',   label: 'Stableroot II',   bonusText: '+{% Land Rank EXP gain for all plots',                  cropCostId: 18, baseValue: 250,  type: 1 },
  { index: 11, name: 'STABLEROOT_III',  label: 'Stableroot III',  bonusText: '+{% Land Rank EXP gain for all plots',                  cropCostId: 20, baseValue: 400,  type: 1 },
  { index: 12, name: 'VIGOUROOT_I',     label: 'Vigouroot I',     bonusText: '}x Land Rank EXP gain for all plots',                   cropCostId: 21, baseValue: 100,  type: 1 },
  { index: 13, name: 'VIGOUROOT_II',    label: 'Vigouroot II',    bonusText: '}x Land Rank EXP gain for all plots',                   cropCostId: 23, baseValue: 130,  type: 1 },
  { index: 14, name: 'PLUMP_DATABASE',  label: 'Plump Database',  bonusText: '+{% higher bonuses from the Land Rank Database',        cropCostId: 24, baseValue: 60,   type: 1 },
  { index: 15, name: 'DATADIGGING',     label: 'Datadigging',     bonusText: '+$ higher max LV for 5th column of Land Rank Database', cropCostId: 25, baseValue: 5,    type: 1 },
  { index: 16, name: 'LEGUMIOSO_I',     label: 'Legumioso I',     bonusText: '+{% Extra Beans from Legumulyte',                       cropCostId: 27, baseValue: 250,  type: 1 },
  { index: 17, name: 'LEGUMIOSO_II',    label: 'Legumioso II',    bonusText: '+{% Extra Beans from Legumulyte',                       cropCostId: 29, baseValue: 350,  type: 1 },
  { index: 18, name: 'LEGUMIOSO_III',   label: 'Legumioso III',   bonusText: '+{% Extra Beans from Legumulyte',                       cropCostId: 30, baseValue: 420,  type: 1 },
  { index: 19, name: 'LARGUMES_I',      label: 'Largumes I',      bonusText: '}x more Beans from Lugumulyte',                         cropCostId: 31, baseValue: 90,   type: 1 },
  { index: 20, name: 'LARGUMES_II',     label: 'Largumes II',     bonusText: '}x more Beans from Lugumulyte',                         cropCostId: 32, baseValue: 130,  type: 1 },
  { index: 21, name: 'FARMER_BRAIN',    label: 'Farmer Brain',    bonusText: '+{% Farming EXP gain on all characters',                cropCostId: 33, baseValue: 300,  type: 1 },
  { index: 22, name: 'FARMER_KNOWHOW',  label: 'Farmer Knowhow',  bonusText: '}x Farming EXP gain on all characters',                 cropCostId: 34, baseValue: 120,  type: 1 },
  { index: 23, name: 'STALK_VALUE_I',   label: 'Stalk Value I',   bonusText: '+{% higher Crop Value max cap',                         cropCostId: 36, baseValue: 50,   type: 1 },
  { index: 24, name: 'STALK_VALUE_II',  label: 'Stalk Value II',  bonusText: '+{% higher Crop Value max cap',                         cropCostId: 37, baseValue: 70,   type: 1 },
  { index: 25, name: 'STALK_VALUE_III', label: 'Stalk Value III', bonusText: '+{% higher Crop Value max cap',                         cropCostId: 38, baseValue: 120,  type: 1 },
  { index: 26, name: 'EVERGROW_I',      label: 'Evergrow I',      bonusText: '}x Overgrowth Chance for all crops',                    cropCostId: 40, baseValue: 100,  type: 1 },
  { index: 27, name: 'EVERGROW_II',     label: 'Evergrow II',     bonusText: '}x Overgrowth Chance for all crops',                    cropCostId: 41, baseValue: 150,  type: 1 },
  { index: 28, name: 'DOUBLE_PETAL_I',  label: 'Double Petal I',  bonusText: '+{% chance for crops to be worth 2x when harvested',    cropCostId: 42, baseValue: 50,   type: 1 },
  { index: 29, name: 'DOUBLE_PETAL_II', label: 'Double Petal II', bonusText: '+{% chance for crops to be worth 2x when harvested',    cropCostId: 44, baseValue: 70,   type: 1 },
  { index: 30, name: 'GOGOGROW',        label: 'Gogogrow',        bonusText: '+{% Growth Speed for all land plots',                   cropCostId: 45, baseValue: 50,   type: 1 },
  { index: 31, name: 'BOUNTIFUL_I',     label: 'Bountiful I',     bonusText: '+{% chance for +1 crop when fully grown',               cropCostId: 46, baseValue: 50,   type: 1 },
  { index: 32, name: 'BOUNTIFUL_II',    label: 'Bountiful II',    bonusText: '+{% chance for +1 crop when fully grown',               cropCostId: 48, baseValue: 60,   type: 1 },
  { index: 33, name: 'BOUNTIFUL_III',   label: 'Bountiful III',   bonusText: '+{% chance for +1 crop when fully grown',               cropCostId: 50, baseValue: 70,   type: 1 },
  { index: 34, name: 'BETTER_DAY_I',    label: 'Better Day I',    bonusText: '+{% cheaper Day Market upgrades',                       cropCostId: 51, baseValue: 40,   type: 1 },
  { index: 35, name: 'BETTER_DAY_II',   label: 'Better Day II',   bonusText: '+{% cheaper Day Market upgrades',                       cropCostId: 53, baseValue: 55,   type: 1 },
  { index: 36, name: 'BETTER_NIGHT_I',  label: 'Better Night I',  bonusText: '+{% cheaper Night Market upgrades',                     cropCostId: 54, baseValue: 40,   type: 1 },
  { index: 37, name: 'BETTER_NIGHT_II', label: 'Better Night II', bonusText: '+{% cheaper Night Market upgrades',                     cropCostId: 56, baseValue: 55,   type: 1 },
  { index: 38, name: 'BETTER_EXOTIC',   label: 'Better Exotic',   bonusText: '+{% extra LVs when buying Exotic Upgrades',             cropCostId: 58, baseValue: 70,   type: 1 },
  { index: 39, name: 'FREEXOTIC',       label: 'Freexotic',       bonusText: '+{% chance to save a purchase when buying Exotic',       cropCostId: 60, baseValue: 30,   type: 1 },
  { index: 40, name: 'SCIENTERRIFIC',   label: 'Scienterrific',   bonusText: '+{% higher bonuses from Crop Scientist',                cropCostId: 62, baseValue: 20,   type: 1 },
  { index: 41, name: 'BRIAR_PATCH',     label: 'Briar Patch',     bonusText: '+{% Total Damage (Not Farming Related)',                 cropCostId: 64, baseValue: 1,    type: 0 },
  { index: 42, name: 'GRAVEL_POUND',    label: 'Gravel Pound',    bonusText: '}x Total Spelunking POW (Not Farming Related)',          cropCostId: 66, baseValue: 300,  type: 1 },
  { index: 43, name: 'SAP_SURGE',       label: 'Sap Surge',       bonusText: '}x Amber found in Spelunking (Not Farming Related)',     cropCostId: 67, baseValue: 500,  type: 1 },
  { index: 44, name: '4_LEAF_CLOVER',   label: '4 Leaf Clover',   bonusText: '+{% Palette Luck in Gaming (Not Farming Related)',       cropCostId: 69, baseValue: 150,  type: 1 },
  { index: 45, name: '5_LEAF_CLOVER',   label: '5 Leaf Clover',   bonusText: '}x Artifact Find Chance (Not Farming Related)',          cropCostId: 79, baseValue: 30,   type: 1 },
  { index: 46, name: 'BUD_COURIER',     label: 'Bud Courier',     bonusText: '+{% chance for 2x Snail Mail (Not Farming Related)',     cropCostId: 71, baseValue: 35,   type: 1 },
  { index: 47, name: 'STUDIOUS_SPORE',  label: 'Studious Spore',  bonusText: '+{% Spelunking EXP Gain (Not Farming Related)',          cropCostId: 73, baseValue: 200,  type: 1 },
  { index: 48, name: 'PRISMA_PETAL',    label: 'Prisma Petal',    bonusText: '+{% Prisma Bubble Bonus (Not Farming Related)',           cropCostId: 75, baseValue: 2,    type: 1 },
  { index: 49, name: 'EXALTED_ELDOU',   label: 'Exalted Eldou',   bonusText: '+{% Exalted Stamp Bonus (Not Farming Related)',           cropCostId: 77, baseValue: 2,    type: 1 },
  { index: 50, name: 'INTELLEAF',       label: 'Intelleaf',       bonusText: '+{% Class EXP (Not Farming Related)',                    cropCostId: 78, baseValue: 300,  type: 1 },
  { index: 51, name: 'GRAPEVINE',       label: 'Grapevine',       bonusText: '}x Villager EXP gain (Not Farming Related)',             cropCostId: 81, baseValue: 70,   type: 1 },
  { index: 52, name: 'HOLLOW_TRUNK',    label: 'Hollow Trunk',    bonusText: '}x Jar Collectibles Chance (Not Farming Related)',       cropCostId: 83, baseValue: 200,  type: 1 },
  { index: 53, name: 'BONEMEAL_SOIL',   label: 'Bonemeal Soil',   bonusText: '+{% Deathbringer Bones (Not Farming Related)',           cropCostId: 85, baseValue: 160,  type: 1 },
  { index: 54, name: 'FORCE_OF_NATURE', label: 'Force of Nature', bonusText: '+{% Windwalker Dust (Not Farming Related)',               cropCostId: 86, baseValue: 160,  type: 1 },
  { index: 55, name: 'PURPLE_GRASS',    label: 'Purple Grass',    bonusText: '+{% Arcane Cultist Tachyons (Not Farming Related)',      cropCostId: 87, baseValue: 160,  type: 1 },
  { index: 56, name: 'POTENT_HEMLOCK',  label: 'Potent Hemlock',  bonusText: '+{% Kill per Kill (Not Farming Related)',                cropCostId: 88, baseValue: 35,   type: 1 },
  { index: 57, name: 'GOLD_FIGLEAF',    label: 'Gold Figleaf',    bonusText: '+{% Gold Balls gained in Arcade (Not Farming Related)',  cropCostId: 89, baseValue: 10,   type: 1 },
  { index: 58, name: 'SNAPEGRASS',      label: 'Snapegrass',      bonusText: '}x Jade Gain in Sneaking (Not Farming Related)',         cropCostId: 91, baseValue: 1500, type: 1 },
  { index: 59, name: 'POMMELION_SEED',  label: 'Pommelion Seed',  bonusText: '+{% Drop Rate (Not Farming Related)',                    cropCostId: 92, baseValue: 25,   type: 1 },
  // Indices 60–78: NAME_MAGNI placeholders — null to preserve index alignment
  ...Array.from({ length: 19 }, () => null),
]

// An organic label (Spelunk[50]) doubles an exotic's bonus; exotic 39 is capped at 50 after that.
// Account-aware version: getExoticBonus in utils/exoticUtils.js.
const EXOTIC_ORGANIC_MULTI = 2
const EXOTIC_39_CAP = 50

export const calcExoticBonus = (upgrade, level, organic = false) => {
  if (!upgrade || level === 0) return 0
  const base = upgrade.type === 1
    ? upgrade.baseValue * (level / (1000 + level))
    : upgrade.baseValue * level
  const value = base * (organic ? EXOTIC_ORGANIC_MULTI : 1)
  return upgrade.index === 39 ? Math.min(EXOTIC_39_CAP, value) : value
}

// Highest bonus a type 1 (capped) exotic can reach
export const exoticCap = (upgrade, organic = false) => {
  const cap = upgrade.baseValue * (organic ? EXOTIC_ORGANIC_MULTI : 1)
  return upgrade.index === 39 ? Math.min(EXOTIC_39_CAP, cap) : cap
}

// ── Land Rank Database ────────────────────────────────────────────────────────
// Base values from ninjaExtraInfo[36], unlock thresholds from ninjaExtraInfo[37]
// formula:
//   linear (index 4,9,14,19):  bonus = base * upgradeLevel
//   diminishing (all others):  bonus = (1.7 * base * upgradeLevel) / (upgradeLevel + 80)
export const landRankMap = [
  { index: 0,  name: 'Evolution Boost',       description: 'Increases next crop chance by +{% per rank of the land plot',          base: 250,   isLinear: false, unlockAt: 1    },
  { index: 1,  name: 'Production Boost',      description: 'Boosts value of crops harvested by +{% per rank of the land plot',     base: 5,     isLinear: false, unlockAt: 5    },
  { index: 2,  name: 'Soil EXP Boost',        description: 'Each land gains +{% extra Rank EXP per rank of the previous land',     base: 25,    isLinear: false, unlockAt: 20   },
  { index: 3,  name: 'Evolution Megaboost',   description: 'Increases next crop chance by +{% multiplicatively!',                  base: 600,   isLinear: false, unlockAt: 30   },
  { index: 4,  name: 'Seed of Stealth',       description: 'Increases the Stealth of all Ninja Twins by +{% per Farming LV',       base: 2,     isLinear: true,  unlockAt: 60   },
  { index: 5,  name: 'Farmtastic Boost',      description: 'Increases Farming Skill EXP gained by +{%',                           base: 90,    isLinear: false, unlockAt: 80   },
  { index: 6,  name: 'Soil EXP Megaboost',    description: 'All plots of land gain +{% more Rank EXP',                            base: 200,   isLinear: false, unlockAt: 125  },
  { index: 7,  name: 'Overgrowth Boost',      description: 'Increases chance for Overgrowth by +{%',                              base: 120,   isLinear: false, unlockAt: 180  },
  { index: 8,  name: 'Production Megaboost',  description: 'Increases the amount of crops harvested by +{%',                      base: 100,   isLinear: false, unlockAt: 250  },
  { index: 9,  name: 'Seed of Loot',          description: 'Increases the Drop Rate of all characters by +{%',                    base: 10,    isLinear: true,  unlockAt: 400  },
  { index: 10, name: 'Evolution Superboost',  description: 'Increases next crop chance by +{% multiplicatively!',                  base: 3000,  isLinear: false, unlockAt: 500  },
  { index: 11, name: 'Overgrowth Megaboost',  description: 'Increases chance for Overgrowth by +{%',                              base: 340,   isLinear: false, unlockAt: 600  },
  { index: 12, name: 'Farmtastic Megaboost',  description: 'Increases Farming Skill EXP gained by +{%',                           base: 110,   isLinear: false, unlockAt: 700  },
  { index: 13, name: 'Soil EXP Superboost',   description: 'All plots of land gain +{% more Rank EXP',                            base: 520,   isLinear: false, unlockAt: 900  },
  { index: 14, name: 'Seed of Damage',        description: 'Gives a +{% Total Damage bonus to all characters',                    base: 20,    isLinear: true,  unlockAt: 1200 },
  { index: 15, name: 'Evolution Ultraboost',  description: 'Increases next crop chance by +{% multiplicatively!',                  base: 40000, isLinear: false, unlockAt: 1300 },
  { index: 16, name: 'Farmtastic Superboost', description: 'Increases Farming Skill EXP gained by +{%',                           base: 220,   isLinear: false, unlockAt: 1500 },
  { index: 17, name: 'Production Superboost', description: 'Increases the amount of crops harvested by +{%',                      base: 600,   isLinear: false, unlockAt: 1750 },
  { index: 18, name: 'Overgrowth Superboost', description: 'Increases chance for Overgrowth by +{%',                              base: 1500,  isLinear: false, unlockAt: 2000 },
  { index: 19, name: 'Seed of Stats',         description: 'Gives a +{% All Stat bonus to your characters',                       base: 5,     isLinear: true,  unlockAt: 3500 },
]


/**
 * Compute the bonus value for a land rank database upgrade.
 *
 * Formula matches toolbox: combinedMulti * (1.7 * base * level) / (level + 80)
 * where combinedMulti = Dank Ranks talent * Plump Database (see getRankMulti in utils/farmingUtils.js)
 *
 * @param {object} rankEntry     - entry from landRankMap
 * @param {number} upgradeLevel  - current upgrade level from save data
 * @param {number} combinedMulti - Dank Ranks * Plump Database multi (default 1)
 */
export const calcRankBonus = (rankEntry, upgradeLevel, combinedMulti = 1) => {
  if (!rankEntry?.base || !upgradeLevel) return 0
  const multi = Math.max(1, combinedMulti)
  return rankEntry.isLinear
    ? multi * rankEntry.base * upgradeLevel
    : multi * (1.7 * rankEntry.base * upgradeLevel) / (upgradeLevel + 80)
}
