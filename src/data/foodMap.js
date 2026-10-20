// =========================
// FOOD
// =========================
// Source: IdleonToolbox (Morta1/IdleonToolbox) items.json (desc lines + Amount / Cooldown).
// Keyed by item id. Images: public/images/food/ (health food), food/golden/, food/boost/, food/potions/
// Golden food effects are the base value, before golden food multipliers.
// Boost food / potion "% chance to be consumed" is per monster kill.

export const foodMap = {
  // ── Golden Food ──
  ButterBar: {
    name: 'Butter Bar',
    img: 'images/food/golden/ButterBar.png',
    effect: 'Increases your Base Accuracy by 60',
  },
  FoodG1: {
    name: 'Golden Jam',
    img: 'images/food/golden/FoodG1.png',
    effect: 'Increases your Max Health by 30%',
  },
  FoodG2: {
    name: 'Golden Kebabs',
    img: 'images/food/golden/FoodG2.png',
    effect: 'Increases Total Damage to all monsters by 20%',
  },
  FoodG3: {
    name: 'Golden Meat Pie',
    img: 'images/food/golden/FoodG3.png',
    effect: 'Increases your Total Defence by 30%',
  },
  FoodG4: {
    name: 'Golden Nomwich',
    img: 'images/food/golden/FoodG4.png',
    effect: 'Increases Base Damage Dealt to all monsters by 400',
  },
  FoodG5: {
    name: 'Golden Ham',
    img: 'images/food/golden/FoodG5.png',
    effect: 'Increases Skill EXP earned from all skills by 18%',
  },
  FoodG6: {
    name: 'Golden Bread',
    img: 'images/food/golden/FoodG6.png',
    effect: 'Boosts coins dropped by mobs by 30%',
  },
  FoodG7: {
    name: 'Golden Ribs',
    img: 'images/food/golden/FoodG7.png',
    effect: 'Increases Fishing Efficiency by 40%',
  },
  FoodG8: {
    name: 'Golden Cheese',
    img: 'images/food/golden/FoodG8.png',
    effect: 'Claiming AFK gains levels up shrines 20% faster',
  },
  FoodG9: {
    name: 'Golden Grilled Cheese Nomwich',
    img: 'images/food/golden/FoodG9.png',
    effect: 'STR AGI WIS and LUK all increased by 10%',
  },
  FoodG10: {
    name: 'Golden Hampter Gummy Candy',
    img: 'images/food/golden/FoodG10.png',
    effect: 'Claiming AFK gives Sailing AFK time 23% chance',
  },
  FoodG11: {
    name: 'Golden Nigiri',
    img: 'images/food/golden/FoodG11.png',
    effect: 'Increases Class EXP gain by 40%',
  },
  FoodG12: {
    name: 'Golden Dumpling',
    img: 'images/food/golden/FoodG12.png',
    effect: 'Increases all AFK Gains rate by 4%',
  },
  FoodG13: {
    name: 'Golden Cake',
    img: 'images/food/golden/FoodG13.png',
    effect: 'Increases Drop Rate by 8%',
  },
  FoodG14: {
    name: 'Golden Saltwater Taffy',
    img: 'images/food/golden/FoodG14.png',
    effect: 'Increases Spelunking EXP gain by 1%',
  },
  FoodG15: {
    name: 'Golden Sugar Cookie',
    img: 'images/food/golden/FoodG15.png',
    effect: 'Increases Joe Momma by 2%',
  },
  PeanutG: {
    name: 'Golden Peanut',
    img: 'images/food/golden/PeanutG.png',
    effect: 'Increases Mining Efficiency by 30%',
  },

  // ── Boost Food ──
  Bullet: {
    name: 'Bullet',
    img: 'images/food/boost/Bullet.png',
    effect: 'Increases Weapon Power by 1. 15% chance to be consumed every time you defeat a monster',
  },
  Bullet3: {
    name: 'Coldseeker Bullet',
    img: 'images/food/boost/Bullet3.png',
    effect: 'Increases Weapon Power by 9. 5% chance to be consumed every time you defeat a monster',
  },
  BulletB: {
    name: 'FMJ Bullet',
    img: 'images/food/boost/BulletB.png',
    effect: 'Increases Weapon Power by 2. 12% chance to be consumed every time you defeat a monster',
  },
  FoodCatch1: {
    name: 'Buttered Toasted Butter',
    img: 'images/food/boost/FoodCatch1.png',
    effect: 'Increases Catching Spd by 20%. 10% chance to be consumed every time you swing your net',
  },
  FoodChoppin1: {
    name: 'Saucy Logfries',
    img: 'images/food/boost/FoodChoppin1.png',
    effect: 'Increases Choppin\' Speed by 15%. 10% chance to be consumed every time you swing your hatchet',
  },
  FoodEvent1: {
    name: 'Giftybread Man',
    img: 'images/food/boost/FoodEvent1.png',
    effect: 'Increases Mining Speed by 25%. 3% chance to be consumed every time you swing your pickaxe',
  },
  FoodEvent2: {
    name: 'Chogg Nog',
    img: 'images/food/boost/FoodEvent2.png',
    effect: 'Increases Choppin\' Speed by 25%. 1% chance to be consumed every time you swing your hatchet',
  },
  FoodEvent3: {
    name: 'Candy Canes',
    img: 'images/food/boost/FoodEvent3.png',
    effect: 'Increases Fishing Spd by 25%. 3% chance to be consumed every time you reel in a fish',
  },
  FoodEvent4: {
    name: 'Mistleberries',
    img: 'images/food/boost/FoodEvent4.png',
    effect: 'Increases Catching Spd by 25%. 1% chance to be consumed every time you swing your net',
  },
  FoodEvent5: {
    name: 'Cherry Choco',
    img: 'images/food/boost/FoodEvent5.png',
    effect: 'Increases Weapon Power by 5. 10% chance to be consumed every time you defeat a monster',
  },
  FoodEvent6: {
    name: 'Lemony Choco',
    img: 'images/food/boost/FoodEvent6.png',
    effect: 'Increases Exp Gain by 30%. 1% chance to be consumed every time you defeat a monster',
  },
  FoodEvent7: {
    name: 'Minto Choco',
    img: 'images/food/boost/FoodEvent7.png',
    effect: 'Increases Move Spd by 8%. 1% chance to be consumed every 10 meters walked',
  },
  FoodFish1: {
    name: 'Slurpin Herm',
    img: 'images/food/boost/FoodFish1.png',
    effect: 'Increases Fishing Spd by 20%. 10% chance to be consumed every time you reel in a fish',
  },
  FoodMining1: {
    name: 'Icing Ironbite',
    img: 'images/food/boost/FoodMining1.png',
    effect: 'Increases Mining Speed by 15%. 10% chance to be consumed every time you swing your pickaxe',
  },
  FoodTrapping1: {
    name: 'Critter Numnums',
    img: 'images/food/boost/FoodTrapping1.png',
    effect: 'Increases Shiny Odds by 25%. 125% chance to be consumed every time you open a trap',
  },
  FoodWorship1: {
    name: 'Soulble Gum',
    img: 'images/food/boost/FoodWorship1.png',
    effect: 'Increases Soul Gain by 25%. 125% chance to be consumed every time you Worship',
  },
  MidnightCookie: {
    name: 'Midnight Cookie',
    img: 'images/food/boost/MidnightCookie.png',
    effect: 'Increases Weapon Power by 5. 2% chance to be consumed every time you defeat a monster',
  },
  Pearl1: {
    name: 'Aqua Pearl',
    img: 'images/food/boost/Pearl1.png',
    effect: 'Increases Fishing Spd by 30%. 1% chance to be consumed every time you reel in a fish',
  },
  Pearl2: {
    name: 'Stained Pearl',
    img: 'images/food/boost/Pearl2.png',
    effect: 'Increases Mining Speed by 30%. 1% chance to be consumed every time you swing your pickaxe',
  },
  Pearl3: {
    name: 'Shiny Pearl',
    img: 'images/food/boost/Pearl3.png',
    effect: 'Increases Exp Gain by 25%. 1% chance to be consumed every time you defeat a monster',
  },

  // ── Potions ──
  FoodPotGr1: {
    name: 'Small Speed Potion',
    img: 'images/food/potions/FoodPotGr1.png',
    effect: 'Increases Move Spd by 10%. 1% chance to be consumed every 10 meters walked',
  },
  FoodPotGr2: {
    name: 'Average Speed Potion',
    img: 'images/food/potions/FoodPotGr2.png',
    effect: 'Increases Move Spd by 15%. 1% chance to be consumed every 10 meters walked',
  },
  FoodPotGr3: {
    name: 'Decent Speed Potion',
    img: 'images/food/potions/FoodPotGr3.png',
    effect: 'Increases Move Spd by 17%. 1% chance to be consumed every 10 meters walked',
  },
  FoodPotGr4: {
    name: 'Potent Speed Potion',
    img: 'images/food/potions/FoodPotGr4.png',
    effect: 'Increases Move Spd by 20%. 1% chance to be consumed every 10 meters walked',
  },
  FoodPotMana1: {
    name: 'Small Mana Potion',
    img: 'images/food/potions/FoodPotMana1.png',
    effect: 'Boosts Mana Regen Rate by 20%. 2% chance to be consumed every 100% Mana Regenerated',
  },
  FoodPotMana2: {
    name: 'Average Mana Potion',
    img: 'images/food/potions/FoodPotMana2.png',
    effect: 'Boosts Mana Regen Rate by 30%. 2% chance to be consumed every 100% Mana Regenerated',
  },
  FoodPotMana3: {
    name: 'Decent Mana Potion',
    img: 'images/food/potions/FoodPotMana3.png',
    effect: 'Boosts Mana Regen Rate by 40%. 1% chance to be consumed every 100% Mana Regenerated',
  },
  FoodPotMana4: {
    name: 'Potent Mana Potion',
    img: 'images/food/potions/FoodPotMana4.png',
    effect: 'Boosts Mana Regen Rate by 50%. 1% chance to be consumed every 100% Mana Regenerated',
  },
  FoodPotOr1: {
    name: 'Small Strength Potion',
    img: 'images/food/potions/FoodPotOr1.png',
    effect: 'Increases Base Dmg by 50. 1% chance to be consumed every time you defeat a monster',
  },
  FoodPotOr2: {
    name: 'Average Strength Potion',
    img: 'images/food/potions/FoodPotOr2.png',
    effect: 'Increases Base Dmg by 150. 1% chance to be consumed every time you defeat a monster',
  },
  FoodPotOr3: {
    name: 'Decent Strength Potion',
    img: 'images/food/potions/FoodPotOr3.png',
    effect: 'Increases Base Dmg by 400. 1% chance to be consumed every time you defeat a monster',
  },
  FoodPotOr4: {
    name: 'Potent Strength Potion',
    img: 'images/food/potions/FoodPotOr4.png',
    effect: 'Increases Base Dmg by 1000. 1% chance to be consumed every time you defeat a monster',
  },
  FoodPotRe1: {
    name: 'Small Life Potion',
    img: 'images/food/potions/FoodPotRe1.png',
    effect: 'Increases Base HP by 75. 1% chance to be consumed every time you defeat a monster',
  },
  FoodPotRe2: {
    name: 'Average Life Potion',
    img: 'images/food/potions/FoodPotRe2.png',
    effect: 'Increases Base HP by 200. 1% chance to be consumed every time you defeat a monster',
  },
  FoodPotRe3: {
    name: 'Decent Life Potion',
    img: 'images/food/potions/FoodPotRe3.png',
    effect: 'Increases Base HP by 400. 1% chance to be consumed every time you defeat a monster',
  },
  FoodPotRe4: {
    name: 'Potent Life Potion',
    img: 'images/food/potions/FoodPotRe4.png',
    effect: 'Increases Base HP by 800. 1% chance to be consumed every time you defeat a monster',
  },
  FoodPotYe1: {
    name: 'Small EXP Potion',
    img: 'images/food/potions/FoodPotYe1.png',
    effect: 'Increases Exp Gain by 30%. 1% chance to be consumed every time you defeat a monster',
  },
  FoodPotYe2: {
    name: 'Average EXP Potion',
    img: 'images/food/potions/FoodPotYe2.png',
    effect: 'Increases Exp Gain by 45%. 1% chance to be consumed every time you defeat a monster',
  },
  FoodPotYe3: {
    name: 'Decent EXP Potion',
    img: 'images/food/potions/FoodPotYe3.png',
    effect: 'Increases Exp Gain by 60%. 1% chance to be consumed every time you defeat a monster',
  },
  FoodPotYe4: {
    name: 'Potent EXP Potion',
    img: 'images/food/potions/FoodPotYe4.png',
    effect: 'Increases Exp Gain by 75%. 1% chance to be consumed every time you defeat a monster',
  },
  FoodPotYe5: {
    name: 'Quotient EXP Potion',
    img: 'images/food/potions/FoodPotYe5.png',
    effect: 'Increases Exp Gain by 90%. 1% chance to be consumed every time you defeat a monster',
  },

  // ── Health Food ──
  FoodEvent8: {
    name: 'Milk Choco',
    img: 'images/food/boost/FoodEvent8.png',
    effect: 'Auto-Used when your health goes below 80%. Restores 1000 HP. Has a 12 second Cooldown',
  },
  FoodHealth1: {
    name: 'Nomwich',
    img: 'images/food/FoodHealth1.png',
    effect: 'Auto-Used when your health goes below 50%. Restores 20 HP. Has a 30 second Cooldown',
  },
  FoodHealth2: {
    name: 'Cheezy Pizza',
    img: 'images/food/FoodHealth2.png',
    effect: 'Auto-Used when your health goes below 50%. Restores 125 HP. Has a 30 second Cooldown',
  },
  FoodHealth3: {
    name: 'Hot Dog',
    img: 'images/food/FoodHealth3.png',
    effect: 'Auto-Used when your health goes below 50%. Restores 50 HP. Has a 30 second Cooldown',
  },
  FoodHealth4: {
    name: 'Saucy Weiner',
    img: 'images/food/FoodHealth4.png',
    effect: 'Auto-Used when your health goes below 50%. Restores 700 HP. Has a 30 second Cooldown',
  },
  FoodHealth5: {
    name: 'Cranberry Jam',
    img: 'images/food/FoodHealth5.png',
    effect: 'Auto-Used when your health goes below 50%. Restores 200 HP. Has a 30 second Cooldown',
  },
  FoodHealth6: {
    name: 'Kebab Sticks',
    img: 'images/food/FoodHealth6.png',
    effect: 'Auto-Used when your health goes below 50%. Restores 300 HP. Has a 30 second Cooldown',
  },
  FoodHealth7: {
    name: 'Meat Pie',
    img: 'images/food/FoodHealth7.png',
    effect: 'Auto-Used when your health goes below 50%. Restores 500 HP. Has a 30 second Cooldown',
  },
  FoodHealth8: {
    name: 'Crabby Cake Supreme',
    img: 'images/food/FoodHealth8.png',
    effect: 'Auto-Used when your health goes below 35%. Restores 700 HP. Has a 60 second Cooldown',
  },
  FoodHealth9: {
    name: 'Yeti Ham',
    img: 'images/food/FoodHealth9.png',
    effect: 'Auto-Used when your health goes below 60%. Restores 1000 HP. Has a 30 second Cooldown',
  },
  FoodHealth10: {
    name: 'Mountain Bread',
    img: 'images/food/FoodHealth10.png',
    effect: 'Auto-Used when your health goes below 50%. Restores 750 HP. Has a 30 second Cooldown',
  },
  FoodHealth11: {
    name: 'Sheepie Dairy',
    img: 'images/food/FoodHealth11.png',
    effect: 'Auto-Used when your health goes below 50%. Restores 1500 HP. Has a 30 second Cooldown',
  },
  FoodHealth12: {
    name: 'Spicy Space Ribs',
    img: 'images/food/FoodHealth12.png',
    effect: 'Auto-Used when your health goes below 50%. Restores 6000 HP. Has a 25 second Cooldown',
  },
  FoodHealth13: {
    name: 'Cupcake',
    img: 'images/food/FoodHealth13.png',
    effect: 'Auto-Used when your health goes below 70%. Restores 3000 HP. Has a 30 second Cooldown',
  },
  FoodHealth14: {
    name: 'Lemon Slice',
    img: 'images/food/FoodHealth14.png',
    effect: 'Auto-Used when your health goes below 50%. Restores 8000 HP. Has a 22 second Cooldown',
  },
  FoodHealth15: {
    name: 'Grilled Cheese Nomwich',
    img: 'images/food/FoodHealth15.png',
    effect: 'Auto-Used when your health goes below 50%. Restores 12500 HP. Has a 20 second Cooldown',
  },
  FoodHealth16: {
    name: 'Raw Nigiri',
    img: 'images/food/FoodHealth16.png',
    effect: 'Auto-Used when your health goes below 50%. Restores 20000 HP. Has a 20 second Cooldown',
  },
  FoodHealth17: {
    name: 'Dumpling',
    img: 'images/food/FoodHealth17.png',
    effect: 'Auto-Used when your health goes below 50%. Restores 40000 HP. Has a 20 second Cooldown',
  },
  FoodHealth18: {
    name: 'Saltwater Taffy',
    img: 'images/food/FoodHealth18.png',
    effect: 'Auto-Used when your health goes below 50%. Restores 60000 HP. Has a 20 second Cooldown',
  },
  FoodHealth19: {
    name: 'Sugar Cookie',
    img: 'images/food/FoodHealth19.png',
    effect: 'Auto-Used when your health goes below 50%. Restores 80000 HP. Has a 20 second Cooldown',
  },
  Meatloaf: {
    name: 'Magic Meatloaf',
    img: 'images/food/boost/Meatloaf.png',
    effect: 'Auto-Used when your health goes below 30%. Restores 2000 HP. Has a 10 second Cooldown',
  },
  Peanut: {
    name: 'Peanut',
    img: 'images/food/boost/Peanut.png',
    effect: 'Auto-Used when your health goes below 75%. Restores 80 HP. Has a 20 second Cooldown. The favorite snack of all bloblytes!',
  },
}
