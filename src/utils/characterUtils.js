import { CLASS_TAB_ROLES, CLASS_TALENT_TABS } from '../data/classes.js'

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

// Roles for a class's card pills, from every tab in its class line. Account-wide roles (allChars)
// come first, then this-character-only ones; within each group, own tab first, then earlier tabs.
// own = from the class's own tab; source = that tab (shown in the tooltip).
export function getClassRoles(className) {
  const tabs = CLASS_TALENT_TABS[className] ?? [className]
  const roles = [...tabs].reverse().flatMap(tab =>
    (CLASS_TAB_ROLES[tab] ?? []).map(role => ({
      ...role,
      source: tab,
      own: tab === className,
    }))
  )
  return [
    ...roles.filter(role => role.allChars),
    ...roles.filter(role => !role.allChars),
  ]
}
