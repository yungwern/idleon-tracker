# Royal Guardian outposts (MasterClasses)

**outpostOptimizer.js**:
outpostOptimizer.js — Royal Guardian Outposts tab (formulas = Toolbox royalGuardian.ts). Compares
fractional Trade ranks (whole ranks tie and bias results); only Trader/Surveyor/empty slots are
swappable (Workers/Guards hold collection and node range); Commanders aim at the next free
Trader (Command 2, 6, 10...). PTS plan (planPts) is closed form: Trade EXP ∝ Traders × (10 + Edu),
so a Barracks level beats 12 Education once 10 + Education > 12 × Traders (ties → Education).
Traders = flex slots + free Traders from Command rank only (Eli): idle Militia and Support Camps are left
out so the switch point is a set plan, +12 per Barracks level (e.g. 3 free Traders: B2 63, B3 75, B4 87).
World header chips (RoyalOutposts.jsx): "PTS → Education" = one total, no outpost list; Barracks
chip names buy/save outposts (an outpost topping Education up to its switch point and then saving is in
both chips, matching its card); their tooltips are OutpostTable grids (mob sprite, name, values). Education: +levels and LV after /
Barracks switch point (educationUntil), gold when it reaches it. Saving: PTS held / 12, Barracks level in the title
(or a column when they differ). Fishing maps (Salty Shores, Faraway Piers) have no mob, so no sprite (max 6, or "every outpost except" when most are saving); Commander /
Priest chips = RGcommander/RGpriest.png → trimmed mob sprite (images/mobs/trimmed, rebuilt by
IdleOn Resources/make_mob_thumbs.py; map → mob = OUTPOST_MOBS in royalOutposts.js) + outpost name.
Priests = job 7 deployments (getPriestAdvice): all on one target; World 1 Froggy Fields /
Spore Meadows first (game quirk: purified map 1/2 triples every Intel/Command bar). Glorify and
Purify are long goals: plain card tags + summary counts, never notices.
Purity is on/off: every game check is min(Purity Rank, 1), so ranks past 1 do nothing today. Priests can't
change job or world (Eli). Once every BUILT outpost in a world is purified, Priests sit on its farm map
(FARM_MAPS in royalOutposts.js, Eli: W1 Froggy Fields/Valley Of The Beans, W2 Shifty Sandbox/The Ring,
W3 Wam Wonderland, W4 Flamboyant Bayou) stacking Purity as a head start for future purified-map bonuses.
Two farm maps: lower Purity rank first, stay put on a tie. A newly unlocked outpost pulls them back to
Rank 1 first; no farm map built yet = no advice. Cards: "purifying" / "stacking Purity (farm map)" /
"(map purified)".
Purified bonuses (Perfect Purification Collection multi, Global Decree - PM, +10 Regal Intervention mobs
on a purified map) live in the world header's red-star tooltip (summary.purifiedBonuses), not on cards.
Support Camps (getCampAdvice → optimizer.campAdvice): camps follow the Priests' target whenever there is
one, purifying or farm map (Eli: ~2 Trade ranks / 30 days from spreading camps is small next to armory
PTS). Otherwise (no Priests, or no farm map built) a camp moves to the Commanders' target only if the 30-day sim gains >= SWAP_MIN_GAIN Trade
ranks after the old link's loss (Commanders assumed on target, Collection Rate not counted). Each camp
= one link (Eli's camps only use slot 8); camps out of reach (OutpostRange + 8, OUTPOST_POSITIONS from
Toolbox mapDetails) are skipped. Sim finding: a 2nd camp on one outpost is worth less Trade than a 1st
camp elsewhere (ranks grow with log of EXP), so stacking on the Commander target rarely wins.
State-Wide Propoganda (armory 77, type = RoyalG[3][3], 0 Trade..4 Purity) is shown under
Compounding Outposting but left out of all math: Toolbox found the game never applies it.
