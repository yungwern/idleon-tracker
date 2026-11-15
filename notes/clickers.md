# Clickers (Orion, Poppy, Bubba)

Bubba page tabs: Run Guide (static, bubbaMap.js; Megaflesh gifts card = BUBBA_MEGAFLESH_GIFTS, Eli: only Beeg Slice + Slabcakes are worth taking) / Megaflesh & Bonuses = MegafleshTab.jsx.

**Clickers** (sidebar group: Orion, Poppy, Bubba): Orion/Poppy pages = hero portrait + ClickerStats, Mega grid (hover text, last Mega
stacks: ×copies), 'rest-of-the-game' bonuses, upgrade cards (cost green when affordable). Shared panels in components/Clicker
(--clicker-color via .clicker--orion/poppy/bubba). Data = orionMap.js / poppyMap.js (IdleOn Resources/gen_clickers.py <Toolbox clone>:
owlData, poppyBonuses, poppyTarBonuses + Mega texts/bonus lines copied from Toolbox owl.ts / kangaroo.ts), BUBBA_MEGAFLESH / BUBBA_BONUSES
in bubbaMap.js. Save: snapshot.orion (OptLacc 253-264, levels 254+i, 262 = Megafeathers), snapshot.poppy (OptLacc 267-305, levels 268+i,
279 = Megafish, Tar Pit 297+i, fish/tar banks 288/305 added like the game does when the menu opens), snapshot.bubba (Bubba[1] levels,
[1][8] = Megaflesh, [1][3] = Bubba Boon). Math = orionUtils / poppyUtils / bubbaUtils + clickerUtils (Furry Friends legend 26 ×, Santas
Little Helper companion 51 ×). Rates, costs, bonuses and Mega multis all = Toolbox on Eli's save (Orion 643.5x, Poppy 239.25x, Bubba 10.2x).
Sprites 4x nearest-neighbor in images/orion, images/poppy, images/bubba (Bubba_<r> bonus icons); Mega art (Feaz/RooMG/BubbaMF) native
size. Poppy.png = Poppy cropped from Toolbox RooA (her fishing sprite). Not ported: Bubba upgrades/meat rate.

**Poppy page tabs**: Overview (hero, Megafish, bonuses, Shiny multi = PoppyShinyMulti.jsx, upgrades, Tar Pit) and Reset
Planner (PoppyResetPlanner.jsx; pool = spent points OptLacc 291-295 + unspent OptLacc 290 = snapshot.poppy.unspentResetPoints: Best split + Shiny stack, both as PoppySplitCards). Sprites: RooReset0-4 (reset spirals,
blue/orange/green/red/black) and RooFishS0-5 (shiny fish, same order as OptLacc 281-286), 4x nearest-neighbor from Toolbox.

**Reset Planner math** (poppyUtils getPoppyResetPlan). Reset bonus i = (1 + perPoint × pts) × (1 + 0.04 × red)
(blue 0.4, orange 0.3, green 0.15, red 0.04, black 0.2; matches the game on Eli's save). Eli: points refund for free
anytime, and every Fisheroo Reset / Greatest Catch wipes fish, tar fish, Tar Pit LVs and shiny counts, so the planner
splits the whole pool. One goal only (Eli): most fish = Megafish sooner. Greedy on Σ weight × ln(bonus), red's weight =
sum of the others. Weights = fish elasticity: blue/green 1, orange = Σ (b/100) / (1 + b·ln n/100) (ln n floored at 20),
black = Tar Pit → fish (Super Yummy, Bluefin Frenzy, Fishy Reductions, King Worm) × 1 / (1 - s), s = Super Tarbait's
tar → more tar loop (Eli asked for it). Not counted: Bonus Catching, Mongo Multipliers (shiny mechanics unknown), Tarrific. Lands close to the old community
guide (orange ~270, black ~250). Shiny stack = all-in orange/red split for early in a run (Eli's idea: build shiny
counts, then swap; a two-phase model gave ~+19% fish). Swap point is the player's call; the save keeps no past-run
peaks. Big purchase = all-in green/red split, only for buying Greatest Catch / Fisheroo Reset (Eli: swapping
points takes a while, so never for regular upgrades); costs per split + ETA at the best split's fish rate. Notices (utils/poppyNotices.js, Settings section 'Poppy': greatestCatch,
fisherooReset) fire when one is affordable with the big purchase split; sidebar badge + Reset Planner tab badge + Big purchase sub-tab badge + To do. Reset Planner has
sub-tabs Best split / Big purchase / Shiny stack (Eli); it opens on Big purchase while a notice is up, with a green
'affordable now: swap, buy, swap back' line. Shiny luck (rarer kinds) isn't modelled: Toolbox doesn't parse how shinies are caught.
