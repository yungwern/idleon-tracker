// ============================================================
// UPGRADE VAULT
// Upgrades by save index (UpgVault[index] = level). From IdleonToolbox shared-data upgradeVault.
// bonus = level × x5 × the vault mastery multi for its block (see utils/upgradeVaultUtils.js)
// ============================================================

export const upgradeVaultMap = [
  {
    name: 'Bigger Damage',
    x5: 1,
    description: '+{ Damage. Monsters hate this upgrade!',
  },
  {
    name: 'Natural Talent',
    x5: 1,
    description: '+{ Talent Points. Go spend them!',
  },
  {
    name: 'Monster Tax',
    x5: 2,
    description: '+{% Coins dropped by Monsters. Total Coin Bonus from@all@sources;~x',
  },
  {
    name: 'Wicked Smart',
    x5: 2,
    description: '+{% Class EXP Gain. Leveling up gives you Talent Pts!',
  },
  {
    name: 'Bullseye',
    x5: 1,
    description: '+{ Accuracy. Useful when you start missing!',
  },
  {
    name: 'Steel Guard',
    x5: 1,
    description: '+{ Defence. Useful when monsters start hurting!',
  },
  {
    name: 'Evolving Talent',
    x5: 1,
    description: '+{ Talent Points for Warrior, Archer, and Mage!',
  },
  {
    name: 'Massive Whirl',
    x5: 2,
    description: 'Whirl is 2x as big and can hit +{ more monsters!',
  },
  {
    name: 'Rapid Arrows',
    x5: 1,
    description: 'Piercing Arrow fires double arrows!',
  },
  {
    name: 'Dual Fireballs',
    x5: 1,
    description: 'Fireball casts in both directions at the same time!',
  },
  {
    name: 'Weapon Craft',
    x5: 10,
    description: 'All crafted weapons give +{% more damage. Go craft a new weapon at the Anvil in Codex',
  },
  {
    name: 'Carry Capacity',
    x5: 5,
    description: 'Can carry +{ more resources per slot! Craft Bags at the anvil to boost this way more!',
  },
  {
    name: 'Baby on Board',
    x5: 2,
    description: '+{% Class EXP Gain for your Lowest LV Player',
  },
  {
    name: 'Major Discount',
    x5: 4,
    description: 'All upgrades in the Vault are $% cheaper',
  },
  {
    name: 'Bored to Death',
    x5: 5,
    description: '+{% Coins from Monsters per POW 10 Bean Kills. $% Coins',
  },
  {
    name: 'Knockout!',
    x5: 1,
    description: '+{% Total Damage per Knockout! Current Target:&  Total:+$% DMG',
  },
  {
    name: 'Stamp Bonanza',
    x5: 2,
    description: '}x higher bonuses from Sword, Heart, Target, and Shield Stamps',
  },
  {
    name: 'Mining Payday$',
    x5: 2,
    description: 'Boosts Coins based on total ores mined (Total:+^%) Go do the mining on your 2nd player!',
  },
  {
    name: 'Drops for Days',
    x5: 1,
    description: '+{% Drop Rate, also known by the IdleOn community as DR',
  },
  {
    name: 'Happy Doggy',
    x5: 2,
    description: '+{% Dog Happiness',
  },
  {
    name: 'Slice N Dice',
    x5: 2,
    description: '+{ Base Damage per POW 10 Carrot Kills. $ Dmg',
  },
  {
    name: 'Go Go Secret Owl',
    x5: 5,
    description: '+{% Feathers/sec for Orion the Horned Owl',
  },
  {
    name: 'Boss Decimation',
    x5: 1,
    description: '+{% Boss Damage',
  },
  {
    name: 'Sleepy Time',
    x5: 1,
    description: '+{% AFK Gains for Fighting and Skilling',
  },
  {
    name: 'Production Revolution',
    x5: 5,
    description: '+{% faster Anvil Production',
  },
  {
    name: 'Statue Bonanza',
    x5: 2,
    description: '}x higher bonuses from Power, Speed, Mining, and Lumberbob Statues',
  },
  {
    name: 'Beeg Forge',
    x5: 5,
    description: '+{% higher Forge Capacity',
  },
  {
    name: 'Stick Snapping',
    x5: 1,
    description: '+{% Total Damage per POW 10 Branch Kills. $% DMG',
  },
  {
    name: 'Liquid Knowledge',
    x5: 1,
    description: '+{% Alchemy EXP Gain',
  },
  {
    name: 'Bug Knowledge',
    x5: 1,
    description: '+{% Catching EXP Gain',
  },
  {
    name: 'Fish Knowledge',
    x5: 1,
    description: '+{% Fishing EXP Gain',
  },
  {
    name: 'Dirty Money',
    x5: 2,
    description: '+{% Coins from Monsters per POW 10 Poop Kills $% Coins',
  },
  {
    name: 'Vault Mastery',
    x5: 1,
    description: '}x higher bonuses from all the Vault Upgrades above with the Blue Highlight!!!',
  },
  {
    name: 'Storage Slots',
    x5: 1,
    description: '+{ more slots in your Storage Chest! Great for moving items between players!',
  },
  {
    name: 'Recipe for Profit',
    x5: 1,
    description: '+{% Coins per recipe unlocked from Taskboard! Total bonus:+$% Coins',
  },
  {
    name: "Schoolin' the Fish$",
    x5: 1,
    description: '+{% Class EXP per POW 10 fish caught. Total Bonus:+$% Class EXP',
  },
  {
    name: 'Straight to Storage',
    x5: 1,
    description: 'You can now deposit resources from AFK straight to storage. Other items will still drop on the ground.',
  },
  {
    name: 'Bubble Money',
    x5: 1,
    description: '+{% Coins from Mobs for each time you upgrade an Alchemy Bubble. Total Bonus:+$% Coins',
  },
  {
    name: 'Drip Drip Drip',
    x5: 5,
    description: '+{% faster Liquid Generation for Alchemy. This is one of the costs to upgrade bubbles!',
  },
  {
    name: 'Active Learning',
    x5: 2,
    description: '}x more Class EXP gained from defeating monsters while the game is open.',
  },
  {
    name: 'Stunning Talent',
    x5: 1,
    description: '+{ Talent Points for your Subclass. Talk to Specius in World 2 Map 3 to get your subclass!!!',
  },
  {
    name: 'Bug Power En Masse$',
    x5: 1,
    description: '+{% Total Damage per POW 10 bugs caught. Total Bonus:+$% DMG',
  },
  {
    name: 'Vial Overtune',
    x5: 10,
    description: 'All vials give }x higher bonuses.',
  },
  {
    name: 'Active Murdering',
    x5: 1,
    description: 'Killing monsters open portals }x faster while the game is open.',
  },
  {
    name: 'Card Retirement',
    x5: 1,
    description: 'Cards that give Card Drop Rate bonuses become PASSIVE, so you never need to equip them again!',
  },
  {
    name: 'Go Go Secret Kangaroo Mouse',
    x5: 10,
    description: '+{% Bluefish for Poppy the Kangaroo Mouse!',
  },
  {
    name: 'All Armoured Up',
    x5: 1,
    description: "All equipment gives }x more DEF stat. You'll need this to not die from monsters!",
  },
  {
    name: 'Daily Mailbox',
    x5: 1,
    description: 'Get { Post Office boxes every day you open up IdleOn and play it!',
  },
  {
    name: 'Buildie Sheepie',
    x5: 2,
    description: '+{% Construction SPD per POW 10 Sheepie Kills. $% Build SPD',
  },
  {
    name: 'Quest KAPOW!',
    x5: 1,
    description: "Raises the max LV of the star talent to { You'll see this star talent on Page 1.",
  },
  {
    name: "Critters 'n Souls",
    x5: 1,
    description: '+{% more Critters and Souls from all sources!',
  },
  {
    name: 'Slight Do-Over',
    x5: 1,
    description: 'Hold down on a Talent to refund, doable { times every day. This will refund the points!',
  },
  {
    name: 'Duplicate Entries',
    x5: 1,
    description: 'Whenever you get new colosseum tickets, you get DOUBLE the amount!',
  },
  {
    name: 'Special Talent',
    x5: 1,
    description: '+{ Star Talent Points',
  },
  {
    name: 'Kitchen Dream-mare',
    x5: 6,
    description: '}x meal cooking speed Go on lad, turn that kitchen around!',
  },
  {
    name: 'Lab Knowledge',
    x5: 1,
    description: '+{% Lab EXP Gain for all players',
  },
  {
    name: 'Foraging Forever',
    x5: 1,
    description: '+{% Foraging Speed for all Mobs, so you can gather spices so much faster!',
  },
  {
    name: 'Teh TOM',
    x5: 2,
    description: '+{ Tome Score. Maybe this will get you into the Top 1% Score of all IdleOn players?',
  },
  {
    name: 'Pet Punchies',
    x5: 2,
    description: '+{% Mob Damage for all Mobs, so you can win Mob battles easier and collect new spices!',
  },
  {
    name: 'Breeding Knowledge',
    x5: 2,
    description: '+{% Breeding EXP Gain. Also, rare eggs now have a HUGE exp multi!',
  },
  {
    name: 'Cooking Knowledge',
    x5: 2,
    description: '+{% Cooking EXP Gain. This bonus is weird, it actually goes up faster the more you level it!',
  },
  {
    name: 'Vault Mastery II',
    x5: 1,
    description: '}x higher bonuses from all the Vault Upgrades above with the Green Highlight!!!',
  },
  {
    name: 'Speedy Sailing',
    x5: 1,
    description: '+{% Faster Sailing speed for all boats! Faster trips mean more CHESTS!',
  },
  {
    name: 'Artifact Find Chance',
    x5: 1,
    description: '+{% higher chance of finding Artifacts, which is the entire point of Sailing!',
  },
  {
    name: 'Skulltrick',
    x5: 1,
    description: 'All monster kills count for +{% more for opening Portals to the next map!',
  },
  {
    name: 'Go Go Bubba the Seal',
    x5: 10,
    description: '}x Meat Slices for Bubba the Seal!',
  },
  {
    name: 'Ocean Knowledge',
    x5: 1,
    description: '+{% Sailing EXP Gain',
  },
  {
    name: 'Sailing Loot',
    x5: 2,
    description: 'Find +{% more treasure when opening Chests! This loot is spent upgrading Sailing Boats.',
  },
  {
    name: 'Mega Bits',
    x5: 5,
    description: 'Gain }x more Bits! This is the currency you use for all upgrades within Gaming.',
  },
  {
    name: 'Gamer Knowledge',
    x5: 1,
    description: '+{% Gaming EXP Gain',
  },
  {
    name: 'Collection Cashout',
    x5: 1,
    description: "Monsters drop +{% more coins for every card You've found. Total Bonus:+$% Coins",
  },
  {
    name: 'Divinity Points',
    x5: 2,
    description: 'Gain +{% more Points in Divinity, used to unlock new Divine gods to link to!',
  },
  {
    name: 'Divine Knowledge',
    x5: 1,
    description: '+{% Divinity EXP Gain',
  },
  {
    name: 'Smarter Villagers',
    x5: 1,
    description: '+{% EXP gain for all Villagers!',
  },
  {
    name: 'Super Slab',
    x5: 1,
    description: 'All Slab bonuses are }x larger. You can see these at the top of your Slab in W5 town.',
  },
  {
    name: 'Better Captains',
    x5: 1,
    description: 'You Sailing Captains gain +{% more EXP from each trip they make!',
  },
  {
    name: 'Big Blessings',
    x5: 1,
    description: 'All Divinity Blessings have a +{ higher Max LV!',
  },
  {
    name: 'Farming Knowledge',
    x5: 1,
    description: '+{% Farming EXP Gain',
  },
  {
    name: 'Croppius Evolvius',
    x5: 8,
    description: '}x higher Evo Chance for all Farming crops!',
  },
  {
    name: 'Properly Funded Research',
    x5: 1,
    description: 'All Crop Depot bonuses are +{% higher!',
  },
  {
    name: 'Raw Damage',
    x5: 2,
    description: "+{% Damage for all players. This is indeed additive, don't get too excited.",
  },
  {
    name: 'Finders Keepers',
    x5: 1,
    description: '+{% more Jade gained from Sneaking! Use these to upgrade your Ninja Twins!',
  },
  {
    name: 'Sneaking Knowledge',
    x5: 1,
    description: '+{% Seanking EXP Gain',
  },
  {
    name: 'White Essentials',
    x5: 1,
    description: 'Generate +{% more White Essence per hour to spend on Summoning upgrades!',
  },
  {
    name: 'Summoning Knowledge',
    x5: 1,
    description: '+{% Summoning EXP Gain',
  },
  {
    name: 'Bigger Better Beans',
    x5: 2,
    description: 'Get +{% more Magic Beans to spend at the Night Market!',
  },
  {
    name: '24 Karat Foods',
    x5: 1,
    description: 'Golden Food bonuses are +{% bigger. This is extra powerful thanks to the Beanstalk!',
  },
  {
    name: 'Rest of the Essentials',
    x5: 1,
    description: 'Generate +{% more of the other Essence!',
  },
  {
    name: 'Topheavy Charms',
    x5: 1,
    description: 'Boost the max possible LV by +{ for all Sneaking Charms you find!',
  },
  {
    name: 'Vault Mastery III',
    x5: 1,
    description: '}x higher bonuses from all the Vault Upgrades above with the Red Highlight!!!',
  },
]
