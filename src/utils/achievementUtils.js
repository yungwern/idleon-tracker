// snapshot.achievements[i] = true once achievement i is complete (AchieveReg[i] === -1)
export function isAchievementComplete(achievements, index) {
  return Boolean(achievements?.[index])
}
