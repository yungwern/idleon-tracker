import { paletteMap, gamingImportMap, superbitMap, mutationMap, godMap } from '../data'
import {
  SUPERBITS,
  IMPORTS,
  SUPERBIT_GROUPS,
  isSuperbitUnlocked,
  getSuperbitCost,
  getImportBonus,
  getImportCost,
  getImportLevel,
  getSprinklerSaveChance,
  getGoldNuggets,
  getSecondsToNextNugget,
  getAcorns,
  getNuggetRolls,
  getAcornShop,
  BOG_LOG_READY_SECONDS,
  getLogGameMulti,
  getPoingMulti,
  getSnailMaxLevel,
  getSnailOdds,
  getEncouragementFor,
  countLogBook,
  getSproutValue,
  getSproutCapacity,
  getFertilizerCost,
  getSproutGrowChance,
  getMutationCost,
  getNewMutationChance,
  getNewMutationChanceExact,
  getRatBitMulti,
  getRatShop,
  getPaletteBonus,
  getPaletteTotalLevels,
  getPaletteChance,
  getPaletteDoubler,
  getBlackStarMulti,
  fillPaletteText,
  formatGamingNumber,
  getTotalTotemWaves,
  getMsaBitsBonus,
  secondsSinceSave,
  splitGamingLines,
  getShellProgress,
  getSprinklerDrops,
} from './gamingUtils'
import { getArtifactBonus } from './sailingUtils'
import { getCompanionBonus } from './companionUtils'
import { getBubbleBonus, getVialBonusByStat } from './alchemyUtils'
import { getMealBonusByStat } from './cookingUtils'
import { getPassiveCardBonus } from './cardUtils'
import { isAchievementComplete } from './achievementUtils'
import { getWinnerBonusByName } from './summoningUtils'
import { getLampBonus, getMonumentBonus } from './cavernUtils'
import { getEmperorBonus } from './emperorUtils'
import { getMeritocracyBonus, getBallotBonus } from './voteUtils'
import { getStickerBonus, getResearchGridBonus, getResearchGridCrownBonus } from './researchUtils'
import { getUpgradeVaultBonus } from './upgradeVaultUtils'
import { getSushiBonus } from './sushiUtils'
import { getJellyBonus } from './jellyUtils'
import { getArcadeBonus } from './arcadeUtils'
import { getExoticBonus } from './exoticUtils'
import { isJadeUnlocked } from './sneakingUtils'
import { getAccountTalentBonus } from './talentUtils'
import { getSkillLevel, isSkillMasteryBonusUnlocked } from './skillUtils'
import { getActiveCharacter } from './characterUtils'
import { getEquinoxUpgradeBonus, EQUINOX_UPGRADES } from './equinoxUtils'
import { getLoreTomeBonus } from './spelunkingUtils'
import { getCropDepotBonus, CROP_DEPOT_BONUSES } from './farmingUtils'
import { getMinorDivinityBonus, GODS } from './divinityUtils'
import { getCoralKidUpgradeBonus, CORAL_KID_UPGRADES } from './coralReefUtils'
import { getMineheadBonus } from './mineheadUtils'
import { getBell } from './holeCavernUtils'
import { getSlabMulti } from './lootyUtils'

// Gaming numbers that read other systems (Toolbox parsers/world-5/gaming.ts getBitsMulti, getPaletteLuck,
// calcRatKing, calcSuperbitBonus; divinity.ts getGodCost; the-bell.ts). Only the Gaming page imports this
// file: gamingUtils.js stays small because many other utils import it.

const log10 = value => Math.log(Math.max(value, 1)) / 2.30259 // game lavaLog

function activeGamingLevel(snapshot) {
  return getSkillLevel(getActiveCharacter(snapshot), 'gaming')
}

// ── Bit multi ─────────────────────────────────────────────────────────────────
const BIT_GRID_SQUARE = 87
const BIT_COMPANION = 53 // Koi Fish
const BIT_VIAL_STATS = { ooblek: 'GameBits', boba: '7bits' }
const BIT_MEAL_STAT = 'GamingBits'
const BITTY_LITTY_TALENT = 177
const BIT_BY_BIT_BUBBLE = 'c22'
const BIT_CARD_EFFECT = '+{% Gaming Bit Multi (Passive)'
const BIT_ACHIEVEMENTS = [296, 307]
const BIT_EMPEROR = 7
const BIT_PALETTES = [7, 18]
const BIT_MERITOCRACY = 1
const BIT_STICKER = 3
const BIT_VAULT = 68
const BIT_SUSHI = 29

// Gummy Orb: +base% bits per 10 items looted past 500 (× its form, × the slab multi). getArtifactBonus = base × form.
function getGummyOrbBonus(snapshot) {
  const looted = snapshot?.lootedItemCount ?? 0
  return getArtifactBonus(snapshot?.sailing, 'Gummy Orb') * getSlabMulti(snapshot).value * Math.floor(Math.max(0, looted - 500) / 10)
}

function source(id, label, system, multi, extra = {}) {
  return {
    id,
    label,
    system,
    multi,
    owned: multi > 1.0000001,
    // Weekly-vote bonuses are only on some weeks: listed, never counted as missing
    weekly: Boolean(extra.weekly),
    note: extra.note,
    hint: extra.hint,
  }
}

// Every multiplier on bits gained (game: GamingStatType SproutValueNonPlantMulti). Sources at 1x are the
// ones the account doesn't have yet (owned: false).
export function getBitMultiSources(snapshot) {
  const gaming = snapshot?.gaming ?? {}
  const gamingLevel = activeGamingLevel(snapshot)
  const snail = Math.max(0, Math.min(25, gaming.snailLevel ?? 0))
  const snailPast = Math.max(0, Math.min(25, (gaming.snailLevel ?? 0) - 25))
  const acornShop = getAcornShop(gaming)
  const logBook = countLogBook(gaming)
  const bitByBit = getBubbleBonus(snapshot, BIT_BY_BIT_BUBBLE)
  const crowns = gaming.crowns?.length ?? 0
  const meal = getMealBonusByStat(snapshot, BIT_MEAL_STAT)
  const ooblek = getVialBonusByStat(snapshot, BIT_VIAL_STATS.ooblek)
  const boba = getVialBonusByStat(snapshot, BIT_VIAL_STATS.boba)
  const bittyLitty = getAccountTalentBonus(snapshot, BITTY_LITTY_TALENT).value
  const achievements = BIT_ACHIEVEMENTS.filter(index => isAchievementComplete(snapshot?.achievements, index)).length
  const logGameMulti = getLogGameMulti(gaming.logGameBestRound)
  const shellBonus = getImportBonus(gaming, IMPORTS.shell)
  const msa = getMsaBitsBonus(snapshot)

  return [
    source('toggle', '100x Bits toggle', 'Gaming', 1 + 99 * (gaming.bitToggle ? 1 : 0), {
      hint: 'The garden toggle: 100x bits, but plants grow 100x slower',
    }),
    source('grid', 'Research grid', 'Research (W7)', 1 + getResearchGridBonus(snapshot, BIT_GRID_SQUARE) / 100),
    source('gummyOrb', 'Gummy Orb (artifact)', 'Sailing', 1 + getGummyOrbBonus(snapshot) / 100, {
      note: `${(snapshot?.lootedItemCount ?? 0).toLocaleString('en-US')} items looted`,
    }),
    source('koiFish', 'Koi Fish (companion)', 'Companions', Math.max(1, 1 + getCompanionBonus(snapshot?.companions, BIT_COMPANION))),
    source('weatherbook', 'Weatherbook (artifact)', 'Sailing', 1 + getArtifactBonus(snapshot?.sailing, 'Weatherbook') * gamingLevel / 100, {
      note: `× Gaming LV ${gamingLevel} (played character)`,
    }),
    source('monument', 'Bravery Monument', 'The Hole', 1 + getMonumentBonus(snapshot, 0, 4) / 100),
    source('mastery', 'Gaming skill mastery', 'Rift', isSkillMasteryBonusUnlocked(snapshot, 'gaming', 1) ? 1.15 : 1),
    source('msa', 'MSA Big Bits', 'Worship', 1 + msa / 100, {
      note: msa > 0 ? `${getTotalTotemWaves(snapshot).toLocaleString('en-US')} total waves` : undefined,
      hint: 'Superbits MSA Totalizer + MSA Big Bits',
    }),
    source('snail', 'Immortal Snail', 'Gaming', Math.max(1, Math.pow(2, snail) * Math.pow(1.5, snailPast)), {
      note: `LV ${gaming.snailLevel ?? 0}`,
    }),
    source('card', 'Gaming bit card', 'Cards', 1 + getPassiveCardBonus(BIT_CARD_EFFECT, snapshot?.cards) / 100),
    source('acorns', 'Acorn shop', 'Gaming', Math.max(1, acornShop[0].bonus)),
    source('nugget', 'Best nugget', 'Gaming', Math.max(1, gaming.bestNugget ?? 1)),
    source('shell', 'Elegant Seashell', 'Gaming', 1 + ((gaming.shellRank ?? 0) * shellBonus) / 100, {
      note: `Rank ${(gaming.shellRank ?? 0) + 1}`,
    }),
    source('logBook', 'Log Book', 'Gaming', Math.max(1, Math.pow(1.08, logBook) + (bitByBit * logBook) / 100), {
      note: `${logBook} plants, with the Bit By Bit bubble`,
    }),
    source('logGame', 'Log Game (Pro Log Flipper)', 'Gaming', logGameMulti, {
      note: logGameMulti > 1 ? `Best round ${gaming.logGameBestRound}` : undefined,
    }),
    source('ratKing', 'King Rat crowns', 'Gaming', getRatBitMulti(crowns), { note: `${crowns} crowns` }),
    source('mealVial', 'Meals + Ooz Ooblek (vial)', 'Cooking / Alchemy', 1 + (meal.value + ooblek.value) / 100),
    source('boba', 'Rocky Boba (vial)', 'Alchemy', 1 + boba.value / 100),
    source('bittyLitty', 'Bitty Litty (talent)', 'Talents', 1 + (bittyLitty * gamingLevel) / 100, {
      note: bittyLitty > 0 ? `× Gaming LV ${gamingLevel} (played character)` : undefined,
    }),
    source('poing', 'POiNG highscore', 'Gaming', Math.max(1, Math.min(25, getPoingMulti(gaming.poingHighscore)))),
    source('achievements', 'Achievements', 'Achievements', 1 + achievements / 20),
    source('summoning', 'Summoning winner bonus', 'Summoning', 1 + getWinnerBonusByName(snapshot, '<x Gaming Bits') / 100),
    source('lamp', 'The Lamp', 'The Hole', 1 + getLampBonus(snapshot, 1, 1) / 100),
    source('emperor', 'Emperor', 'Emperor (W6)', 1 + getEmperorBonus(snapshot, BIT_EMPEROR) / 100),
    ...BIT_PALETTES.map(index => source(`palette${index}`, `${paletteMap[index].name} (palette)`, 'Gaming',
      1 + getPaletteBonus(snapshot, index) / 100)),
    source('meritocracy', 'Meritocracy', 'Weekly vote', 1 + getMeritocracyBonus(snapshot, BIT_MERITOCRACY) / 100, {
      weekly: true,
      note: 'Only on weeks the bits Meritocracy wins the vote',
    }),
    source('sticker', 'Bit sticker', 'Research (W7)', 1 + getStickerBonus(snapshot, BIT_STICKER) / 100),
    source('vault', 'Mega Bits (vault)', 'Upgrade Vault', 1 + getUpgradeVaultBonus(snapshot?.upgradeVault, BIT_VAULT) / 100),
    source('sushi', 'Sushi Station', 'Sushi (W7)', 1 + getSushiBonus(snapshot?.sushi, BIT_SUSHI) / 100),
  ]
}

export function getBitMulti(snapshot) {
  const sources = getBitMultiSources(snapshot)
  return {
    sources,
    total: sources.reduce((product, s) => product * s.multi, 1),
  }
}

// ── Palette luck ──────────────────────────────────────────────────────────────
const LUCK_MERITOCRACY = 8
const LUCK_PALETTE = 3
const LUCK_LORE_TOME = 5
const LUCK_EXOTIC = 44
const LUCK_JADE = 41 // Palette Slot
const LUCK_GRID = 107 // King Rat crown bonus
const LUCK_SUSHI = 42
const LUCK_LORE_BOSS = 8

// Palette Luck multiplier (game: PaletteLuck). Returns { value, sources }.
export function getPaletteLuck(snapshot, tomePoints) {
  const gaming = snapshot?.gaming ?? {}
  const has = index => isSuperbitUnlocked(gaming, index) ? 1 : 0
  const gamingLevel = activeGamingLevel(snapshot)
  const loreBoss = snapshot?.spelunking?.loreBossesDefeated?.[LUCK_LORE_BOSS] ? 1 : 0
  const loreTome = getLoreTomeBonus(snapshot, LUCK_LORE_TOME, tomePoints)
  const colourful = (4 * gamingLevel * loreBoss + getPaletteTotalLevels(gaming) + loreTome) * has(SUPERBITS.colourfulLuck)
  const ratShop = getRatShop(gaming)[1].bonus

  const additive = [
    [`${paletteMap[LUCK_PALETTE].name} (palette)`, getPaletteBonus(snapshot, LUCK_PALETTE)],
    ['Colourful Luck (superbit)', colourful],
    ['Gamer Luck (superbit)', Math.max(0, 3 * (gamingLevel - 200)) * has(SUPERBITS.gamerLuck)],
    ['Lucky Snail (superbit)', 20 * Math.max(0, (gaming.snailLevel ?? 0) - 25) * has(SUPERBITS.luckySnail)],
    ['Acorn shop', getAcornShop(gaming)[2].bonus],
    ['Exotic market', getExoticBonus(snapshot?.farming, LUCK_EXOTIC)],
    ['Palette Slot (Jade Emporium)', isJadeUnlocked(snapshot?.sneaking, LUCK_JADE) ? 100 : 0],
    ['Arcade', getArcadeBonus(snapshot, 'Palette Luck')],
    ['Research grid', getResearchGridCrownBonus(snapshot, LUCK_GRID)],
  ]
  const additiveTotal = additive.reduce((sum, [, value]) => sum + value, 0)

  const sources = [
    { label: 'Bigger Palette (superbit)', multi: 1 + has(SUPERBITS.biggerPalette) },
    { label: 'Meritocracy', multi: 1 + getMeritocracyBonus(snapshot, LUCK_MERITOCRACY) / 100, weekly: true },
    { label: 'King Rat shop', multi: 1 + ratShop / 100 },
    { label: 'Artistic Gamer (superbit)', multi: 1 + 0.3 * has(SUPERBITS.artisticGamer) },
    { label: 'Sushi Station', multi: 1 + getSushiBonus(snapshot?.sushi, LUCK_SUSHI) / 100 },
    {
      label: 'Luck bonuses (added together)',
      multi: 1 + additiveTotal / 100,
      parts: additive.filter(([, value]) => value > 0).map(([label, value]) => ({ label, value })),
    },
  ]
  return {
    value: sources.reduce((product, s) => product * s.multi, 1),
    sources,
    needsTomePoints: !(Number(tomePoints) > 0) && (snapshot?.spelunking?.loreBonusesUnlocked ?? 0) > LUCK_LORE_TOME,
  }
}

// Hidden caps the game applies where a palette bonus is used (Toolbox parsers/misc/hiddenCaps.ts)
const SNAIL_MAIL_EXOTIC = 46

function getPaletteHiddenCap(snapshot, index) {
  const gaming = snapshot?.gaming
  if (index === 9) {
    return { cap: 75, total: getPaletteBonus(snapshot, 9) + getImportBonus(gaming, IMPORTS.bogLog), with: 'Bog Log' }
  }
  if (index === 16) {
    return { cap: 82, total: getPaletteBonus(snapshot, 16) + 100 * getSprinklerSaveChance(snapshot), with: 'Golden Sprinkler' }
  }
  if (index === 17) {
    return { cap: 100, total: getPaletteBonus(snapshot, 17) + getExoticBonus(snapshot?.farming, SNAIL_MAIL_EXOTIC), with: 'the exotic market' }
  }
  return null
}

// Every palette colour with its bonus, odds and Black Stars. Suggested = the fastest colours to level, one
// per selected slot. Capped colours still count: a capped bonus stops growing, but every LV still adds to
// total palette LVs (Colourful Luck and other total-LV bonuses), so leveling them isn't wasted.
export function getPalette(snapshot, tomePoints) {
  const gaming = snapshot?.gaming ?? {}
  const luck = getPaletteLuck(snapshot, tomePoints)
  const active = new Set(gaming.paletteSlots ?? [])
  const slotCount = Math.max(1, active.size)
  const colours = paletteMap.map((colour, index) => {
    const level = gaming.paletteLevels?.[index] ?? 0
    const stars = gaming.paletteBlackStars?.[index] ?? 0
    const bonus = getPaletteBonus(snapshot, index)
    const unstarred = stars > 0 ? bonus / getBlackStarMulti(stars) : bonus
    const cap = getPaletteHiddenCap(snapshot, index)
    const doubler = getPaletteDoubler(index)
    return {
      ...colour,
      index,
      level,
      bonus,
      text: fillPaletteText(colour.description, bonus),
      chance: getPaletteChance(gaming, index, luck.value),
      active: active.has(index),
      blackStars: stars,
      blackStarMulti: getBlackStarMulti(stars),
      nextStarText: unstarred > 0 && stars < 2 ? fillPaletteText(colour.description, unstarred * getBlackStarMulti(stars + 1)) : null,
      cap,
      capped: Boolean(cap && cap.total >= cap.cap),
      doubler: doubler !== null ? { name: superbitMap[doubler]?.name, owned: isSuperbitUnlocked(gaming, doubler) } : null,
    }
  })
  const suggested = new Set(colours
    .filter(colour => colour.chance > 0)
    .sort((a, b) => b.chance - a.chance)
    .slice(0, slotCount)
    .map(colour => colour.index))
  return {
    colours: colours.map(colour => ({ ...colour, suggested: suggested.has(colour.index) })),
    luck,
    totalLevels: getPaletteTotalLevels(gaming),
    slotCount,
    blackStarsPlaced: (gaming.paletteBlackStars ?? []).reduce((sum, stars) => sum + (stars || 0), 0),
  }
}

// ── King Rat ──────────────────────────────────────────────────────────────────
const KING_RAT_GRID = 108 // research square that unlocks King Rat's tokens
const CROWN_SUSHI = 31
const CROWN_JELLY = 42
const TOKEN_PALETTE = 34

export function getKingRat(snapshot) {
  const gaming = snapshot?.gaming ?? {}
  const crowns = gaming.crowns?.length ?? 0
  const unlocked = getResearchGridBonus(snapshot, KING_RAT_GRID) >= 1
  const shop = getRatShop(gaming)
  const base = gaming.ratShop?.[0] ?? 0
  const crownChance = Math.min(1, 0.05
    * (1 + 0.5 * (isSuperbitUnlocked(gaming, SUPERBITS.royalFlora) ? 1 : 0))
    * (1 + (shop[2].bonus + base + getArcadeBonus(snapshot, 'New Crown Chance')) / 100)
    * (1 + getSushiBonus(snapshot?.sushi, CROWN_SUSHI) / 100)
    * (1 + getJellyBonus(snapshot?.jellyOperator, CROWN_JELLY) / 100))
  const tokensPerHour = unlocked
    ? (1 + 0.5 * (isSuperbitUnlocked(gaming, SUPERBITS.aKingsRansom) ? 1 : 0))
      * (1 + (getPaletteBonus(snapshot, TOKEN_PALETTE) + getResearchGridBonus(snapshot, KING_RAT_GRID)) / 100)
      * (1 + crowns / 100)
      * (1 + shop[0].bonus / 100)
    : 0
  return {
    crowns,
    unlocked,
    bitMulti: getRatBitMulti(crowns),
    crownChance,
    // Royalty Boxes per new crown on average, as the King Rat screen shows it (1.111x per crown owned)
    boxesPerCrown: (1 / crownChance) * Math.pow(1.111, crowns),
    tokensPerHour,
    tokens: gaming.ratTokens ?? 0,
    shop: shop.map(upgrade => ({
      ...upgrade,
      // King Rat's tokens come in at a steady rate, so each upgrade can say when it's affordable
      hoursToAfford: tokensPerHour > 0 ? Math.max(0, upgrade.cost - (gaming.ratTokens ?? 0)) / tokensPerHour : null,
    })),
  }
}

// ── Snail ─────────────────────────────────────────────────────────────────────
const MEGA_NUT_PALETTE = 31 // Red Orange: +% chance for a 50x Mega Nut from the squirrel
const SNAIL_SCHEMATIC = 53 // +4% snail success per power of 10 of Well sediment 13
const SNAIL_SEDIMENT = 13

export function getSnail(snapshot) {
  const gaming = snapshot?.gaming ?? {}
  const level = gaming.snailLevel ?? 0
  const encouragement = gaming.snailEncouragement ?? 0
  const built = Number(snapshot?.caverns?.schematics?.[SNAIL_SCHEMATIC]) === 1
  const holeBonus = built ? 4 * Math.floor(log10(snapshot?.caverns?.holeResources?.[SNAIL_SEDIMENT] ?? 0)) : 0
  return {
    level,
    maxLevel: getSnailMaxLevel(gaming),
    encouragement,
    holeBonus,
    current: getSnailOdds(level, encouragement, holeBonus),
    for90: getEncouragementFor(level, 0.9, holeBonus),
    mailDoubleChance: getImportBonus(gaming, IMPORTS.snail),
  }
}

// ── Imports ───────────────────────────────────────────────────────────────────
// Each import with its level, bonus text, next cost and the live extras its card shows. now = Date.now().
export function getImports(snapshot, now = Date.now()) {
  const gaming = snapshot?.gaming ?? {}
  const elapsed = secondsSinceSave(snapshot, now)
  return gamingImportMap.map(item => {
    const level = getImportLevel(gaming, item.index)
    const bonus = getImportBonus(gaming, item.index)
    const base = {
      ...item,
      level,
      owned: level > 0,
      bonus,
      majorLines: splitGamingLines(item.majorBonus),
      minorText: item.minorBonus.replace('{', formatGamingNumber(bonus)),
      cost: getImportCost(gaming, item.index),
      image: item.index === IMPORTS.sprinkler && getSprinklerSaveChance(snapshot) > 0 ? 'GamingItem0b' : item.image,
      facts: [],
    }
    const fact = (label, value, tip) => base.facts.push({ label, value, tip })
    if (item.index === IMPORTS.sprinkler) {
      fact('Water drops', formatGamingNumber(getSprinklerDrops(gaming)),
        'Drops in the sprinkler at the time of the save. Each one waters a plant.')
      fact('Golden Sprinkler save chance', `${formatGamingNumber(100 * getSprinklerSaveChance(snapshot))}%`,
        'Chance a sprinkler use keeps its charge (gem shop Golden Sprinkler)')
    }
    if (item.index === IMPORTS.shovel && level > 0) {
      const seconds = (gaming.shovelSeconds ?? 0) + elapsed
      const detector = getEquinoxUpgradeBonus(snapshot?.equinox, EQUINOX_UPGRADES.metalDetector)
      const rolls = getNuggetRolls(gaming, detector)
      fact('Since last dig', { seconds })
      fact('Nuggets ready', formatGamingNumber(getGoldNuggets(seconds)))
      fact('Next nugget in', { countdown: getSecondsToNextNugget(seconds) })
      fact('Nugget rolls', `${formatGamingNumber(rolls.min)} to ${formatGamingNumber(rolls.max)}`,
        'A dig rolls a nugget size in this range. Only your biggest nugget ever counts for bits.')
      fact('Best nugget', `${formatGamingNumber(gaming.bestNugget ?? 0)}x bits`)
      fact('Nuggets since last upgrade', formatGamingNumber(gaming.nuggetsSinceUpgrade ?? 0),
        `Nuggets dug since your best nugget last went up. With Metal Detector (equinox), each one makes digs ${formatGamingNumber(detector)}% bigger until the next upgrade.`)
    }
    if (item.index === IMPORTS.squirrel && level > 0) {
      const seconds = (gaming.squirrel?.[1] ?? 0) + elapsed
      fact('Since last visit', { seconds })
      fact('Acorns ready', formatGamingNumber(getAcorns(seconds, gaming.squirrel?.[0] ?? 0)))
      fact('Mega Nut chance', `${formatGamingNumber(getPaletteBonus(snapshot, MEGA_NUT_PALETTE))}%`,
        `From the ${paletteMap[MEGA_NUT_PALETTE].name} palette colour: chance an acorn find is a Mega Nut worth 50x.`)
      base.shop = {
        currency: 'acorns',
        rows: getAcornShop(gaming)
          .filter(row => row.index < 2 || isSuperbitUnlocked(gaming, 37))
          .map(row => ({ name: row.text, level: row.level, cost: row.cost })),
      }
    }
    if (item.index === IMPORTS.shell && level > 0) {
      const shell = getShellProgress(gaming)
      fact('Shell rank', formatGamingNumber(shell.rank))
      fact('Plants evolved', formatGamingNumber(shell.evolved))
      if (shell.next !== null) fact(`Evolutions to rank ${shell.rank + 1}`, formatGamingNumber(shell.needed))
      base.shell = shell
    }
    if (item.index === IMPORTS.bogLog && level > 0) {
      const timer = (gaming.bogLogTimer ?? 0) + elapsed
      fact('Log', timer >= BOG_LOG_READY_SECONDS ? 'Ready' : { countdown: BOG_LOG_READY_SECONDS - timer })
      if (isSuperbitUnlocked(gaming, SUPERBITS.proLogFlipper)) {
        fact('Best round', formatGamingNumber(gaming.logGameBestRound ?? 0))
        fact('Bit multi', `${formatGamingNumber(getLogGameMulti(gaming.logGameBestRound))}x`)
      }
    }
    if (item.index === IMPORTS.poing && level > 0) {
      fact('Highscore', formatGamingNumber(gaming.poingHighscore ?? 0))
      fact('Bit multi', `${formatGamingNumber(Math.min(25, getPoingMulti(gaming.poingHighscore)))}x`, 'Counts up to 25x')
    }
    if (item.index === IMPORTS.snail && level > 0) {
      const snail = getSnail(snapshot)
      const odds = snail.current
      fact('Snail LV', `${snail.level} / ${snail.maxLevel}`)
      fact('Encouragement', formatGamingNumber(snail.encouragement))
      fact('Level up chance', formatSnailChance(odds.successShown),
        odds.successShown < 0 ? 'Negative in game too: the snail can\'t pass this LV for now.' : undefined)
      fact('Reset to LV 0', formatSnailChance(odds.reset), 'Chance an attempt fails and also resets the snail')
      fact('Nothing happens', formatSnailChance(odds.stay))
      base.snail = snail
    }
    if (item.index === IMPORTS.kingRat && level > 0) {
      const rat = getKingRat(snapshot)
      fact('Crowns', `${rat.crowns} / 100`)
      fact('Bit multi', `${formatGamingNumber(rat.bitMulti)}x`)
      fact('New crown', `1 in ${formatGamingNumber(rat.boxesPerCrown)} boxes`,
        'Royalty Boxes per new crown on average, as the King Rat screen shows it. Rises with every crown you own.')
      if (rat.unlocked) fact('King Tokens', `${formatGamingNumber(rat.tokensPerHour)} / hr`)
      base.shop = rat.unlocked
        ? {
          currency: 'tokens',
          rows: rat.shop.map(row => ({
            name: row.text.replace('{', formatGamingNumber(row.bonus)),
            label: row.name,
            level: row.level,
            cost: row.cost,
            hoursToAfford: row.hoursToAfford,
          })),
        }
        : null
    }
    return base
  })
}

// Snail odds as the game prints them: negative stays negative
export function formatSnailChance(value) {
  return `${formatGamingNumber(Math.round(value * 10000) / 100)}%`
}

// ── Fertilizer ────────────────────────────────────────────────────────────────
const SPROUT_SPEED_PALETTES = [8, 11]

// Seconds per growth cycle (game: SproutGrowthTime / SproutGrowthCHANCE)
export function getSproutGrowSeconds(snapshot) {
  const gaming = snapshot?.gaming ?? {}
  // Purrmep's link bonus from each character linked to Purrmep (Toolbox getAccountMinorDivinityBonus: only
  // Harriep and Goharut go to everyone, so King Doot doesn't spread this one)
  const purrmep = (snapshot?.characters ?? []).reduce((sum, _, i) => (
    snapshot?.divinity?.linkedGods?.[i] === GODS.Purrmep ? sum + getMinorDivinityBonus(snapshot, i, GODS.Purrmep) : sum
  ), 0)
  const kitsune = gaming.kitsune ?? [0, 0]
  const growTime = 5e3 * (1 + 99 * (gaming.bitToggle ? 1 : 0))
    / ((1 + (2 * (gaming.fertilizerLevels?.[1] ?? 0)) / 100)
      * (1 + getPaletteBonus(snapshot, SPROUT_SPEED_PALETTES[0]) / 100)
      * (1 + getPaletteBonus(snapshot, SPROUT_SPEED_PALETTES[1]) / 100)
      * (1 + (getAcornShop(gaming)[1].bonus + purrmep) / 100)
      * (1 + (3 + Math.round(kitsune[0]) / 100) * kitsune[1]))
  const depot = getCropDepotBonus(snapshot, CROP_DEPOT_BONUSES.gamingEvo).value
  const chance = Math.min(1, getSproutGrowChance(gaming) * Math.max(1, depot))
  return growTime / chance
}

function formatGrowTime(seconds) {
  if (seconds > 3600) return `${formatGamingNumber(seconds / 3600)} hr`
  if (seconds > 60) return `${formatGamingNumber(seconds / 60)} min`
  return `${formatGamingNumber(seconds)} sec`
}

export function getFertilizer(snapshot) {
  const gaming = snapshot?.gaming ?? {}
  const values = [
    { bits: getSproutValue(gaming) },
    { text: formatGrowTime(getSproutGrowSeconds(snapshot)) },
    { text: String(getSproutCapacity(snapshot)) },
  ]
  return [0, 1, 2].map(index => ({
    index,
    level: gaming.fertilizerLevels?.[index] ?? 0,
    cost: getFertilizerCost(gaming, index),
    ...values[index],
  }))
}

// ── Superbits ─────────────────────────────────────────────────────────────────
// Superbit counts and totals (Toolbox calcSuperbitBonus): } = count, { = total
function getSuperbitValues(snapshot, index) {
  const gaming = snapshot?.gaming ?? {}
  const waves = getTotalTotemWaves(snapshot)
  const tens = Math.floor(waves / 10)
  const wavesOver300 = Math.max(0, Math.floor((waves - 300) / 10))
  const discoveries = snapshot?.spelunking?.discoveries?.length ?? 0
  const character = getActiveCharacter(snapshot)
  const wavesInfo = total => `Total bonus: ${formatGamingNumber(total)}% (${waves.toLocaleString('en-US')} waves)`
  switch (index) {
    case 0: {
      const count = (snapshot?.achievements ?? []).filter(Boolean).length
      return { count, total: Math.pow(1.03, count) }
    }
    case 3: case 16: return { info: wavesInfo(tens) }
    case 7: return { info: wavesInfo(tens) }
    case 11: return { info: wavesInfo(1.12 * tens) }
    case 13: return { info: wavesInfo(13 * tens) }
    case 20: return { info: wavesInfo(50 * tens) }
    case 27: return { info: wavesInfo(2.5 * wavesOver300) }
    case 44: return { info: wavesInfo(0.3 * wavesOver300) }
    case 12: return { total: getSkillLevel(character, 'gaming') }
    case 24: return { total: Math.pow(1.01, discoveries), info: `${discoveries} discoveries` }
    case 26: return { total: Math.pow(1.02, discoveries), info: `${discoveries} discoveries` }
    case 32: return { total: Math.pow(1.05, discoveries), info: `${discoveries} discoveries` }
    case 28: return { total: Math.round(20 * Math.max(0, (gaming.snailLevel ?? 0) - 25)), info: `Snail LV ${gaming.snailLevel ?? 0}` }
    case 38: return { total: getPaletteTotalLevels(gaming) }
    case 45: {
      const level = getSkillLevel(character, 'gaming')
      return { total: Math.round(Math.max(0, 3 * (level - 200))), info: `Gaming LV ${level} (played character)` }
    }
    case 47: {
      const level = Number(character?.level) || 0
      return { total: Math.floor(Math.max(0, 0.01 * (level - 500))), info: `Class LV ${level} (played character)` }
    }
    case 55: {
      const level = getSkillLevel(character, 'farming')
      return { total: 1 + 0.02 * Math.max(0, level - 300), info: `Farming LV ${level} (played character)` }
    }
    default: return {}
  }
}

export function getSuperbits(snapshot) {
  const gaming = snapshot?.gaming ?? {}
  return superbitMap.map(superbit => {
    const values = getSuperbitValues(snapshot, superbit.index)
    const text = superbit.description
      .replace('}', formatGamingNumber(values.count ?? 0))
      .replace('{', formatGamingNumber(values.total ?? 0))
    return {
      ...superbit,
      group: SUPERBIT_GROUPS.find(group => superbit.index >= group.from && superbit.index <= group.to)?.id,
      unlocked: isSuperbitUnlocked(gaming, superbit.index),
      cost: getSuperbitCost(superbit.index),
      // The game splits "effect.  Total bonus: ..." with a wide gap; one line each
      lines: text.split(/ {2,}/).map(line => line.trim()).filter(Boolean),
      info: values.info,
    }
  })
}

// ── Mutations ─────────────────────────────────────────────────────────────────
const MUTATION_BALLOT = 21
const MUTATION_DNA_STEPS = [10, 25, 50, 100, 200, 400, 1000]

export function getMutations(snapshot) {
  const gaming = snapshot?.gaming ?? {}
  const unlocked = gaming.mutationsUnlocked ?? 0
  const voteMulti = 1 + getBallotBonus(snapshot, MUTATION_BALLOT) / 100
  const chanceAt = dna => getNewMutationChanceExact(unlocked, dna, voteMulti)
  return {
    dna: gaming.dna ?? 0,
    unlocked,
    evolutionLevel: gaming.evolutionLevel ?? 0,
    cost: getMutationCost(gaming),
    newChance: getNewMutationChance(unlocked, gaming.dna ?? 0, voteMulti),
    voteActive: voteMulti > 1,
    // The chance flattens with DNA (half its max at 100 DNA), so DNA spent in small claims goes further:
    // per-100-DNA value at each amount, and how many more finds two claims at 100 give vs one at 200
    dnaTable: MUTATION_DNA_STEPS.map(dna => ({ dna, chance: chanceAt(dna), per100: (chanceAt(dna) / dna) * 100 })),
    splitGain: chanceAt(200) > 0 ? (2 * chanceAt(100)) / chanceAt(200) : 1,
    list: mutationMap.map((mutation, index) => ({
      ...mutation,
      index,
      unlocked: index < unlocked,
      lines: splitGamingLines(mutation.description),
    })),
  }
}

// ── Bits spent outside Gaming ─────────────────────────────────────────────────
// Divinity blessings paid in bits (by god slot), and the Bell's bits improvement method
const BIT_BLESSING_SLOTS = [GODS.Snehebatu, GODS.Nobisect, GODS.Goharut, GODS.Kattlekruk]
const BLESSING_VAULT = 76
const BLESSING_MINEHEAD = 9
const BLESSING_JELLIES = [49, 63]
const BLESSING_JADE = 33 // True Godly Blessings: +5% per god rank (not Nobisect)
const BELL_BITS_METHOD = 2

export function getBlessingMaxLevel(snapshot) {
  return Math.round(100
    + getCoralKidUpgradeBonus(snapshot?.coralReef, CORAL_KID_UPGRADES.blessingMaxLevel)
    + getMineheadBonus(snapshot?.minehead, BLESSING_MINEHEAD)
    + getUpgradeVaultBonus(snapshot?.upgradeVault, BLESSING_VAULT)
    + BLESSING_JELLIES.reduce((sum, index) => sum + getJellyBonus(snapshot?.jellyOperator, index), 0))
}

export function getBitSpending(snapshot) {
  const bits = snapshot?.gaming?.bits ?? 0
  const divinity = snapshot?.divinity ?? {}
  const maxLevel = getBlessingMaxLevel(snapshot)
  const godRank = Math.max(0, (divinity.unlockedGods ?? 0) - 10)
  const emporium = isJadeUnlocked(snapshot?.sneaking, BLESSING_JADE) ? 1 + 0.05 * godRank : 1
  const blessings = BIT_BLESSING_SLOTS.map(slot => {
    const god = godMap[slot]
    const level = divinity.blessingLevels?.[slot] ?? 0
    const [base, growth] = god.blessingCost
    const maxed = level >= maxLevel
    const bonus = level * god.blessingMultiplier * (slot === GODS.Nobisect ? 1 : emporium)
    return {
      id: `blessing-${slot}`,
      name: `${god.name} blessing`,
      system: 'Divinity (W5)',
      image: `images/divinity/DivGod${slot}.png`,
      text: god.blessing.replace('{', formatGamingNumber(bonus)),
      level,
      maxLevel,
      locked: slot >= (divinity.unlockedGods ?? 0),
      maxed,
      cost: maxed ? null : base * Math.pow(growth, level),
      have: bits,
    }
  })
  const method = getBell(snapshot).methods[BELL_BITS_METHOD]
  const bell = method && {
    id: 'bell-bits',
    name: 'Bell improvement (bits)',
    system: 'The Hole: The Bell',
    image: 'images/hole/bell/bell0.png',
    text: method.text,
    level: method.level,
    locked: !method.owned,
    maxed: false,
    cost: method.cost,
    have: bits,
  }
  return [...blessings, bell].filter(Boolean)
}

// ── Top tiles ─────────────────────────────────────────────────────────────────
export function getGamingSummary(snapshot, now = Date.now()) {
  const gaming = snapshot?.gaming ?? {}
  const squirrelSeconds = (gaming.squirrel?.[1] ?? 0) + secondsSinceSave(snapshot, now)
  return {
    bits: gaming.bits ?? 0,
    sproutCapacity: getSproutCapacity(snapshot),
    envelopes: gaming.envelopes ?? 0,
    ratTokens: gaming.ratTokens ?? 0,
    acorns: getImportLevel(gaming, IMPORTS.squirrel) > 0 ? getAcorns(squirrelSeconds, gaming.squirrel?.[0] ?? 0) : null,
    // Kitsune Rock (GamingSprout[29] = [import LV, on]): ON = plants grow (4 + LV / 100)x faster, 3x less bits
    kitsune: getImportLevel(gaming, IMPORTS.kitsune) > 0
      ? { on: Boolean(gaming.kitsune?.[1]), speed: 4 + Math.round(gaming.kitsune?.[0] ?? 0) / 100 }
      : null,
  }
}
