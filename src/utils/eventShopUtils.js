import { hasSaveLetter } from './saveCodeUtils'

// Event shop purchase i: 1 if owned, else 0 (Toolbox getEventShopBonus)
export function getEventShopBonus(eventShop, index) {
  return hasSaveLetter(eventShop?.purchases, index) ? 1 : 0
}
