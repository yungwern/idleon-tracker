import { statueBases } from '../data'
import { getAccountTalentBonus } from './talentUtils'
import { getArtifactBonus } from './sailingUtils'
import { getZenithBonus } from './zenithUtils'
import { getEventShopBonus } from './eventShopUtils'
import { getUpgradeVaultBonus } from './upgradeVaultUtils'
import { getMeritocracyBonus } from './voteUtils'

// Statue bonuses (game StatueBonusGiven), reimplemented from IdleonToolbox parsers/world-1/statues.ts.
// snapshot.statues[i] = { level, grade } (grade from StuG: 2 onyx, 3 zenith).
// Left out: the per-class statue talents (Shieldiest/Strongest/Shwifty... Statues, they only boost
// the old W1-W3 statues listed in CLASS_TALENT_STATUES).

const DRAGON = 29 // Dragon statue: }x all other statue bonuses
const VOODOO_STATUFICATION = 56 // talent: higher statue bonuses
const ONYX_LANTERN = 'The Onyx Lantern'
const ZENITH_STATUE_BOOST = 0 // zenith market
const STATUE_EVENT_SHOP = 19
const VAULT_STATUES = new Set([0, 1, 2, 6])
const VAULT_STATUE_UPGRADE = 25
const MERITOCRACY_STATUES = 26
const CLASS_TALENT_STATUES = new Set([0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 17])

// Returns { value, missing } (value as a %, the multi is 1 + value / 100)
export function getStatueBonus(snapshot, i) {
  const statue = snapshot?.statues?.[i]
  const level = Number(statue?.level) || 0
  const grade = Number(statue?.grade) || 0
  const missing = []
  if (level <= 0) return { value: 0, missing }
  if (CLASS_TALENT_STATUES.has(i)) missing.push('class statue talent')

  const talent = 1 + getAccountTalentBonus(snapshot, VOODOO_STATUFICATION).value / 100
  const onyx = grade >= 2 ? 1 + (100 + getArtifactBonus(snapshot?.sailing, ONYX_LANTERN)) / 100 : 1
  const zenith = grade >= 3 ? 1 + (50 + getZenithBonus(snapshot?.zenith, ZENITH_STATUE_BOOST)) / 100 : 1
  const dragon = i === DRAGON ? 1 : 1 + getStatueBonus(snapshot, DRAGON).value / 100
  const vault = VAULT_STATUES.has(i) ? 1 + getUpgradeVaultBonus(snapshot?.upgradeVault, VAULT_STATUE_UPGRADE) / 100 : 1
  const event = 1 + 0.3 * getEventShopBonus(snapshot?.eventShop, STATUE_EVENT_SHOP)
  const meritocracy = 1 + getMeritocracyBonus(snapshot, MERITOCRACY_STATUES) / 100

  return {
    value: level * (statueBases[i] ?? 0) * talent * onyx * zenith * dragon * vault * event * meritocracy,
    missing,
  }
}
