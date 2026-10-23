// Rift bonuses (W4), from IdleonToolbox parsers/world-4/rift.ts.
// Each unlocks once the current rift level (snapshot.rift.level) reaches its index.
export const RIFT_BONUSES = {
  trapBoxVacuum: 5,
  infiniteStars: 10,
  skillMastery: 15,
  eclipseSkulls: 20,
  stampMastery: 25,
  eldritchArtifact: 30,
  vialMastery: 35,
  constructMastery: 40,
  rubyCards: 45,
  killroyPrime: 50,
  sneakMastery: 55,
  cookingMastery: 60,
}

export function isRiftBonusUnlocked(rift, bonus) {
  return (rift?.level ?? 0) >= RIFT_BONUSES[bonus]
}
