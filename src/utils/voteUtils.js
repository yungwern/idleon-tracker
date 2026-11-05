import { ballotBonuses, meritocracyBonuses, holeMajiks } from '../data'
import { getCompanionBonus } from './companionUtils'
import { getArcadeBonus } from './arcadeUtils'
import { getLegendTalentBonus, getLegendTalentLevel } from './legendTalentUtils'
import { getClamWorkBonus } from './clamWorkUtils'
import { getSushiBonus } from './sushiUtils'
import { getJellyBonus } from './jellyUtils'
import { getEventShopBonus } from './eventShopUtils'
import { getPaletteBonus } from './gamingUtils'
import { getWinnerBonusByName } from './summoningUtils'
import { getEquinoxUpgradeBonus, EQUINOX_UPGRADES } from './equinoxUtils'

// Vote Ballot (W2). snapshot.voteBallot holds this week's winning picks, from serverVars.
// Both votes are ported (Toolbox parsers/world-2/voteBallot.ts): Bonus Ballot = VotingBonusz,
// Multi Meritocracy = MeritocBonuszMulti. Bonus = base % (data/voteBallotMap.js) × multi, the week it wins.
export function isBallotBonusSelected(voteBallot, index) {
  return voteBallot?.selectedBonus === index
}

export function isMeritocracyBonusSelected(voteBallot, index) {
  return voteBallot?.selectedMeritocracy === index
}

const SPIRIT_VILLAGE_MAP = 250 // W6 town: Meritocracy gives nothing until a character clears this map
const PUFFERBLOB = 39 // companion: +% Meritocracy multi
const POPPY = 161 // companion: 2x Bonus Ballot and Meritocracy
const MERIT_LEGEND_TALENT = 24
const MERIT_CLAM_WORK = 3 // +5%
const MERIT_SUSHI = 51
const MERIT_JELLY = 33
const MERIT_EVENT_SHOP = 23 // +20%

// The account's Meritocracy multiplier (4.52 on Eli's save, = Toolbox)
export function getMeritocracyMulti(snapshot) {
  const reached = (snapshot?.characters ?? []).some(character => {
    const left = character?.mapKillsLeft?.[SPIRIT_VILLAGE_MAP]
    return left != null && Number(left) <= 0
  })
  if (!reached) return 0
  const base = snapshot?.voteBallot?.demonfleshHandedIn ? 1 : 0.25
  const legend = getLegendTalentBonus(MERIT_LEGEND_TALENT, getLegendTalentLevel(snapshot?.legendTalents, MERIT_LEGEND_TALENT))
  const additive = 5 * getClamWorkBonus(snapshot, MERIT_CLAM_WORK)
    + getCompanionBonus(snapshot?.companions, PUFFERBLOB)
    + legend
    + getArcadeBonus(snapshot, 'Meritocracy Bonus')
    + 20 * getEventShopBonus(snapshot?.eventShop, MERIT_EVENT_SHOP)
    + getSushiBonus(snapshot?.sushi, MERIT_SUSHI)
    + getJellyBonus(snapshot?.jellyOperator, MERIT_JELLY)
  return (1 + getCompanionBonus(snapshot?.companions, POPPY) / 100) * (base + additive / 100)
}

// Meritocracy bonus `index` as a %: base × multi the week it's the winning pick, else 0
export function getMeritocracyBonus(snapshot, index) {
  if (!isMeritocracyBonusSelected(snapshot?.voteBallot, index)) return 0
  return (meritocracyBonuses[index]?.value ?? 0) * getMeritocracyMulti(snapshot)
}

const MASHED_POTATO = 19 // companion: +% ballot multi
const CRYSTAL_CUTTLEFISH = 41 // companion: +% ballot multi
const BALLOT_PALETTE = 32
const BALLOT_LEGEND_TALENT = 22
const BALLOT_EVENT_SHOP = [7, 16] // +17% and +13%
const VOTER_INTEGRITY = 3 // IdleOn majik (Conjuror): +x0% per LV
const BALLOT_SUSHI = 50
const BALLOT_MERITOCRACY = 9 // Meritocracy: }x Bonus Ballot

// The account's Bonus Ballot multiplier
export function getBallotMulti(snapshot) {
  const legend = getLegendTalentBonus(BALLOT_LEGEND_TALENT, getLegendTalentLevel(snapshot?.legendTalents, BALLOT_LEGEND_TALENT))
  const majikLevel = Number(snapshot?.caverns?.idleonMajiks?.[VOTER_INTEGRITY]) || 0
  const majik = Math.floor((holeMajiks[2]?.[VOTER_INTEGRITY]?.x0 ?? 0) * majikLevel)
  const additive = getCompanionBonus(snapshot?.companions, CRYSTAL_CUTTLEFISH)
    + getEquinoxUpgradeBonus(snapshot?.equinox, EQUINOX_UPGRADES.voterRights)
    + majik
    + getWinnerBonusByName(snapshot, '+{% Ballot Bonus')
    + 17 * getEventShopBonus(snapshot?.eventShop, BALLOT_EVENT_SHOP[0])
    + 13 * getEventShopBonus(snapshot?.eventShop, BALLOT_EVENT_SHOP[1])
    + getCompanionBonus(snapshot?.companions, MASHED_POTATO)
    + getPaletteBonus(snapshot, BALLOT_PALETTE)
    + legend
    + getSushiBonus(snapshot?.sushi, BALLOT_SUSHI)
  return (1 + getCompanionBonus(snapshot?.companions, POPPY) / 100)
    * (1 + getMeritocracyBonus(snapshot, BALLOT_MERITOCRACY) / 100)
    * (1 + additive / 100)
}

// Bonus Ballot bonus `index` as a %: base × multi the week it's the winning pick, else 0
export function getBallotBonus(snapshot, index) {
  if (!isBallotBonusSelected(snapshot?.voteBallot, index)) return 0
  return (ballotBonuses[index]?.value ?? 0) * getBallotMulti(snapshot)
}
