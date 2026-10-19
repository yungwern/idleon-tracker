// =========================
// BIS SETUPS
// =========================
// Best-in-slot loadouts for common farming setups.
// Source: AlmostPsycho's Sampling Sheet (Google Sheets, "Sampling Setups" + "Other Setups" tabs).
//
// Entry formats:
//   { id: 'EquipmentHats123' }                  → equipment; name, image and bonuses come from the item id
//   { name, img, desc }                         → anything else (food, chips, cards, keychains)
//   { todo: 'Ring with a silver clock face' }   → not identified yet; text describes the sheet icon
//
// Food/keychain names + effects are from IdleOn Resources/items.json.
// Card names come from the card's monster (mapEnemyData / miniBosses). Cards whose monster
// isn't in our data yet show the raw monster code — swap in the real name when known.

// ── Keychains ────────────────────────────────────────────────
const KEYCHAINS = {
  negative7: {
    name: 'Negative 7 Chain',
    img: 'images/items/EquipmentKeychain22.png',
    desc: '3 / 4 / 6% Mob Respawn',
  },
  relic: {
    name: 'Relic Chain',
    img: 'images/items/EquipmentKeychain11.png',
    desc: '3 / 5 / 8% Drop Rate',
  },
}

// ── Golden Food (desc = base effect before golden food multipliers) ──
const FOOD = {
  kebabs: {
    name: 'Golden Kebabs',
    img: 'images/food/golden/FoodG2.png',
    desc: '+20% Total Damage',
  },
  nomwich: {
    name: 'Golden Grilled Cheese Nomwich',
    img: 'images/food/golden/FoodG9.png',
    desc: '+10% All Stats',
  },
  dumpling: {
    name: 'Golden Dumpling',
    img: 'images/food/golden/FoodG12.png',
    desc: '+4% All AFK Gains',
  },
  cake: {
    name: 'Golden Cake',
    img: 'images/food/golden/FoodG13.png',
    desc: '+8% Drop Rate',
  },
  cheese: {
    name: 'Golden Cheese',
    img: 'images/food/golden/FoodG8.png',
    desc: 'Shrines level up 20% faster from AFK claims',
  },
  bread: {
    name: 'Golden Bread',
    img: 'images/food/golden/FoodG6.png',
    desc: '+30% Coins from Monsters',
  },
}

// ── Lab Chips ────────────────────────────────────────────────
const CHIPS = {
  omegaMotherboard: {
    name: 'Omega Motherboard',
    img: 'images/lab/ConsoleChip21.png',
  },
  omegaNanochip: {
    name: 'Omega Nanochip',
    img: 'images/lab/ConsoleChip20.png',
  },
  silkrodeProcessor: {
    name: 'Silkrode Processor',
    img: 'images/lab/ConsoleChip18.png',
  },
  silkrodeSoftware: {
    name: 'Silkrode Software',
    img: 'images/lab/ConsoleChip17.png',
  },
  silkrodeMotherboard: {
    name: 'Silkrode Motherboard',
    img: 'images/lab/ConsoleChip16.png',
  },
  silkrodeNanochip: {
    name: 'Silkrode Nanochip',
    img: 'images/lab/ConsoleChip15.png',
  },
  galvanicNanochip: {
    name: 'Galvanic Nanochip',
    img: 'images/lab/ConsoleChip10.png',
  },
  chocolatey: {
    name: 'Chocolatey Chip',
    img: 'images/lab/ConsoleChip9.png',
  },
}

// ── Cards ────────────────────────────────────────────────────
const card = (file, name) => ({
  name,
  img: `images/cards/${file}.png`,
})

const CARDS = {
  mantaray: card('2CardsJ19', 'Mantaray Card'),
  kingDoot: card('2CardsZ6', 'King Doot Card'),
  w7b9: card('2CardsJ21', 'Card (w7b9)'),
  wolfB: card('2CardsZ4', 'Card (wolfB)'),
  minichiefSpirit: card('2CardsI13', 'Minichief Spirit Card'),
  boss6A: card('2CardsZ21', 'Card (Boss6A)'),
  mini6a: card('2CardsZ25', 'Card (mini6a)'),
  coralcaveGuardian: card('2CardsJ12', 'Coralcave Guardian Card'),
  drDefecaus: card('2CardsA15', 'Dr. Defecaus Card'),
  octodar: card('2CardsG11', 'Octodar Card'),
  clammie: card('2CardsG10', 'Clammie Card'),
  suggma: card('2CardsH1', 'Suggma Card'),
  woodlinSpirit: card('2CardsI5', 'Woodlin Spirit Card'),
  boss6C: card('2CardsZ23', 'Card (Boss6C)'),
  poop: card('2CardsA10', 'Poop Card'),
  demonGenie: card('2CardsG4', 'Demon Genie Card'),
}

const CARD_SETS = {
  set8: card('CardSet8', 'Card Set (CardSet8)'),
  set9: card('CardSet9', 'Card Set (CardSet9)'),
  set26: card('CardSet26', 'Card Set (CardSet26)'),
}

// ── Shared rows ──────────────────────────────────────────────
const ENDGAME_TOOLS = [
  { slot: 'Pickaxe',
    id: 'EquipmentTools15' },
  { slot: 'Hatchet',
    id: 'EquipmentToolsHatchet10' },
  { slot: 'Fishing Rod',
    id: 'FishingRod12' },
  { slot: 'Catching Net',
    id: 'CatchingNet12' },
]

const CLOCK_RING = {
  todo: 'Ring with a silver clock face',
}

const CRYSTAL_MONEY_CHIPS = [
  CHIPS.omegaMotherboard,
  CHIPS.omegaNanochip,
  CHIPS.silkrodeNanochip,
  CHIPS.silkrodeMotherboard,
  CHIPS.silkrodeSoftware,
  CHIPS.silkrodeProcessor,
  CHIPS.chocolatey,
]

const CRYSTAL_MONEY_CARDS = {
  set: CARD_SETS.set26,
  cards: [
    CARDS.poop,
    CARDS.mantaray,
    CARDS.w7b9,
    CARDS.minichiefSpirit,
    CARDS.kingDoot,
    CARDS.boss6A,
    CARDS.coralcaveGuardian,
    CARDS.demonGenie,
  ],
}

export const BIS_SETUPS = [
  {
    key: 'rare-drops',
    name: 'Rare Drops',
    classes: 'DK / RG',
    equipment: [
      { slot: 'Helmet',
        id: 'EquipmentHats123' },
      { slot: 'Weapon',
        id: 'EquipmentSword5' },
      { slot: 'Chest',
        id: 'EquipmentShirts36' },
      { slot: 'Pendant',
        id: 'EquipmentPendant30' },
      { slot: 'Pants',
        id: 'EquipmentPants27' },
      { slot: 'Ring',
        ...CLOCK_RING },
      { slot: 'Boots',
        id: 'EquipmentShoes41' },
      { slot: 'Ring',
        ...CLOCK_RING },
    ],
    tools: [
      { slot: 'Traps',
        id: 'TrapBoxSet11' },
      { slot: 'Worship Skull',
        id: 'WorshipSkull12' },
      ...ENDGAME_TOOLS,
    ],
    specials: [
      { slot: 'Keychain',
        ...KEYCHAINS.negative7 },
      { slot: 'Keychain',
        ...KEYCHAINS.negative7 },
      { slot: 'Premium Armor',
        id: 'EquipmentGown9' },
      { slot: 'Cape',
        id: 'EquipmentCape18' },
      { slot: 'Chat Ring',
        id: 'EquipmentRingsChat11' },
    ],
    food: [
      FOOD.kebabs,
      FOOD.nomwich,
      FOOD.dumpling,
      FOOD.cake,
      FOOD.cheese,
    ],
    chips: [
      CHIPS.omegaMotherboard,
      CHIPS.omegaNanochip,
      CHIPS.silkrodeProcessor,
      CHIPS.silkrodeSoftware,
      CHIPS.silkrodeNanochip,
      CHIPS.silkrodeMotherboard,
      CHIPS.galvanicNanochip,
    ],
    cards: {
      set: CARD_SETS.set8,
      cards: [
        CARDS.mantaray,
        CARDS.kingDoot,
        CARDS.w7b9,
        CARDS.wolfB,
        CARDS.minichiefSpirit,
        CARDS.boss6A,
        CARDS.mini6a,
        CARDS.coralcaveGuardian,
      ],
    },
  },

  {
    key: 'afk-fight',
    name: 'AFK Fight',
    classes: 'Gmush DB',
    equipment: [
      { slot: 'Helmet',
        id: 'EquipmentHats123' },
      { slot: 'Weapon',
        id: 'EquipmentSword5' },
      { slot: 'Chest',
        id: 'EquipmentShirts36' },
      { slot: 'Pendant',
        id: 'EquipmentPendant30' },
      { slot: 'Pants',
        id: 'EquipmentPants27' },
      { slot: 'Ring',
        ...CLOCK_RING },
      { slot: 'Boots',
        id: 'EquipmentShoes41' },
      { slot: 'Ring',
        ...CLOCK_RING },
    ],
    tools: [
      { slot: 'Traps',
        id: 'TrapBoxSet11' },
      { slot: 'Worship Skull',
        id: 'WorshipSkull12' },
    ],
    specials: [
      { slot: 'Keychain',
        ...KEYCHAINS.negative7 },
      { slot: 'Keychain',
        ...KEYCHAINS.negative7 },
      { slot: 'Premium Armor',
        id: 'EquipmentGown8' },
      { slot: 'Cape',
        id: 'EquipmentCape19' },
      { slot: 'Chat Ring',
        id: 'EquipmentRingsChat11' },
    ],
    food: [
      FOOD.kebabs,
      FOOD.nomwich,
      FOOD.dumpling,
      FOOD.cheese,
    ],
    chips: [
      CHIPS.galvanicNanochip,
      CHIPS.galvanicNanochip,
      CHIPS.silkrodeProcessor,
      CHIPS.silkrodeSoftware,
      CHIPS.silkrodeNanochip,
      CHIPS.silkrodeMotherboard,
      CHIPS.galvanicNanochip,
    ],
    cards: {
      set: CARD_SETS.set9,
      cards: [
        CARDS.wolfB,
        CARDS.drDefecaus,
        CARDS.mini6a,
        CARDS.octodar,
        CARDS.clammie,
        CARDS.suggma,
        CARDS.woodlinSpirit,
        CARDS.boss6C,
      ],
    },
  },

  {
    key: 'crystal',
    name: 'Crystal',
    classes: 'DK / RG',
    equipment: [
      { slot: 'Helmet',
        id: 'EquipmentHats119' },
      { slot: 'Weapon',
        id: 'EquipmentSword9' },
      { slot: 'Chest',
        id: 'EquipmentShirts39' },
      { slot: 'Pendant',
        todo: 'Purple and green pendant' },
      { slot: 'Pants',
        id: 'EquipmentPants31' },
      { slot: 'Ring',
        id: 'EquipmentRings36' },
      { slot: 'Boots',
        id: 'EquipmentShoes40' },
      { slot: 'Ring',
        id: 'EquipmentRings36' },
    ],
    tools: [
      { slot: 'Traps',
        id: 'TrapBoxSet10' },
      { slot: 'Worship Skull',
        id: 'WorshipSkull11' },
      ...ENDGAME_TOOLS,
    ],
    specials: [
      { slot: 'Keychain',
        ...KEYCHAINS.relic },
      { slot: 'Keychain',
        ...KEYCHAINS.relic },
      { slot: 'Premium Armor',
        id: 'EquipmentGown9' },
      { slot: 'Cape',
        id: 'EquipmentCape18' },
      { slot: 'Chat Ring',
        id: 'EquipmentRingsChat11' },
    ],
    food: [
      FOOD.cake,
    ],
    chips: CRYSTAL_MONEY_CHIPS,
    cards: CRYSTAL_MONEY_CARDS,
  },

  {
    key: 'money',
    name: 'Money',
    classes: 'DK / RG',
    equipment: [
      { slot: 'Helmet',
        id: 'EquipmentHats123' },
      { slot: 'Weapon',
        id: 'EquipmentSword10' },
      { slot: 'Chest',
        id: 'EquipmentShirts41' },
      { slot: 'Pendant',
        todo: 'Green gem pendant (gold frame)' },
      { slot: 'Pants',
        id: 'EquipmentPants32' },
      { slot: 'Ring',
        id: 'EquipmentRings36' },
      { slot: 'Boots',
        id: 'EquipmentShoes41' },
      { slot: 'Ring',
        id: 'EquipmentRings36' },
    ],
    tools: [
      { slot: 'Traps',
        id: 'TrapBoxSet11' },
      { slot: 'Worship Skull',
        id: 'WorshipSkull12' },
    ],
    specials: [
      { slot: 'Keychain',
        ...KEYCHAINS.relic },
      { slot: 'Keychain',
        ...KEYCHAINS.relic },
      { slot: 'Premium Armor',
        id: 'EquipmentGown5' },
      { slot: 'Cape',
        id: 'EquipmentCape18' },
      { slot: 'Chat Ring',
        id: 'EquipmentRingsChat11' },
    ],
    food: [
      FOOD.cake,
      FOOD.nomwich,
      FOOD.bread,
      { todo: 'Blue boost food (icicle spear)' },
    ],
    chips: CRYSTAL_MONEY_CHIPS,
    cards: CRYSTAL_MONEY_CARDS,
  },
]
