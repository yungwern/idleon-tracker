import { hasSaveLetter } from './saveCodeUtils'

// Gaming (W5) superbits by index, e.g. 62 = Bettah Stickahs
export function isSuperbitUnlocked(gaming, index) {
  return hasSaveLetter(gaming?.superbits, index)
}
