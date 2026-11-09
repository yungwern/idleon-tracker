// Sneaking > Setups: Eli's gear setups for each Sneaking goal (not an optimizer). Items are ninjaItemMap raw ids
// (gloves/weapon slot first, then the two charms); 'bestNunchaku' = the strongest nunchaku you own.
// count: 'one' = a single ninja, 'rest' = every ninja not given another role.

export const BEST_NUNCHAKU = 'bestNunchaku'

export const sneakingSetups = [
  {
    id: 'door',
    name: 'Door Breaking',
    goal: 'Break the door to the next floor.',
    roles: [
      {
        name: 'Door breaker',
        count: 'one',
        items: [BEST_NUNCHAKU, 'NjTr17', 'NjTr4'],
      },
      {
        name: 'Taunter',
        count: 'one',
        items: ['NjGl2', 'NjTr1', 'NjTr2'],
      },
      {
        name: 'Everyone else',
        count: 'rest',
        items: ['NjGl2', 'NjTr16', 'NjTr2'],
      },
    ],
    why: [
      'Rosaries and Silk Veil are the two best stealth charms and both multiply Total Stealth, so the door breaker gets the most stealth possible. Get its detection just under 100% (around 99%): with every bonus it usually only needs one hit to break the door, so a small chance to swing is enough.',
      'Everyone else works on making that easier. Thundergloves and Yellow Belts speed them up, the Taunting Mark pulls every KO onto one ninja and cuts its KO time, and each KO adds Funeral Flowers to the floor. The Lotus Flowers give the door breaker more stealth on top.',
    ],
  },
  {
    id: 'flowers',
    name: 'Funeral Flower Push',
    goal: 'Get as many KOs as possible to stack Funeral Flowers (stealth on that floor).',
    roles: [
      {
        name: 'Taunter',
        count: 'one',
        items: ['NjGl2', 'NjTr1', 'NjTr2'],
      },
      {
        name: 'Everyone else',
        count: 'rest',
        items: ['NjGl2', 'NjTr2', 'NjTr2'],
      },
    ],
    why: [
      'Every KO adds Funeral Flowers, which boost stealth on that floor until you change mastery. Simple setup, but everyone after the taunter needs a second Yellow Belt from storage.',
      'Why the Taunting Mark over a second Yellow Belt: speed only helps between KOs, while the Mark shortens the KO itself and soaks up the other ninjas\' KOs. It wins whenever a KO lasts longer than an action, and the gap shrinks as your KO time gets shorter.',
    ],
  },
  {
    id: 'meteorite',
    name: 'Item Farming (Meteorite)',
    goal: 'Farm items with one ninja on a floor you can survive.',
    roles: [
      {
        name: 'Farmer',
        count: 'one',
        items: ['NjGl2', 'NjTr17', 'NjTr5'],
      },
      {
        name: 'Everyone else',
        count: 'rest',
        items: ['NjGl2', 'NjTr16', 'NjTr16'],
      },
    ],
    why: [
      'The farmer gets Rosaries for stealth and Meteorite for item find. Every other ninja carries two Lotus Flowers to raise the farmer\'s stealth, so you need a lot of spare Lotus Flowers in storage.',
      'Once the farmer is under about 80% detection, Meteorite gives a huge boost to items found. It only boosts items and stops Sneaking EXP, so if you want Jade too, use Scroll of Power instead.',
    ],
  },
  {
    id: 'items',
    name: 'Item Farming (Stealth)',
    goal: 'Farm items (and Jade) on floors that need a lot of stealth.',
    roles: [
      {
        name: 'Farmer',
        count: 'one',
        items: ['NjGl2', 'NjTr17', 'NjTr7'],
      },
      {
        name: 'Everyone else',
        count: 'rest',
        items: ['NjGl2', 'NjTr16', 'NjTr16'],
      },
    ],
    why: [
      'For floors where the Meteorite setup doesn\'t give the farmer enough stealth. Rosaries and Scroll of Power both raise Total Stealth, and Scroll of Power also boosts Jade, so it beats Meteorite whenever you want Jade as well as items.',
      'If two Lotus Flowers on everyone is more than you need (Funeral Flowers can make it overkill), switch to Item Farming (Hybrid) to keep stacking flowers until the farmer can run Meteorite.',
    ],
  },
  {
    id: 'hybrid',
    name: 'Item Farming (Hybrid)',
    goal: 'Keep farming items while stacking Funeral Flowers toward a Meteorite setup.',
    roles: [
      {
        name: 'Farmer',
        count: 'one',
        items: ['NjGl2', 'NjTr17', 'NjTr7'],
      },
      {
        name: 'Taunter',
        count: 'one',
        items: ['NjGl2', 'NjTr1', 'NjTr2'],
      },
      {
        name: 'Everyone else',
        count: 'rest',
        items: ['NjGl2', 'NjTr16', 'NjTr2'],
      },
    ],
    why: [
      'The farmer stays the same, while everyone else mixes the Funeral Flower Push (Taunting Mark, Yellow Belts) with one Lotus Flower each. You keep enough stealth to farm while KOs keep adding flowers, until the farmer has enough stealth to swap Scroll of Power for Meteorite.',
    ],
  },
  {
    id: 'exp',
    name: 'EXP Gain',
    goal: 'Level up one ninja\'s Sneaking.',
    roles: [
      {
        name: 'EXP ninja',
        count: 'one',
        items: ['NjGl2', 'NjTr19', 'NjTr2'],
      },
    ],
    why: [
      'Leave the EXP ninja alone on the bottom floor while everyone else pushes the floor above. Alone on a floor, Black Belt triples and Yellow Belt doubles. A lone ninja usually needs the very bottom floor, or it won\'t have the stealth to farm EXP at all.',
      'Best done right after reaching a new mastery, and worth doing for each ninja: the ones that only boost a main ninja sit at 100% detection almost the whole run and fall behind.',
    ],
  },
]
