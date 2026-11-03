// ============================================================
// THE HOLE (World 5 caverns): villagers, caverns and their text
// Villagers/caverns are handwritten; everything under "Generated" comes from IdleonToolbox
// data/website-data (holesInfo.json, shared-data.json) via IdleOn Resources/gen_hole.py.
// Text only; the math lives in utils/holeUtils.js.
// ============================================================

// ── Villagers ──
// Save index = Holes[1..3] slot (LV, EXP, opals invested). tab = our page tab. Names, unlock caverns, opal
// rates and Parallel Villager tiers are from SolarFrost's Camp guide (Eli's screenshot, v2.20).
// Librarian (Bolaia) isn't in that guide yet: unlock and rate left null.
export const holeVillagers = [
  {
    id: 0,
    tab: 'explore',
    tabLabel: 'Explore',
    name: 'Polonai',
    role: 'Explorer of the Hole',
    unlockCavern: 0,
    opalRate: '15% - 30%',
    parallelTier: 'A',
    info: 'Each LV unlocks a new cavern, the only way to get new caverns. Balance him with the other villagers: new caverns mean new opal sources, but the others give crucial buffs.',
  },
  {
    id: 1,
    tab: 'engineer',
    tabLabel: 'Engineer',
    name: 'Kaipu',
    role: 'Engineer of Schematics',
    unlockCavern: 2,
    opalRate: '35% - 60%',
    parallelTier: 'S+',
    info: 'Each LV unlocks 3 schematics to build, +1 every 5th LV. Schematics are crucial for Hole progress and also boost normal IdleOn stats.',
  },
  {
    id: 2,
    tab: 'bonuses',
    tabLabel: 'Bonuses',
    name: 'Cosmo',
    role: 'Conjuror of Bonuses',
    unlockCavern: 5,
    opalRate: '10% - 20%',
    parallelTier: 'C',
    info: 'Each LV gives 1 Conjuror Point for Hole, Villager or IdleOn Majiks. Levels slower than the others. Tip: 1-3 points on Villager Majiks early, then 2 on Divinity Linking (IdleOn Majiks).',
  },
  {
    id: 3,
    tab: 'measure',
    tabLabel: 'Measure',
    name: 'Minau',
    role: 'Taker of Measurement',
    unlockCavern: 7,
    opalRate: '25% - 40%',
    parallelTier: 'S+',
    info: 'Each LV unlocks a Measure: a cavern-resource sink whose bonus is multiplied by an IdleOn stat (Tome score, Death Note points, ...). Villager EXP Gain is the most important one.',
  },
  {
    id: 4,
    tab: 'studies',
    tabLabel: 'Studies',
    name: 'Bolaia',
    role: 'Librarian',
    unlockCavern: 12,
    opalRate: null,
    parallelTier: 'S+',
    info: 'Send him to study one cavern at a time to unlock its study bonus. Each LV boosts his study rate by +5%.',
  },
]

// ── Caverns ──
// Biomes in game order (Toolbox getStudies locations); shortName = tab label. Cavern id = save index everywhere (Holes[7] opals
// found, Holes[26] study, Cavern_<id>.png). Guide text for caverns 0-9 is from SolarFrost's Biome 1/2
// guide (Eli's screenshots); the rest is short until we build them out.
export const holeBiomes = [
  { id: 'shallow', name: 'Shallow Caverns', shortName: 'Shallow' },
  { id: 'glowshroom', name: 'Glowshroom Tunnels', shortName: 'Glowshroom' },
  { id: 'overgrowth', name: 'Underground Overgrowth', shortName: 'Overgrowth' },
  { id: 'sentinel', name: 'Sentinel Caverns', shortName: 'Sentinel' },
]

export const holeCaverns = [
  {
    id: 0,
    name: 'The Well',
    biome: 'shallow',
    kind: 'Resource',
    opalSource: 'Trade Gravel for opals (the cost goes up with every opal).',
    guide: [
      'Buckets fill with Sediment over time. Each bucket either fills a chosen sediment or removes rock layers to unlock the next sediment.',
      'Speed = Bucket Fill Rate. Get more buckets and BFR at the Engineer, and unlock Bar Expansion upgrades as soon as you can (keep them on unless you\'re saving up).',
    ],
  },
  {
    id: 1,
    name: 'Motherlode',
    biome: 'shallow',
    kind: 'Skilling (Mining)',
    opalSource: 'Every Motherlode layer destroyed.',
    guide: [
      'An infinite mining node: collect the layer\'s ores, then press Destroy Layer. Extra ore does not carry over.',
      'Each layer needs more ore and more Mining Efficiency. AFK here like any mining node.',
    ],
  },
  {
    id: 2,
    name: 'The Den',
    biome: 'shallow',
    kind: 'Combat challenge',
    opalSource: 'Every high score threshold reached.',
    guide: [
      'Kill hounds for points before Fear fills the bar. Trying different Amplifier and Talent Bar setups can lead to higher scores.',
      'Amplifiers raise difficulty for a bigger score multi. Arcane Cultist, Royal Guardian, and Windwalker are the recommended class choices.',
    ],
  },
  {
    id: 3,
    name: 'Bravery',
    biome: 'shallow',
    kind: 'Monument',
    opalSource: 'Chance to show up as a monument bonus.',
    guide: [
      'AFK here for Respect bonuses, then play the sword story: Fight or Run Away before each battle.',
      'Fight if Sword Throws × 60% max damage beats the enemy HP, else run.',
      'Use your Sword Rerolls when the Sword damage is lower than 40-50% damage.'
    ],
  },
  {
    id: 4,
    name: 'The Bell',
    biome: 'shallow',
    kind: 'Bonus',
    opalSource: '+1 opal every Ping.',
    guide: [
      'Generates Ring, Ping, Clean and Renew rates for the selected action; click when the bar fills.',
      'Ring = +1 LV to a random bonus, Ping unlocks Opals, Clean unlocks improvements, Renew resets ring bonuses (you keep improvements and opals).',
    ],
  },
  {
    id: 5,
    name: 'The Harp',
    biome: 'glowshroom',
    kind: 'Resource',
    opalSource: '1 opal per successful Type D (Opal Twine) string played.',
    guide: [
      'Pluck the strings to make Notes. Each string gets a type; types level up as they\'re played.',
      'Strings level as they\'re plucked, and G gives EXP to every type. Which mix and order is best depends on your string LVs: see Best setup below. Get more strings ASAP.',
    ],
  },
  {
    id: 6,
    name: 'The Lamp',
    biome: 'glowshroom',
    kind: 'Bonus',
    opalSource: '1 opal per wish 2 (1,000,000 Opals) wished.',
    guide: [
      'Gives wishes every daily reset (pocket watches don\'t work here). Wishes change your cavern playstyle and give big IdleOn bonuses.',
      'Get as many wishes per day as you can (Bell, Measurer, Conjuror).',
      'Opal Calculator is only there to help you plan how long it will take to buy the next one. It doesn\'t mean it\'s always the best thing to buy.',
    ],
  },
  {
    id: 7,
    name: 'The Hive',
    biome: 'glowshroom',
    kind: 'Skilling (Catching)',
    opalSource: '1 opal per hive harvested.',
    guide: [
      'An infinite catching node that works just like the Motherlode. AFK here like a normal catching node.',
    ],
  },
  {
    id: 8,
    name: 'Grotto',
    biome: 'glowshroom',
    kind: 'Combat',
    opalSource: '1 opal per colony conquered.',
    guide: [
      'Kill the colony, then press Challenge the Monarch (a tanky giant) for the next colony tier.',
      'AFK is better than active (slow respawns). Gloomie Mushroom card: +5% Villager EXP per tier. Unique drop: Villager statue.',
    ],
  },
  {
    id: 9,
    name: 'Justice',
    biome: 'glowshroom',
    kind: 'Monument',
    opalSource: 'Chance for Justice opals.',
    guide: [
      'The second monument: AFK for Respect bonuses, then play its story (cases in court).',
    ],
    link: {
      text: 'Not sure which choice to pick in a case? This helper tells you:',
      label: 'IdleOn Justice helper',
      url: 'https://idleon-justice.vercel.app/',
    },
  },
  {
    id: 10,
    name: 'The Jars',
    biome: 'overgrowth',
    kind: 'Resource',
    opalSource: 'Some jars have a chance to hold an opal.',
    guide: [
      'Make and break jars for Rupies, opals and collectibles. Collectibles give permanent bonuses and can be enchanted.',
    ],
  },
  {
    id: 11,
    name: 'Evertree',
    biome: 'overgrowth',
    kind: 'Skilling (Choppin)',
    opalSource: null,
    guide: [
      'An infinite choppin node that works like the Motherlode, one trunk at a time.',
    ],
  },
  {
    id: 12,
    name: 'Wisdom',
    biome: 'overgrowth',
    kind: 'Monument',
    opalSource: 'Chance for Wisdom opals.',
    guide: [
      'The third monument: AFK for Respect bonuses, then play its daily story (a matching game).',
    ],
  },
  {
    id: 13,
    name: 'Gambit',
    biome: 'overgrowth',
    kind: 'Challenge',
    opalSource: null,
    guide: [
      'Daily timed trials. Your best time on each one gives Gambit Points, and points give Summoning Doublers (World 6 > Summoning > Doublers).',
    ],
  },
  {
    id: 14,
    name: 'The Temple',
    biome: 'overgrowth',
    kind: 'Combat',
    opalSource: null,
    guide: [
      'Ancient Golems drop torches. Spend torches on Illuminate / Search / Amplify to push deeper layers.',
    ],
  },
  {
    id: 15,
    name: 'Fountain',
    biome: 'sentinel',
    kind: 'Resource',
    opalSource: null,
    guide: [
      'Coins pile up in the fountain\'s spaces. Three water types each have 20 upgrades, which can be Marbleized for a bigger bonus.',
    ],
  },
  {
    id: 16,
    name: 'Trench',
    biome: 'sentinel',
    kind: 'Skilling (Fishing)',
    opalSource: null,
    guide: [
      'The Bottomless Trench: an infinite fishing node that works like the Motherlode, one depth at a time.',
    ],
  },
  {
    id: 17,
    name: 'The Lair',
    biome: 'sentinel',
    kind: 'Shop',
    opalSource: null,
    guide: [
      'Home of the Crystal Glunko upgrades (the save calls this cavern THE_COVE).',
    ],
  },
]

// The Well sediments in save order (Holes[9][0..9], icons images/hole/resources/<i>.png). Names from Eli.
export const wellSedimentNames = ['Gravel', 'Goldust', 'Redstone', 'Mythril', 'Cobaltine', 'Bruntine', 'Freezium', 'Sweetium', 'Rad Coral', 'Hyper Coral']

// The Den amplifiers: max charge per amp (Toolbox getAmpStoneMax) and a recommended setup.
// denRecommendedSetup = Eli's charges at Best Score 7.16B (Nov 2026): a starting point for later game, to tweak per
// account and character.
export const denAmpMax = [100, 100, 20, 100, 30, 20, 24, 40]
export const denRecommendedSetup = [100, 100, 0, 100, 30, 20, 0, 0]

// ── Generated from Toolbox (gen_hole.py) ──
// Conjuror majiks: [hole, villager, idleon] groups. Holes[4] / [5] / [6] = levels.
// bonus = floor(x0 × LV) (Toolbox getCosmoBonus), except idleon majik 1 = max(1, 3^LV). maxLevel = holesInfo[56 + group] + 1
export const holeMajiks = [
  [
    { name: "Monumental Vibes", description: "All of your Monument Bonuses are }x higher! 9 out of 10 monument enjoyers recommend this bonus!", x0: 25, maxLevel: 4 },
    { name: "String Is Strung", description: "Adds { more string to your harp, cluck it with pride! Err, pluck it. I'm not a chicken that was just a typo!!", x0: 1, maxLevel: 5 },
    { name: "Wishy Washy", description: "+{% chance to get an additional Wish every day at the Lamp!", x0: 30, maxLevel: 3 },
    { name: "Rupies Everywhere", description: "Increases the chance for jars to have multiple rupies by +{%", x0: 35, maxLevel: 5 },
    { name: "Profoun-tain", description: "Each level gives +1 Max Coin Stack size, 1.25x all coins value, and 1.10x Marble rate for The Fountain cave!", x0: 1, maxLevel: 5 },
    { name: "Confused Bonus", description: "Who am I to tell you what bonus I give?", x0: 10, maxLevel: 2 },
    { name: "Confused Bonus", description: "Who am I to tell you what bonus I give?", x0: 10, maxLevel: 2 },
    { name: "Confused Bonus", description: "Who am I to tell you what bonus I give?", x0: 10, maxLevel: 2 },
    { name: "Confused Bonus", description: "Who am I to tell you what bonus I give?", x0: 10, maxLevel: 2 },
  ],
  [
    { name: "Opal Enthusiasm", description: "Every 10th opal invested in a villager boosts their own exp gain by +{%", x0: 30, maxLevel: 5 },
    { name: "Contented Creator", description: "+{% villager exp gain per schematic created. Total Bonus: +|%", x0: 1, maxLevel: 4 },
    { name: "Cosmo, Enhance!", description: "You can now enhance conjuror bonuses! Also, uh, +{% villager exp gain, why not?", x0: 10, maxLevel: 3 },
    { name: "Lengthmeister", description: "All measurement bonuses are }x higher! Inchredible! Meterrific! Footastic! Yards!!!!", x0: 25, maxLevel: 4 },
    { name: "Study All Nighter", description: "+{% Study Rate for Bolaia!", x0: 20, maxLevel: 5 },
    { name: "Equal Spread", description: "+{% villager exp per 5 opals invested in the villager with the LEAST opals! Total Bonus: +$%", x0: 2, maxLevel: 4 },
    { name: "Confused Bonus", description: "Don't conjure this... it does nothing yet! Wait for future updates, where this bonus and more will be added!", x0: 10, maxLevel: 2 },
    { name: "Confused Bonus", description: "Who am I to tell you what bonus I give?", x0: 10, maxLevel: 2 },
    { name: "Confused Bonus", description: "Who am I to tell you what bonus I give?", x0: 10, maxLevel: 2 },
    { name: "Confused Bonus", description: "Who am I to tell you what bonus I give?", x0: 10, maxLevel: 2 },
    { name: "Confused Bonus", description: "Who am I to tell you what bonus I give?", x0: 10, maxLevel: 2 },
    { name: "Confused Bonus", description: "Who am I to tell you what bonus I give?", x0: 10, maxLevel: 2 },
  ],
  [
    { name: "Pocket Divinity", description: "Get the link bonuses from this god: Y Z", x0: 1, maxLevel: 2 },
    { name: "Beeg Beeg Forge", description: "Increase the forge capacity by {x", x0: 2, maxLevel: 5 },
    { name: "Resource Bursting", description: "Increase the max Multi-Ore by {% but not just for ore... for ALL resources! Multi-fish, Multi-everything!", x0: 100, maxLevel: 3 },
    { name: "Voter Integrity", description: "Get +{% Ballot Box bonus multiplier! This way you can be even MORE emotionally invested in the vote outcome!", x0: 6, maxLevel: 5 },
    { name: "Weapon Relevancy", description: "The effect Weapon Power has on DMG is {% higher.", x0: 75, maxLevel: 4 },
    { name: "Equinox Maxim", description: "Increases the Equinox Bar Fill Rate by a multiplicative +{%", x0: 12, maxLevel: 5 },
    { name: "Confused Bonus", description: "Don't conjure this... it does nothing yet! Wait for future updates, where this bonus and more will be added!", x0: 10, maxLevel: 2 },
    { name: "Confused Bonus", description: "Who am I to tell you what bonus I give?", x0: 10, maxLevel: 2 },
    { name: "Confused Bonus", description: "Who am I to tell you what bonus I give?", x0: 10, maxLevel: 2 },
    { name: "Confused Bonus", description: "Who am I to tell you what bonus I give?", x0: 10, maxLevel: 2 },
    { name: "Confused Bonus", description: "Who am I to tell you what bonus I give?", x0: 10, maxLevel: 2 },
    { name: "Confused Bonus", description: "Who am I to tell you what bonus I give?", x0: 10, maxLevel: 2 },
  ],
]

// Lamp wishes (Holes[21] = times each wish was used). Cost: Toolbox LampWishCost (holeUtils getWishCost)
export const lampWishes = [
  { name: "More Wishes", description: "Your wish is my command... wait stop no you can't just wish for more wishes!!", x1: 1, x2: 3 },
  { name: "Another Try", description: "That sounds like a fair request, what exactly would you like another try at?", x1: 6, x2: 0 },
  { name: "1000000 Opals", description: "A million opals??!? M'lord please, lets be reasonable here! I can give to you but one opal...", x1: 2, x2: 2 },
  { name: "Bring Them Back", description: "I'm sorry, I can't do this... it wouldn't be right. But I can grant 12 hours of respect, to whom should it go?", x1: 2, x2: 0 },
  { name: "World 4 Stuff", description: "Uhh, sure, how about these bonuses: +{% Cooking Speed +}% Shiny Mob LV Up & Breedability Rate +~% Lab EXP gain", x1: 1, x2: 0.2 },
  { name: "A Moderate Discount", description: "A... discount? Just a discount? Thats uh, yea, that is certainly doable m'lord. I can grant an additional 15% discount on the next Engineer Schematic creation!", x1: 2, x2: 0.5 },
  { name: "World 5 Things", description: "Wow very specific! How about: +{% Sailing Loot Value +}% Bits gain +~% Divinity Pts gain", x1: 1, x2: 0.2 },
  { name: "Infinite Resources", description: "Infinite is more of a concept... instead, I'll grant a #x bonus to Well and Harp resource gain! Oh, and $x for Jar Rupie gain and Fountain Currency value!", x1: 1, x2: 0.05 },
  { name: "World 6 Majigers", description: "Yes yes majigers, how about things like: +{% Next Crop chance +}% Stealth for Ninja twins +~% All Essence gain", x1: 1, x2: 0.2 },
  { name: "Knowledge Of Future", description: "If I told you what the future was, it wouldn't really be the future anymore would it m'lord? No, you'll have to wait for the future to be the now.", x1: 999, x2: 999 },
  { name: "World 7 Watsinames", description: "Hmm... I suspect you're wanting things like +{% total Spelunking Amber, and maybe a little bit for the future skills...? Granted!", x1: 3, x2: 0.5 },
  { name: "World 8 Stuff", description: "Oh please, World 8? Is this 'World 8' in the room with us right now? M'lord, you waste both our time!", x1: 999, x2: 999 },
]

// Engineer schematics by save index (Holes[13][i] = 1 when built). holeSchematicOrder = in-game list order (holesInfo[40]).
// bg = HoleUIbuildSq<bg> tile colour, resource = hole resource index paid, cost = fixed cost (fixedCost) or the
// base of Toolbox getEngineerUpgradeCost. description stops before the "Total Bonus" line (not computed yet).
export const holeSchematics = [
  { name: "Opal Dividends", description: "Each opal invested in a villager now gives them 125 EXP/hr, instead of 100 EXP/hr Also worry not, you can reset your opals later at Cavern 7", bg: 0, resource: 0, cost: 6, fixedCost: true },
  { name: "Better Buckets", description: "Increases the base fill rate of all Well Buckets from 10/hr to 15/hr. IMPORTANT:You can click on the buckets for more info!", bg: 1, resource: 0, cost: 8, fixedCost: true },
  { name: "Cavern 'porting", description: "All teleports to this map are free! Also, did you know you can double-click a map instead of pressing the Teleport button?", bg: 0, resource: 0, cost: 60, fixedCost: true },
  { name: "2nd Bucket!", description: "Adds another bucket at the Well! You'll need to expand your Gravel bar to hold the 130 needed to create this!", bg: 1, resource: 0, cost: 130, fixedCost: true },
  { name: "3rd Bucket!", description: "Adds another bucket at the Well! Remember, click a bucket to change what sediment it collects! That's how you get this gold resource!", bg: 1, resource: 1, cost: 850, fixedCost: true },
  { name: "4th Bucket!", description: "Adds yet another bucket at the Well!", bg: 1, resource: 2, cost: 3000, fixedCost: false },
  { name: "Five Nights At Bucket", description: "Adds one more bucket at the Well! Five buckets!!! WOW! That's worth writing home about!", bg: 1, resource: 2, cost: 12500, fixedCost: false },
  { name: "6th Bucket!", description: "Adds another bucket at the Well! I guess 5 wasn't enough for a go getter like yourself!", bg: 1, resource: 3, cost: 75000, fixedCost: false },
  { name: "7rth Barckot?!", description: "Adds another bucket at the Well! You DO want more buckets, right?", bg: 1, resource: 4, cost: 1, fixedCost: false },
  { name: "Last Bucket!", description: "Adds another bucket at the Well! And it's the last one too, I hope your bucket lust is satiated!", bg: 1, resource: 5, cost: 1, fixedCost: false },
  { name: "9th Bucket!", description: "Adds another bucket at the Well! Yea apparently there were a few more of these left!", bg: 1, resource: 6, cost: 1, fixedCost: false },
  { name: "Bucket Finale!", description: "Adds another bucket at the Well! And yea this one is actually the last one, I don't think an 11th would fit on screen!", bg: 1, resource: 7, cost: 1, fixedCost: false },
  { name: "Bar Expand-o-rama", description: "Adds the 'Expand Full Bars' toggle to the Well! Let me explain... when a bar is full of sediment, you lose half of the sediment, but permanently increase the max by 1.50x!", bg: 1, resource: 0, cost: 100, fixedCost: true },
  { name: "Uber Bar Expand-o-rama-hala", description: "Allow for UBER Full Bar Expansion, which means you can expand Well Bars beyond the previous limit of 14 times.", bg: 1, resource: 0, cost: 28000, fixedCost: true },
  { name: "Expander Extravaganza", description: "Gives all your buckets +20% Fill Rate per bar expansion across all sediment types! This includes Uber expansions later!", bg: 1, resource: 1, cost: 350, fixedCost: true },
  { name: "Motherlode ~ Bucket Synergy", description: "Gives all your buckets 1.10x fill rate per Motherlode Layer you've destroyed!", bg: 1, resource: 0, cost: 180, fixedCost: true },
  { name: "Green Amplifier", description: "Adds a new Amplifier stone to interact with at the Dawg Den!", bg: 1, resource: 1, cost: 250, fixedCost: true },
  { name: "Pink Amplifier", description: "Adds a new Amplifier stone to interact with at the Dawg Den!", bg: 1, resource: 2, cost: 3250, fixedCost: true },
  { name: "Yellow Amplifier", description: "Adds a new Amplifier stone to interact with at the Dawg Den!", bg: 1, resource: 0, cost: 10000, fixedCost: false },
  { name: "Cyan Amplifier", description: "Adds a new Amplifier stone to interact with at the Dawg Den!", bg: 1, resource: 3, cost: 10, fixedCost: false },
  { name: "Purple Amplifier", description: "Adds a new Amplifier stone to interact with at the Dawg Den!", bg: 1, resource: 13, cost: 10, fixedCost: false },
  { name: "White Amplifier", description: "Adds a new Amplifier stone to interact with at the Dawg Den!", bg: 1, resource: 6, cost: 10, fixedCost: false },
  { name: "Dark Amplifier", description: "Adds a new Amplifier stone to interact with at the Dawg Den!", bg: 1, resource: 18, cost: 10, fixedCost: false },
  { name: "Amplifier Stackin'", description: "You now get an additional +0.50x Multiplier at the Dawg Den for every 10 total charge across all amplifiers!", bg: 1, resource: 2, cost: 10, fixedCost: false },
  { name: "The Story Changes Over Time...", description: "Bravery Swords get +1 minimum DMG and +10 maximum DMG per 6 HR of AFK time at the Bravery Monument!", bg: 1, resource: 1, cost: 600, fixedCost: true },
  { name: "First Try, I Swear!", description: "If you throw the LAST bravery sword first, and it kills the monster, you get a +10% Sword Max DMG bonus for the rest of the story. If it doesn't kill, this bonus resets back to 0%", bg: 1, resource: 0, cost: 10, fixedCost: false },
  { name: "Even Better Buckets", description: "Increases the base fill rate of all Well Buckets from 15/hr to 20/hr. Try changing your bucket to remove the rocks, once you remove that layer you can collect gold dust!", bg: 1, resource: 1, cost: 25, fixedCost: false },
  { name: "Eee String", description: "Permanently unlocks a new String Type for the Harp! You can level it up by plucking it, getting +1 EXP per 100% Harp Power!", bg: 2, resource: 10, cost: 10, fixedCost: false },
  { name: "Eff String", description: "Permanently unlocks a new String Type for the Harp! You can level it up by plucking it, getting +1 EXP per 100% Harp Power!", bg: 2, resource: 12, cost: 10, fixedCost: false },
  { name: "Geez String", description: "Permanently unlocks a new String Type for the Harp! You can level it up just like any other string, getting +1 EXP per 100% Harp Power!", bg: 2, resource: 14, cost: 10, fixedCost: false },
  { name: "Aye String", description: "Permanently unlocks a new String Type for the Harp! You can level it up just like any other string!", bg: 2, resource: 16, cost: 10, fixedCost: false },
  { name: "Bee String", description: "Permanently unlocks a new String Type for the Harp! You can level it up just like any other string!", bg: 2, resource: 18, cost: 10, fixedCost: false },
  { name: "Loaded Harp", description: "Adds +1 more string to the Harp, ready to be strummed until the end of (the) time (signature)!", bg: 2, resource: 10, cost: 10, fixedCost: false },
  { name: "Packed Harp", description: "Adds +1 more string to the Harp, you'll find it right next to all your other strings!", bg: 2, resource: 11, cost: 10, fixedCost: false },
  { name: "Hefty Harp", description: "Adds +1 more string to the Harp, it even makes sound when strummed! The other ones do too, but like, this one does too! Just incase you were worried it wouldn't.", bg: 2, resource: 13, cost: 10, fixedCost: false },
  { name: "Multitudinal Harp", description: "Adds +9999 more strings to the Harp! Haha nah just +1 string, figured I'd keep you on your toes! If I tricked you, you must go pluck the F string.", bg: 2, resource: 15, cost: 10, fixedCost: false },
  { name: "Sumptuous Harp", description: "Adds +1 more string to the Harp... all these strings really remind me of string cheese, I used to love it!", bg: 2, resource: 17, cost: 10, fixedCost: false },
  { name: "Domino Effect", description: "Strings give +20% more per string plucked during a strum... let me explain. Imagine you have 5 strings, this would mean the final string you pluck would be worth DOUBLE!", bg: 2, resource: 4, cost: 10, fixedCost: false },
  { name: "Variety Effect", description: "Strings give +30% more for each unique string type on your harp... I see you currently have $ different strings on your harp, so your strings are all worth #% more!", bg: 2, resource: 6, cost: 10, fixedCost: false },
  { name: "Stringy Effect", description: "Strings give +15% more. More what, you ask? More everything! They give more String EXP, more notes, higher chance for opal... so yea, MORE!", bg: 2, resource: 3, cost: 10, fixedCost: false },
  { name: "Reroll Keeper", description: "Each unused reroll you have in a Bravery Story gives +10% Sword Max DMG. So don't be all loosey goosey with those rerolls!", bg: 1, resource: 5, cost: 10, fixedCost: false },
  { name: "Fractalfly ~ Harp Synergy", description: "Boosts your Harp Note production by 1.10x per Undying Hive Layer you've destroyed!", bg: 2, resource: 13, cost: 10, fixedCost: false },
  { name: "Double Dinger Ringer", description: "Ringing the Bell now has a +30% chance of giving +2 LV to a bonus, instead of just +1 LV", bg: 1, resource: 3, cost: 10, fixedCost: false },
  { name: "Rng Oxidizing Layer", description: "When you Clean the Bell and FAIL to get a new Improvement Method, the success chance for next time goes up by 1.25x. This happens every fail, and resets when you finally succeed!", bg: 1, resource: 4, cost: 10, fixedCost: false },
  { name: "Gloomie Mulch", description: "Gloomie mushrooms respawn +10% faster! In fact, ALL monsters across all the worlds of IdleOn respawn +10% faster!", bg: 0, resource: 14, cost: 10, fixedCost: false },
  { name: "Improvement Stackin'", description: "For every 25 LVs across all Improvement Methods upgrades at the Bell, all your Improvement Method bonuses are 1.10x higher!", bg: 1, resource: 12, cost: 10, fixedCost: false },
  { name: "Gloomie Lootie", description: "+5% Drop Rate for each Colony of Gloomie Mushrooms defeated! Drop rate here as in like, the one for stuff outside of the Caverns.", bg: 0, resource: 6, cost: 10, fixedCost: false },
  { name: "Gloomie Expie", description: "+25% Class EXP gain for each Colony of Gloomie Mushrooms defeated!", bg: 0, resource: 15, cost: 10, fixedCost: false },
  { name: "Gloomie Opie", description: "+10% Villager EXP gain for each Colony of Gloomie Mushrooms successfully romanced... or defeated, whichever is higher.", bg: 0, resource: 16, cost: 10, fixedCost: false },
  { name: "Motherlode Trickledown", description: "+15% All Skill Efficiency, and +10% All Skill EXP gain per Motherlode Layer you've destroyed!", bg: 0, resource: 3, cost: 10, fixedCost: false },
  { name: "Fractalfly Trickledown", description: "+15% All Skill Efficiency, and +10% All Skill EXP gain per Undying Hive Layer you've destroyed!", bg: 0, resource: 15, cost: 10, fixedCost: false },
  { name: "Rift Guy", description: "Hey bet you weren't expecting to see me here, huh? Well, that's just how it goes with me, it's in my blood. It's how I roll. Go ahead, create me. Or don't, I'll keep being me.", bg: 4, resource: 0, cost: 10, fixedCost: false },
  { name: "Dna Rock Tumbler", description: "Gives you a +60% chance to get an additional Grey Gene when trashing a Mob for every Power of 10 Gravel you have.", bg: 0, resource: 0, cost: 10, fixedCost: false },
  { name: "Final Ballad Of The Snail", description: "Gives you a 1.04x higher success chance when leveling up Snail for every Power of 10 Trebel Notes you have.", bg: 0, resource: 13, cost: 10, fixedCost: false },
  { name: "Noise Reduction Therapy", description: "Gives you a multiplicative 1.20x Stealth bonus for all ninjas for every Power of 10 Quaver Notes you have.", bg: 0, resource: 15, cost: 10, fixedCost: false },
  { name: "Tune Of Artifaction", description: "Gives you +10% Artifact Find Chance for every Power of 10 Natural Notes you have.", bg: 0, resource: 11, cost: 10, fixedCost: false },
  { name: "Heavy Redstone Seasoning", description: "Gives you a multiplicative 1.30x Cooking Speed bonus for every Power of 10 Redstone you have.", bg: 0, resource: 2, cost: 10, fixedCost: false },
  { name: "True Golden Edge", description: "Gives all your players +20% Damage for every Power of 10 Golddust you have.", bg: 0, resource: 1, cost: 10, fixedCost: false },
  { name: "Loadin' Some 'lode", description: "Gives +5 Bucket Fill Rate per Power of 10 Motherlode Ore mined. You have mined # so far!", bg: 1, resource: 0, cost: 12, fixedCost: true },
  { name: "Hiring The Hounds From Beyond", description: "Gives +10 B.F.R. per 100 hounds defeated in best runs of each class. & Beginner:!, Warrior:#, Archer:$, Mage:%", bg: 1, resource: 0, cost: 30, fixedCost: true },
  { name: "Triple Tap Tinkle", description: "Ringing the Bell now has another +30% chance of giving +2 LV to a bonus instead of just +1 LV. Also, there's a new +20% chance of giving +3 LV instead of +2 or +1!", bg: 1, resource: 6, cost: 10, fixedCost: false },
  { name: "Compound Interest", description: "You start with +1 more Court Coins every Power of 2 HRs of AFK time at the Justice Monument! So 2Hrs you get +1 coin, 4Hrs you get +2 coins, 8Hrs you get +3 coins, and so on!", bg: 2, resource: 12, cost: 600, fixedCost: false },
  { name: "Big Jar Mach Ii", description: "Upgrades the main jar, doubling the base value of every rupie you find. So if you see 2 red rupies, you actually got 4!", bg: 3, resource: 20, cost: 10, fixedCost: true },
  { name: "Big Jar Mach Iii", description: "Upgrades the main jar, allowing you to produce 2 jar types at once!", bg: 3, resource: 21, cost: 10, fixedCost: false },
  { name: "Big Jar Mach Iv", description: "Upgrades the main jar, increasing the chance for multiple rupies in a jar by +50%", bg: 3, resource: 22, cost: 10, fixedCost: false },
  { name: "Big Jar Mach V", description: "Upgrades the main jar, doubling the base value of every rupie you find AGAIN! If 2 red rupies gave you 4 before, now it's 8!!!", bg: 3, resource: 24, cost: 10, fixedCost: false },
  { name: "Big Jar Mach Vi", description: "Upgrades the main jar, allowing you to produce 3 jar types at once!", bg: 3, resource: 25, cost: 10, fixedCost: false },
  { name: "Big Jar Mach Vii", description: "Upgrades the main jar, reducing the production amount required to make jars by 30% so you can make them faster!", bg: 3, resource: 27, cost: 10, fixedCost: false },
  { name: "Big Jar Mach Viii", description: "Upgrades the main jar, doubling the base value of every rupie you find! This does not stack with the other ones... just kidding it totally does! ANOTHER 2x RUPIES!!!", bg: 3, resource: 29, cost: 10, fixedCost: false },
  { name: "Break All Button", description: "Adds a new button to the top left of the Jar, allowing you to break all jars at once!", bg: 3, resource: 21, cost: 200, fixedCost: true },
  { name: "Max Monument Rewards", description: "Monument Reward Multi now increases at the normal rate of +100% daily for 4 full days! Before this upgrade, it was only 2 days...", bg: 1, resource: 24, cost: 10, fixedCost: false },
  { name: "Supergiant Jars", description: "Jars now COMBINE to save space! 10 Jars becomes 1 large jar, which gives 10x rewards. 10 large jars become 1 giant jar, which gives 100x rewards. This continues forever!", bg: 3, resource: 20, cost: 25, fixedCost: true },
  { name: "Light Speed", description: "Every POW 10 white rupies you own increases the production rate of jars by +10%", bg: 3, resource: 25, cost: 10, fixedCost: false },
  { name: "Dark Luck", description: "Every POW 10 dark rupies you own increases the chance of enchanting collectibles from the Enchanted Jar by 1.10x", bg: 3, resource: 27, cost: 10, fixedCost: false },
  { name: "Jar Production Line", description: "The requirement to make a jar is 5% lower per POW 10 jars made of the previous type. For example, making 100 Simple Jars would mean Tall jars are 10% quicker to make!", bg: 3, resource: 22, cost: 10, fixedCost: false },
  { name: "Advanced Collection", description: "You can now find new collectible types from jars, found in the new 2nd page of your collection! Go collect 'em all!", bg: 3, resource: 28, cost: 10, fixedCost: false },
  { name: "Collect 'em All", description: "Gives a 1.02x chance to find a new collectible for every digit of all the rupies you own.", bg: 3, resource: 23, cost: 10, fixedCost: false },
  { name: "Roaring Flame", description: "+25% chance to get DOUBLE the Torches from Ancient Golems when picking them up!", bg: 3, resource: 26, cost: 10, fixedCost: false },
  { name: "The Sicilian", description: "+10% Total Gambit Score", bg: 3, resource: 25, cost: 10, fixedCost: false },
  { name: "Evertree Trickledown", description: "+15% All Skill Efficiency, and +10% All Skill EXP gain per Evertree Trunk you've whittled!", bg: 3, resource: 20, cost: 400, fixedCost: true },
  { name: "Evertree ~ Rupie Synergy", description: "Boosts overall Rupie value by 1.10x per Evertree Trunk you've whittled!", bg: 3, resource: 20, cost: 100, fixedCost: true },
  { name: "Rock Smart", description: "After much thought, this schematic has decided to give +20% Monument AFK gain, and +2 Starting Attempts for the Wisdom Story per POW 10 Wisdom Monument Hours.", bg: 3, resource: 23, cost: 10, fixedCost: false },
  { name: "Sanctum Of Loot", description: "+20% Drop Rate for each Sanctum of Ancient Golems you've cleared!", bg: 3, resource: 27, cost: 10, fixedCost: false },
  { name: "Sanctum Of Exp", description: "+40% Class EXP for each Sanctum of Ancient Golems you've cleared!", bg: 3, resource: 28, cost: 10, fixedCost: false },
  { name: "Sanctum Of Dmg", description: "+100% Total Damage for each Sanctum of Ancient Golems you've cleared!", bg: 3, resource: 29, cost: 10, fixedCost: false },
  { name: "Peer Reviewed Books", description: "Bolaia now get +7% Study Rate per LV, instead of the previous +5% per LV!", bg: 3, resource: 21, cost: 10, fixedCost: false },
  { name: "All This Ringing In My Ears", description: "When Ringing the Bell, there is now a 25% chance to get 2x more LVs than you otherwise would have gotten!", bg: 3, resource: 25, cost: 10, fixedCost: false },
  { name: "Cutting Edge Research", description: "Bolaia now get a massive +10% Study Rate per LV, instead of the previous +7% per LV!", bg: 3, resource: 24, cost: 10, fixedCost: false },
  { name: "Billion Dollar Grant", description: "Bolaia now get a sumptuous +15% Study Rate per LV, instead of the previous +10% per LV!", bg: 3, resource: 29, cost: 1000000000, fixedCost: true },
  { name: "Horsey Gambit", description: "Unlocks the Horsey challenge in the Gambit cavern.", bg: 3, resource: 22, cost: 10, fixedCost: false },
  { name: "Bishop Gambit", description: "Unlocks the Bishop challenge in the Gambit cavern.", bg: 3, resource: 24, cost: 10, fixedCost: false },
  { name: "Queen Gambit", description: "Unlocks the Queen challenge in the Gambit cavern.", bg: 3, resource: 20, cost: 10, fixedCost: false },
  { name: "Castle Gambit", description: "Unlocks the Castle challenge in the Gambit cavern.", bg: 3, resource: 21, cost: 10, fixedCost: false },
  { name: "Noob Gambit", description: "Unlocks the Noob challenge in the Gambit cavern.", bg: 3, resource: 27, cost: 10, fixedCost: false },
  { name: "Trench ~ Coin Synergy", description: "Boosts the value of all coin types, also called Currencies, by 1.10x per Trench Depth you've cast!", bg: 4, resource: 31, cost: 500, fixedCost: true },
  { name: "Size Does Matter", description: "When collecting a coinstack at The Fountain, you get +10% MULTI per stack height. Example:If a stack was 5 coins high, they'd all be worth 1.50x more!!!", bg: 4, resource: 32, cost: 7500, fixedCost: true },
  { name: "Monument Mogmaxing", description: "Monument Reward Multi now increases at the normal rate of +100% daily for 6 full days! Before this upgrade, it was only 4 days...", bg: 1, resource: 34, cost: 25000, fixedCost: true },
  { name: "Triple Decker Extender", description: "All coinstacks at The Fountain can stack +3 coins higher than before!", bg: 4, resource: 30, cost: 150, fixedCost: true },
  { name: "Trench Trickledown", description: "+15% All Skill Efficiency, and +10% All Skill EXP gain per Bottomless Trench Depth you've cast down to!", bg: 4, resource: 31, cost: 2500, fixedCost: true },
  { name: "2nd Billion Dollar Grant", description: "Bolaia now get a brilliant +20% Study Rate per LV, instead of the previous +15% per LV!", bg: 3, resource: 33, cost: 1000000000, fixedCost: true },
  { name: "Glunko Conglomeration", description: "Crystal Glunko monsters in Cavern 18 now respawn 25% faster!", bg: 4, resource: 34, cost: 10, fixedCost: false },
  { name: "More Goo", description: "Whenever you pick up shapes dropped by Crystal Glunko monsters, there's a 10% chance to get DOUBLE the amount!", bg: 4, resource: 35, cost: 10, fixedCost: false },
  { name: "Justin Opal", description: "Its 'just an' Opal. A single opal.", bg: 0, resource: 36, cost: 10, fixedCost: false },
  { name: "Even More Goo", description: "Boosts your Double Shape chance from 10% up to 20%", bg: 4, resource: 36, cost: 10, fixedCost: false },
  { name: "Anotha One", description: "Gives you a 2nd Golden Bucket, which fills faster as described by the 'Golden Bucket Boost' upgrade at Cavern 16's Fountain", bg: 1, resource: 37, cost: 10, fixedCost: false },
  { name: "Increasingly More Goo", description: "Boosts your Double Shape chance from 20% up to 30%", bg: 4, resource: 37, cost: 10, fixedCost: false },
  { name: "Namenamename", description: "desc", bg: 3, resource: 24, cost: 10, fixedCost: false },
]
export const holeSchematicOrder = [0, 1, 58, 59, 2, 12, 3, 52, 15, 16, 14, 26, 24, 4, 57, 42, 17, 56, 49, 32, 27, 13, 5, 18, 55, 45, 43, 39, 33, 37, 41, 6, 28, 19, 60, 25, 23, 29, 53, 50, 34, 40, 7, 20, 46, 38, 47, 48, 54, 44, 61, 35, 8, 21, 30, 9, 62, 71, 80, 69, 79, 63, 85, 74, 81, 36, 89, 64, 90, 76, 70, 87, 91, 65, 78, 72, 86, 66, 92, 22, 73, 82, 67, 10, 75, 77, 83, 93, 11, 68, 88, 84, 97, 94, 98, 95, 96, 99, 100, 101, 102, 103, 104, 105, 51, 31]

// Measurer: one measurement per LV. Holes[22] = levels. base = perLevel × LV, or for TOT entries
// total × LV / (100 + LV). measuredBy = the IdleOn stat that multiplies it (holesInfo[52] → [53]).
// stat = which IdleOn stat multiplies it (holeUtils MEASURE_STATS), resource = hole resource index paid to level it (holesInfo[50]).
export const holeMeasurements = [
  { description: "+{% VILLAGER EXP GAIN", value: 45.0, tot: true, measuredBy: "Tome Score", stat: 3, resource: 3 },
  { description: "+{% BRAVERY SWORD MAX DMG", value: 2.0, tot: false, measuredBy: "All Skill Lv", stat: 4, resource: 10 },
  { description: "+{% BELL RING & PING RATE", value: 10.0, tot: false, measuredBy: "Deathnote Pts", stat: 6, resource: 4 },
  { description: "+{% HARP NOTE GAIN", value: 6.0, tot: false, measuredBy: "Slab Items", stat: 8, resource: 12 },
  { description: "+{% DAILY LAMP WISHES", value: 80.0, tot: true, measuredBy: "Crops Found", stat: 1, resource: 14 },
  { description: "+{% BUCKET FILL RATE", value: 11.0, tot: false, measuredBy: "Highest Dmg", stat: 7, resource: 5 },
  { description: "+{% HARP STRING EXP", value: 13.0, tot: false, measuredBy: "Account Lv", stat: 2, resource: 16 },
  { description: "+{% VILLAGER EXP GAIN", value: 60.0, tot: true, measuredBy: "Slab Items", stat: 8, resource: 6 },
  { description: "+{% HARP NOTE GAIN", value: 30.0, tot: false, measuredBy: "Tome Score", stat: 3, resource: 17 },
  { description: "+{% MULTIKILL PER TIER", value: 40.0, tot: true, measuredBy: "Gloomie Kills", stat: 0, resource: 7 },
  { description: "+{% RUPIE VALUE", value: 10.0, tot: false, measuredBy: "Studies Done", stat: 9, resource: 20 },
  { description: "+{% MONUMENT AFK RATE", value: 5.0, tot: true, measuredBy: "All Skill Lv", stat: 4, resource: 21 },
  { description: "+{% JAR PRODUCE SPD", value: 30.0, tot: true, measuredBy: "Account Lv", stat: 2, resource: 23 },
  { description: "+{% GAMBIT POINTS", value: 10.0, tot: true, measuredBy: "Deathnote Pts", stat: 6, resource: 24 },
  { description: "+{% RUPIE VALUE", value: 18.0, tot: false, measuredBy: "Highest Dmg", stat: 7, resource: 26 },
  { description: "+{% DROP RATE", value: 50.0, tot: true, measuredBy: "Golem Kills", stat: 10, resource: 29 },
  { description: "+{% FOUNTAIN COINS VALUE", value: 10.0, tot: true, measuredBy: "Slab Items", stat: 8, resource: 30 },
]

// Librarian studies: one per cavern (same index). Holes[26] = level, [27] = progress, [11][61] = active study.
// bonus = LV × perLevel (study 3: min(32, 12 + LV × perLevel), study 9: 50 + LV × perLevel, both 0 at LV 0)
export const holeStudies = [
  { description: "You only lose 25% sediment when bar expanding instead of 50% Also, +{% Bucket Fill Rate per Bar Expansion", perLevel: 10.0 },
  { description: "Every layer destroyed lowers the resources needed to destroy other skilling caverns by {%", perLevel: 2.0 },
  { description: "Defeating the Golden Hound gives a }x score multi and spawns another Golden Hound!", perLevel: 5.0 },
  { description: "Minimum DMG is at least {% of Max, and you now skip trivial fights!", perLevel: 3.0 },
  { description: "Every 20th Bell Ring gives a random bonus +{ LVs. Biiig Ring baby!", perLevel: 20.0 },
  { description: "All strings give 2x EXP, and have a 1% chance of getting a massive {x EXP multi", perLevel: 100.0 },
  { description: "Get { more lamp wishes every day. No, you can't wish to change this!", perLevel: 1.0 },
  { description: "Every hive harvested lowers the resources needed to destroy other skilling caverns by {%", perLevel: 5.0 },
  { description: "Each Gloomie kill counts for }x more toward challenging the Monarch", perLevel: 1.0 },
  { description: "Justice Reward Multi goes up 100% every day for +14 more days! Also, }x chance for opal reward!", perLevel: 50.0 },
  { description: "Double click to choose a collectible to be most likely enchanted! Also, }x Enchantment Chance!", perLevel: 25.0 },
  { description: "Every trunk whittled lowers the resources needed to destroy other skilling caverns by {%", perLevel: 5.0 },
  { description: "If you end a round with no instamatches, you get one! Also, start with { more attempts!", perLevel: 1.0 },
  { description: "+{% Total Gambit Points. Also, 50% chance to not use up your daily Gambit attempt when starting a Gambit!", perLevel: 5.0 },
  { description: "There is an extra +{% chance to get double torches when picking them up!", perLevel: 30.0 },
  { description: "You can Marbleize upgrades more than once! Also, }x higher Marble production!", perLevel: 5.0 },
  { description: "Every depth cast lowers the resources needed to destroy other skilling caverns by {%", perLevel: 3.0 },
  { description: "The first { upgrades each day in The Cove are 15% cheaper", perLevel: 1.0 },
]

// Harp string types C..A (Holes[19][2t] = LV, [2t + 1] = EXP; Holes[20] = string type on each harp string).
// { = what the string makes, } = LV bonus %, | = LV bonus as a multi; LV bonus = perLevel × LV (holesInfo[47]).
export const harpStringTypes = [
  { letter: "C", description: "Creates { of the note you're tuned to! LV bonus: +}% Harp Note Gain", perLevel: 10.0 },
  { letter: "D", description: "Has a {% chance of finding an opal! LV bonus: |x Harp Note Gain", perLevel: 6.0 },
  { letter: "E", description: "Doesn't do anything... but its LV bonus is freakin' epic! LV bonus: |x Harp Power/hr", perLevel: 5.0 },
  { letter: "F", description: "Creates { of the tune, and notes next to the tune! LV bonus: +}% Harp Note Gain", perLevel: 13.0 },
  { letter: "G", description: "Gives { EXP to all string types! LV bonus: +}% String EXP Gain!", perLevel: 20.0 },
  { letter: "A", description: "Creates { of every note you know! LV bonus: +}% Harp Note Gain", perLevel: 18.0 },
]

// Harp notes (Holes[9][10 + i] = owned; Holes[11][21] = the note the harp is tuned to). Names: Eli
export const harpNoteNames = ['Crotchet', 'Natural', 'Bass', 'Treble', 'Eighth', 'Quaver', 'Sharp', 'F Clef', 'G Clef', 'Sixteenth']

// Bell ring bonuses (Holes[17] = LV, value = base × LV)
export const bellRingBonuses = [
  { description: "+{% BUCKET FILL RATE", perLevel: 10.0 },
  { description: "+{% ALL VILLAGER EXP", perLevel: 0.5 },
  { description: "+{% HARP NOTE GAINS", perLevel: 10.0 },
  { description: "+{% DAILY LAMP WISHES", perLevel: 0.3 },
  { description: "+{% EXTRA RUPIE CHANCE", perLevel: 0.5 },
  { description: "+{% DOUBLE TORCH CHANCE", perLevel: 2.0 },
  { description: "+{% COINS FROM FOUNTAIN", perLevel: 0.2 },
]

// The Den amplifiers (Holes[12] = LV each)
export const denAmplifiers = [
  { name: "Bigger Bite", description: "Hounds now have a base attack value of {" },
  { name: "Elusive Instinct", description: "Hounds now require { Accuracy for 100% hit chance" },
  { name: "Canine Recovery", description: "All hounds now heal {% HP every 3s" },
  { name: "Bigger Bow Wow", description: "Hounds have a 10% chance to spawn BIG with {x HP and DMG" },
  { name: "Doggo Emp Effect", description: "Somehow the hounds now make your attacks cost {x more MP" },
  { name: "Cursed Howl", description: "Hounds have a 5% chance to be cursed, causing {x more Fear" },
  { name: "Den Despair", description: "Start with your fear meter filled to {%" },
  { name: "Fast And Deadly", description: "Hounds cause fear { seconds faster than normal" },
]

// Monument bonuses 10t + i (t: 0 Bravery, 1 Justice, 2 Wisdom), Holes[15] = LV. Value: cavernUtils getMonumentBonus
export const monumentBonusText = ["+{% Mining Efficiency", "}x Bucket Fill Rate", "}x Cooking Speed", "+{% EXP Gain for Villagers", "}x Gaming Bits Gain", "+{% Chance for Bravery Opals", "+{% DMG for all Characters", "}x Bell Ring & Ping Rate", "+{% All Monument AFK Gain", "}x Bravery Bonuses Multi", "+{% Catching Efficiency", "}x Harp Note Gain", "}x Artifact Find Chance", "+{% EXP Gain for Villagers", "}x All Summoning Essence Gain", "+{% Chance for Justice Opals", "+{% Class EXP Gain", "+{% more daily Lamp Wishes", "+{% All Monument AFK Gain", "}x Justice Bonuses Multi", "+{% Choppin Efficiency", "}x Jar Rupie Value", "}x Jade Coin Gain", "+{% EXP Gain for Villagers", "}x Farming Crop Evo Chance", "+{% Chance for Wisdom Opals", "+{% Player Drop Rate", "+{% Gambit Points", "+{% All Monument AFK Gain", "}x Wisdom Bonuses Multi"]

// Jar collectibles (Holes[24] = LV). bonus = LV × perLevel × (1 + legend talent 29 %) (Toolbox getJarBonus)
export const jarCollectibles = [
  { name: "Abnormal Rupie", perLevel: 20.0, description: "Rupies found are worth +{% more. Current Rupie Value:$" },
  { name: "Sapphire Droplet", perLevel: 10.0, description: "Jar production rate is +{% faster." },
  { name: "Effervescent Diamond", perLevel: 20.0, description: "}x higher chance to find Opals in Tall Jars." },
  { name: "Tortole Rock", perLevel: 25.0, description: "All rupies found are worth a whopping }x more!" },
  { name: "Natural Pearl", perLevel: 15.0, description: "All villagers gain +{% more EXP." },
  { name: "Amethyst Heartstone", perLevel: 10.0, description: "All skilling caverns require {% less Resources to get opals!" },
  { name: "Amber Square", perLevel: 25.0, description: "Rupies found are worth +{% more." },
  { name: "Verdant Thorns", perLevel: 25.0, description: "}x higher chance to find new Collectibles." },
  { name: "Violent Violets", perLevel: 20.0, description: "All buckets get }x Bucket Fill Rate!" },
  { name: "Blue Faberge Egg", perLevel: 15.0, description: "}x higher chance to enchant a Collectible" },
  { name: "Shadow Prism", perLevel: 20.0, description: "All villagers gain +{% more EXP." },
  { name: "Big Beef Rock", perLevel: 25.0, description: "}x faster Bell Ring Rate!" },
  { name: "Emerald Ore", perLevel: 30.0, description: "All villagers gain +{% more EXP." },
  { name: "Dawn Prism", perLevel: 30.0, description: "Rupies found are worth +{% more." },
  { name: "Swampstone", perLevel: 25.0, description: "}x higher chance to find Opals in Tall Jars." },
  { name: "Frost Spirestone", perLevel: 12.0, description: "Jar production rate is +{% faster." },
  { name: "Rosemerald", perLevel: 10.0, description: "}x Faster study rate for villager Bolaia" },
  { name: "Blood Glass", perLevel: 40.0, description: "All rupies found are worth a whopping }x more!" },
  { name: "Sunrise Diamond", perLevel: 25.0, description: "}x higher chance to enchant a Collectible" },
  { name: "Minceraft Gem", perLevel: 20.0, description: "+{% Monument AFK Gain rate." },
  { name: "Crimson Spade", perLevel: 20.0, description: "The harp produces }x more Notes!" },
  { name: "Stained Glassdrop", perLevel: 35.0, description: "Rupies found are worth +{% more." },
  { name: "Tabula Rasastone", perLevel: 32.0, description: "All villagers gain +{% more EXP." },
  { name: "Deep Blue Square", perLevel: 1.0, description: "+{% Gambit PTS" },
  { name: "Earthbound Geode", perLevel: 15.0, description: "Jar production rate is +{% faster." },
  { name: "Inferno Droplet", perLevel: 40.0, description: "}x higher chance to find new Collectibles." },
  { name: "Octogonal Gem", perLevel: 30.0, description: "}x higher chance to enchant a Collectible" },
  { name: "Solarfang", perLevel: 32.0, description: "}x higher chance to find Opals in Tall Jars." },
  { name: "Mystic Ore", perLevel: 50.0, description: "All rupies found are worth a whopping }x more!" },
  { name: "Arcane Prism", perLevel: 38.0, description: "All villagers gain +{% more EXP." },
  { name: "Murky Fabrege Egg", perLevel: 1.0, description: "+{% Gambit PTS" },
  { name: "Corpore Rock", perLevel: 1.0, description: "Boosts a future cavern... futuuure..!" },
  { name: "Twilight Prism", perLevel: 1.0, description: "Boosts a future cavern... futuuure..!" },
  { name: "Tewball Orbstone", perLevel: 40.0, description: "Rupies found are worth +{% more." },
  { name: "Mad Muscle Rock", perLevel: 40.0, description: "}x higher chance to enchant a Collectible" },
  { name: "Sunroot Splinters", perLevel: 40.0, description: "All villagers gain +{% more EXP." },
  { name: "Twisted Rupie", perLevel: 75.0, description: "}x faster Bell Ring Rate!" },
  { name: "Overloaded Relic", perLevel: 1.0, description: "Boosts a future cavern... futuuure..!" },
  { name: "Sunburst Pearl", perLevel: 1.0, description: "Boosts a future cavern... futuuure..!" },
  { name: "Bloodfang Spires", perLevel: 1.0, description: "Boosts a future cavern... futuuure..!" },
]

// The Well: extra % on each sediment cap (holesInfo[21]); cap = 100 × 1.5^expansions × (1 + this / 100)
export const wellSedimentCapBonus = [0.0, 50.0, 500.0, 9000.0, 125000.0, 1500000.0, 20000000.0, 100000000.0, 500000000.0, 2000000000.0]

// Monument AFK-hour unlocks: hours needed (holesInfo[30]) and reward text per monument (holesInfo[31], 8 per monument).
// Unlocked count = Holes[14][1 + 2t]. Bravery: { = min sword damage, } = max.
export const monumentHourReqs = [1, 80, 300, 750, 2000, 5000, 10000, 24000]
export const monumentHourRewards = [["Swords deal {~} damage", "+2 additional Sword", "You can Re-Throw 5 swords per story", "+1 additional Sword", "You get 1 Retelling per story", "+1 additional Sword", "+10 Re-Throws per story", "+1 additional Sword"], ["Start with $ coins", "Start with 2 Mental Health", "You can Dismiss 1 case per story", "Start with 1.5x more coins", "+1 Mental Health and Dismissal", "Start with 10 popularity", "Start with 3x more coins", "+2 Mental Health and Dismissals"], ["Start with # Attempts", "Get +2 Attempts per Board Clear", "1st attempt each Board reveals row", "Start with 4 Insta Matches per story", "+4 additional Starting Attempts", "4th attempt each Board reveals square", "Get +1 Attempts per Board Clear", "+5 additional Insta Matches"]]

// The Bell improvement methods (Holes[16] = LV): text (holesInfo[60]), base cost (holesInfo[42]),
// schematic 45 boost per method (holesInfo[61]). Method 0 costs coins, 1 Well sediment 3, 2 bits, 3 Harp note 14,
// 4 particles, 5 rupie 25 (Toolbox getImprovementMethodCostType).
export const bellMethods = [
  { description: "+{% Bell Ring/hr", baseCost: 15000000000.0, boost: 5.0 },
  { description: "+{% Bell Clean/hr", baseCost: 100.0, boost: 10.0 },
  { description: "+{% Bell Ring/hr", baseCost: 1000000.0, boost: 8.0 },
  { description: "+{% Bell Ping/hr", baseCost: 300.0, boost: 13.0 },
  { description: "+{% Bell Ring/hr", baseCost: 150.0, boost: 12.0 },
  { description: "+{% Bell Ring/hr", baseCost: 1500.0, boost: 15.0 },
]

// Gambit bonuses (holesInfo[71]): x0 / x1 (1 = × log10 points), unlock at getGambitPointReq(i)
export const gambitBonuses = [
  { name: "{ Summoning Doublers &", x0: 1.0, x1: 1.0 },
  { name: "1 Opal per POW 10 Points &", x0: 1.0, x1: 1.0 },
  { name: "+{% Flurbos per party member &", x0: 20.0, x1: 0.0 },
  { name: "+{% Resources from Caverns &", x0: 25.0, x1: 1.0 },
  { name: "+{% Upgrade Stone Success", x0: 20.0, x1: 0.0 },
  { name: "} Essence Gain &", x0: 25.0, x1: 1.0 },
  { name: "{% chance for 2& ribbon combine &", x0: 35.0, x1: 0.0 },
  { name: "} Coins from monsters &", x0: 10.0, x1: 1.0 },
  { name: "} gains from clickers &", x0: 100.0, x1: 1.0 },
  { name: "+1 Trim Slot and +100 Wiz Max LV &", x0: 1.0, x1: 0.0 },
  { name: "2& extra Snail Mail every day", x0: 1.0, x1: 0.0 },
  { name: "} Ninja Stealth &", x0: 25.0, x1: 1.0 },
  { name: "2& Extra Bones on Deathbringer", x0: 1.0, x1: 0.0 },
  { name: "2& daily particle bubble upg", x0: 1.0, x1: 0.0 },
  { name: "+{% Spelunking EXP Gain", x0: 250.0, x1: 0.0 },
  { name: "+{% Research AFK Gains rate", x0: 3.0, x1: 0.0 },
  { name: "World 7 bonus... what will it be...?", x0: 1.0, x1: 0.0 },
  { name: "World 8 bonus... what will it be...?", x0: 1.0, x1: 0.0 },
  { name: "World 8 bonus... what will it be...?", x0: 1.0, x1: 0.0 },
]
