import { useState, useEffect } from 'react'

const STORAGE_KEY = 'idleon_save_snapshot'

// ============================================================
// TALENT MAP
// Maps skillIndex (talent ID) → display name
// ============================================================
const rawTalentMap = {
  0: "HEALTH_BOOSTER",
  1: "MANA_BOOSTER",
  5: "SHARPENED_AXE",
  6: "GILDED_SWORD",
  8: "STAR_PLAYER",
  9: "BUCKLERED_UP",
  10: "FIST_OF_RAGE",
  11: "QUICKNESS_BOOTS",
  12: "BOOK_OF_THE_WISE",
  13: "LUCKY_CLOVER",
  15: "INDIANA_ATTACK",
  16: "BREAKIN'_THE_BANK",
  17: "SUPERNOVA_PLAYER",
  18: "TWO_PUNCH_MAN",
  19: "GIMME_GIMME",
  20: "LUCKY_HIT",
  21: "F'LUK'EY_FABRICS",
  22: "CHACHING!",
  23: "LUCKY_HORSESHOE",
  24: "CURSE_OF_MR_LOOTY_BOOTY",
  25: "ITS_YOUR_BIRTHDAY!",
  26: "CMON_OUT_CRYSTALS",
  27: "REROLL_PLS",
  28: "CARDS_GALORE",
  29: "RARES_EVERYWHERE!",
  30: "COIN_TOSS",
  31: "SKILLAGE_DAMAGE",
  32: "PRINTER_GO_BRRR",
  33: "TRIPLE_JAB",
  34: "ONE_STEP_AHEAD",
  35: "LUCKY_CHARMS",
  36: "CLEVER_CLOVER_OBOLS",
  37: "SKILLIEST_STATUE",
  38: "BLISS_N_CHIPS",
  39: "COLLOQUIAL_CONTAINERS",
  40: "MAESTRO_TRANSFUSION",
  41: "CRYSTAL_COUNTDOWN",
  42: "LEFT_HAND_OF_LEARNING",
  43: "RIGHT_HAND_OF_ACTION",
  44: "JMAN_WAS_BETTER",
  45: "VOID_TRIAL_RERUN",
  46: "VOID_RADIUS",
  47: "BOSSING_VAIN",
  48: "QUAD_JAB",
  49: "ENHANCEMENT_ECLIPSE",
  50: "POWER_ORB",
  51: "ETERNAL_STR",
  52: "ETERNAL_AGI",
  53: "ETERNAL_WIS",
  54: "ETERNAL_LUK",
  55: "EXP_CULTIVATION",
  56: "VOODOO_STATUFICATION",
  57: "SPECIES_EPOCH",
  58: "MASTER_OF_THE_SYSTEM",
  59: "BLOOD_MARROW",
  75: "HAPPY_DUDE",
  76: "KNUCKLEBUSTER",
  77: "FEATHER_FLIGHT",
  78: "EXTRA_BAGS",
  79: "SLEEPIN'_ON_THE_JOB",
  81: "STR_SUMMORE",
  85: "BRUTE_EFFICIENCY",
  86: "MEAT_SHANK",
  87: "CRITIKILL",
  88: "IDLE_BRAWLING",
  89: "IDLE_SKILLING",
  90: "POWER_STRIKE",
  91: "WHIRL",
  92: "HEALTH_OVERDRIVE",
  93: "DOUBLE_STRIKE",
  94: "FIRMLY_GRASP_IT",
  95: "STRENGTH_IN_NUMBERS",
  96: "STR_ESS_TESTED_GARB",
  97: "CARRY_A_BIG_STICK",
  98: "ABSOLUTE_UNIT",
  99: "HAUNGRY_FOR_GOLD",
  100: "BIG_PICK",
  101: "COPPER_COLLECTOR",
  102: "MOTHERLODE_MINER",
  103: "TOOL_PROFICIENCY",
  104: "TEMPESTUOUS_EMOTIONS",
  105: "BEAR_SWIPE",
  106: "AXE_HURL",
  107: "MOCKING_SHOUT",
  108: "NO_PAIN_NO_GAIN",
  109: "MONSTER_DECIMATOR",
  110: "APOCALYPSE_ZOW",
  111: "FISTFUL_OF_OBOL",
  112: "STRONGEST_STATUES",
  114: "BEEFY_BOTTLES",
  115: "WORMING_UNDERCOVER",
  116: "BOBBIN_BOBBERS",
  117: "ALL_FISH_DIET",
  118: "CATCHING_SOME_ZZZS",
  119: "BACK_TO_BASICS",
  120: "SHOCKWAVE_SLASH",
  121: "DAGGERANG",
  122: "BRICKY_SKIN",
  123: "MASTERY_UP",
  124: "BALANCED_SPIRIT",
  125: "PRECISION_POWER",
  127: "SHIELDIEST_STATUES",
  129: "BLOCKY_BOTTLES",
  130: "REFINERY_THROTTLE",
  131: "REDOX_RATES",
  132: "SHARPER_SAWS",
  133: "SUPER_SAMPLES",
  135: "FIRED_UP",
  136: "COMBUSTION",
  137: "SERRATED_SWIPE",
  138: "EMBER_BEAR",
  139: "FEROCITY_STRIKE",
  140: "TOUGH_STEAKS",
  141: "CHARRED_SKULLS",
  142: "SKILL_STRENGTHEN",
  143: "OVERBLOWN_TESTOSTERONE",
  144: "THE_FAMILY_GUY",
  145: "TASTE_TEST",
  146: "APOCALYPSE_CHOW",
  147: "WAITING_TO_COOL",
  148: "OVERFLOWING_LADLE",
  149: "SYMBOLS_OF_BEYOND_R",
  165: "KNIGHTLY_DISCIPLE",
  166: "MEGA_MONGORANG",
  167: "DIVINE_INTERVENTION",
  168: "ORB_OF_REMEMBRANCE",
  169: "IMBUED_SHOCKWAVES",
  170: "GAMER_STRENGTH",
  175: "UNDYING_PASSION",
  176: "1000_HOURS_PLAYED",
  177: "BITTY_LITTY",
  178: "KING_OF_THE_REMEMBERED",
  195: "WRAITH_FORM",
  196: "GRIMOIRE",
  197: "SENTINEL_AXES",
  198: "GRAVEYARD_SHIFT",
  199: "DETONATION",
  200: "MARAUDER_STYLE",
  201: "BULWARK_STYLE",
  202: "FAMINE_O_FISH",
  203: "BUILT_DIFFERENT",
  204: "RIBBON_WINNING",
  205: "MASS_IRRIGATION",
  206: "AGRICULTURAL_PRECIATION",
  207: "DANK_RANKS",
  208: "WRAITH_OVERLORD",
  209: "APOCALYPSE_WOW",
  263: "ELUSIVE_EFFICIENCY",
  266: "FEATHERWEIGHT",
  267: "I_SEE_YOU",
  268: "IDLE_SHOOTING",
  269: "BROKEN_TIME",
}

const formatTalentName = (raw) =>
  raw
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())

const talentMap = Object.fromEntries(
  Object.entries(rawTalentMap).map(([id, name]) => [
    Number(id),
    formatTalentName(name),
  ])
)

// ============================================================
// FIELD EXTRACTORS
// To add a new field in the future, add an entry here:
//   fieldName: (json, charIndex) => json['some_key']?.[charIndex]
// Then use `snapshot.characters[i].fieldName` in your components.
// ============================================================
const extractors = {
  level: (json, i) => json[`Lv0_${i}`]?.[0] ?? null,
  equipOrder: (json, i) => json[`EquipOrder_${i}`]?.[0] ?? {},
  superTalentPresets: (json, i) => {
    const spelunk = typeof json.Spelunk === 'string'
      ? JSON.parse(json.Spelunk)
      : json.Spelunk

    const presetConfig = [
      { label: 'Fighting', presetIndex: 0, slKey: `SL_${i}` },
      { label: 'Skilling', presetIndex: 1, slKey: `SM_${i}` },
    ]

    return presetConfig.map(({ label, presetIndex, slKey }) => {
      const talentLevels = typeof json[slKey] === 'string'
        ? JSON.parse(json[slKey])
        : (json[slKey] ?? {})

      const spelunkIndex = 20 + i + 12 * presetIndex
      const superArray = spelunk?.[spelunkIndex] ?? []

      const superedTalents = superArray
        .filter((id) => id !== -1)
        .map((id) => ({
          id,
          name: talentMap[id] ?? `Unknown Talent (${id})`,
          level: talentLevels[String(id)] ?? 0,
        }))

      return { label, superedTalents }
    })
  },
}

function extractSnapshot(json) {
  const characterCount = 10
  const characters = Array.from({ length: characterCount }, (_, i) => {
    const extracted = {}
    for (const [field, fn] of Object.entries(extractors)) {
      extracted[field] = fn(json, i)
    }
    return extracted
  })

  return {
    characters,
    importedAt: new Date().toISOString(),
  }
}

export function useSaveImport() {
  const [snapshot, setSnapshot] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setSnapshot(JSON.parse(raw))
    } catch {
      console.warn('Failed to load save snapshot from localStorage.')
    }
  }, [])

  function importFromText(text) {
    const json = JSON.parse(text.trim())
    const newSnapshot = extractSnapshot(json)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSnapshot))
    setSnapshot(newSnapshot)
  }

  function clearSnapshot() {
    localStorage.removeItem(STORAGE_KEY)
    setSnapshot(null)
  }

  function formatImportedAt(iso) {
    if (!iso) return null
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return {
    snapshot,
    importFromText,
    clearSnapshot,
    importedAt: snapshot ? formatImportedAt(snapshot.importedAt) : null,
  }
}