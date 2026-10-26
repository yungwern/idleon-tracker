// The character the save was taken on. The game reads many account bonuses "as the logged-in
// character sees them" (its star signs, chips, skill levels). Only the played character's
// PTimeAway keeps moving, so the newest one is it (Toolbox getBestActiveCharacter).
export function getActiveCharacterIndex(snapshot) {
  const characters = snapshot?.characters ?? []
  let best = 0
  characters.forEach((character, i) => {
    if ((character.awayTime ?? 0) > (characters[best]?.awayTime ?? 0)) best = i
  })
  return best
}

export function getActiveCharacter(snapshot) {
  return snapshot?.characters?.[getActiveCharacterIndex(snapshot)]
}
