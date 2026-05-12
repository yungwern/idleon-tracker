export const worshipMap = {
    totem_0: {
        name: 'Goblin Gorefest',
        map: 'Forest Outskirts',
        soul: 'Forest Soul',
        chargeReq: 25,
        prayers: [
            { name: 'Big Brain Time', wave: 10 },
            { name: 'Skilled Dimwit', wave: 25 },
            { name: 'Unending Energy', wave: 51 },
            { name: 'Shiny Snitch', wave: 81 },
            { name: 'Zerg Rushogen', wave: 121 },
        ],
    },
    totem_1: {
        name: 'Wakawaka War',
        map: 'Up Up Down Down',
        soul: 'Dune Soul',
        chargeReq: 40,
        prayers: [
            { name: 'Tachion of the Titans', wave: 11 },
            { name: 'Balance of Precision', wave: 31 },
            { name: 'Midas Minded', wave: 71 },
            { name: 'Jawbreaker', wave: 101 },
        ],
    },
    totem_2: {
        name: 'Acorn Assault',
        map: 'The Roots',
        soul: 'Rooted Soul',
        chargeReq: 60,
        prayers: [
            { name: 'The Royal Sampler', wave: 21 },
            { name: 'Antifun Spirit', wave: 41 },
            { name: 'Circular Criticals', wave: 71 },
            { name: 'Ruck Sack', wave: 111 },
        ],
    },
    totem_3: {
        name: 'Frosty Firefight',
        map: "Rollin' Tundra",
        soul: 'Frigid Soul',
        chargeReq: 90,
        prayers: [
            { name: 'Fibers of Absence', wave: 21 },
            { name: 'Vascous Tissue', wave: 51 },
            { name: 'Beefy For Real', wave: 121 },
        ],
    },
    totem_4: {
        name: 'Clash of Cans',
        map: 'Mountainous Deugh',
        soul: 'Squishy Soul',
        chargeReq: 120,
        prayers: [
            { name: 'Balance of Pain', wave: 21 },
            { name: 'Balance of Proficiency', wave: 51 },
            { name: 'Glitterbug', wave: 131 },
        ],
    },
    totem_5: {
        name: 'Citric Conflict',
        map: 'OJ Bay',
        soul: 'Oozie Soul',
        chargeReq: 250,
    },
    totem_6: {
        name: 'Breezy Battle',
        map: 'Above the Clouds',
        soul: 'Breezy Soul',
        chargeReq: 500,
    },
    totem_7: {
        name: 'Pufferblob Brawl',
        map: 'Puffpuff Overpass',
        soul: 'Deepsea Soul',
        chargeReq: 1000,
    },
}

export const soulsMap = {
    Soul1: 'Forest Soul',
    Soul2: 'Dune Soul',
    Soul3: 'Rooted Soul',
    Soul4: 'Frigid Soul',
    Soul5: 'Squishy Soul',
    Soul6: 'Oozie Soul',
    Soul7: 'Breezy Soul',
    Soul8: 'Deepsea Soul',
}

export const towerMap = {
    ConTower9: {
        name: 'Pulse Mage',
        bonus: 'Damage',
        upgReq: 'Refinery1',
        amount: 2,
        costInc: [15, 1.4],
        traits: {
            a: '+25 chance to multihit',
            b: 'Hits push back Non Gigao enemies by +5 pixels',
        },
    },
    ConTower10: {
        name: 'Fireball Lobber',
        bonus: 'Damage',
        upgReq: 'Refinery1',
        amount: 4,
        costInc: [20, 1.5],
        traits: {
            a: '+15% chance to throw 2 fireballs',
            b: '+25% bigger explosion radius',
        },
    },
    ConTower11: {
        name: 'Boulder Roller',
        bonus: 'Damage',
        upgReq: 'Refinery2',
        amount: 4,
        costInc: [25, 1.6],
        traits: {
            a: 'Boulders travel +50% farther',
            b: 'Boulders can hit +2 more enemies',
        },
    },
ConTower12: {
    name: 'Frozone Malone',
    bonus: 'Range',
    upgReq: 'Refinery2',
    amount: 7,
    costInc: [1.5, 1.6],
    traits: {
        a: 'Freezing effect slows enemies +15% more',
        b: 'Monsters stay frozen +2 seconds longer',
    },
    setup: ['AAAAAA'],
    setupDesc: [
        'Maximizes the slow effect on enemies, keeping them in range of your damage towers longer.',
    ],
},
ConTower13: {
    name: 'Stormcaller',
    bonus: 'Damage',
    upgReq: 'Refinery3',
    amount: 5,
    costInc: [30, 1.7],
    traits: {
        a: '+200% dmg to monsters below 60% HP',
        b: 'All towers in range gain +20% crit chance',
    },
    setup: ['BBBBBA', 'AAAAAA'],
    setupDesc: [
        'Boosts crit chance for all nearby towers, amplifying your entire setup\'s damage output.',
        'Greatly increases damage against weakened enemies, making Stormcaller a powerful finisher.',
    ],
},
ConTower14: {
    name: 'Party Starter',
    bonus: 'Range',
    upgReq: 'Refinery3',
    amount: 9,
    costInc: [4, 1.7],
    traits: {
        a: 'Other towers in range get +25% speed',
        b: 'All towers in entire map get +15% dmg',
    },
    setup: ['AAABBB', 'BBBBBB'],
    setupDesc: [
        'Increases the attack speed of nearby towers while also buffing map-wide damage.',
        'Maximizes the damage buff across your entire map for the highest possible tower output.',
    ],
},
ConTower15: {
    name: 'Kraken Cosplayer',
    bonus: 'Spawn Rate',
    upgReq: 'Refinery4',
    amount: 7,
    costInc: [3, 1.6],
    traits: {
        a: '+1 max underlings from this tower',
        b: 'Underlings push mobs back +25% farther',
    },
    setup: ['BAAAA'],
    setupDesc: [
        'Leads with an extra underling, then stacks additional pushback for sustained crowd control.',
    ],
},
ConTower16: {
    name: 'Poisonic Elder',
    bonus: 'Damage',
    upgReq: 'Refinery5',
    amount: 10,
    costInc: [15, 1.6],
    traits: {
        a: 'Poison cloud lasts +5 seconds longer (base time is 10s)',
        b: 'Clouds hit monsters +30% more often',
    },
    setup: ['ABABBB'],
    setupDesc: [
        'Balances longer poison duration with more frequent cloud hits before committing to maximizing hit frequency.',
    ],
},
ConTower17: {
    name: 'Voidinator',
    bonus: 'Range',
    upgReq: 'Refinery6',
    amount: 20,
    costInc: [0.7, 0.8],
    traits: {
        a: '+25% chance on cast for fast cooldown',
        b: 'All towers in entire map get +20% dmg',
    },
    setup: ['BBBB'],
    setupDesc: [
        'Provides a strong map-wide damage bonus to all towers.',
    ],
},
}