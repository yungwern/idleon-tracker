// Bonus Ballot (W2 Vote Ballot, first vote): one bonus wins each week (serverVars voteCategories[0]).
// value = base %, × the account's ballot multi (utils/voteUtils.js). From Toolbox ninjaExtraInfo[38].
export const ballotBonuses = [
  { text: "All your characters deal }x more damage to enemies", value: 25 },
  { text: "All your characters deal }x more damage to enemies", value: 25 },
  { text: "Increases STR AGI WIS and LUK for all characters by +{%", value: 15 },
  { text: "Increases Defence and Accuracy by +{% for all characters", value: 30 },
  { text: "Logging in each day gives +{ more GP to your guild than you normally do", value: 30 },
  { text: "}x Kill per Kill, making monster kills worth more for portals and Deathnote", value: 20 },
  { text: "+{% AFK gain for both fighting and skills for all characters", value: 15 },
  { text: "Boosts all Mining EXP gain and Mining Efficiency by +{%", value: 42 },
  { text: "Boosts all Fishing EXP gain and Fishing Efficiency by +{%", value: 50 },
  { text: "Boosts all Choppin' EXP gain and Choppin' Efficiency by +{%", value: 38 },
  { text: "Boosts all Catching EXP gain and Catching Efficiency by +{%", value: 46 },
  { text: "Increases the amount of resources produced by the 3D Printer by }x", value: 20 },
  { text: "Boosts liquid generation rate for all Alchemy liquids by +{%", value: 25 },
  { text: "Boosts all Cooking EXP gain and Cooking Speed by +{%", value: 63 },
  { text: "Boosts Dungeon Credit and Dungeon Flurbo gain by }x", value: 50 },
  { text: "All your characters gain +{% more Class EXP from monsters", value: 60 },
  { text: "Speeds up Egg Incubation time and Breeding EXP gain by +{%", value: 50 },
  { text: "Boosts Sigil EXP gain by }x, still requires Sigils active in Lab", value: 80 },
  { text: "Boosts Construction Build Rate and Construction EXP gain by +{%", value: 40 },
  { text: "Boosts Shrine EXP gain by a staggering }x", value: 53 },
  { text: "Boosts Artifact Find chance in Sailing by }x", value: 31 },
  { text: "Boosts New Species chance when using DNA in Gaming by }x", value: 80 },
  { text: "Find +{% more Gold Nuggets when digging with the Shovel in Gaming", value: 75 },
  { text: "Boosts Divinity PTS gain by }x and Divinity EXP Gain by +{%", value: 60 },
  { text: "Boosts Sailing Captain EXP gain and Sailing Speed by }x", value: 50 },
  { text: "Boosts Sneaking Stealth by }x and EXP Gain by +{% for all your Ninja Twins", value: 65 },
  { text: "Boosts bonuses from all Golden Food by +{%", value: 30 },
  { text: "Increases Drop Rate for all your characters by +{%", value: 38 },
  { text: "Boosts Summoning EXP gain by +{% and all Essence gained by }x", value: 40 },
  { text: "Boosts Crop Value, and Farming EXP gain, AND Next Crop Chance by +{%", value: 40 },
  { text: "Increases Trapping EXP gain and Worship EXP gain by +{%", value: 54 },
  { text: "Increases Lab EXP gain by +{%", value: 90 },
  { text: "Boosts Equinox Bar Fill rate by }x", value: 40 },
  { text: "Boosts Refinery Cycle Speed by +{%", value: 50 },
  { text: "Increases cash earned from monsters by +{%", value: 52 },
]

// Multi Meritocracy (W2 Vote Ballot, second vote): one bonus wins each week (serverVars voteCat2[0]).
// value = base %, × the account's Meritocracy multi (utils/voteUtils.js). From Toolbox ninjaExtraInfo[41].
export const meritocracyBonuses = [
  { text: "Multiplies everything in the game by 1.00x", value: 0 },
  { text: "Multiplies all Gaming Bits gained by }x", value: 700 },
  { text: "Multiplies your chance to get Double Snail Mail each day by }x", value: 150 },
  { text: "Kattlekruk gives }x more Bubble LVs than normal each day", value: 200 },
  { text: "Multiplies how many Shiny Critters you get from Trapping by }x", value: 400 },
  { text: "Multiplies your Total Damage dealt to monsters by }x", value: 200 },
  { text: "Multiplies all the Jade your ninja twins find by }x", value: 900 },
  { text: "Multiplies your Monument Reward Multi by }x", value: 200 },
  { text: "Multiplies your total Palette Luck in Gaming by }x", value: 200 },
  { text: "The Bonus Ballo... ugh, THAT guy... the Bonus Ballot's stuff is like }x more or whatever...", value: 100 },
  { text: "Multiplies Skill EXP gain by }x", value: 125 },
  { text: "You get }x more Ribbons added to your Ribbon Shelf every day", value: 100 },
  { text: "Multiplies Feather and Fish production Rate by }x for your friends Orion and Poppy", value: 9900 },
  { text: "Your Beryllium atom creates }x more PO Boxes each day while still using up just 1 Silver Pen", value: 200 },
  { text: "All material costs for upgrading Stamp Max LV are }x lower", value: 100 },
  { text: "You're guaranteed }x more Crystal Mobs than normal to start each day", value: 100 },
  { text: "Get }x more Worship PTS while playing Tower Defence", value: 100 },
  { text: "Stamina Regeneration Rate in Spelunking is }x faster", value: 200 },
  { text: "Multiplies the chance for Killroy Skulls to drop by }x", value: 200 },
  { text: "When you claim 48hrs or less of AFK gains on a Masterclass, you get }x more AFK items", value: 200 },
  { text: "All of your Vials give }x higher bonuses than normal", value: 50 },
  { text: "All of your Sigils give }x higher bonuses than normal", value: 40 },
  { text: "All of your Starsigns give }x higher bonuses than normal", value: 60 },
  { text: "All of your Slab give }x higher bonuses than normal", value: 30 },
  { text: "Your Brain Coral gives }x more daily LVs for your Grind Time bubble", value: 200 },
  { text: "All masterclasses find }x more Bones, Dust, and Tachyons", value: 200 },
  { text: "All of your Statues give }x higher bonuses than normal", value: 50 },
  { text: "Multiplies Class EXP gain by }x", value: 150 },
]

// Name and box sprite for each weekly vote (Home rows, Weekly Votes tabs)
export const voteTitles = {
  ballot: 'Bonus Ballot',
  meritocracy: 'Meritocracy',
}

export const voteIcons = {
  ballot: 'images/home/vote-ballot.png',
  meritocracy: 'images/home/meritocracy.png',
}
