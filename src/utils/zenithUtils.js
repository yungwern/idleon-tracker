import { zenithMarketMap } from '../data'

// Zenith market (W7 Spelunking) bonus: floor(x4 × level)
export function getZenithBonus(zenith, index) {
  return Math.floor((zenithMarketMap[index]?.x4 ?? 0) * (zenith?.marketLevels?.[index] ?? 0))
}
