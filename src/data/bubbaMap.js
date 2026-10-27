// ============================================================
// BUBBA (World 3) — run guide
// Charisma goals are in BUBBA_ATTRIBUTES order.
// ============================================================

export const BUBBA_ATTRIBUTES = ['Hustle', 'Rizz', 'Joy', 'Courage', 'Mindful', 'Savvy']

// Which attribute to emulsify for each action
export const BUBBA_EMULSIFY_RULES = [
  {
    attribute: 'Joy',
    when: 'Using pats',
  },
  {
    attribute: 'Hustle',
    when: 'Opening a gift (and while using candy on Hustle)',
  },
  {
    attribute: 'Rizz',
    when: 'Buying More Dice, More Sides and Smoker',
  },
  {
    attribute: 'Mindful',
    when: 'Spending meat between candies early on, and after coins unlock',
  },
  {
    attribute: 'Savvy',
    when: 'Buying dice after the hourly reset, once coins are unlocked',
  },
]

export const BUBBA_CHARISMA_GOALS = [
  {
    label: 'After candies',
    note: 'Step 1',
    values: [12, 8, 7, 0, 120, 0],
  },
  {
    label: 'Mid run',
    note: 'Step 6',
    values: [30, 15, 10, 0, 120, 0],
  },
  {
    label: 'Rough final',
    note: 'Step 8',
    values: [35, 25, 15, 0, 120, 15],
  },
]

export const BUBBA_STEPS = [
  {
    title: 'Opening (first ~5 minutes)',
    points: [
      'Leave 1st Slice and Good Meat at Lv 50. They are for coins later.',
      'Reach Charisma and upgrade it to about Lv 100.',
      'Use Bubba Candy to get Mindful to 120. Keep upgrading Charisma; this takes about 3 candies depending on your Charisma level.',
      'Between candies, spend meat on upgrades with Mindful emulsified.',
      'Keep using candy for Charisma: 1 on Hustle (emulsify Hustle while using candy), 1 on Rizz, 1 on Joy. Usually fewer than 10 candies total, ending up at Super Chart.',
      'Use the dice when you unlock them, but only roll once.',
    ],
    goal: 0,
  },
  {
    title: 'First gift',
    points: [
      'Use some of your 50 pats with Joy emulsified to get into grey happiness.',
      'Emulsify Hustle and open a gift. This unlocks More Dice.',
    ],
    gift: 'Gift 1 → More Dice',
  },
  {
    title: 'Second gift',
    points: [
      'Buy more dice and spend some rolls on a good multi (3–5 dice multi is great).',
      'Spend meats, use more pats to get back to grey happiness, then open a gift.',
      'Close to Smoker but short? Use another candy on Hustle.',
      'Bad dice roll after unlocking more dice? Open a gift and try a couple more. Still nothing, wait for the reset.',
    ],
    gift: 'Gift 2 → Smoker',
  },
  {
    title: 'Third gift',
    points: [
      'Spam Smoker until it costs about the same as Great Meat (with Rizz emulsified).',
      'Spend your meats. You should still have pats left to get back to grey happiness.',
      'Open another gift with the Smoker multi. This should get you More Sides.',
    ],
    gift: 'Gift 3 → More Sides',
  },
  {
    title: 'Hourly loop',
    points: [
      'Now you wait every hour. When pats refresh: reroll dice and spend meats.',
      'Save some meat and spam Smoker to around Great Meat cost. This gives extra happiness from Buyer Grin.',
      'Use all your pats with Joy emulsified, switch to Hustle emulsified, and open a gift.',
      'Get Hustle to 20 as soon as you can.',
    ],
    tips: [
      'You should unlock the next upgrade with each gift. If not, you need more Smoker levels or a better dice roll (you may have missed More Dice or More Sides). If a gift fails after unlocking more dice, wait an hour and try again.',
      'Fell behind? Double pat a gift for some extra. Don\'t stress about mistakes, you\'ll have way more gifts than you need once all the multis are built up.',
    ],
  },
  {
    title: 'Rinse and repeat',
    points: [
      'Keep Smoker cost around Great Meat cost while upgrading everything.',
      'Focus on Super Chart and the later upgrades.',
      'Buy More Dice and More Sides whenever you can, with Rizz emulsified. After opening a gift, if you\'re close, emulsify Rizz to see if you can buy one.',
      'Once you unlock Best Meat, switch to Savvy and get it to Lv 10 before coins.',
    ],
    tips: [
      'Start on Savvy early. By 8 gifts it should already be going.',
    ],
    goal: 1,
  },
  {
    title: 'Coins',
    points: [
      'Once you get to coins, upgrade it, then emulsify Mindful.',
      'Buy 1st Slice and Good Meat up to about Lv 1000 for a ton of coins.',
      'From now on, emulsify Savvy when buying dice after the hourly reset.',
    ],
    gift: 'Around 12 gifts',
  },
  {
    title: 'Endgame loop',
    points: [
      'Every hour: upgrade, roll dice, buy Smoker. Then use pats and open a gift.',
    ],
    tips: [
      'The final Charisma goal is not a requirement, just aim close to it. More Savvy is probably best for later Mindful runs.',
    ],
    goal: 2,
  },
]
