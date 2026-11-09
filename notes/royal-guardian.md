# Royal Guardian outposts (MasterClasses)

**outpostOptimizer.js**:
outpostOptimizer.js — Royal Guardian Outposts tab (formulas = Toolbox royalGuardian.ts). Compares
fractional Trade ranks (whole ranks tie and bias results); only Trader/Surveyor/empty slots are
swappable (Workers/Guards hold collection and node range); Commanders aim at the next free
Trader (Command 2, 6, 10...). PTS plan (planPts) is closed form: Trade EXP ∝ Traders × (10 + Edu),
so a Barracks level beats 12 Education once 10 + Education > 12 × Traders (ties → Education).
World header chips (RoyalOutposts.jsx): "PTS → Education" = one total, no outpost list; Barracks
chip names buy/save outposts (max 6, or "every outpost except" when most are saving); Commander /
Priest chips = RGcommander/RGpriest.png → trimmed mob sprite (images/mobs/trimmed, rebuilt by
IdleOn Resources/make_mob_thumbs.py; map → mob = OUTPOST_MOBS in royalOutposts.js) + outpost name.
Priests = job 7 deployments (getPriestAdvice): all on one target; World 1 Froggy Fields /
Spore Meadows first (game quirk: purified map 1/2 triples every Intel/Command bar). Glorify and
Purify are long goals: plain card tags + summary counts, never notices. Purifying is top
priority (Eli): Support Camps not linked to the Priests' target get a chip (campsToLink).
State-Wide Propoganda (armory 77, type = RoyalG[3][3], 0 Trade..4 Purity) is shown under
Compounding Outposting but left out of all math: Toolbox found the game never applies it.
