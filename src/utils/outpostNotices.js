import { optimizeOutposts } from './outpostOptimizer'

// Every Outposts notice, per world. The world headers, their count badges and the Royal Guardian
// sidebar badge all read from here, so they always agree.
// Returns { byWorld: Map(world → { commander, priest, camps, swaps, count }), count }
//   commander / priest: that world's advice when the units need moving, else null
//   camps: Support Camps to link to the Priests' target ([] when none)
//   swaps: outposts whose Trader/Surveyor split should change ([{ outpost, swap }])
//   count: +1 for each kind of notice the world has (so 5 swaps still count once)
export function getOutpostNotices(rg, outposts) {
  const optimizer = optimizeOutposts(rg, outposts)
  const worlds = new Set(outposts.map(o => o.world))
  const byWorld = new Map()
  let count = 0
  worlds.forEach(world => {
    const commander = optimizer.commanderAdvice.get(world)
    const priest = optimizer.priestAdvice.get(world)
    const swaps = outposts
      .filter(o => o.world === world)
      .map(outpost => ({ outpost, swap: optimizer.byMap.get(outpost.mapIndex)?.unitSwap }))
      .filter(row => row.swap)
    const notices = {
      commander: commander?.needsMove ? commander : null,
      priest: priest?.needsMove ? priest : null,
      camps: priest?.campsToLink ?? [],
      swaps,
    }
    notices.count = [notices.commander, notices.priest, notices.camps.length > 0, swaps.length > 0].filter(Boolean).length
    count += notices.count
    byWorld.set(world, notices)
  })
  return { byWorld, count }
}
