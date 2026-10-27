// ============================================================
// BUBBA (World 3) — run guide
// Upgrade names/order: Toolbox shared-data.json bubbaUpgrades. The index
// matches the icon file images/bubba/Bubbo_Upgrade_<index>.png.
// Guide text tokens: [Upgrade Name] renders an upgrade chip, {Attribute}
// renders a Charisma attribute pill. Charisma goals are in BUBBA_ATTRIBUTES order.
// ============================================================

export const BUBBA_UPGRADES = [
  '1st Slice',
  'Happi Boi',
  'Good Meat',
  'Bubba Boon',
  'Bargain',
  'Buyer Grin',
  'Charisma',
  '2nd Slice',
  'Megaflesh',
  'Fun Gifts',
  'Open Gift',
  'Great Meat',
  'Dice Roll',
  'Super Chart',
  'More Dice',
  'Smoker',
  'More Sides',
  'Uber Gifts',
  'Cost Saver',
  'Best Meat',
  'Real Love',
  'Spare Coins',
  'Loaded Dice',
  '3rd Slice',
  'Crossover',
  '2X Smoke',
  'Perma Sale',
  'Big Ol Coin',
]

export const BUBBA_ATTRIBUTES = ['Hustle', 'Rizz', 'Joy', 'Courage', 'Mindful', 'Savvy']

// Happiness tiers, lowest to highest (images/bubba/BubbaHappyIcon<index>.png).
// "Grey happiness" in the guide is Delighted.
export const BUBBA_HAPPINESS = ['Amused', 'Beaming', 'Contented', 'Delighted', 'Ecstatic']
export const BUBBA_GIFT_HAPPINESS = 3

export const BUBBA_CHARISMA_GOALS = [
  {
    label: 'After candies',
    values: [12, 8, 7, 0, 120, 0],
  },
  {
    label: 'Mid run',
    values: [30, 15, 10, 0, 120, 0],
  },
  {
    label: 'Rough final',
    values: [35, 25, 15, 0, 120, 15],
  },
]

export const BUBBA_PHASES = [
  {
    title: 'Opening',
    subtitle: 'First ~5 minutes',
    steps: [
      {
        title: 'Charisma and candies',
        points: [
          'Leave [1st Slice] and [Good Meat] at Lv 50. They are for coins later.',
          'Upgrade [Charisma] to about Lv 100, then use Bubba Candy to get {Mindful} to 120. Takes about 3 candies.',
          'Between candies, spend meat on upgrades with {Mindful} emulsified.',
          'Keep using candy for Charisma: 1 on {Hustle} (emulsified while using candy), 1 on {Rizz}, 1 on {Joy}. Under 10 candies total, ending around [Super Chart].',
          'Use [Dice Roll] when you unlock it, but only roll once.',
        ],
        goal: 0,
      },
    ],
  },
  {
    title: 'First gifts',
    subtitle: 'Pat to grey, open, unlock',
    steps: [
      {
        title: 'First gift',
        points: [
          'Use some of your 50 pats with {Joy} emulsified to get into grey happiness.',
          'Emulsify {Hustle} and open a gift.',
        ],
        unlocks: 'More Dice',
      },
      {
        title: 'Second gift',
        points: [
          'Buy [More Dice] and spend some rolls on a good multi (3–5 dice multi is great).',
          'Spend meats, pat back to grey happiness, then open a gift.',
        ],
        tips: [
          'Close to [Smoker] but short? Use another candy on {Hustle}.',
          'Bad dice roll? Open a gift and try a couple more. Still nothing, wait for the reset.',
        ],
        unlocks: 'Smoker',
      },
      {
        title: 'Third gift',
        points: [
          'Spam [Smoker] until it costs about the same as [Great Meat] with {Rizz} emulsified.',
          'Spend your meats, pat back to grey happiness, and open a gift with the Smoker multi.',
        ],
        unlocks: 'More Sides',
      },
    ],
  },
  {
    title: 'Hourly loop',
    subtitle: 'Once pats run out',
    steps: [
      {
        title: 'Every hour',
        points: [
          'When pats refresh: reroll dice and spend meats.',
          'Save some meat and spam [Smoker] to around [Great Meat] cost for extra happiness from [Buyer Grin].',
          'Use all your pats with {Joy} emulsified, switch to {Hustle}, and open a gift.',
          'Get {Hustle} to 20 as soon as you can.',
        ],
        tips: [
          'Each gift should unlock the next upgrade. If not, you need more [Smoker] levels or a better dice roll (you may have missed [More Dice] or [More Sides]). Still short? Wait an hour.',
          'Fell behind? Double pat a gift. Don\'t stress mistakes, you\'ll have way more gifts than you need once the multis build up.',
        ],
      },
      {
        title: 'Rinse and repeat',
        points: [
          'Keep [Smoker] cost around [Great Meat] cost while upgrading everything. Focus on [Super Chart] and the later upgrades.',
          'Buy [More Dice] and [More Sides] whenever you can, with {Rizz} emulsified. If you\'re close after a gift, emulsify {Rizz} to check.',
          'Once you unlock [Best Meat], switch to {Savvy} and get it to Lv 10 before coins.',
        ],
        tips: [
          'Start {Savvy} early. By 8 gifts it should already be going.',
        ],
        goal: 1,
      },
    ],
  },
  {
    title: 'Coins & endgame',
    subtitle: 'Around 12 gifts',
    steps: [
      {
        title: 'Coins',
        points: [
          'Once you reach coins, upgrade [Spare Coins], then emulsify {Mindful}.',
          'Buy [1st Slice] and [Good Meat] up to about Lv 1000 for a ton of coins.',
          'From now on, emulsify {Savvy} when buying dice after the hourly reset.',
        ],
      },
      {
        title: 'Endgame loop',
        points: [
          'Every hour: upgrade, roll dice, buy [Smoker]. Then use pats and open a gift.',
        ],
        tips: [
          'The final goal isn\'t required, just aim close. More {Savvy} is probably best for later [Megaflesh] runs.',
        ],
        goal: 2,
      },
    ],
  },
]
