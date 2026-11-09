# Printer and Refinery (World 3)

**Printer** (World 3): `snapshot.printer.characters[i]` = { library (Print, 5 slots), extraLibrary (PrinterXtra, 5 slots),
printing (2) }, each { item, value }. Unlocks = gem shop (`printerUtils getPrinterUnlocks`, `printerBuffMap` + BuffsPanel):
GemItemsPurchased[111] Crystal 3D Printer = 2nd chamber, [112] More Sample Spaces (max 6) = library 4 + purchases (Eli).
Print Multis = the 5 in-game MULTI lines (`printerMultiMap`, `printerUtils getPrinterMultis`, inputs in snapshot.printer from OptLacc
138/323/354/364/479 + Compass[0][43]); all 5 match the game on Eli's save (1.32/2/2/5/3x). Yet Another Printer Multi
was shown but never applied until the Nov 1 2026 game update fixed it (Toolbox may still leave it out). `printerHiddenMultiMap` / getPrinterHiddenMultis = multis not on the
in-game screen (Gold Relic OptLacc[125] days by artifact form, Skill Mastery + Lolly Flower added, Vote 11 = Bonus Ballot bonus 11). Total (getPrinterTotalMulti) = product of all 8 (1472x on Eli's save; Toolbox's 490.68x × the 3x legend talent). value = the per-hour number the in-game
printer shows (matched Eli's screenshot). Row art `public/images/printer/row.png` = one 458x76 row of Toolbox PrintBG (saved at 4x),
so positions in Printer.css are % of that row; slot.png = PrintSlot. Sampleable item sprites = `images/items/<rawName>.png`, names in
itemMap.js PRINTER SAMPLES (Toolbox items.json Type ORE/LOG/FISH/BUG/MONSTER_DROP).
Printer page = InfoPanel, then tabs Printers / Salt Materials (not "Refinery": that's its own section). Salt Materials
(SaltMaterialsTab.jsx) = print plan + printable salt inputs grouped by salt (refineryUtils getRefineryPrintList). utils/printPlanner.js
getPrintPlan: fewest characters (ceil(chambers needed / 2)) keeping every input whose storage (unprinted) runs out within the chosen
window printed. Tries every character set of that size; each set is filled by an exact assignment (Hungarian) maximizing
getPlacementScore × 10 + continuity (printing now 2, in library 1). Placement: 5 = specialist line (getClassFit 2: class line passes
the skill's tab in SKILL_SPECIALISTS: Warrior mining, Barbarian fishing, Mage choppin, Bowman catching), 2 = non-warrior main stat
or monster drop, 1 = other non-warrior, 0 = warrior off its specialty (Eli: keep warriors on Copper, e.g. Caulifish overflow goes to a
non-warrior). Eli: wrong-class prints get moved even if they cover the need (the tab shows the optimal setup). Then (local swaps after
the Hungarian, never costing class score) a character prints only monster drops or only skilling items (Eli: no fighting/skilling
setup swaps); this beats continuity. Tome (addTomePrint): one Oak Log (OakTree) print on a mage, the
only printer Tome line the refinery doesn't cover (Eli: prints happen in statue weeks). Last priority: planned mage's spare
chamber next to skilling > free mage > spare chamber next to a monster drop; never displaces a refinery input. Ties keep more
warriors free. The Vman (last Voidwalker) always gets Spore Caps (Eli: portal runs). Copper takes no slot when anyone is left free.
Window choice in localStorage (idleon_print_plan_window). The full view is the World 3 Refinery section
(components/Refinery): tabs Rank Planner (RankPlannerTab.jsx) / Materials (cycle times, each salt's inputs per hour vs printed, storage time left for unprintables). Rank Planner = refineryUtils getSaltRankPlan (Toolbox getSaltsBalance): salt made per cycle = floor(min(250k, rank^1.3 × Panda multi, companion 35)), each salt's
`Safe up to` = highest rank whose cost of its feeder fits the feeder's output (per cycle, × cycle-time ratio, minus the Keep spare share),
starved salts pass their slowdown down the chain (sustained), rank ups are manual (bar full = PowerCAP, REFINERY_POWER_CAPS) and the
Rank up now list walks top-down so a feeder's rank up can free the next salt. Same-speed 2-cost salts balance at equal ranks. refineryMap.js = salts + costs
(`printable` flag) + speed constants; refineryUtils (Toolbox refinery.ts): getRefineryCycleTimes (every % speed source, Gilded Tubing 3x
assumed, legend 19, polymerize meal + research 48), cost = floor(rank^1.5) × qty (salt inputs ^1.3 up to TaskZZ2[2][6]), cycle times
ceiled. Needed/hr matches Toolbox on Eli's save. printerUtils getPrintedPerHour = sample × account Total × per-character Wired In 2x /
Harriep 3x (getCharacterPrintMulti, divinityUtils isMajorGodActive). Family DK bonus uses the account's best THE_FAMILY_GUY
(talentUtils getAccountFamilyBonuses; 62.3 vs Toolbox 62.6, per-character added levels not ported). Exalted stamp multi is complete now
(atoms, compass 76, event shop 18, palette 23, exalted fragments).
