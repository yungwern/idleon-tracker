// Vote Ballot (W2). snapshot.voteBallot holds this week's winning picks, from serverVars.
// The bonus amounts also need the ballot multiplier, which isn't ported yet, so callers
// only get whether a bonus is the winning one.
export function isBallotBonusSelected(voteBallot, index) {
  return voteBallot?.selectedBonus === index
}

export function isMeritocracyBonusSelected(voteBallot, index) {
  return voteBallot?.selectedMeritocracy === index
}
