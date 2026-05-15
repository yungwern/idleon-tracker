// ── Obol Map ─────────────────────────────────────────────────────────────────
// Upgrade order: Bronze → Silver → Gold → Platinum → Pink
// Hyper obols are standalone with a B-variant upgrade (base → b)
// Boss/miniboss obols are single variant

export const obolMap = {
  // ── Numbered Obols ────────────────────────────────────────────────────────
  0: {
    type: 'stat',
    bronze:   { name: 'Bronze STR Obol',   rawName: 'ObolBronze0' },
    silver:   { name: 'Silver STR Obol',   rawName: 'ObolSilver0' },
    gold:     { name: 'Gold STR Obol',     rawName: 'ObolGold0' },
    platinum: { name: 'Platinum STR Obol', rawName: 'ObolPlatinum0' },
    pink:     { name: 'Dementia STR Obol', rawName: 'ObolPink0' },
  },
  1: {
    type: 'stat',
    bronze:   { name: 'Bronze AGI Obol',   rawName: 'ObolBronze1' },
    silver:   { name: 'Silver AGI Obol',   rawName: 'ObolSilver1' },
    gold:     { name: 'Gold AGI Obol',     rawName: 'ObolGold1' },
    platinum: { name: 'Platinum AGI Obol', rawName: 'ObolPlatinum1' },
    pink:     { name: 'Dementia AGI Obol', rawName: 'ObolPink1' },
  },
  2: {
    type: 'stat',
    bronze:   { name: 'Bronze WIS Obol',   rawName: 'ObolBronze2' },
    silver:   { name: 'Silver WIS Obol',   rawName: 'ObolSilver2' },
    gold:     { name: 'Gold WIS Obol',     rawName: 'ObolGold2' },
    platinum: { name: 'Platinum WIS Obol', rawName: 'ObolPlatinum2' },
    pink:     { name: 'Dementia WIS Obol', rawName: 'ObolPink2' },
  },
  3: {
    type: 'stat',
    bronze:   { name: 'Bronze LUK Obol',   rawName: 'ObolBronze3' },
    silver:   { name: 'Silver LUK Obol',   rawName: 'ObolSilver3' },
    gold:     { name: 'Gold LUK Obol',     rawName: 'ObolGold3' },
    platinum: { name: 'Platinum LUK Obol', rawName: 'ObolPlatinum3' },
    pink:     { name: 'Dementia LUK Obol', rawName: 'ObolPink3' },
  },

  // ── Skill Obols ───────────────────────────────────────────────────────────
  card: {
    type: 'misc',
    bronze:   { name: 'Bronze Obol of Cards',   rawName: 'ObolBronzeCard' },
    silver:   { name: 'Silver Obol of Cards',   rawName: 'ObolSilverCard' },
    gold:     { name: 'Golden Obol of Cards',   rawName: 'ObolGoldCard' },
    platinum: { name: 'Platinum Obol of Cards', rawName: 'ObolPlatinumCard' },
    pink:     { name: 'Dementia Obol of Cards', rawName: 'ObolPinkCard' },
  },
  catching: {
    type: 'skilling',
    bronze:   { name: 'Bronze Obol of Few Flies',           rawName: 'ObolBronzeCatching' },
    silver:   { name: 'Silver Obol of Big Bugs',            rawName: 'ObolSilverCatching' },
    gold:     { name: 'Golden Obol of Insane Insects',      rawName: 'ObolGoldCatching' },
    platinum: { name: 'Platinum Obol of Ample Anthropods',  rawName: 'ObolPlatinumCatching' },
    pink:     { name: 'Dementia Obol of Colossal Crawlies', rawName: 'ObolPinkCatching' },
  },
  choppin: {
    type: 'skilling',
    bronze:   { name: 'Bronze Obol of Chippin Chops', rawName: 'ObolBronzeChoppin' },
    silver:   { name: 'Silver Obol of Big Bark',      rawName: 'ObolSilverChoppin' },
    gold:     { name: 'Golden Obol of Huge Hackin',   rawName: 'ObolGoldChoppin' },
    platinum: { name: 'Platinum Obol of Lumby Loggo', rawName: 'ObolPlatinumChoppin' },
    pink:     { name: 'Dementia Obol of WOWOWOWWO',   rawName: 'ObolPinkChoppin' },
  },
  cons: {
    type: 'skilling',
    bronze:   { name: 'Bronze Obol of Construction',   rawName: 'ObolBronzeCons' },
    silver:   { name: 'Silver Obol of Construction',   rawName: 'ObolSilverCons' },
    gold:     { name: 'Golden Obol of Construction',   rawName: 'ObolGoldCons' },
    platinum: { name: 'Platinum Obol of Construction', rawName: 'ObolPlatinumCons' },
    pink:     { name: 'Dementia Obol of Construction', rawName: 'ObolPinkCons' },
  },
  damage: {
    type: 'fighting',
    bronze:   { name: 'Bronze Obol of Puny Damage',      rawName: 'ObolBronzeDamage' },
    silver:   { name: 'Silver Obol of Little Damage',    rawName: 'ObolSilverDamage' },
    gold:     { name: 'Golden Obol of Big Boy Damage',   rawName: 'ObolGoldDamage' },
    platinum: { name: 'Platinum Obol of Lethal Damage',  rawName: 'ObolPlatinumDamage' },
    pink:     { name: 'Dementia Obol of Infinite Damage',rawName: 'ObolPinkDamage' },
  },
  def: {
    type: 'fighting',
    bronze:   { name: 'Bronze Obol of Defence',             rawName: 'ObolBronzeDef' },
    silver:   { name: 'Silver Obol of Defence',             rawName: 'ObolSilverDef' },
    gold:     { name: 'Golden Obol of Defence',             rawName: 'ObolGoldDef' },
    platinum: { name: 'Platinum Obol of Defense with an S', rawName: 'ObolPlatinumDef' },
    pink:     { name: 'Dementia Obol of Defence',           rawName: 'ObolPinkDef' },
  },
  exp: {
    type: 'misc',
    bronze:   { name: 'Bronze Obol of Experience',   rawName: 'ObolBronzeEXP' },
    silver:   { name: 'Silver Obol of Experience',   rawName: 'ObolSilverEXP' },
    gold:     { name: 'Golden Obol of Experience',   rawName: 'ObolGoldEXP' },
    platinum: { name: 'Platinum Obol of Experience', rawName: 'ObolPlatinumEXP' },
    pink:     { name: 'Dementia Obol of Experience', rawName: 'ObolPinkEXP' },
  },
  fishing: {
    type: 'skilling',
    bronze:   { name: 'Bronze Obol of Finite Fish',        rawName: 'ObolBronzeFishing' },
    silver:   { name: 'Silver Obol of Puny Pikes',         rawName: 'ObolSilverFishing' },
    gold:     { name: 'Golden Obol of Crazy Carp',         rawName: 'ObolGoldFishing' },
    platinum: { name: 'Platinum Obol of Tremendous Trout', rawName: 'ObolPlatinumFishing' },
    pink:     { name: 'Dementia Obol of Monument Marlins', rawName: 'ObolPinkFishing' },
  },
  kill: {
    type: 'fighting',
    bronze:   { name: 'Bronze Obol of Multikill',      rawName: 'ObolBronzeKill' },
    silver:   { name: 'Silver Obol of Megakill',       rawName: 'ObolSilverKill' },
    gold:     { name: 'Golden Obol of Ultrakill',      rawName: 'ObolGoldKill' },
    platinum: { name: 'Platinum Obol of Killimanjaro', rawName: 'ObolPlatinumKill' },
    pink:     { name: 'Dementia Obol of Killionaire',  rawName: 'ObolPinkKill' },
  },
  mining: {
    type: 'skilling',
    bronze:   { name: 'Bronze Obol of Small Swings',         rawName: 'ObolBronzeMining' },
    silver:   { name: 'Silver Obol of Moderate Mining',      rawName: 'ObolSilverMining' },
    gold:     { name: 'Golden Obol of Diligent Digging',     rawName: 'ObolGoldMining' },
    platinum: { name: 'Platinum Obol of Dwarven Delving',    rawName: 'ObolPlatinumMining' },
    pink:     { name: 'Dementia Obol of Magisterial Metals', rawName: 'ObolPinkMining' },
  },
  pop: {
    type: 'misc',
    bronze:   { name: 'Bronze Obol of Pop',               rawName: 'ObolBronzePop' },
    silver:   { name: 'Silver Obol of Pop Pop',           rawName: 'ObolSilverPop' },
    gold:     { name: 'Golden Obol of Poppity Pop',       rawName: 'ObolGoldPop' },
    platinum: { name: 'Platinum Obol of Poppity Poppy',   rawName: 'ObolPlatinumPop' },
    pink:     { name: 'Dementia Obol of Pop Pop Pop Pop', rawName: 'ObolPinkPop' },
  },
  trapping: {
    type: 'skilling',
    bronze:   { name: 'Bronze Obol of Trapping',   rawName: 'ObolBronzeTrapping' },
    silver:   { name: 'Silver Obol of Trapping',   rawName: 'ObolSilverTrapping' },
    gold:     { name: 'Golden Obol of Trapping',   rawName: 'ObolGoldTrapping' },
    platinum: { name: 'Platinum Obol of Trapping', rawName: 'ObolPlatinumTrapping' },
    pink:     { name: 'Dementia Obol of Trapping', rawName: 'ObolPinkTrapping' },
  },
  worship: {
    type: 'skilling',
    bronze:   { name: 'Bronze Obol of Worship',   rawName: 'ObolBronzeWorship' },
    silver:   { name: 'Silver Obol of Worship',   rawName: 'ObolSilverWorship' },
    gold:     { name: 'Golden Obol of Worship',   rawName: 'ObolGoldWorship' },
    platinum: { name: 'Platinum Obol of Worship', rawName: 'ObolPlatinumWorship' },
    pink:     { name: 'Dementia Obol of Worship', rawName: 'ObolPinkWorship' },
  },

  // ── Partial-tier Skill Obols ──────────────────────────────────────────────
  luck: {
    type: 'misc',
    silver:   { name: 'Silver Obol of Double Sixes',    rawName: 'ObolSilverLuck' },
    gold:     { name: 'Golden Obol of Triple Sixes',    rawName: 'ObolGoldLuck' },
    platinum: { name: 'Platinum Obol of Yahtzee Sixes', rawName: 'ObolPlatinumLuck' },
    pink:     { name: 'Dementia Obol of Infinisixes',   rawName: 'ObolPinkLuck' },
  },
  money: {
    type: 'misc',
    silver: { name: 'Silver Obol of Pocket Change',    rawName: 'ObolSilverMoney' },
    gold:   { name: 'Golden Obol of Plentiful Riches', rawName: 'ObolGoldMoney' },
  },

  // ── Hyper Obols ───────────────────────────────────────────────────────────
  hyper0: {
    type: 'gemshop',
    base: { name: 'Hyper Obol of Lucky Rolls',      rawName: 'ObolHyper0' },
    b:    { name: 'Hyper Obol of Rare Drops',        rawName: 'ObolHyperB0' },
  },
  hyper1: {
    type: 'gemshop',
    base: { name: 'Hyper Obol of Stragiwisluk',     rawName: 'ObolHyper1' },
    b:    { name: 'Hyper Obol of All Statisticals',  rawName: 'ObolHyperB1' },
  },
  hyper2: {
    type: 'gemshop',
    base: { name: 'Hyper Obol of Supa Damagio',     rawName: 'ObolHyper2' },
    b:    { name: 'Hyper Obol of Mega Damagio',      rawName: 'ObolHyperB2' },
  },
  hyper3: {
    type: 'gemshop',
    base: { name: 'Hyper Obol of Destruction',      rawName: 'ObolHyper3' },
    b:    { name: 'Hyper Obol of Decimation',        rawName: 'ObolHyperB3' },
  },

  // ── Boss / Miniboss Obols ─────────────────────────────────────────────────
  amarok:  { type: 'boss',      name: "Granite Obol of Amarok's Stare",  rawName: 'ObolAmarokA' },
  efaunt:  { type: 'boss',      name: "Skeletal Obol of Efaunt's Gaze",  rawName: 'ObolEfauntA' },
  chizoar: { type: 'boss',      name: "Frozen Obol of Chizoar's Rage",   rawName: 'ObolChizoarA' },
  emp:     { type: 'boss',      name: 'Gilded Obol of the Emperor',      rawName: 'ObolEmp' },
  frog:    { type: 'eventboss', name: 'Grumpy Obol of the Grandfrogger', rawName: 'ObolFrog' },
  knight:  { type: 'eventboss', name: 'Vigilant Obol of Ice Guard',      rawName: 'ObolKnight' },
  kruk:    { type: 'boss',      name: 'Molten Obol of Dead Divine',      rawName: 'ObolKruk' },
  lava:    { type: 'miniboss',  name: 'Magma Obol of Big Time Domeo',    rawName: 'ObolLava' },
  slush:   { type: 'miniboss',  name: 'Slushy Obol of Much Dilapidation',rawName: 'ObolSlush' },
  troll:   { type: 'boss',      name: 'Jagged Obol of Massive Trolling', rawName: 'ObolTroll' },
}

// ── Flat rawName lookup ───────────────────────────────────────────────────────
// Maps rawName → { name, type }
// Used by TierList itemMap and anywhere a rawName needs to resolve to display data
export const obolByRawName = (() => {
  const map = {}
  for (const entry of Object.values(obolMap)) {
    if (entry.rawName) {
      map[entry.rawName] = { name: entry.name, type: entry.type }
      continue
    }
    const { type, ...variants } = entry
    for (const variant of Object.values(variants)) {
      if (variant?.rawName) {
        map[variant.rawName] = { name: variant.name, type }
      }
    }
  }
  return map
})()

// ── Obol Farm Map ─────────────────────────────────────────────────────────────
// Only obols worth actively farming are listed.
// mobKey references mobsMap; null = not farmable from monsters.
// bestClass: DK = Divine Knight, ES = Elemental Sorcerer, null = not class-specific
export const obolFarmMap = {
  // Stat obols
  0:        { farmRawName: 'ObolBronze0',       mobKey: 'Bored_Bean',       notes: null },
  1:        { farmRawName: 'ObolSilver1',        mobKey: 'Sandy_Pot',        notes: null },
  2:        { farmRawName: 'ObolSilver2',        mobKey: 'Sand_Castle',      notes: null },
  3:        { farmRawName: 'ObolSilver3',        mobKey: 'Tyson',            notes: null },

  // Skill obols
  luck:     { farmRawName: 'ObolSilverLuck',     mobKey: 'Sand_Castle',      notes: null },
  pop:      { farmRawName: 'ObolBronzePop',      mobKey: 'Gigafrog',         notes: null },
  money:    { farmRawName: 'ObolSilverMoney',    mobKey: 'Bored_Bean',       notes: null },
  damage:   { farmRawName: 'ObolSilverDamage',   mobKey: 'Bored_Bean',       notes: null },
  def:      { farmRawName: 'ObolBronzeDef',      mobKey: 'Sandy_Pot',        notes: null },
  exp:      { farmRawName: 'ObolBronzeEXP',      mobKey: 'Bored_Bean',       notes: null },
  kill:     { farmRawName: 'ObolBronzeKill',     mobKey: 'Dedotated_Ram',    notes: null },
  cons:     { farmRawName: 'ObolBronzeCons',     mobKey: 'Dedotated_Ram',    notes: null },
  trapping: { farmRawName: 'ObolBronzeTrapping', mobKey: 'Mamooth',          notes: null },
  worship:  { farmRawName: 'ObolBronzeWorship',  mobKey: 'Sir_Stache',       notes: null },

  // Alchemy shop only
  card:     { farmRawName: 'ObolBronzeCard',     mobKey: 'Liquid1_x1',       notes: 'Only available from Alchemy Shop liquid purchases' },
  choppin:  { farmRawName: 'ObolBronzeChoppin',  mobKey: 'Liquid1_x1',       notes: 'Only available from Alchemy Shop liquid purchases' },
  mining:   { farmRawName: 'ObolBronzeMining',   mobKey: 'Liquid1_x1',       notes: 'Only available from Alchemy Shop liquid purchases' },
  catching: { farmRawName: 'ObolBronzeCatching', mobKey: 'Liquid1_x1',       notes: 'Only available from Alchemy Shop liquid purchases' },
  fishing:  { farmRawName: 'ObolBronzeFishing',  mobKey: 'Liquid1_x1',       notes: 'Only available from Alchemy Shop liquid purchases' },

  // Boss / Event obols
  frog:    { farmRawName: 'ObolFrog',     mobKey: 'Grandfrogger',        notes: 'Angry Frog seasonal event' },
  amarok:  { farmRawName: 'ObolAmarokA',  mobKey: 'Amarok',              notes: 'Amarok world boss' },
  efaunt:  { farmRawName: 'ObolEfauntA',  mobKey: 'Efaunt',              notes: 'Efaunt world boss' },
  knight:  { farmRawName: 'ObolKnight',   mobKey: 'Ice_Guard',           notes: 'Glacial Guild seasonal event' },
  chizoar: { farmRawName: 'ObolChizoarA', mobKey: 'Chizoar',             notes: 'Chizoar world boss' },
  troll:   { farmRawName: 'ObolTroll',    mobKey: 'Massive_Troll',       notes: 'Troll world boss' },
  lava:    { farmRawName: 'ObolLava',     mobKey: 'Domeo_Magmus',        notes: 'Domeo Magmus miniboss' },
  kruk:    { farmRawName: 'ObolKruk',     mobKey: 'Kattlekruk',          notes: 'Kattlekruk world boss' },
  emp:     { farmRawName: 'ObolEmp',      mobKey: 'Emperor',             notes: 'Emperor world boss' },

  // Hyper obols — unobtainable through normal play
  hyper0:  { farmRawName: 'ObolHyper0',   mobKey: 'PremiumGem',          notes: 'Limited time gem shop purchase only' },
  hyper1:  { farmRawName: 'ObolHyper1',   mobKey: 'PremiumGem',          notes: 'Limited time gem shop purchase only' },
  hyper2:  { farmRawName: 'ObolHyper2',   mobKey: 'PremiumGem',          notes: 'Limited time gem shop purchase only' },
  hyper3:  { farmRawName: 'ObolHyper3',   mobKey: 'PremiumGem',          notes: 'Limited time gem shop purchase only' },
}

// ── Tier Lists ────────────────────────────────────────────────────────────────
// Four tier lists split by obol slot shape.
// Colors are handled by global.css via data-tier attribute on each row.
// Note: Where you see a Mining Obol, all other skilling obols of that tier belong there too.

const TIER_SUBLABELS = {
  s: 'Best',
  a: 'Good',
  b: 'Worth Keeping',
  c: 'If Nothing Better',
  d: 'Fragment',
}

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
  { id: 's', label: 'S', sublabel: TIER_SUBLABELS.s, items: ['ObolPinkLuck', 'ObolEmp'] },
  { id: 'a', label: 'A', sublabel: TIER_SUBLABELS.a, items: [ 'ObolTroll', 'ObolKruk'] },
  { id: 'b', label: 'B', sublabel: TIER_SUBLABELS.b, items: ['ObolPinkCons', 'ObolPinkMining'] },
  { id: 'c', label: 'C', sublabel: TIER_SUBLABELS.c, items: ['ObolPinkPop', 'ObolPinkTrapping', 'ObolPinkWorship'] },
  { id: 'd', label: 'D', sublabel: TIER_SUBLABELS.d, items: ['ObolPinkCard', 'ObolPinkEXP', 'ObolPinkKill', 'ObolPinkDef'] },
]

// ── Example Boards ────────────────────────────────────────────────────────────
// Ideal loadouts for reference. Slots in order: top-left to bottom-right.
// Account board: 24 slots in 5/5/4/5/5 rows
// Character boards: 21 slots in 3/2/2/2/3/2/2/2/3 pattern

export const idealAccountBoard = [
  // Row 1 (5)
  'ObolSilverPop', 'ObolSilverPop', 'ObolGoldLuck', 'ObolSilverPop', 'ObolSilverPop',
  // Row 2 (5)
  'ObolSilverPop', 'ObolPlatinumLuck', 'ObolPinkLuck', 'ObolPlatinumLuck', 'ObolSilverPop',
  // Row 3 (4)
  'ObolGoldLuck', 'ObolPinkLuck', 'ObolPinkLuck', 'ObolGoldLuck',
  // Row 4 (5)
  'ObolSilverPop', 'ObolPlatinumLuck', 'ObolPinkLuck', 'ObolPlatinumLuck', 'ObolSilverPop',
  // Row 5 (5)
  'ObolSilverPop', 'ObolSilverPop', 'ObolGoldLuck', 'ObolSilverPop', 'ObolSilverPop',
]

export const endgameAccountBoard = [
  // Row 1 (5)
  'ObolSilverPop', 'ObolSilverPop', 'ObolKnight', 'ObolSilverPop', 'ObolSilverPop',
  // Row 2 (5)
  'ObolSilverPop', 'ObolLava', 'ObolEmp', 'ObolLava', 'ObolSilverPop',
  // Row 3 (4)
  'ObolKnight', 'ObolEmp', 'ObolEmp', 'ObolKnight',
  // Row 4 (5)
  'ObolSilverPop', 'ObolLava', 'ObolEmp', 'ObolLava', 'ObolSilverPop',
  // Row 5 (5)
  'ObolSilverPop', 'ObolSilverPop', 'ObolKnight', 'ObolSilverPop', 'ObolSilverPop',
]

export const characterBoards = {
  dr: {
    label: 'Drop Rate',
    slots: [
      // Row 1 (3)
      'ObolGoldLuck', 'ObolPlatinumLuck', 'ObolGoldLuck',
      // Section 1 (2/2/2)
      'ObolSilverPop', 'ObolSilverPop',
      'ObolSilverPop', 'ObolSilverPop',
      'ObolSilverPop', 'ObolSilverPop',
      // Row 2 (3)
      'ObolGoldLuck', 'ObolPinkLuck', 'ObolGoldLuck',
      // Section 2 (2/2/2)
      'ObolSilverPop', 'ObolSilverPop',
      'ObolSilverPop', 'ObolSilverPop',
      'ObolSilverPop', 'ObolSilverPop',
      // Row 3 (3)
      'ObolGoldLuck', 'ObolPlatinumLuck', 'ObolGoldLuck',
    ],
  },
  skilling: {
    label: 'Skilling',
    slots: [
      // Row 1 (3)
      'ObolGoldMining', 'ObolSlush', 'ObolGoldMining',
      // Section 1 (2/2/2)
      'ObolSilverMining', 'ObolSilverMining',
      'ObolSilverMining', 'ObolSilverMining',
      'ObolSilverMining', 'ObolSilverMining',
      // Row 2 (3)
      'ObolGoldMining', 'ObolPinkMining', 'ObolGoldMining',
      // Section 2 (2/2/2)
      'ObolSilverMining', 'ObolSilverMining',
      'ObolSilverMining', 'ObolSilverMining',
      'ObolSilverMining', 'ObolSilverMining',
      // Row 3 (3)
      'ObolGoldMining', 'ObolSlush', 'ObolGoldMining',
    ],
  },
  construction: {
    label: 'Construction',
    slots: [
      // Row 1 (3)
      'ObolGoldCons', 'ObolPlatinumCons', 'ObolGoldCons',
      // Section 1 (2/2/2)
      'ObolSilverCons', 'ObolSilverCons',
      'ObolSilverCons', 'ObolSilverCons',
      'ObolSilverCons', 'ObolSilverCons',
      // Row 2 (3)
      'ObolGoldCons', 'ObolPinkCons', 'ObolGoldCons',
      // Section 2 (2/2/2)
      'ObolSilverCons', 'ObolSilverCons',
      'ObolSilverCons', 'ObolSilverCons',
      'ObolSilverCons', 'ObolSilverCons',
      // Row 3 (3)
      'ObolGoldCons', 'ObolPlatinumCons', 'ObolGoldCons',
    ],
  },
}