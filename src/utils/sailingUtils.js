import { artifactMap } from '../data'

// Sailing artifacts (W5), from IdleonToolbox parsers/world-5/sailing.ts getArtifact.
// Only artifacts whose bonus is just baseBonus (× the form number for "main bonus is N-tupled"
// forms); ones that scale with other stats (Maneki Kat, Opera Mask...) aren't ported.
export function getArtifactBonus(sailing, name) {
  const index = artifactMap.findIndex(artifact => artifact.name === name)
  const form = sailing?.artifactForms?.[index] ?? 0
  if (index === -1 || form <= 0) return 0
  const artifact = artifactMap[index]
  return artifact.baseBonus * (artifact.mainBonusForms.includes(form) ? form : 1)
}
