// Tome (W4). Total Tome points come from ~124 account stats across ~45 game systems (Toolbox
// parsers/world-4/tome.ts calcTomeQuantity), most of which the snapshot doesn't parse, so the app
// takes the total as an input (the number shown in the game's Tome) instead of recomputing it.

// localStorage key for the Tome points the player typed in (Import Save modal, see hooks/useTomePoints)
export const TOME_POINTS_KEY = 'farming_tome_points_input'

// What reads Tome points, listed in the Import Save modal so players know why it's asked for
export const TOME_POINTS_USES = [
  {
    page: 'Farming',
    use: 'Crop Chapter bubble in the Crop Evolution multi',
  },
  {
    page: 'Spelunking',
    use: 'Tome lore bonus in Amber gain',
  },
]

// Tome bubbles (Crop Chapter, Tome Strength...) give their bonus once per 2000 points above 5000
export function getTomeBubbleMulti(tomePoints) {
  return Math.floor(Math.max(0, (Number(tomePoints) || 0) - 5000) / 2000)
}
