import { researchGridSquares, researchObservationBonuses, stickerBaseBonuses } from '../data'
import { getCompanionBonus, isCompanionActive } from './companionUtils'
import { getCloudBonus, EQUINOX_CLOUDS } from './equinoxUtils'
import { getSushiBonus } from './sushiUtils'
import { getEventShopBonus } from './eventShopUtils'
import { isSuperbitUnlocked } from './gamingUtils'
import { getActiveCharacter } from './characterUtils'
import { getSkillLevel } from './skillUtils'

// Research (W7) grid and stickers, from IdleonToolbox parsers/world-7/research.ts and
// world-6/farming.ts getStickerBonus.

const KING_DOOT = 0 // companion
const GRID_ALL_MULTI_COMPANION = 55
const DOOT_GRID_SQUARE = 173

// Multiplier on every grid square (Toolbox getGridBonusAllmulti). King Doot counts while the
// played character has Divinity LV 2+.
export function getGridAllMulti(snapshot) {
  const research = snapshot?.research
  const doot = isCompanionActive(snapshot?.companions, KING_DOOT)
    && getSkillLevel(getActiveCharacter(snapshot), 'divinity') >= 2 ? 1 : 0
  const clouds = getCloudBonus(snapshot?.equinox, EQUINOX_CLOUDS.researchGrid1)
    + getCloudBonus(snapshot?.equinox, EQUINOX_CLOUDS.researchGrid2)
    + getCloudBonus(snapshot?.equinox, EQUINOX_CLOUDS.researchGrid3)
  return 1 + (getCompanionBonus(snapshot?.companions, GRID_ALL_MULTI_COMPANION)
    + 5 * Math.min(1, (research?.gridLevels?.[DOOT_GRID_SQUARE] ?? 0) * doot)
    + clouds
    + getSushiBonus(snapshot?.sushi, 53)) / 100
}

// A grid square's main bonus (mode 0)
export function getResearchGridBonus(snapshot, index) {
  const research = snapshot?.research
  const level = Number(research?.gridLevels?.[index]) || 0
  const base = (researchGridSquares[index]?.baseBonus ?? 0) * level * Math.max(1, getGridAllMulti(snapshot))
  const observation = Number(research?.gridObservations?.[index])
  if (!(observation >= 0)) return base
  return base * (1 + (researchObservationBonuses[observation] ?? 0) / 100)
}

// Squares 67, 68 and 107 also scale with King Rat Crowns (their mode 2 bonus)
export function getResearchGridCrownBonus(snapshot, index) {
  return getResearchGridBonus(snapshot, index) * (snapshot?.research?.kingRatCrowns ?? 0)
}

const BOONY_CROWNS = 68 // grid square: stickers +% per King Rat Crown
const STICKER_EVENT_SHOP = 37
const BETTAH_STICKAHS = 62 // superbit

// Sticker bonus by sticker type: owned × base × crowns/event shop × superbit
export function getStickerBonus(snapshot, index) {
  const owned = snapshot?.research?.stickerLevels?.[index] ?? 0
  const boost = getResearchGridCrownBonus(snapshot, BOONY_CROWNS)
    + 30 * getEventShopBonus(snapshot?.eventShop, STICKER_EVENT_SHOP)
  const superbit = isSuperbitUnlocked(snapshot?.gaming, BETTAH_STICKAHS) ? 1 : 0
  return (1 + boost / 100) * (1 + (20 * superbit) / 100) * owned * (stickerBaseBonuses[index] ?? 0)
}
