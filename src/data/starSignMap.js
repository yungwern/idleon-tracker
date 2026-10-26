// ============================================================
// STAR SIGNS
// By star sign index: PVtStarSign_i lists the indexes character i has equipped, StarSg holds
// unlocked names, and Infinite Stars counts from index 0. From IdleonToolbox shared-data starSigns.
// ============================================================

export const starSignMap = [
  {
    name: 'The_Buff_Guy',
    bonuses: [{ effect: 'Total_Damage', bonus: 1 }, { effect: 'STR', bonus: 3 }],
  },
  {
    name: 'Flexo_Bendo',
    bonuses: [{ effect: 'Movement_Speed', bonus: 2 }, { effect: 'AGI', bonus: 3 }],
  },
  {
    name: 'The_Book_Worm',
    bonuses: [{ effect: 'Class_EXP_Gain', bonus: 1 }, { effect: 'WIS', bonus: 3 }],
  },
  {
    name: 'The_Fuzzy_Dice',
    bonuses: [{ effect: 'Talent_Points', bonus: 3 }, { effect: 'LUK', bonus: 3 }],
  },
  {
    name: 'Dwarfo_Beardus',
    bonuses: [{ effect: 'Mining_Efficency', bonus: 5 }, { effect: 'Multi', bonus: 20 }],
  },
  {
    name: 'Hipster_Logger',
    bonuses: [{ effect: 'Chop_Efficiency', bonus: 5 }, { effect: 'Multi', bonus: 20 }],
  },
  {
    name: 'Pie_Seas',
    bonuses: [{ effect: 'Fishin_Efficency', bonus: 5 }, { effect: 'Multi', bonus: 20 }],
  },
  {
    name: 'Shoe_Fly',
    bonuses: [{ effect: 'Catch_Efficiency', bonus: 5 }, { effect: 'Multi', bonus: 20 }],
  },
  {
    name: 'Blue_Hedgehog',
    bonuses: [{ effect: 'Movement_Speed', bonus: 4 }, { effect: 'Ring_Drop', bonus: 0.0001 }],
  },
  {
    name: 'Gum_Drop',
    bonuses: [{ effect: 'to_get_a_Time', bonus: 20 }, { effect: 'when_claiming', bonus: 0 }, { effect: 'Hour_AFK_gains', bonus: 8 }],
  },
  {
    name: 'Activelius',
    bonuses: [{ effect: 'Class_EXP_when', bonus: 15 }, { effect: 'actively', bonus: 0 }],
  },
  {
    name: 'Pack_Mule',
    bonuses: [{ effect: 'Carry_Cap', bonus: 10 }],
  },
  {
    name: 'Ned_Kelly',
    bonuses: [{ effect: 'Defence', bonus: 6 }, { effect: 'Weapon_Power', bonus: 2 }],
  },
  {
    name: 'Robinhood',
    bonuses: [{ effect: 'Accuracy', bonus: 4 }, { effect: 'Movement_Speed', bonus: 2 }, { effect: 'Cant_Trade_GME', bonus: 1 }],
  },
  {
    name: 'Pirate_Booty',
    bonuses: [{ effect: 'Drop_Rate', bonus: 5 }],
  },
  {
    name: 'Muscle_Man',
    bonuses: [{ effect: 'STR', bonus: 8 }],
  },
  {
    name: 'Fast_Frog',
    bonuses: [{ effect: 'AGI', bonus: 8 }],
  },
  {
    name: 'Smart_Stooge',
    bonuses: [{ effect: 'WIS', bonus: 8 }],
  },
  {
    name: 'Lucky_Larry',
    bonuses: [{ effect: 'LUK', bonus: 8 }],
  },
  {
    name: 'Silly_Snoozer',
    bonuses: [{ effect: 'Fight_AFK_Gain', bonus: 2 }],
  },
  {
    name: 'The_Big_Comatose',
    bonuses: [{ effect: 'Skill_AFK_Gain', bonus: 2 }],
  },
  {
    name: 'Miniature_Game',
    bonuses: [{ effect: 'minigame_reward', bonus: 30 }],
  },
  {
    name: 'Mount_Eaterest',
    bonuses: [{ effect: 'chance_to_not', bonus: 10 }, { effect: 'food', bonus: 0 }, { effect: 'All_Food_Effect', bonus: 15 }],
  },
  {
    name: 'Bob_Build_Guy',
    bonuses: [{ effect: 'Speed_in_Town', bonus: 10 }, { effect: '', bonus: 0 }],
  },
  {
    name: 'The_Big_Brain',
    bonuses: [{ effect: 'Class_EXP_gain', bonus: 3 }],
  },
  {
    name: 'The_OG_Skiller',
    bonuses: [{ effect: 'Carry_Cap', bonus: 5 }, { effect: 'Skill_AFK_gain', bonus: 1 }, { effect: 'All_Skill_Prowess', bonus: 2 }],
  },
  {
    name: 'Grim_Reaper',
    bonuses: [{ effect: 'Mob_Respawn_rate', bonus: 2 }],
  },
  {
    name: 'The_Fallen_Titan',
    bonuses: [{ effect: 'Boss_Damage', bonus: 3 }, { effect: 'Crit_Chance', bonus: 4 }],
  },
  {
    name: 'The_Forsaken',
    bonuses: [{ effect: 'Total_HP', bonus: -80 }, { effect: 'Defence', bonus: -50 }, { effect: 'Fight_AFK_Gain', bonus: 6 }],
  },
  {
    name: 'Mr_No_Sleep',
    bonuses: [{ effect: 'AFK_Gain', bonus: -6 }, { effect: 'Carry_Cap', bonus: 30 }],
  },
  {
    name: 'Sir_Savvy',
    bonuses: [{ effect: 'Skill_EXP_gain', bonus: 3 }],
  },
  {
    name: 'All_Rounder',
    bonuses: [{ effect: 'All_Stats', bonus: 4 }],
  },
  {
    name: 'Fatty_Doodoo',
    bonuses: [{ effect: 'Movement_Speed', bonus: -3 }, { effect: 'Defence', bonus: 5 }, { effect: 'Total_Damage', bonus: 2 }],
  },
  {
    name: 'Chronus_Cosmos',
    bonuses: [{ effect: 'characters_can', bonus: 0 }, { effect: 'align_with_', bonus: 2 }, { effect: 'Signs_at_once', bonus: 0 }],
  },
  {
    name: 'All_Rounderi',
    bonuses: [{ effect: 'All_Stat', bonus: 1 }, { effect: 'STR', bonus: 0 }],
  },
  {
    name: 'Centaurii',
    bonuses: [{ effect: 'Accuracy', bonus: 10 }],
  },
  {
    name: 'Murmollio',
    bonuses: [{ effect: 'Defence', bonus: 10 }],
  },
  {
    name: 'Strandissi',
    bonuses: [{ effect: 'STR', bonus: 3 }],
  },
  {
    name: 'Agitagi',
    bonuses: [{ effect: 'AGI', bonus: 3 }],
  },
  {
    name: 'Wispommo',
    bonuses: [{ effect: 'WIS', bonus: 3 }],
  },
  {
    name: 'Lukiris',
    bonuses: [{ effect: 'LUK', bonus: 3 }],
  },
  {
    name: 'Pokaminni',
    bonuses: [{ effect: 'Card_Drop', bonus: 15 }, { effect: 'of_Dungeons', bonus: 0 }],
  },
  {
    name: 'Gor_Bowzor',
    bonuses: [{ effect: 'Boss_Damage', bonus: 3 }],
  },
  {
    name: 'Hydron_Cosmos',
    bonuses: [{ effect: 'characters_can', bonus: 0 }, { effect: 'align_with_', bonus: 3 }, { effect: 'Signs_at_once', bonus: 0 }],
  },
  {
    name: 'Trapezoidburg',
    bonuses: [{ effect: 'Critters', bonus: 2 }, { effect: 'Trap_Efficiency', bonus: 10 }],
  },
  {
    name: 'Sawsaw_Salala',
    bonuses: [{ effect: 'Construct_Exp', bonus: 25 }],
  },
  {
    name: 'Preys_Bea',
    bonuses: [{ effect: 'Worship_Efficiency', bonus: 15 }, { effect: 'Worship_EXP', bonus: 15 }],
  },
  {
    name: 'Cullingo',
    bonuses: [{ effect: 'Total_Multikill', bonus: 15 }],
  },
  {
    name: 'Gum_Drop_Major',
    bonuses: [{ effect: 'to_get_a_Time', bonus: 40 }, { effect: 'when_claiming', bonus: 0 }, { effect: 'Hour_AFK_gains', bonus: 40 }],
  },
  {
    name: 'Grim_Reaper_Major',
    bonuses: [{ effect: 'Mob_Respawn_rate', bonus: 4 }, { effect: 'Lv', bonus: 60 }],
  },
  {
    name: 'Sir_Savvy_Major',
    bonuses: [{ effect: 'Skill_EXP_gain', bonus: 6 }, { effect: 'Lv', bonus: 70 }],
  },
  {
    name: 'The_Bulwark',
    bonuses: [{ effect: 'Total_Damage', bonus: 20 }, { effect: 'Movement_Speed', bonus: -12 }],
  },
  {
    name: 'Big_Brain_Major',
    bonuses: [{ effect: 'Class_EXP_gain', bonus: 6 }, { effect: 'Lv', bonus: 80 }],
  },
  {
    name: 'The_Fiesty',
    bonuses: [{ effect: 'Total_Damage', bonus: 6 }],
  },
  {
    name: 'The_Overachiever',
    bonuses: [{ effect: 'Total_Damage', bonus: 15 }, { effect: 'Fight_AFK_Gain', bonus: -7 }],
  },
  {
    name: 'Comatose_Major',
    bonuses: [{ effect: 'Skill_AFK_Gain', bonus: 4 }, { effect: 'Lv', bonus: 90 }],
  },
  {
    name: 'S._Snoozer_Major',
    bonuses: [{ effect: 'Fight_AFK_Gain', bonus: 4 }, { effect: 'Lv', bonus: 100 }],
  },
  {
    name: 'Breedabilli',
    bonuses: [{ effect: 'Breedable_Spd', bonus: 35 }, { effect: 'Shiny_Mob_LV_spd', bonus: 15 }],
  },
  {
    name: 'Gordonius_Major',
    bonuses: [{ effect: 'Cooking_SPD', bonus: 15 }, { effect: '', bonus: 0 }],
  },
  {
    name: 'Power_Bowower',
    bonuses: [{ effect: 'Mob_DMG_for', bonus: 30 }, { effect: 'Skill', bonus: 0 }],
  },
  {
    name: 'Scienscion',
    bonuses: [{ effect: 'Lab_EXP_Gain', bonus: 20 }],
  },
  {
    name: 'Artifosho',
    bonuses: [{ effect: 'Artifact_Find', bonus: 15 }, { effect: '', bonus: 0 }, { effect: '', bonus: 0 }],
  },
  {
    name: 'Divividov',
    bonuses: [{ effect: 'Divinity_EXP', bonus: 30 }],
  },
  {
    name: 'C._Shanti_Minor',
    bonuses: [{ effect: 'Sailing_SPD', bonus: 20 }],
  },
  {
    name: 'Muscle_Magnus',
    bonuses: [{ effect: 'STR', bonus: 50 }],
  },
  {
    name: 'Cropiovo_Minor',
    bonuses: [{ effect: 'Crop_Evo', bonus: 3 }, { effect: 'per_Farming_LV', bonus: 0 }],
  },
  {
    name: 'Fabarmi',
    bonuses: [{ effect: 'Farming_EXP', bonus: 20 }],
  },
  {
    name: 'O.G._Signalais',
    bonuses: [{ effect: 'OG_Chance', bonus: 15 }],
  },
  {
    name: 'Lightspeed_Frog',
    bonuses: [{ effect: 'AGI', bonus: 50 }],
  },
  {
    name: 'Beanbie_Major',
    bonuses: [{ effect: 'Golden_Food', bonus: 20 }, { effect: '', bonus: 0 }],
  },
  {
    name: 'Damarian_Major',
    bonuses: [{ effect: 'Total_Damage', bonus: 25 }],
  },
  {
    name: 'Lotto_Larrinald',
    bonuses: [{ effect: 'LUK', bonus: 50 }],
  },
  {
    name: 'Intellostooge',
    bonuses: [{ effect: 'WIS', bonus: 50 }],
  },
  {
    name: 'S._Tealio',
    bonuses: [{ effect: 'Ninja_Twin', bonus: 12 }, { effect: '', bonus: 0 }],
  },
  {
    name: 'Sneekee_E._X.',
    bonuses: [{ effect: 'Sneaking_EXP', bonus: 15 }],
  },
  {
    name: 'Jadaciussi',
    bonuses: [{ effect: 'Jade_Gain', bonus: 10 }, { effect: '', bonus: 0 }],
  },
  {
    name: 'Druipi_Major',
    bonuses: [{ effect: 'Drop_Rate', bonus: 12 }],
  },
  {
    name: 'Sumo_Magno',
    bonuses: [{ effect: 'Summoning_EXP', bonus: 20 }],
  },
  {
    name: 'Killian_Maximus',
    bonuses: [{ effect: 'Multikill_Per_Tier', bonus: 3 }],
  },
  {
    name: 'Seraph_Cosmos',
    bonuses: [{ effect: 'characters_now_get', bonus: 0 }, { effect: 'Star_Sign_bonuses', bonus: 1.1 }, { effect: '', bonus: 20 }],
  },
  {
    name: 'Glimmer_of_Beyond',
    bonuses: [],
  },
  {
    name: 'Fillerz48',
    bonuses: [],
  },
  {
    name: 'Fillerz49',
    bonuses: [],
  },
  {
    name: 'Fillerz50',
    bonuses: [],
  },
  {
    name: 'Fillerz51',
    bonuses: [],
  },
  {
    name: 'Fillerz52',
    bonuses: [],
  },
  {
    name: 'Fillerz53',
    bonuses: [],
  },
  {
    name: 'Fillerz54',
    bonuses: [],
  },
  {
    name: 'Fillerz55',
    bonuses: [],
  },
  {
    name: 'Fillerz56',
    bonuses: [],
  },
  {
    name: 'Fillerz57',
    bonuses: [],
  },
  {
    name: 'Fillerz58',
    bonuses: [],
  },
  {
    name: 'Fillerz59',
    bonuses: [],
  },
  {
    name: 'Fillerz32',
    bonuses: [],
  },
]
