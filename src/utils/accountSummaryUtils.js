// Home account summary: plain numbers from the snapshot (characters, levels, money, tickets, arcade balls).

// Coins work like the game's purse: each coin tier is worth 100 of the one before it (Coins1 = copper ...
// Coins30). Returns the highest `count` tiers held, [{ tier, amount }], highest first (Toolbox getCoinsArray).
// The total is a float past ~1e15, so only the top tiers are exact enough to show.
const HIGHEST_COIN = 30

export function getTopCoins(money, count = 3) {
  if (!Number.isFinite(money) || money < 1) return []
  let digits = BigInt(Math.floor(money)).toString()
  const tiers = []
  let tier = 1
  while (digits.length > 0 && tier < HIGHEST_COIN) {
    tiers.push({ tier, amount: Number(digits.slice(-2)) })
    digits = digits.slice(0, -2)
    tier += 1
  }
  if (digits.length > 0) tiers.push({ tier: HIGHEST_COIN, amount: Number(digits) })
  return tiers.reverse().filter(coin => coin.amount > 0).slice(0, count)
}

export function getAccountSummary(snapshot) {
  const characters = snapshot?.characters ?? []
  const highest = characters.reduce((best, c) => ((c.level ?? 0) > (best?.level ?? -1) ? c : best), null)
  const lowest = characters.reduce((worst, c) => ((c.level ?? 0) < (worst?.level ?? Infinity) ? c : worst), null)
  return {
    characterCount: characters.length,
    totalLevel: characters.reduce((sum, c) => sum + (Number(c.level) || 0), 0),
    highest: highest ? { name: highest.name, className: highest.class, level: highest.level ?? 0 } : null,
    lowest: lowest ? { name: lowest.name, level: lowest.level ?? 0 } : null,
    money: snapshot?.currencies?.money ?? 0,
    colosseumTickets: snapshot?.currencies?.colosseumTickets ?? null,
    arcadeBalls: snapshot?.arcade?.balls ?? null,
    arcadeGoldBalls: snapshot?.arcade?.goldBalls ?? null,
    arcadeRoyalBalls: snapshot?.arcade?.royalBalls ?? null,
    arcadeOmegaBalls: snapshot?.arcade?.omegaBalls ?? null,
  }
}
