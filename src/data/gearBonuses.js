// =========================
// GEAR BONUSES
// =========================
// Misc bonus values per item ID, sourced from IdleOn Toolbox website-data.json
// Format: { 'Bonus Category': { value: number, type: 'additive' | 'multi' } }
// Only items with at least one misc bonus are listed here.
//
// Bonus category notes:
// - 'AFK Gains' covers both All AFK Gain (additive) and AFK Gain Multi (multi)
// - 'Damage' covers both Total Damage (additive) and Damage Multi (multi)
// - Multi pieces are always ranked above additive when optimizing
// - 'Skill AFK Gain' is separate from 'AFK Gains' — skilling characters only

export const GEAR_BONUSES = {

  // ── Helmets ──
  // Platinum Helmet
  EquipmentHats19: { 'Defence': { value: 5, type: 'additive' } },
  // Gold Helmet
  EquipmentHats28: { 'Defence': { value: 3, type: 'additive' } },
  // Efaunt Helmet
  EquipmentHats52: { 'Drop Rate': { value: 5, type: 'additive' } },
  // Dementia Helmet
  EquipmentHats53: { 'Defence': { value: 6, type: 'additive' } },
  // Void Imperium Helmet
  EquipmentHats54: { 'Defence': { value: 8, type: 'additive' } },
  // Mark of Member
  EquipmentHats61: { 'XP From Monsters': { value: 15, type: 'additive' } },
  // Chizoar Helmet
  EquipmentHats68: { 'Damage': { value: 15, type: 'additive' } },
  // Lustre Veil
  EquipmentHats70: { 'Defence': { value: 12, type: 'additive' } },
  // Diabolical Headcase
  EquipmentHats71: { 'Defence': { value: 16, type: 'additive' } },
  // Thin Veil of the Troll
  EquipmentHats74: { 'All Stats': { value: 4, type: 'additive' } },
  // Magma Core Headdress
  EquipmentHats77: { 'All Stats': { value: 6, type: 'additive' } },
  // Skulled Helmet of the Divine
  EquipmentHats83: { 'Damage': { value: 30, type: 'additive' }, 'Drop Rate': { value: 10, type: 'additive' } },
  // Marbiglass Headdress
  EquipmentHats105: { 'All Stats': { value: 12, type: 'additive' }, 'Money': { value: 35, type: 'additive' } },
  // Crown of the Gods
  EquipmentHats106: { 'Drop Rate': { value: 15, type: 'additive' }, 'Multikill Per Tier': { value: 22, type: 'additive' } },
  // Emperor Kabuto
  EquipmentHats119: { 'Drop Rate': { value: 25, type: 'additive' }, 'Multikill Per Tier': { value: 30, type: 'additive' } },
  // Prehistoric Battlehair
  EquipmentHats123: { 'AFK Gains': { value: 25, type: 'additive' }, 'Class EXP': { value: 30, type: 'multi' } },

  // ── Chest ──
  // Chizoar Bodyplate
  EquipmentShirts6: { 'Mastery': { value: 7, type: 'additive' }, 'Damage': { value: 3, type: 'additive' } },
  // Efaunt Ribcage
  EquipmentShirts26: { 'Mastery': { value: 4, type: 'additive' } },
  // Member Hoodie
  EquipmentShirts31: { 'XP From Monsters': { value: 15, type: 'additive' } },
  // Lustre Chestplate
  EquipmentShirts32: { 'Defence': { value: 6, type: 'additive' } },
  // Diabolical Abdomen
  EquipmentShirts33: { 'Defence': { value: 11, type: 'additive' } },
  // Trollish Garb
  EquipmentShirts34: { 'All Stats': { value: 3, type: 'additive' } },
  // Magma Core Wavemaille
  EquipmentShirts35: { 'All Stats': { value: 4, type: 'additive' }, 'Damage': { value: 4, type: 'additive' } },
  // Serrated Chest of the Divine
  EquipmentShirts36: { 'Mob Respawn': { value: 8, type: 'additive' }, 'Damage': { value: 6, type: 'additive' } },
  // Marbiglass Tunic
  EquipmentShirts37: { 'All Stats': { value: 8, type: 'additive' }, 'Money': { value: 26, type: 'additive' } },
  // Robe of the Gods
  EquipmentShirts38: { 'Drop Rate': { value: 30, type: 'additive' }, 'Multikill Per Tier': { value: 16, type: 'additive' } },
  // Emperor Sokutai Ho
  EquipmentShirts39: { 'Drop Rate': { value: 40, type: 'additive' }, 'Multikill Per Tier': { value: 25, type: 'additive' } },
  // Prehistoric Parka
  EquipmentShirts41: { 'AFK Gains': { value: 20, type: 'additive' }, 'Class EXP': { value: 25, type: 'multi' } },

  // ── Pants ──
  // Dementia Shins
  EquipmentPants6: { 'Defence': { value: 3, type: 'additive' } },
  // Twisted Scales
  EquipmentPants8: { 'All Stats': { value: 3, type: 'additive' } },
  // Chizoar Scaled Leggings
  EquipmentPants9: { 'Mastery': { value: 7, type: 'additive' } },
  // Efaunt Hipilium
  EquipmentPants20: { 'Defence': { value: 5, type: 'additive' } },
  // Void Imperium Shardshins
  EquipmentPants21: { 'Defence': { value: 7, type: 'additive' } },
  // Lustre Scales
  EquipmentPants24: { 'Defence': { value: 9, type: 'additive' } },
  // Diabolical Trimed Leg Guards
  EquipmentPants25: { 'Defence': { value: 13, type: 'additive' } },
  // Magma Core Battleskirt
  EquipmentPants26: { 'All Stats': { value: 4, type: 'additive' }, 'Damage': { value: 4, type: 'additive' } },
  // Spiked Leggings of the Divine
  EquipmentPants27: { 'Mob Respawn': { value: 4, type: 'additive' }, 'Damage': { value: 6, type: 'additive' } },
  // Marbiglass Legplates
  EquipmentPants29: { 'All Stats': { value: 7, type: 'additive' }, 'Money': { value: 22, type: 'additive' } },
  // Tatters of the Gods
  EquipmentPants30: { 'Drop Rate': { value: 25, type: 'additive' }, 'Multikill Per Tier': { value: 14, type: 'additive' } },
  // Emperor Zubon
  EquipmentPants31: { 'Drop Rate': { value: 35, type: 'additive' }, 'Multikill Per Tier': { value: 20, type: 'additive' } },
  // Prehistoric Pantaloons
  EquipmentPants32: { 'AFK Gains': { value: 15, type: 'additive' }, 'Class EXP': { value: 20, type: 'multi' } },

  // ── Boots ──
  // Platinum Boots
  EquipmentShoes4: { 'Defence': { value: 5, type: 'additive' } },
  // Dementia Boots
  EquipmentShoes5: { 'Defence': { value: 7, type: 'additive' } },
  // Amarok Paws
  EquipmentShoes20: { 'Defence': { value: 3, type: 'additive' } },
  // Efaunts Broken Ankles
  EquipmentShoes21: { 'Movement Speed': { value: 2, type: 'additive' } },
  // Void Imperium Kicks
  EquipmentShoes22: { 'Defence': { value: 8, type: 'additive' } },
  // Chizoar Walkers
  EquipmentShoes23: { 'Mastery': { value: 5, type: 'additive' } },
  // Lustre Shieldshoe
  EquipmentShoes24: { 'Defence': { value: 10, type: 'additive' } },
  // Diabolical Toe Tips
  EquipmentShoes25: { 'Defence': { value: 13, type: 'additive' } },
  // Soles of the Troll
  EquipmentShoes34: { 'All Stats': { value: 3, type: 'additive' } },
  // Magma Core Lavarunners
  EquipmentShoes35: { 'All Stats': { value: 4, type: 'additive' }, 'Damage': { value: 4, type: 'additive' } },
  // Devious Slippers of the Divine
  EquipmentShoes36: { 'Drop Rate': { value: 15, type: 'additive' }, 'Damage': { value: 8, type: 'additive' } },
  // Marbiglass Soles
  EquipmentShoes37: { 'All Stats': { value: 7, type: 'additive' }, 'Money': { value: 25, type: 'additive' } },
  // Drip of the Gods
  EquipmentShoes38: { 'Drop Rate': { value: 30, type: 'additive' }, 'Multikill Per Tier': { value: 12, type: 'additive' } },
  // Emperor Geta
  EquipmentShoes40: { 'Drop Rate': { value: 40, type: 'additive' }, 'Multikill Per Tier': { value: 20, type: 'additive' } },
  // Prehistoric Bracers
  EquipmentShoes41: { 'AFK Gains': { value: 10, type: 'additive' }, 'Class EXP': { value: 15, type: 'multi' } },

  // ── Pendants ──
  // The Divine Scarf
  EquipmentPendant30: { 'AFK Gains': { value: 25, type: 'additive' } },
  // Deathbloom Flower Pendant
  EquipmentPendant31: { 'Damage': { value: 30, type: 'multi' }, 'Mob Respawn': { value: 20, type: 'additive' } },
  // Bramble of the Emperor
  EquipmentPendant35: { 'Skill AFK Gain': { value: 50, type: 'additive' }, 'Skill Efficiency': { value: 25, type: 'additive' } },

  // ── Rings ──
  // Chef Ring
  EquipmentRings25: { 'Cooking Efficiency': { value: 400, type: 'additive' } },
  // Serrated Rex Ring
  EquipmentRings26: { 'Skill Efficiency': { value: 8, type: 'additive' } },
  // Demented Opal Ring
  EquipmentRings36: { 'All Stats': { value: 10, type: 'additive' }, 'Damage': { value: 1, type: 'multi' } },

  // ── Mining ──
  // Platinum Pickaxe
  EquipmentTools6: { 'Mining Efficiency': { value: 1, type: 'additive' } },
  // Dementia Pickaxe
  EquipmentTools7: { 'Mining Efficiency': { value: 2, type: 'additive' } },
  // Void Imperium Pik
  EquipmentTools11: { 'Mining Efficiency': { value: 8, type: 'additive' } },
  // Lustre Pickaxe
  EquipmentTools8: { 'Mining Efficiency': { value: 12, type: 'additive' } },
  // Starfire Pickaxe
  EquipmentTools12: { 'Mining Efficiency': { value: 16, type: 'additive' } },
  // Dreadlo Pickolo
  EquipmentTools9: { 'Mining Efficiency': { value: 20, type: 'additive' } },
  // Marbiglass Pickaxe
  EquipmentTools14: { 'Mining Efficiency': { value: 25, type: 'additive' }, 'Money': { value: 10, type: 'additive' } },
  // Destroyer of the Mollo Gomme
  EquipmentTools15: { 'Mining Efficiency': { value: 35, type: 'additive' }, 'Drop Rate': { value: 10, type: 'additive' } },
  // Prehistoric Pickaxe
  EquipmentTools16: { 'Mining Efficiency': { value: 50, type: 'additive' }, 'Damage': { value: 2, type: 'additive' } },

  // ── Chopping ──
  // Marbiglass Hatchet
  EquipmentToolsHatchet12: { 'Chop Efficiency': { value: 5, type: 'additive' }, 'Money': { value: 10, type: 'additive' } },
  // Annihilator of the Yggdrasil
  EquipmentToolsHatchet10: { 'Chop Efficiency': { value: 12, type: 'additive' }, 'Drop Rate': { value: 10, type: 'additive' } },
  // Prehistoric Choppah
  EquipmentToolsHatchet13: { 'Chop Efficiency': { value: 25, type: 'additive' }, 'Damage': { value: 2, type: 'additive' } },

  // ── Fishing ──
  // Marbiglass Rod
  FishingRod11: { 'Fishing Efficiency': { value: 5, type: 'additive' }, 'Money': { value: 10, type: 'additive' } },
  // Angler of the Iliunne
  FishingRod12: { 'Fishing Efficiency': { value: 12, type: 'additive' }, 'Drop Rate': { value: 10, type: 'additive' } },
  // Prehistoric Rod
  FishingRod13: { 'Fishing Efficiency': { value: 25, type: 'additive' }, 'Damage': { value: 2, type: 'additive' } },

  // ── Catching ──
  // Marbiglass Netting
  CatchingNet11: { 'Catch Efficiency': { value: 5, type: 'additive' }, 'Money': { value: 15, type: 'additive' } },
  // Wrangler of the Qoxzul
  CatchingNet12: { 'Catch Efficiency': { value: 12, type: 'additive' }, 'Drop Rate': { value: 10, type: 'additive' } },
  // Prehistoric Netting
  CatchingNet13: { 'Catch Efficiency': { value: 25, type: 'additive' }, 'Damage': { value: 2, type: 'additive' } },

  // ── Worship ──
  // Dreadnaught Skull
  WorshipSkull9: { 'Damage': { value: 3, type: 'additive' }, 'All Stats': { value: 3, type: 'additive' } },
  // Cultist Skull
  WorshipSkull10: { 'Money': { value: 15, type: 'additive' } },
  // Crystal Skull of Esquire Vnoze
  WorshipSkull11: { 'AFK Gains': { value: 4, type: 'additive' }, 'Drop Rate': { value: 10, type: 'additive' } },
  // Prehistoric Skull
  WorshipSkull12: { 'AFK Gains': { value: 6, type: 'additive' }, 'Damage': { value: 5, type: 'additive' } },

  // ── Traps ──
  // Forbidden Traps
  TrapBoxSet9: { 'Money': { value: 15, type: 'additive' } },
  // Containment of the Zrgyios
  TrapBoxSet10: { 'AFK Gains': { value: 4, type: 'additive' }, 'Drop Rate': { value: 10, type: 'additive' } },
  // Prehistoric Traps
  TrapBoxSet11: { 'AFK Gains': { value: 6, type: 'additive' }, 'Damage': { value: 5, type: 'additive' } },

};