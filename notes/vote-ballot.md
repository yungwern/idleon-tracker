# Vote Ballot (Meritocracy and Bonus Ballot)

**Vote Ballot** (utils/voteUtils.js, data in data/voteBallotMap.js): both votes are ported. Multi Meritocracy:
getMeritocracyBonus(snapshot, i) = meritocracyBonuses[i].value ( Toolbox ninjaExtraInfo[41]) × getMeritocracyMulti the week i wins (serverVars voteCat2[0]), else 0. Multi =
0 until a character clears map 250 (Spirit Village, KLA ≤ 0), else Poppy (companion 161) × (base 1, or 0.25 before the Demonflesh
OptLacc[472] + clam work 3 ×5 + Pufferblob 39 + legend 24 + arcade + event shop 23 ×20 + sushi 51 + jelly 33)/100; 4.52 on Eli's save
(= Toolbox). Used by vials (20), monument reward (7), slab (23), sigils (21, Pipe Gauge), stamina (17), Seraph Cosmos (22), statues (26).
Bonus Ballot: getBallotBonus(snapshot, i) = ballotBonuses[i].value (ninjaExtraInfo[38]) × getBallotMulti the week i wins
(voteCategories[0]). Multi = Poppy × (1 + Meritocracy 9) × (1 + (Crystal Cuttlefish 41 + Equinox Voter Rights (upgrade 11) + IdleOn
majik 3 Voter Integrity + summoning '+{% Ballot Bonus' + event shop 7 ×17 + 16 ×13 + Mashed Potato 19 + palette 32 + legend 22 + sushi
50)/100); 8.66 on Eli's save (= Toolbox). Used by printer (11), refinery speed (33), crop ballot 29 (added to every land rank plot term:
farmingUtils withCropBallotBonus(snapshot) = farming + cropBallotBonus, which the Land Ranks tab passes to the land rank functions).
New vote uses: call getBallotBonus / getMeritocracyBonus, never flag them missing.

## Weekly Votes page (Global, `components/WeeklyVotes/`)
Tabs for Bonus Ballot and Meritocracy (tab colours gold / cyan, same as Home's rows). For now each tab only shows
next week's three options (`NextVoteTab.jsx`): `voteBallot.bonusOptions / meritocracyOptions` from serverVars
(voteCategories / voteCat2 after [0], votePercent / votePercent2), each at the current multi, leader highlighted,
share bar, vote countdown and "as of" save time. This week's winner is on Home. Names/sprites: `voteTitles` /
`voteIcons` in voteBallotMap.js; `voteUtils formatVoteMulti`; clock: `hooks/useNow.js`. More to come (Eli).
