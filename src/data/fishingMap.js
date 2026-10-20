// =========================
// FISHING
// =========================
// Source: IdleonToolbox (Morta1/IdleonToolbox) shared-data.json "fishingKits" + items.json.
// Images: public/images/fishing/ (rods, lines, weights and fish all live here).
//
// Toolkit weights and lines — one of each is equipped per character.
// The save stores the equipped pair as PersonalValuesMap.FishingToolkit = [weight, line];
// those numbers match the item ids (Weight5 = 5). 0 = the default Fly / Fishing Twine (no item).
//   depth  = bonus chance to catch fish from each depth zone (Green, Yellow, Red, Purple)
//   exp    = Fishing EXP, speed = shorter time between catches, power = fishing efficiency

export const fishingWeightMap = {
  Weight1: {
    name: 'Wormie Weight',
    img: 'images/fishing/Weight1.png',
    depth: {
      green: 0,
      yellow: 15,
      red: 0,
      purple: 0,
    },
    exp: 5,
    speed: 0,
    power: 0,
  },
  Weight2: {
    name: 'Iron Hook',
    img: 'images/fishing/Weight2.png',
    depth: {
      green: 3,
      yellow: 2,
      red: 0,
      purple: 0,
    },
    exp: 0,
    speed: 3,
    power: 1,
  },
  Weight3: {
    name: 'Basic Bobber',
    img: 'images/fishing/Weight3.png',
    depth: {
      green: 0,
      yellow: 3,
      red: 3,
      purple: 0,
    },
    exp: 4,
    speed: 4,
    power: 1,
  },
  Weight4: {
    name: 'Dualhook Prongs',
    img: 'images/fishing/Weight4.png',
    depth: {
      green: 0,
      yellow: 0,
      red: 4,
      purple: 4,
    },
    exp: 0,
    speed: 8,
    power: 3,
  },
  Weight5: {
    name: 'One Pound of Steel',
    img: 'images/fishing/Weight5.png',
    depth: {
      green: 0,
      yellow: 0,
      red: 0,
      purple: 30,
    },
    exp: 2,
    speed: 2,
    power: 0,
  },
  Weight6: {
    name: 'One Pound of Feathers',
    img: 'images/fishing/Weight6.png',
    depth: {
      green: 0,
      yellow: 0,
      red: 35,
      purple: 10,
    },
    exp: 0,
    speed: 5,
    power: 0,
  },
  Weight7: {
    name: 'Massless Unit for Physics Questions',
    img: 'images/fishing/Weight7.png',
    depth: {
      green: 20,
      yellow: 0,
      red: 0,
      purple: 0,
    },
    exp: 10,
    speed: 0,
    power: 0,
  },
  Weight8: {
    name: 'Literal Elephant',
    img: 'images/fishing/Weight8.png',
    depth: {
      green: 0,
      yellow: 0,
      red: 20,
      purple: 60,
    },
    exp: 0,
    speed: 0,
    power: 6,
  },
  Weight9: {
    name: 'Valve Patented Circle Thingies',
    img: 'images/fishing/Weight9.png',
    depth: {
      green: 0,
      yellow: 0,
      red: 0,
      purple: 40,
    },
    exp: 5,
    speed: 10,
    power: 5,
  },
  Weight10: {
    name: 'Dynamite',
    img: 'images/fishing/Weight10.png',
    depth: {
      green: 0,
      yellow: 0,
      red: 10,
      purple: 20,
    },
    exp: 0,
    speed: 0,
    power: 2,
  },
  Weight11: {
    name: 'Not Dynamite',
    img: 'images/fishing/Weight11.png',
    depth: {
      green: 12,
      yellow: 12,
      red: 0,
      purple: 0,
    },
    exp: 0,
    speed: 0,
    power: 4,
  },
  Weight12: {
    name: 'Triple Threat',
    img: 'images/fishing/Weight12.png',
    depth: {
      green: 0,
      yellow: 0,
      red: 0,
      purple: 0,
    },
    exp: 6,
    speed: 6,
    power: 6,
  },
  Weight13: {
    name: 'Crash Box',
    img: 'images/fishing/Weight13.png',
    depth: {
      green: 0,
      yellow: 0,
      red: 0,
      purple: 11,
    },
    exp: 0,
    speed: 12,
    power: 5,
  },
  Weight14: {
    name: 'Fat Albert',
    img: 'images/fishing/Weight14.png',
    depth: {
      green: 0,
      yellow: 0,
      red: 0,
      purple: 0,
    },
    exp: 10,
    speed: 0,
    power: 19,
  },
}

export const fishingLineMap = {
  Line1: {
    name: 'Copper Twine',
    img: 'images/fishing/Line1.png',
    depth: {
      green: 0,
      yellow: 3,
      red: 5,
      purple: 0,
    },
    exp: 0,
    speed: 3,
    power: 0,
  },
  Line2: {
    name: 'Silver Twine',
    img: 'images/fishing/Line2.png',
    depth: {
      green: 0,
      yellow: 0,
      red: 20,
      purple: 0,
    },
    exp: 15,
    speed: 0,
    power: 0,
  },
  Line3: {
    name: 'Gold Twine',
    img: 'images/fishing/Line3.png',
    depth: {
      green: 0,
      yellow: 0,
      red: 8,
      purple: 20,
    },
    exp: 22,
    speed: 6,
    power: 2,
  },
  Line4: {
    name: 'Platinum Twine',
    img: 'images/fishing/Line4.png',
    depth: {
      green: 0,
      yellow: 0,
      red: 30,
      purple: 30,
    },
    exp: 35,
    speed: 12,
    power: 5,
  },
  Line5: {
    name: 'Leafy Vines',
    img: 'images/fishing/Line5.png',
    depth: {
      green: 0,
      yellow: 0,
      red: 10,
      purple: 0,
    },
    exp: 0,
    speed: 0,
    power: 2,
  },
  Line6: {
    name: 'Fun Flags',
    img: 'images/fishing/Line6.png',
    depth: {
      green: 0,
      yellow: 0,
      red: 8,
      purple: 8,
    },
    exp: 0,
    speed: 1,
    power: 3,
  },
  Line7: {
    name: 'Electrical Wiring',
    img: 'images/fishing/Line7.png',
    depth: {
      green: 0,
      yellow: 0,
      red: 5,
      purple: 20,
    },
    exp: 0,
    speed: 2,
    power: 5,
  },
  Line8: {
    name: 'Wiener Links',
    img: 'images/fishing/Line8.png',
    depth: {
      green: 0,
      yellow: 0,
      red: 17,
      purple: 5,
    },
    exp: 0,
    speed: 3,
    power: 10,
  },
  Line9: {
    name: 'Zeus Gon Fishin',
    img: 'images/fishing/Line9.png',
    depth: {
      green: 0,
      yellow: 0,
      red: 0,
      purple: 30,
    },
    exp: 0,
    speed: 5,
    power: 20,
  },
  Line10: {
    name: 'Needledrop',
    img: 'images/fishing/Line10.png',
    depth: {
      green: 0,
      yellow: 0,
      red: 5,
      purple: 10,
    },
    exp: 5,
    speed: 0,
    power: 0,
  },
  Line11: {
    name: 'Scripticus Spoons',
    img: 'images/fishing/Line11.png',
    depth: {
      green: 0,
      yellow: 0,
      red: 0,
      purple: 15,
    },
    exp: 9,
    speed: 2,
    power: 1,
  },
  Line12: {
    name: 'Its a Boy Celebration',
    img: 'images/fishing/Line12.png',
    depth: {
      green: 0,
      yellow: 0,
      red: 0,
      purple: 0,
    },
    exp: 0,
    speed: 15,
    power: 5,
  },
  Line13: {
    name: 'Its a Girl Celebration',
    img: 'images/fishing/Line13.png',
    depth: {
      green: 0,
      yellow: 0,
      red: 0,
      purple: 0,
    },
    exp: 15,
    speed: 5,
    power: 0,
  },
  Line14: {
    name: 'Its Alright Celebration',
    img: 'images/fishing/Line14.png',
    depth: {
      green: 0,
      yellow: 0,
      red: 0,
      purple: 0,
    },
    exp: 8,
    speed: 8,
    power: 8,
  },
}

// Fish (names only; Fishing Rods are equipment — names in itemMap.js)
export const fishMap = {
  Fish1: {
    name: 'Goldfish',
    img: 'images/fishing/Fish1.png',
  },
  Fish2: {
    name: 'Hermit Can',
    img: 'images/fishing/Fish2.png',
  },
  Fish3: {
    name: 'Jellyfish',
    img: 'images/fishing/Fish3.png',
  },
  Fish4: {
    name: 'Bloach',
    img: 'images/fishing/Fish4.png',
  },
  Fish5: {
    name: 'Skelefish',
    img: 'images/fishing/Fish5.png',
  },
  Fish6: {
    name: 'Sand Shark',
    img: 'images/fishing/Fish6.png',
  },
  Fish7: {
    name: 'Manta Ray',
    img: 'images/fishing/Fish7.png',
  },
  Fish8: {
    name: 'Kraken',
    img: 'images/fishing/Fish8.png',
  },
  Fish9: {
    name: 'Icefish',
    img: 'images/fishing/Fish9.png',
  },
  Fish10: {
    name: 'Shellfish',
    img: 'images/fishing/Fish10.png',
  },
  Fish11: {
    name: 'Jumbo Shrimp',
    img: 'images/fishing/Fish11.png',
  },
  Fish12: {
    name: 'Caulifish',
    img: 'images/fishing/Fish12.png',
  },
  Fish13: {
    name: 'Equinox Fish',
    img: 'images/fishing/Fish13.png',
  },
  Fish14: {
    name: 'Trench fish',
    img: 'images/fishing/Fish14.png',
  },
}
