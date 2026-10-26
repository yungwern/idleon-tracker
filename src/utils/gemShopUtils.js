// Gem shop purchases by item index (GemItemsPurchased)
export function getGemShopPurchases(gemShop, index) {
  return gemShop?.purchases?.[index] ?? 0
}
