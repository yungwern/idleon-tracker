// ── Obol Map ─────────────────────────────────────────────────────────────────
// Upgrade order: Bronze → Silver → Gold → Platinum → Pink
// Hyper obols are standalone with a B-variant upgrade (base → b)
// Boss/miniboss obols are single variant
//
// Stats per variant:
//   STR, AGI, WIS, LUK, def        — base stat bonuses
//   wp                             — Weapon Power
//   skillPower                     — skill-specific power (Mining, Choppin, etc.)
//   uq1, uq1val, uq2, uq2val       — unique bonuses (null if none)

export const obolMap = {
  // ── Numbered Obols ────────────────────────────────────────────────────────
  0: {
    type: 'stat',
    bronze:   { name: 'Bronze STR Obol',   rawName: 'ObolBronze0',   STR: 1 },
    silver:   { name: 'Silver STR Obol',   rawName: 'ObolSilver0',   STR: 2 },
    gold:     { name: 'Gold STR Obol',     rawName: 'ObolGold0',     STR: 4 },
    platinum: { name: 'Platinum STR Obol', rawName: 'ObolPlatinum0', STR: 7 },
    pink:     { name: 'Dementia STR Obol', rawName: 'ObolPink0',     STR: 12,  wp: 1 } },
  1: {
    type: 'stat',
    bronze:   { name: 'Bronze AGI Obol',   rawName: 'ObolBronze1',  AGI: 1 },
    silver:   { name: 'Silver AGI Obol',   rawName: 'ObolSilver1',  AGI: 2 },
    gold:     { name: 'Gold AGI Obol',     rawName: 'ObolGold1',  AGI: 4 },
    platinum: { name: 'Platinum AGI Obol', rawName: 'ObolPlatinum1',  AGI: 7 },
    pink:     { name: 'Dementia AGI Obol', rawName: 'ObolPink1',  AGI: 12,  wp: 1 } },
  2: {
    type: 'stat',
    bronze:   { name: 'Bronze WIS Obol',   rawName: 'ObolBronze2',  WIS: 1 },
    silver:   { name: 'Silver WIS Obol',   rawName: 'ObolSilver2',  WIS: 2 },
    gold:     { name: 'Gold WIS Obol',     rawName: 'ObolGold2',  WIS: 4 },
    platinum: { name: 'Platinum WIS Obol', rawName: 'ObolPlatinum2',  WIS: 7 },
    pink:     { name: 'Dementia WIS Obol', rawName: 'ObolPink2',  WIS: 12,  wp: 1 } },
  3: {
    type: 'stat',
    bronze:   { name: 'Bronze LUK Obol',   rawName: 'ObolBronze3',  LUK: 1 },
    silver:   { name: 'Silver LUK Obol',   rawName: 'ObolSilver3',  LUK: 2 },
    gold:     { name: 'Gold LUK Obol',     rawName: 'ObolGold3',  LUK: 4 },
    platinum: { name: 'Platinum LUK Obol', rawName: 'ObolPlatinum3',  LUK: 7 },
    pink:     { name: 'Dementia LUK Obol', rawName: 'ObolPink3',  LUK: 12,  wp: 1 } },

  // ── Skill Obols ───────────────────────────────────────────────────────────
  card: {
    type: 'misc',
    bronze:   { name: 'Bronze Obol of Cards',   rawName: 'ObolBronzeCard', uq1: '%_CARD_DROP_CHANCE', uq1val: 1 },
    silver:   { name: 'Silver Obol of Cards',   rawName: 'ObolSilverCard',   STR: 1, AGI: 1, WIS: 1, uq1: '%_CARD_DROP_CHANCE', uq1val: 3 },
    gold:     { name: 'Golden Obol of Cards',   rawName: 'ObolGoldCard',     STR: 2, AGI: 2, WIS: 2, uq1: '%_CARD_DROP_CHANCE', uq1val: 5 },
    platinum: { name: 'Platinum Obol of Cards', rawName: 'ObolPlatinumCard', STR: 3, AGI: 3, WIS: 3, uq1: '%_CARD_DROP_CHANCE', uq1val: 7 },
    pink:     { name: 'Dementia Obol of Cards', rawName: 'ObolPinkCard',     STR: 5, AGI: 5, WIS: 5, wp: 1, uq1: '%_CARD_DROP_CHANCE', uq1val: 10 } },
  catching: {
    type: 'skilling',
    bronze:   { name: 'Bronze Obol of Few Flies',           rawName: 'ObolBronzeCatching', skillPower: { Catching: 1 } },
    silver:   { name: 'Silver Obol of Big Bugs',            rawName: 'ObolSilverCatching', AGI: 1, skillPower: { Catching: 2 } },
    gold:     { name: 'Golden Obol of Insane Insects',      rawName: 'ObolGoldCatching', AGI: 2, skillPower: { Catching: 3 } },
    platinum: { name: 'Platinum Obol of Ample Anthropods',  rawName: 'ObolPlatinumCatching', AGI: 3, skillPower: { Catching: 4 }, uq1: '%_CATCH_EFFICINCY', uq1val: 2 },
    pink:     { name: 'Dementia Obol of Colossal Crawlies', rawName: 'ObolPinkCatching', AGI: 5, skillPower: { Catching: 5 }, uq1: '%_CATCH_EFFICINCY', uq1val: 8 } },
  choppin: {
    type: 'skilling',
    bronze:   { name: 'Bronze Obol of Chippin Chops', rawName: 'ObolBronzeChoppin', skillPower: { Choppin: 1 } },
    silver:   { name: 'Silver Obol of Big Bark',      rawName: 'ObolSilverChoppin', WIS: 1, skillPower: { Choppin: 2 } },
    gold:     { name: 'Golden Obol of Huge Hackin',   rawName: 'ObolGoldChoppin', WIS: 2, skillPower: { Choppin: 3 } },
    platinum: { name: 'Platinum Obol of Lumby Loggo', rawName: 'ObolPlatinumChoppin', WIS: 3, wp: 4, skillPower: { Choppin: 0 }, uq1: '%_CHOP_EFFICIENCY', uq1val: 2 },
    pink:     { name: 'Dementia Obol of WOWOWOWWO',   rawName: 'ObolPinkChoppin', WIS: 5, wp: 5, skillPower: { Choppin: 0 }, uq1: '%_CHOP_EFFICIENCY', uq1val: 8 } },
  cons: {
    type: 'skilling',
    bronze:   { name: 'Bronze Obol of Construction',   rawName: 'ObolBronzeCons', uq1: '%_BUILD_SPD', uq1val: 1 },
    silver:   { name: 'Silver Obol of Construction',   rawName: 'ObolSilverCons',   STR: 1, uq1: '%_BUILD_SPD', uq1val: 2 },
    gold:     { name: 'Golden Obol of Construction',   rawName: 'ObolGoldCons',     STR: 2, uq1: '%_BUILD_SPD', uq1val: 5 },
    platinum: { name: 'Platinum Obol of Construction', rawName: 'ObolPlatinumCons', STR: 3, uq1: '%_BUILD_SPD', uq1val: 12 },
    pink:     { name: 'Dementia Obol of Construction', rawName: 'ObolPinkCons',     STR: 5, uq1: '%_BUILD_SPD', uq1val: 20 } },
  damage: {
    type: 'fighting',
    bronze:   { name: 'Bronze Obol of Puny Damage',      rawName: 'ObolBronzeDamage', uq1: '_BASE_DAMAGE', uq1val: 5 },
    silver:   { name: 'Silver Obol of Little Damage',    rawName: 'ObolSilverDamage',   STR: 1, AGI: 1, WIS: 1, uq1: '_BASE_DAMAGE', uq1val: 10 },
    gold:     { name: 'Golden Obol of Big Boy Damage',   rawName: 'ObolGoldDamage',     STR: 1, AGI: 1, WIS: 1, wp: 1, uq1: '_BASE_DAMAGE', uq1val: 20 },
    platinum: { name: 'Platinum Obol of Lethal Damage',  rawName: 'ObolPlatinumDamage', STR: 2, AGI: 3, WIS: 3, LUK: 3, wp: 2, uq1: '_BASE_DAMAGE', uq1val: 50 },
    pink:     { name: 'Dementia Obol of Infinite Damage',rawName: 'ObolPinkDamage',     STR: 5, AGI: 5, WIS: 5, LUK: 5, wp: 3, uq1: '_BASE_DAMAGE', uq1val: 100 } },
  def: {
    type: 'fighting',
    bronze:   { name: 'Bronze Obol of Defence',             rawName: 'ObolBronzeDef', def: 1 },
    silver:   { name: 'Silver Obol of Defence',             rawName: 'ObolSilverDef', def: 3 },
    gold:     { name: 'Golden Obol of Defence',             rawName: 'ObolGoldDef', def: 6 },
    platinum: { name: 'Platinum Obol of Defense with an S', rawName: 'ObolPlatinumDef', def: 15 },
    pink:     { name: 'Dementia Obol of Defence',           rawName: 'ObolPinkDef', def: 25 } },
  exp: {
    type: 'misc',
    bronze:   { name: 'Bronze Obol of Experience',   rawName: 'ObolBronzeEXP', uq1: '%_XP_FROM_MONSTERS', uq1val: 1 },
    silver:   { name: 'Silver Obol of Experience',   rawName: 'ObolSilverEXP',   STR: 1, AGI: 1, WIS: 1, uq1: '%_XP_FROM_MONSTERS', uq1val: 1 },
    gold:     { name: 'Golden Obol of Experience',   rawName: 'ObolGoldEXP',     STR: 2, AGI: 2, WIS: 2, uq1: '%_XP_FROM_MONSTERS', uq1val: 2 },
    platinum: { name: 'Platinum Obol of Experience', rawName: 'ObolPlatinumEXP', STR: 3, AGI: 3, WIS: 3, uq1: '%_XP_FROM_MONSTERS', uq1val: 3 },
    pink:     { name: 'Dementia Obol of Experience', rawName: 'ObolPinkEXP',     STR: 5, AGI: 5, WIS: 5, wp: 1, uq1: '%_XP_FROM_MONSTERS', uq1val: 4 } },
  fishing: {
    type: 'skilling',
    bronze:   { name: 'Bronze Obol of Finite Fish',        rawName: 'ObolBronzeFishing', skillPower: { Fishing: 1 } },
    silver:   { name: 'Silver Obol of Puny Pikes',         rawName: 'ObolSilverFishing',   STR: 1, skillPower: { Fishing: 2 } },
    gold:     { name: 'Golden Obol of Crazy Carp',         rawName: 'ObolGoldFishing',     STR: 2, skillPower: { Fishing: 3 } },
    platinum: { name: 'Platinum Obol of Tremendous Trout', rawName: 'ObolPlatinumFishing', STR: 3, skillPower: { Fishing: 4 }, uq1: '%_FISHIN_EFFICINCY', uq1val: 2 },
    pink:     { name: 'Dementia Obol of Monument Marlins', rawName: 'ObolPinkFishing',     STR: 5, skillPower: { Fishing: 5 }, uq1: '%_FISHIN_EFFICINCY', uq1val: 8 } },
  kill: {
    type: 'fighting',
    bronze:   { name: 'Bronze Obol of Multikill',      rawName: 'ObolBronzeKill', uq1: '%_MULTIKILL', uq1val: 1 },
    silver:   { name: 'Silver Obol of Megakill',       rawName: 'ObolSilverKill', uq1: '%_MULTIKILL', uq1val: 2 },
    gold:     { name: 'Golden Obol of Ultrakill',      rawName: 'ObolGoldKill', wp: 1, uq1: '%_MULTIKILL', uq1val: 3 },
    platinum: { name: 'Platinum Obol of Killimanjaro', rawName: 'ObolPlatinumKill', wp: 1, uq1: '%_MULTIKILL', uq1val: 5 },
    pink:     { name: 'Dementia Obol of Killionaire',  rawName: 'ObolPinkKill', wp: 2, uq1: '%_MULTIKILL', uq1val: 10 } },
  mining: {
    type: 'skilling',
    bronze:   { name: 'Bronze Obol of Small Swings',         rawName: 'ObolBronzeMining', skillPower: { Mining: 1 } },
    silver:   { name: 'Silver Obol of Moderate Mining',      rawName: 'ObolSilverMining',   STR: 1, skillPower: { Mining: 2 } },
    gold:     { name: 'Golden Obol of Diligent Digging',     rawName: 'ObolGoldMining',     STR: 2, skillPower: { Mining: 3 } },
    platinum: { name: 'Platinum Obol of Dwarven Delving',    rawName: 'ObolPlatinumMining', STR: 3, skillPower: { Mining: 4 }, uq1: '%_MINING_EFFICINCY', uq1val: 2 },
    pink:     { name: 'Dementia Obol of Magisterial Metals', rawName: 'ObolPinkMining',     STR: 5, skillPower: { Mining: 5 }, uq1: '%_MINING_EFFICINCY', uq1val: 8 } },
  pop: {
    type: 'misc',
    bronze:   { name: 'Bronze Obol of Pop',               rawName: 'ObolBronzePop', LUK: 1,  def: 1, uq1: '%_DROP_RATE', uq1val: 2 },
    silver:   { name: 'Silver Obol of Pop Pop',           rawName: 'ObolSilverPop', LUK: 3,  def: 2, uq1: '%_DROP_RATE', uq1val: 3 },
    gold:     { name: 'Golden Obol of Poppity Pop',       rawName: 'ObolGoldPop', LUK: 6,  def: 3, uq1: '%_DROP_RATE', uq1val: 4 },
    platinum: { name: 'Platinum Obol of Poppity Poppy',   rawName: 'ObolPlatinumPop', LUK: 9,  def: 4, uq1: '%_DROP_RATE', uq1val: 6 },
    pink:     { name: 'Dementia Obol of Pop Pop Pop Pop', rawName: 'ObolPinkPop', LUK: 12, def: 5, uq1: '%_DROP_RATE', uq1val: 9 } },
  trapping: {
    type: 'skilling',
    bronze:   { name: 'Bronze Obol of Trapping',   rawName: 'ObolBronzeTrapping', wp: 1 },
    silver:   { name: 'Silver Obol of Trapping',   rawName: 'ObolSilverTrapping', AGI: 1, wp: 2 },
    gold:     { name: 'Golden Obol of Trapping',   rawName: 'ObolGoldTrapping', AGI: 2, wp: 3 },
    platinum: { name: 'Platinum Obol of Trapping', rawName: 'ObolPlatinumTrapping', AGI: 3, wp: 5 },
    pink:     { name: 'Dementia Obol of Trapping', rawName: 'ObolPinkTrapping', AGI: 5, wp: 7 } },
  worship: {
    type: 'skilling',
    bronze:   { name: 'Bronze Obol of Worship',   rawName: 'ObolBronzeWorship', wp: 1 },
    silver:   { name: 'Silver Obol of Worship',   rawName: 'ObolSilverWorship', WIS: 1, wp: 2 },
    gold:     { name: 'Golden Obol of Worship',   rawName: 'ObolGoldWorship', WIS: 2, wp: 3 },
    platinum: { name: 'Platinum Obol of Worship', rawName: 'ObolPlatinumWorship', WIS: 3, wp: 5 },
    pink:     { name: 'Dementia Obol of Worship', rawName: 'ObolPinkWorship', WIS: 5, wp: 7 } },

  // ── Partial-tier Skill Obols ──────────────────────────────────────────────
  luck: {
    type: 'misc',
    silver:   { name: 'Silver Obol of Double Sixes',    rawName: 'ObolSilverLuck', LUK: 2, uq1: '%_DROP_RATE', uq1val: 5 },
    gold:     { name: 'Golden Obol of Triple Sixes',    rawName: 'ObolGoldLuck', LUK: 3, uq1: '%_DROP_RATE', uq1val: 7 },
    platinum: { name: 'Platinum Obol of Yahtzee Sixes', rawName: 'ObolPlatinumLuck', LUK: 5, uq1: '%_DROP_RATE', uq1val: 10 },
    pink:     { name: 'Dementia Obol of Infinisixes',   rawName: 'ObolPinkLuck', LUK: 7, uq1: '%_DROP_RATE', uq1val: 15 } },
  money: {
    type: 'misc',
    silver: { name: 'Silver Obol of Pocket Change',    rawName: 'ObolSilverMoney', uq1: '%_MONEY', uq1val: 6 },
    gold:   { name: 'Golden Obol of Plentiful Riches', rawName: 'ObolGoldMoney', uq1: '%_MONEY', uq1val: 10 } },

  // ── Hyper Obols ───────────────────────────────────────────────────────────
  hyper0: {
    type: 'gemshop',
    base: { name: 'Hyper Obol of Lucky Rolls',      rawName: 'ObolHyper0', wp: 1, uq1: '%_DROP_RATE',  uq1val: 4 },
    b:    { name: 'Hyper Obol of Rare Drops',        rawName: 'ObolHyperB0', wp: 5, uq1: '%_DROP_RATE',  uq1val: 10 } },
  hyper1: {
    type: 'gemshop',
    base: { name: 'Hyper Obol of Stragiwisluk',     rawName: 'ObolHyper1', wp: 1, uq1: '%_ALL_STATS',  uq1val: 2 },
    b:    { name: 'Hyper Obol of All Statisticals',  rawName: 'ObolHyperB1', wp: 5, uq1: '%_ALL_STATS',  uq1val: 5 } },
  hyper2: {
    type: 'gemshop',
    base: { name: 'Hyper Obol of Supa Damagio',     rawName: 'ObolHyper2', wp: 1, uq1: '%_TOTAL_DAMAGE', uq1val: 3 },
    b:    { name: 'Hyper Obol of Mega Damagio',      rawName: 'ObolHyperB2', wp: 5, uq1: '%_TOTAL_DAMAGE', uq1val: 12 } },
  hyper3: {
    type: 'gemshop',
    base: { name: 'Hyper Obol of Destruction',      rawName: 'ObolHyper3', wp: 2, uq1: '%_MULTIKILL_PER_TIER', uq1val: 2 },
    b:    { name: 'Hyper Obol of Decimation',        rawName: 'ObolHyperB3', wp: 8, uq1: '%_MULTIKILL_PER_TIER', uq1val: 6 } },

  // ── Boss / Miniboss Obols ─────────────────────────────────────────────────
  amarok:  { type: 'boss',      name: "Granite Obol of Amarok's Stare",  rawName: 'ObolAmarokA', STR: 2,   AGI: 2,   WIS: 2,   LUK: 2,   def: 5, uq1: '%_DEFENCE',             uq1val: 4  },
  efaunt:  { type: 'boss',      name: "Skeletal Obol of Efaunt's Gaze",  rawName: 'ObolEfauntA', STR: 5,   AGI: 5,   WIS: 5,   LUK: 5,  wp: 2, uq1: '%_BOSS_DAMAGE',          uq1val: 5  },
  chizoar: { type: 'boss',      name: "Frozen Obol of Chizoar's Rage",   rawName: 'ObolChizoarA',   def: 2,  wp: 4, uq1: '%_TOTAL_DAMAGE',         uq1val: 4  },
  emp:     { type: 'boss',      name: 'Gilded Obol of the Emperor',      rawName: 'ObolEmp',     STR: 100, AGI: 100, WIS: 100, LUK: 100, def: 50, wp: 30, uq1: '%_ALL_STATS',            uq1val: 10, uq2: '%_SKILL_EFFICIENCY', uq2val: 10 },
  frog:    { type: 'eventboss', name: 'Grumpy Obol of the Grandfrogger', rawName: 'ObolFrog',   def: 2, uq1: '%_MONEY',                uq1val: 12, uq2: '%_DROP_RATE',        uq2val: 1  },
  knight:  { type: 'eventboss', name: 'Vigilant Obol of Ice Guard',      rawName: 'ObolKnight',  STR: 3,   AGI: 3,   WIS: 3,   LUK: 3,   def: 5,  wp: 2, uq1: '%_DROP_RATE',            uq1val: 8  },
  kruk:    { type: 'boss',      name: 'Molten Obol of Dead Divine',      rawName: 'ObolKruk',    STR: 15,  AGI: 15,  WIS: 15,  LUK: 15,  wp: 7, uq1: '%_ALL_AFK_GAIN',         uq1val: 5,  uq2: '%_TOTAL_DAMAGE',     uq2val: 2  },
  lava:    { type: 'miniboss',  name: 'Magma Obol of Big Time Domeo',    rawName: 'ObolLava',   LUK: 10, uq1: '%_DROP_RATE',            uq1val: 14  },
  slush:   { type: 'miniboss',  name: 'Slushy Obol of Much Dilapidation',rawName: 'ObolSlush',   STR: 4,   AGI: 4,   WIS: 4,   LUK: 4, uq1: '%_SKILL_EFFICIENCY',     uq1val: 3  },
  troll:   { type: 'boss',      name: 'Jagged Obol of Massive Trolling', rawName: 'ObolTroll',   STR: 9,   AGI: 9,   WIS: 9,   LUK: 9,   def: 10, wp: 4, uq1: '%_ALL_STATS',            uq1val: 3  } }

// ── Flat rawName lookup ───────────────────────────────────────────────────────
// Maps rawName → full variant data including stats
export const obolByRawName = (() => {
  const map = {}
  for (const entry of Object.values(obolMap)) {
    if (entry.rawName) {
      map[entry.rawName] = { ...entry }
      continue
    }
    const { type, ...variants } = entry
    for (const variant of Object.values(variants)) {
      if (variant?.rawName) {
        map[variant.rawName] = { ...variant, type }
      }
    }
  }
  return map
})()

// ── Obol Farm Map ─────────────────────────────────────────────────────────────
export const obolFarmMap = {
  // Stat obols
  0:        { farmRawName: 'ObolBronze0',        mobKey: 'Bored_Bean',    notes: null },
  1:        { farmRawName: 'ObolSilver1',         mobKey: 'Sandy_Pot',     notes: null },
  2:        { farmRawName: 'ObolSilver2',         mobKey: 'Sand_Castle',   notes: null },
  3:        { farmRawName: 'ObolSilver3',         mobKey: 'Tyson',         notes: null },

  // Skill obols
  luck:     { farmRawName: 'ObolSilverLuck',      mobKey: 'Sand_Castle',   notes: null },
  pop:      { farmRawName: 'ObolBronzePop',       mobKey: 'Gigafrog',      notes: null },
  money:    { farmRawName: 'ObolSilverMoney',     mobKey: 'Bored_Bean',    notes: null },
  damage:   { farmRawName: 'ObolSilverDamage',    mobKey: 'Bored_Bean',    notes: null },
  def:      { farmRawName: 'ObolBronzeDef',       mobKey: 'Sandy_Pot',     notes: null },
  exp:      { farmRawName: 'ObolBronzeEXP',       mobKey: 'Bored_Bean',    notes: null },
  kill:     { farmRawName: 'ObolBronzeKill',      mobKey: 'Dedotated_Ram', notes: null },
  cons:     { farmRawName: 'ObolBronzeCons',      mobKey: 'Dedotated_Ram', notes: null },
  trapping: { farmRawName: 'ObolBronzeTrapping',  mobKey: 'Mamooth',       notes: null },
  worship:  { farmRawName: 'ObolBronzeWorship',   mobKey: 'Sir_Stache',    notes: null },

  // Alchemy shop only
  card:     { farmRawName: 'ObolBronzeCard',      mobKey: 'Liquid1_x1',   notes: 'Only available from Alchemy Shop liquid purchases' },
  choppin:  { farmRawName: 'ObolBronzeChoppin',   mobKey: 'Liquid1_x1',   notes: 'Only available from Alchemy Shop liquid purchases' },
  mining:   { farmRawName: 'ObolBronzeMining',    mobKey: 'Liquid1_x1',   notes: 'Only available from Alchemy Shop liquid purchases' },
  catching: { farmRawName: 'ObolBronzeCatching',  mobKey: 'Liquid1_x1',   notes: 'Only available from Alchemy Shop liquid purchases' },
  fishing:  { farmRawName: 'ObolBronzeFishing',   mobKey: 'Liquid1_x1',   notes: 'Only available from Alchemy Shop liquid purchases' },

  // Boss / Event obols
  frog:    { farmRawName: 'ObolFrog',     mobKey: 'Grandfrogger',  notes: 'Angry Frog seasonal event' },
  amarok:  { farmRawName: 'ObolAmarokA',  mobKey: 'Amarok',        notes: 'Amarok world boss' },
  efaunt:  { farmRawName: 'ObolEfauntA',  mobKey: 'Efaunt',        notes: 'Efaunt world boss' },
  knight:  { farmRawName: 'ObolKnight',   mobKey: 'Ice_Guard',     notes: 'Glacial Guild seasonal event' },
  chizoar: { farmRawName: 'ObolChizoarA', mobKey: 'Chizoar',       notes: 'Chizoar world boss' },
  troll:   { farmRawName: 'ObolTroll',    mobKey: 'Massive_Troll', notes: 'Troll world boss' },
  lava:    { farmRawName: 'ObolLava',     mobKey: 'Domeo_Magmus',  notes: 'Domeo Magmus miniboss' },
  kruk:    { farmRawName: 'ObolKruk',     mobKey: 'Kattlekruk',    notes: 'Kattlekruk world boss' },
  emp:     { farmRawName: 'ObolEmp',      mobKey: 'Emperor',       notes: 'Emperor world boss' },

  // Hyper obols
  hyper0:  { farmRawName: 'ObolHyper0',   mobKey: 'PremiumGem',    notes: 'Limited time gem shop purchase only' },
  hyper1:  { farmRawName: 'ObolHyper1',   mobKey: 'PremiumGem',    notes: 'Limited time gem shop purchase only' },
  hyper2:  { farmRawName: 'ObolHyper2',   mobKey: 'PremiumGem',    notes: 'Limited time gem shop purchase only' },
  hyper3:  { farmRawName: 'ObolHyper3',   mobKey: 'PremiumGem',    notes: 'Limited time gem shop purchase only' } }

// ── Tier Lists ────────────────────────────────────────────────────────────────
const TIER_SUBLABELS = {
  s: 'Best',
  a: 'Good',
  b: 'Worth Keeping',
  c: 'If Nothing Better',
  d: 'Fragment' }

export const circleTiers = [
  { id: 's', label: 'S', sublabel: TIER_SUBLABELS.s, items: ['ObolSilverPop', 'ObolHyper0', 'ObolHyper1'] },
  { id: 'a', label: 'A', sublabel: TIER_SUBLABELS.a, items: ['ObolBronzePop', 'ObolSilverMining', 'ObolHyper3', 'ObolHyper2', 'ObolSilverCons'] },
  { id: 'b', label: 'B', sublabel: TIER_SUBLABELS.b, items: ['ObolBronzeCons', 'ObolBronzeMining'] },
  { id: 'c', label: 'C', sublabel: TIER_SUBLABELS.c, items: ['ObolPlatinum0', 'ObolPlatinum1', 'ObolPlatinum2', 'ObolPlatinum3'] },
  { id: 'd', label: 'D', sublabel: TIER_SUBLABELS.d, items: ['ObolSilverEXP', 'ObolSilverKill', 'ObolSilverDef', 'ObolGoldDamage'] },
]

export const squareTiers = [
  { id: 's', label: 'S', sublabel: TIER_SUBLABELS.s, items: ['ObolHyperB0', 'ObolGoldLuck', 'ObolKnight', 'ObolHyperB3'] },
  { id: 'a', label: 'A', sublabel: TIER_SUBLABELS.a, items: ['ObolSilverLuck', 'ObolHyperB1', 'ObolHyperB2', 'ObolGoldMining', 'ObolGoldCons'] },
  { id: 'b', label: 'B', sublabel: TIER_SUBLABELS.b, items: ['ObolGoldMoney', 'ObolFrog'] },
  { id: 'c', label: 'C', sublabel: TIER_SUBLABELS.c, items: ['ObolGoldKill', 'ObolGoldPop', 'ObolPink0', 'ObolPink1', 'ObolPink2', 'ObolPink3'] },
  { id: 'd', label: 'D', sublabel: TIER_SUBLABELS.d, items: ['ObolSilverCard', 'ObolGoldEXP', 'ObolPlatinumDamage'] },
]

export const hexagonTiers = [
  { id: 's', label: 'S', sublabel: TIER_SUBLABELS.s, items: ['ObolPlatinumLuck', 'ObolLava', 'ObolSlush'] },
  { id: 'a', label: 'A', sublabel: TIER_SUBLABELS.a, items: ['ObolPlatinumMining', 'ObolPlatinumCons'] },
  { id: 'b', label: 'B', sublabel: TIER_SUBLABELS.b, items: ['ObolEfauntA', 'ObolChizoarA'] },
  { id: 'c', label: 'C', sublabel: TIER_SUBLABELS.c, items: ['ObolPlatinumPop', 'ObolPlatinumDef'] },
  { id: 'd', label: 'D', sublabel: TIER_SUBLABELS.d, items: ['ObolGoldCard', 'ObolPlatinumCard', 'ObolPlatinumEXP', 'ObolPlatinumKill', 'ObolPinkDamage', 'ObolAmarokA'] },
]

export const sparkleTiers = [
  { id: 's', label: 'S', sublabel: TIER_SUBLABELS.s, items: ['ObolPinkLuck', 'ObolEmp', 'ObolKruk'] },
  { id: 'a', label: 'A', sublabel: TIER_SUBLABELS.a, items: ['ObolPinkMining', 'ObolTroll', 'ObolPinkCons'] },
  { id: 'b', label: 'B', sublabel: TIER_SUBLABELS.b, items: [] },
  { id: 'c', label: 'C', sublabel: TIER_SUBLABELS.c, items: ['ObolPinkPop', 'ObolPinkTrapping', 'ObolPinkWorship'] },
  { id: 'd', label: 'D', sublabel: TIER_SUBLABELS.d, items: ['ObolPinkCard', 'ObolPinkEXP', 'ObolPinkKill', 'ObolPinkDef'] },
]

// ── Example Boards ────────────────────────────────────────────────────────────
export const idealAccountBoard = [
  'ObolSilverPop', 'ObolSilverPop', 'ObolGoldLuck', 'ObolSilverPop', 'ObolSilverPop',
  'ObolSilverPop', 'ObolPlatinumLuck', 'ObolPinkLuck', 'ObolPlatinumLuck', 'ObolSilverPop',
  'ObolGoldLuck', 'ObolPinkLuck', 'ObolPinkLuck', 'ObolGoldLuck',
  'ObolSilverPop', 'ObolPlatinumLuck', 'ObolPinkLuck', 'ObolPlatinumLuck', 'ObolSilverPop',
  'ObolSilverPop', 'ObolSilverPop', 'ObolGoldLuck', 'ObolSilverPop', 'ObolSilverPop',
]

export const endgameAccountBoard = [
  'ObolSilverPop', 'ObolSilverPop', 'ObolKnight', 'ObolSilverPop', 'ObolSilverPop',
  'ObolSilverPop', 'ObolLava', 'ObolEmp', 'ObolLava', 'ObolSilverPop',
  'ObolKnight', 'ObolEmp', 'ObolEmp', 'ObolKnight',
  'ObolSilverPop', 'ObolLava', 'ObolEmp', 'ObolKnight', 'ObolSilverPop',
  'ObolSilverPop', 'ObolSilverPop', 'ObolKnight', 'ObolSilverPop', 'ObolSilverPop',
]

export const characterBoards = {
  dr: {
    label: 'Drop Rate',
    slots: [
      'ObolGoldLuck', 'ObolPlatinumLuck', 'ObolGoldLuck',
      'ObolSilverPop', 'ObolSilverPop',
      'ObolSilverPop', 'ObolSilverPop',
      'ObolSilverPop', 'ObolSilverPop',
      'ObolGoldLuck', 'ObolPinkLuck', 'ObolGoldLuck',
      'ObolSilverPop', 'ObolSilverPop',
      'ObolSilverPop', 'ObolSilverPop',
      'ObolSilverPop', 'ObolSilverPop',
      'ObolGoldLuck', 'ObolPlatinumLuck', 'ObolGoldLuck',
    ] },
  skilling: {
    label: 'Skilling',
    slots: [
      'ObolGoldMining', 'ObolSlush', 'ObolGoldMining',
      'ObolSilverMining', 'ObolSilverMining',
      'ObolSilverMining', 'ObolSilverMining',
      'ObolSilverMining', 'ObolSilverMining',
      'ObolGoldMining', 'ObolPinkMining', 'ObolGoldMining',
      'ObolSilverMining', 'ObolSilverMining',
      'ObolSilverMining', 'ObolSilverMining',
      'ObolSilverMining', 'ObolSilverMining',
      'ObolGoldMining', 'ObolSlush', 'ObolGoldMining',
    ] },
  construction: {
    label: 'Construction',
    slots: [
      'ObolGoldCons', 'ObolPlatinumCons', 'ObolGoldCons',
      'ObolSilverCons', 'ObolSilverCons',
      'ObolSilverCons', 'ObolSilverCons',
      'ObolSilverCons', 'ObolSilverCons',
      'ObolGoldCons', 'ObolPinkCons', 'ObolGoldCons',
      'ObolSilverCons', 'ObolSilverCons',
      'ObolSilverCons', 'ObolSilverCons',
      'ObolSilverCons', 'ObolSilverCons',
      'ObolGoldCons', 'ObolPlatinumCons', 'ObolGoldCons',
    ] } }