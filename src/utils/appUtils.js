export const toClassSlug = (className) => className.toLowerCase().replace(/\s+/g, '-')

export function classColor(cls) {
  const colors = {
    'Death Bringer':      '#f87171',
    'Divine Knight':      '#fbbf24',
    'Siege Breaker':      '#16a34a',
    'Wind Walker':        '#059669',
    'Elemental Sorcerer': '#7c3aed',
    'Arcane Cultist':     '#65a30d',
    'Voidwalker':         '#af9dce',
  }
  return colors[cls] ?? '#fff'
}

export function statueLevelColor(level) {
  if (level >= 500) return '#e879f9'
  if (level >= 400) return '#67e8f9'
  if (level >= 300) return '#f43f5e'
  if (level >= 200) return '#fbbf24'
  if (level >= 100) return '#94a3b8'
  return '#cd7f32'
}

export function shrineLevelColor(level) {
  if (level >= 30) return '#e879f9'
  if (level >= 25) return '#67e8f9'
  if (level >= 20) return '#f43f5e'
  if (level >= 15) return '#fbbf24'
  if (level >= 10) return '#94a3b8'
  return '#cd7f32'
}