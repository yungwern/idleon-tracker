import fs from 'fs'

const STEAM_SAVE_PATH = 'C:\\Program Files (x86)\\Steam\\userdata\\412692137\\1147690\\remote\\NGUCloud'

try {
  const raw = fs.readFileSync(STEAM_SAVE_PATH)
  console.log('File size:', raw.length, 'bytes')
  
  const str = raw.toString('latin1')
  
  // Search for common IdleOn save keys
  const searches = ['playerNames', 'CharacterClass', 'Lv0_', 'money', 'chars']
  
  for (const term of searches) {
    const pos = str.indexOf(term)
    console.log(`Position of "${term}":`, pos)
    if (pos !== -1) {
      console.log('  Context:', str.slice(Math.max(0, pos - 20), pos + 50))
    }
  }

} catch (err) {
  console.error('❌ Error:', err.message)
}