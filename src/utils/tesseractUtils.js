import { tesseractMap } from '../data'

// Tesseract (Arcane Cultist) upgrades, from IdleonToolbox calcTesseractBonus.
// Most upgrades are boosted by upgrade 39; these aren't.
const TESSERACT_MULTI = 39
const NOT_BOOSTED = new Set([3, 7, 8, 10, 13, 16, 20, 25, 26, 28, 33, 35, 39, 40, 43, 45, 48, 57, 58])

export function getTesseractBonus(tesseract, index) {
  const base = (tesseract?.levels?.[index] ?? 0) * (tesseractMap[index]?.x5 ?? 0)
  if (NOT_BOOSTED.has(index)) return base
  return base * (1 + getTesseractBonus(tesseract, TESSERACT_MULTI) / 100)
}
