# IdleOn Hub — Project Context

A React fan companion app for the idle game **IdleOn**. Reads a player's exported save file and displays character stats, talents, statues, shrines, minibosses, premium gear, and more in a clean dashboard UI.

---

## Stack & Environment

- **React + Vite** (Windows dev environment)
- **Plain CSS** per component — no CSS framework
- **HMR fix**: if hot reload stops working → `rmdir /s /q node_modules\.vite`
- **HMR rule**: one default export per `.jsx` file. All utilities/constants go in `.js` files.

---

## Project Structure

```
src/
├── components/         # One folder per feature (see casing note below)
│   ├── Section pages:  Breeding, Bubba (static guide, data in bubbaMap.js), Construction, Cooking, Farming, GearOptimizer,
│   │                   CapeVine, HatRack, Hole (+ VillagerTab, CavernTab, *Panel per cavern, MonumentBonusList, StatIconRow), Islands (one tab file per island), MasterClasses, Minibosses, Obols, Printer (+ SaltMaterialsTab.jsx), Refinery, Shrines, Spelunking (+ LoreTab.jsx, RedJellyTab.jsx, ElixirTab.jsx), Statues, Summoning (+ BossesTab.jsx, DoublersTab.jsx), Worship
│   └── Shared/sub:     AnvilProduction (Overview tab), BuffsPanel, PremiumCollection (Hat Rack + Cape Vine body), CharacterCard, CogBoardMap, ImportModal, InfoPanel,
│                       ObolBoard (in Obols/), PremiumGear, TierList
├── data/               # Game data; index.js barrel file re-exports everything, grouped by world
│                       # sections.js = sidebar groups (empty ones hidden) + sectionIcons (sidebar sprite per section); statueWorlds lives in statueMap.js
│                       # Item names → itemMap.js; fixed UQ stats (keychains, etc.) → equipmentMap.js
│                       # labChipMap.js, foodMap.js (golden/boost/potion/health): { name, img, effect }.
│                       # fishingMap.js: toolkit weights + lines (depth/exp/speed/power) and fish.
│                       # cardMap.js (all cards + cardSetMap) adds bonus/perTier/set; effect has { for
│                       #   the value. Card stars from the save (snapshot.cards) → utils/cardUtils.js.
│                       # bisSetups.js only holds ids.
│                       # legendTalentMap.js: W7 legend talents by save index (Spelunk[18]); math and
│                       #   { } $ text placeholders → utils/legendTalentUtils.js
│                       # Growth-curve data (func/x1/x2, bonus = growth() in utils/mathUtils.js) lives on
│                       #   bubbleMap + stampMap entries, vialMap.js, talentMap.js talentGrowthMap. Generated
│                       #   from Toolbox: grimoireMap, upgradeVaultMap, sushiMap, sneakingMap (pristine
│                       #   charms), mealMap (every meal: baseStat/stat), companionMap, tesseractMap, arcadeMap,
│                       #   jellyMap, meritMap, emperorMap, artifactMap, summoningMap, cavernsMap, zenithMap,
│                       #   starSignMap, researchMap (grid squares, observations, stickers), buttonMap,
│                       #   divinityMap (godMap by slot), gamingMap (paletteMap), spelunkingMap (shop upgrades with
│                       #   readable keys for Toolbox x1-x8, lore chapters, tunnel rocks/lore bosses, amber tiers),
│                       #   mineheadMap (opponent bonuses), cavernsMap glunkoUpgradeValues (Crystal Glunko Cove).
│                       #   Lore page reading (spelunkingReadLevels/Odds) is from Pulse's Lore Breakpoints guide (Eli's
│                       #   screenshot), not Toolbox. Confirmed by Eli's in-game reads: read LV is continuous
│                       #   (30 + log(pages/3,865,564)/log(1.4394), no cap at 30), × (1 + Chapter 4 bonus 4 %), and the
│                       #   fraction is a chance at +1 LV. 8 daily reads (with Rift mastery) are shared by all chapters.
│                       #   Lore tab = sub-tabs Page Reads (planner) / Breakpoints (chapter bonuses) / Red Jellyfish. Planner: equal stacks + all reads is always optimal; user picks reads/day + days.
│                       #   Elixirs: spelunkingElixirMap (text/bonus from Toolbox generalSpelunky[16]/[17]; names and colors
│                       #   are ours) + spelunkingElixirSetups (Eli's belt guide, per-delve explanations). Spelunk[7] = belt,
│                       #   Spelunk[48] = memorized (matched his in-game picks). Max copies of one elixir = 1 + Duplicate
│                       #   Elixirs LV. Fit/active checks: spelunkingUtils getElixirBelt / checkElixirSetup.
│                       #   Red Jellyfish (W7 Menagerie, snapshot.spelunking.redJelly): Menagerie[2][7] unlocked, [0][6] days
│                       #   rested, [4][c] pages tracked per chapter (never spent). READ = one normal read per chapter of its
│                       #   whole tracked stack (checked with before/after saves) + a small uncounted +1-3 to each chapter's
│                       #   bonus #1. Reading multi = floor(days^0.74) (Toolbox), always worse than reading daily.
│                       # classes.js also has CLASS_TALENT_TABS (class lines) and CLASS_FAMILY_BONUSES.
│                       # Data files never import utils; computed tables (e.g. ribbonData) live in utils.
├── hooks/              # useSaveImport.js, useTomePoints.js (Tome points typed into the Import Save modal's
                        #   Manual Inputs, held in App and passed to pages; add new uses to TOME_POINTS_USES),
                        #   useCloudSave.js (logged-in cloud save, see Cloud login below)
├── lib/                # extractSnapshot.js — parses raw save JSON; idleonCloud.js — cloud login + save read
├── styles/             # global.css — shared layout classes and reusable components
└── utils/              # appUtils.js (toClassSlug, statueLevelColor, shrineLevelColor),
                        # talentUtils.js (super talent points for Overview notifications),
                        # cogBoardUtils.js (cog names, board border groups, big-number format),
                        # cookingUtils.js (ribbonMulti/ribbonTierClass from the game formula, max rank 25;
                        #   masteryNodeMulti for Cooking Mastery yellow nodes = snapshot.cooking.masteryNodes),
                        # *Notices.js (notification counts, see Notifications below)
                        # spiceOptimizer.js — Breeding > Spice Formations: forage model (Toolbox TotalTrekkingHR/REQ,
                        #   checked against real saves) + best gene-type formation per territory (owned types,
                        #   typical power, not specific pets); runs in spiceOptimizer.worker.js.
                        # shinyPlanner.js — Breeding > Shiny Planner: getShinyRate (= Toolbox calcShinyLvMulti, matches
                        #   446,114/day on Eli's save) + getShinyPlan (fence = 3 copies each (Eli's choice, SHINY_COPIES_PER_SPECIES) of
                        #   the species with the cheapest next level; copies add evenly, levels cost ~1.7x each, OverLV +10% rate). Only fence type 5 pets
                        #   are shiny (snapshot.breeding.fenceShiny); pet upgrade levels = Breeding[2] (petUpgradeLevels).
                        # outpostOptimizer.js — Royal Guardian Outposts tab (formulas = Toolbox royalGuardian.ts). Compares
                        #   fractional Trade ranks (whole ranks tie and bias results); only Trader/Surveyor/empty slots are
                        #   swappable (Workers/Guards hold collection and node range); Commanders aim at the next free
                        #   Trader (Command 2, 6, 10...). PTS plan (planPts) is closed form: Trade EXP ∝ Traders × (10 + Edu),
                        #   so a Barracks level beats 12 Education once 10 + Education > 12 × Traders (ties → Education).
                        #   World header chips (RoyalOutposts.jsx): "PTS → Education" = one total, no outpost list; Barracks
                        #   chip names buy/save outposts (max 6, or "every outpost except" when most are saving); Commander /
                        #   Priest chips = RGcommander/RGpriest.png → trimmed mob sprite (images/mobs/trimmed, rebuilt by
                        #   IdleOn Resources/make_mob_thumbs.py; map → mob = OUTPOST_MOBS in royalOutposts.js) + outpost name.
                        #   Priests = job 7 deployments (getPriestAdvice): all on one target; World 1 Froggy Fields /
                        #   Spore Meadows first (game quirk: purified map 1/2 triples every Intel/Command bar). Glorify and
                        #   Purify are long goals: plain card tags + summary counts, never notices. Purifying is top
                        #   priority (Eli): Support Camps not linked to the Priests' target get a chip (campsToLink).
                        #   State-Wide Propoganda (armory 77, type = RoyalG[3][3], 0 Trade..4 Purity) is shown under
                        #   Compounding Outposting but left out of all math: Toolbox found the game never applies it.
                        # farmingUtils.js — Farming market costs, exotic rotation, land rank totals + optimizer
                        #   (ported from Toolbox parsers/world-6/farming.ts: per-plot goal scores in log space,
                        #   greedy over Toolbox's "all" goal; default spends only unspent points and never lowers a level,
                        #   Full Reset replans every point). Market costs include the Emperor discount.
                        #   getCropEvolutionBreakdown = every crop evo multi (Toolbox getCropEvolution), each read
                        #   from its own system's utils; sources marked exact / partial (missing inner boosts) /
                        #   input (waits on a typed-in value, e.g. Crop Chapter needs Tome points) / missing.
                        #   All match Toolbox on Eli's save; only partial: lab mainframe (vial, stamp, meal jewel)
                        #   is assumed connected. Tome points are a per-browser input (see tomeUtils).
                        #   getCropPushOutlook (Crop Evolution tab) = odds/time to the next undiscovered crops (stops at
                        #   crop 330): one evo roll per plot per growth, chance 30% × decay^tier × plot multi (cap 100%),
                        #   fresh plants climb one tier per growth; walks each plot's tier odds growth by growth.
                        #   Medal growth is a fixed 7 h. Insta grows (FarmUpg[19] banked, +2/day per gem shop 139
                        #   purchase) = one extra roll each, all modelled on one plot (getInstaGrows); with Mass
                        #   Irrigation (talent 205) one insta grow rolls a whole column (rows of 9 → 4 plots).
                        #   Verdict (getPushVerdict): banked insta grows cover a 50% shot, else the last-roll wait.
                        #   global.css .dropdown-panel = shared click-to-open <details> section.
                        #   Crop Evo reads Button slot 5 (not the slot 7 the name list calls "Crop Evo"; confirmed in game).
                        # One util per game system, each returning plain numbers or { value, missing }:
                        #   alchemyUtils (bubbles, prisma, vials), stampUtils, cookingUtils (meals), breedingUtils
                        #   (shiny levels/passives), talentUtils (account talent levels incl. added), grimoireUtils,
                        #   upgradeVaultUtils, killroyUtils, sushiUtils, sneakingUtils (charms), riftUtils,
                        #   skillUtils (Lv0_i skill index map, skill rank), achievementUtils, voteUtils, mapUtils,
                        #   mapBonusUtils (Arcane Cultist map bonuses + cap), exoticUtils (getExoticBonus, organic 2x),
                        #   companionUtils, jellyUtils, tesseractUtils, arcadeUtils, gemShopUtils, meritUtils,
                        #   bundleUtils, sailingUtils (simple artifacts), armorSetUtils, emperorUtils,
                        #   summoningUtils (winner bonuses), cavernUtils (lamp, monument), zenithUtils,
                        #   starSignUtils, characterUtils (played character = newest PTimeAway), tomeUtils,
                        #   equinoxUtils, eventShopUtils / gamingUtils (save-letter flags, saveCodeUtils),
                        #   researchUtils (grid, stickers), buttonUtils, labUtils (jewels + mainframe, assumed connected),
                        #   divinityUtils (minor link bonuses), familyUtils (family bonus walk), coralReefUtils,
                        #   prayerUtils (bonus/curse at PrayOwned level = snapshot.worship.prayerLevels; cards sort prayers by id, utility prayers 3 and 5 last),
                        #   gamingUtils (superbits, palette), spelunkingUtils (shop upgrade bonus/cost/descriptions,
                        #   cost discount (optional max Amber Hoard), amber tier, chapter bonuses, stamina regen, overstim
                        #   timer, Grand Discovery odds, tunnel discoveries; all match Toolbox on Eli's save. Spelunk[1]
                        #   has 15 tunnel slots, only 10 tunnels exist. Best Nova Blast tool only knows the 4 shop tools:
                        #   how Scepter/Mjolnir unlock isn't in Toolbox data), mineheadUtils, cavernUtils getGlunkoBonus.
                        #   spelunkingUtils getSpelunkingPow / getAmberGain = Toolbox getPower / getAmberGain (both
                        #   match on Eli's saves); amber's Tome lore bonus needs the typed-in Tome points (TOME_POINTS_KEY
                        #   in tomeUtils, entered in the Import Save modal). Their sources: menagerieUtils (unlocks/boosts),
                        #   clamWorkUtils, lootyUtils (Slab), breedingUtils getCrucibleBonus, gamingUtils MSA,
                        #   farmingUtils getCropDepotBonus, coralReefUtils getDancingCoralBonus, labUtils
                        #   getAssumedMainframeBonus (Slab Sovereignty / Depot Studies + jewel).
                        #   talentUtils getMaxPossibleTalentLevel = best SM_i max (book) level + added + super levels,
                        #   for talents people only fill when needed. SL_i = current talent levels, SM_i = max levels. talentUtils getAddedTalentLevels = every added level
                        #   source (Arctis, Symbols, family, Equinox...), checked against Toolbox (246 on Eli's save).
                        #   New bonus sources go in their system's util, never in the page that uses them.

public/images/brand/    # Site logo (logo.png = sidebar + favicon; 16px art at 12x, options + generator in
                        #   IdleOn Resources/logo-options/) and login marks (steam/google/email.svg, used as CSS
                        #   masks via .provider-icon in global.css)
public/images/          # Game sprites — Vite serves public/ at the site root, so code uses /images/...
                        # Data source of truth: the IdleonToolbox repo (github.com/Morta1/IdleonToolbox) —
                        #   data/website-data/*.json (items, cards, shared-data: chips, cardSets…). Eli
                        #   grabs PNGs from Toolbox (public/data/), so its ids match our image filenames.
                        #   Prefer it over the wiki; clone it shallow when you need data.
                        #   https://idleoneer.com/ — another save-reading IdleOn site: good for layout ideas and how
                        #   systems look in game (e.g. Spelunking tunnel depths). Pages only fill in with a connected
                        #   save, so ask Eli for screenshots when you need to see one.
IdleOn Resources/       # Outside src/ — not shipped with the site
                        # raw-save.json — Eli's latest IdleOn Toolbox export ({ data, charNames, ... })
                        # make_obol_farm_thumbs.py — rebuilds public/images/obols/farm/ (40px farm-card
                        #   sprites); run `python make_obol_farm_thumbs.py ../public` after adding a farm mob
                        # items.json — every item (displayName, UQ1txt/UQ1val stats, rawName keys),
                        #   from the Morta1/IdleonToolbox GitHub repo's split data files
                        # More Toolbox data files get added here as needed — ask Eli for the one you need
                        # Game formulas (odds, bonuses) live in Toolbox's parsers/ folder on GitHub
                        #   (Morta1/IdleonToolbox), e.g. parsers/class-specific/royalGuardian.ts
                        # Toolbox as an oracle: in a shallow clone, `npm i --no-save date-fns`, then with tsx
                        #   (--tsconfig tsconfig.json) import './polyfills' and parseData(raw.data, raw.charNames,
                        #   raw.companion, raw.guildData, raw.serverVars, raw.accountCreateTime, raw.tournament)
                        #   to get Toolbox's numbers for raw-save.json and compare against ours.
                        #   Lighter setup (no full npm i): node_modules with core-js, date-fns, tsx, @mantine/hooks,
                        #   lodash.merge is enough for parseData.
```

**File casing**: Windows doesn't care about filename case, but Linux/GitHub builds do — imports must
match the real filename exactly. Three components are lowercase on disk:
`Minibosses/minibosses.jsx|css`, `Shrines/shrines.jsx|css`, `Statues/statues.jsx|css`.
`Obols/ObolUtils.js` is PascalCase.

---

## Key Conventions
**General Formatting**: multi-line format - each property on its own line

**CSS naming**: namespace all classes with a component prefix to avoid conflicts
- e.g. `shrine-preview-*`, `statue-preview-*`, `miniboss-*`
- Shared layout classes and reusable components live in `global.css` — adding to global is preferred where it makes sense so future components can reuse them.
- Always use `global.css` if possible, especially for tooltips.

**CSS formatting**: multi-line format — each property on its own line

**CSS values**: `px` for sizing, hex codes for colors (e.g. `#c084fc`), class-based styling always — no inline styles

**Pixel art sizing**: obol PNGs are 36px art saved at 4x (144px, nearest-neighbor) and shown with normal
smooth scaling, which keeps pixels even at any size and Windows display scaling. Don't use `pixelated` on
them (looks blocky), and never smooth-scale a small file up (looks fuzzy). New obol art: upscale to 144px first.

**Image paths**: images live in `public/images/`. In JS/JSX write them **without** a leading slash
(`images/mobs/Penguin.png`) so they work both locally and under the GitHub Pages subpath. In CSS write
them **with** one (`url("/images/...")`) so Vite can prefix the base path at build time. Filenames are
case-sensitive on the live site even though Windows ignores case.

**Deployment**: pushing to `main` deploys to https://yungwern.github.io/idleon-tracker/ via
`.github/workflows/deploy.yml`. `vite.config.js` sets `base: '/idleon-tracker/'` for builds only.

**Cog board**: `CogBoardMap` with no props = Optimal Cog Layout; pass `board={snapshot.construction.board}`
(96 slots, CogO/CogM 0-95, row-major) for the player's real board. Cog stat keys come from Toolbox `cogKeyMap`:
d = % Bonus Construct EXP, f = % Player Construct XP, b = player Construct EXP/hr, h = boost pattern.

**Printer** (World 3): `snapshot.printer.characters[i]` = { library (Print, 5 slots), extraLibrary (PrinterXtra, 5 slots),
printing (2) }, each { item, value }. Unlocks = gem shop (`printerUtils getPrinterUnlocks`, `printerBuffMap` + BuffsPanel):
GemItemsPurchased[111] Crystal 3D Printer = 2nd chamber, [112] More Sample Spaces (max 6) = library 4 + purchases (Eli).
Print Multis = the 5 in-game MULTI lines (`printerMultiMap`, `printerUtils getPrinterMultis`, inputs in snapshot.printer from OptLacc
138/323/354/364/479 + Compass[0][43]); all 5 match the game on Eli's save (1.32/2/2/5/3x). Yet Another Printer Multi
was shown but never applied until the Nov 1 2026 game update fixed it (Toolbox may still leave it out). `printerHiddenMultiMap` / getPrinterHiddenMultis = multis not on the
in-game screen (Gold Relic OptLacc[125] days by artifact form, Skill Mastery + Lolly Flower added, Vote 11 = lower bound: vote multi
not ported). Total (getPrinterTotalMulti) = product of all 8 (1472x on Eli's save; Toolbox's 490.68x × the 3x legend talent). value = the per-hour number the in-game
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
non-warrior). Eli: wrong-class prints get moved even if they cover the need (the tab shows the optimal setup). Ties keep more
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

**Summoning** (World 6, components/Summoning): tab row like Refinery (InfoPanel text per tab = TAB_INFO), tabs Bosses / Doublers. Bosses = 7 summoning stone
bosses (`summoningStoneBosses` in summoningMap.js: Toolbox summoningEnemies[106+i] + stone maps). Kills = KRbest SummzTrz<i> =
`snapshot.summoning.stoneKills`; next fight HP = 2 × baseHp × 4000^kills; colour upgrades × (1 + kills) (summoningUtils
getSummoningStoneBosses, matched IT on Eli's save). Stone art = public/images/summoning/SumStone_<i>.png (Toolbox etc/).
Doublers (DoublersTab.jsx, summoningUtils getDoublerPlans): count = cavernUtils getSummoningDoublers (Gambit points from Holes[11][65..70]
trial times × points multi, first gambit bonus + 10 from event shop 15; multi includes Measurement 13 (Death Note pts), 8.18x and
33 = Toolbox on Eli's save). Placed = Holes[28] (upgrade index, -1 empty) = snapshot.caverns.gambitDoublers. Doubler multi = 2 + max(0,
Absolute Stardom (talent 597) / 100 - 1) + Allstar (upgrade 78) % (3.33 on Eli's save, = Toolbox). Upgrade bonus = Summon[0] LV × qty ×
stone multi (summoningUpgrades in summoningMap.js, stoneBoosted = Toolbox filler). Planner fills tiers, greedy log gain inside
each (summoningDoublerModel; army DMG/HP = Toolbox getArmyDamage/Health, Merciless 51 / Unit Blood 50 stay in the shared pools: Eli
says doubling them does ~nothing; 74/81 own multipliers). Damage setup = one combat tier (damage, spikes, mana, Jeweled Cards;
score = ln mana regen + ln jeweled + ½ ln unit DMG + ½ ln spikes + ½ ln starting mana: output ≈ units summoned × damage) > HP (Eli:
always last) > essence. Jeweled Cards = raised chance, not sure even past 100% (Eli tested), valued as 1 + bonus/100 (estimate).
Essence setup = essence while a doubler adds 1% (Σ colours ln(knowledge × victories × summoning × Infinite Essence) + colours ×
ln(cost cuts)), then combat, then HP. Take off / Put on chips = icon only, name in a tooltip. Icons = public/images/summoning/upgrades/SumUpgIc<i>.png (Toolbox data/). Career wins per colour =
won enemies by mapEnemyData world (Pet* = white).

**The Hole** (World 5, components/Hole): top tabs Villagers + 4 biomes (holeBiomes shortName), sub
tabs per villager (Explore/Engineer/Bonuses/Measure/Studies) or cavern. Data = holeMap.js: villagers/caverns handwritten (names,
unlock caverns, opal rates and guide text from SolarFrost's Camp/Biome guides, Eli's screenshots); the rest generated by
IdleOn Resources/gen_hole.py from Toolbox holesInfo.json/shared-data.json. Math = holeUtils.js (Toolbox hole.ts + caverns/*):
villager EXP req, schematics unlocked (1 + 3 LV + floor(LV/5), max 105), majik bonus, measurements (base × stat multi via
MEASURE_STATS: Tome Score = typed-in Tome points, Account LV = Σ character LV, All Skill LV = Σ every skill LV, Highest DMG =
snapshot.highestDamage (TaskZZ0[1][0]), Death Note pts = deathNoteUtils; code in utils/measureUtils.js (shared with
cavernUtils Gambit points, measurement 13); every total = Toolbox on Eli's save),
study bonus/req, study rate (getStudyRate = Toolbox studyPerHour, 550,656/hr on Eli's save; time to LV = (req - progress) / rate), jar bonus, layer cavern req/efficiency, wish cost; getCavernDetails(snapshot, id) = stat cards + one list
per cavern. Save = snapshot.caverns (parseCaverns; extra = Holes[11], slots in HOLE_EXTRA). Cavern 17 = "The Lair" (Eli's name;
save/Toolbox call it THE_COVE / Crystal Glunko Cove). Icons = public/images/hole/ (Toolbox etc/Cavern_i, Villager_i, data/Opal).
Opals invested tooltip = getOpalSources (game TotalOpalsEarned: cavern finds + gem shop 5, grimoire 11, companion 13 (25),
compass 52, emperor 3 + schematic 102, tesseract 25, sushi 56; = 561 invested on Eli's save). Engineer = in-game style grid, rows of 6 tiles
at native 97px with "Created ✓" / cost / unlock LV along the bottom (public/images/hole/schematics/<i>.png = HoleUIbuildSq<bg> + HoleUIbuildUpg<i> pre-composited, To create/Locked/Created/All
filter, cost = getSchematicCost incl. Lamp wish 5 discount). Measure cards: Measure_<i> icon + cost (getMeasurementCost) in
its resource (images/hole/resources/<index>.png, trimmed: 0-9 well, 10-19 notes, 20-29 rupies, 30+ coins). Studies: Peripheral
Vision = superbit 43, the studies either side of the active one. Parallel Villager chip = gem shop purchase, Holes[23][i] (2x EXP). Hole sprites (Cavern/Villager/Majik/Opal/measure/resources)
are saved at 4x nearest-neighbor like obols: set a CSS height, never pixelated. Tabs use the default page-tabs colour.
Caverns: CavernTab = head card + opals card, then a full panel for caverns in CAVERN_PANELS (the panel gets the opals card as
`lead` for its stat row) or getCavernDetails stat cards/list. Cavern math = utils/holeCavernUtils.js (Toolbox caverns/*.ts).
Shallow (all = Toolbox on Eli's save): WellPanel (Gravel opal cost, bucket fill rate getBucketFillRate incl. Gambit bonus 3,
golden buckets = first 1-2 (Fountain 0/15 + schematic 104, × 1 + boost/100), buckets drawn 9 7 5 3 1 | 2 4 6 8 10 like the game,
bars top = Hyper Coral; outline colour tiers brown/silver/gold/blue/red/green, each grows over 20 expansions from 14 (fit to
Eli's screenshot, green full at 114); sediment names wellSedimentNames (Eli); buckets pre-composited per sediment in
images/hole/well/), DenPanel (score multi, amp effects, denRecommendedSetup = Eli's charges as a starting point), BraveryPanel
(hour unlocks holesInfo[30]/[31], sword damage, reward multi; Meritocracy reward bonus flagged, not counted), BellPanel (4 rates +
use reqs, ring bonuses, improvement methods with costs: coins/bits/particles = snapshot.currencies; Ring or Ping? card =
getBellRingOrPing: full-bar time of the next Ring vs next Ping at current rates, within 10% = Either; only the selected
action fills, Renew resets the ring count (Eli), pings never reset; crossover = ring # where Ring passes today's ping time).
Charging bell = Holes[11][19] (HOLE_EXTRA.bellCharging: 0 Ring, 1 Ping, 2 Clean, 3 Renew; found by diffing Eli's Ring/Ping
saves). utils/holeNotices.js (byCavern + count) = The Hole sidebar, biome tab and cavern tab badges: Ring or Ping charging
while the other one is faster (not Either); harp strings under 99.5% (HARP_SETUP_MATCH) of both Best setups (getHarpSetupCheck; optimizer results cached, ~0.4 s first run). MonumentBonusList = LV +
bonus, capped bonuses (base >= 30) get a cap bar + 50-99% milestones (progress = LV / (250 + LV)); also used by Justice/Wisdom.
Bravery study (3) caps at 32% = LV 7 (getStudyMaxLevel). Motherlode-style caverns show ore remaining like the game.
Glowshroom (Toolbox the-harp/the-lamp/justice/grotto.ts): HarpPanel (getHarp: Holes[20] = string type per harp string, Holes[11][21] = tuned note (2 = Bass, matched Eli's screen), notes = Holes[9][10..19], names harpNoteNames (Eli); string LV/EXP bars per type in its in-game colour (.hole-harp--t), Makes = per pluck at current Harp Power; letter art images/hole/harp/string_t.png = Toolbox HarpNote_109+t at 4x), LampPanel (getLamp: wish art images/hole/lamp/wish_t.png = HoleLampUpg t, wishes/day = 136.1 like the game, next cost + days to afford; x1 999 wishes = not in the game yet; Opal calculator = getLampOpalPlan, next 6 opals of wish 2 by day; each More Wishes (wish 0) rank shows one more wish on the in-game Lamp (Eli), e.g. W7 Watsinames), Harp Best setup (HarpSetups.jsx + utils/harpOptimizer.js, one setup per goal: Eli found 3 confusing): brute force over every type mix, slot k multi = 1 + (15 + 20k + 30 × unique types)/100 (Stringy/Domino/Variety), order by pairwise swaps. Notes goal = ln(notes per strum) + Σ (LV worth / ln 1.15) × ln(EXP per strum to the type) (LV ≈ ln EXP / ln 1.15; worth from current LVs, getHarpLevelWorth), so high-LV accounts get one of each + C, low-LV ones E/G-heavy (the in-game tip 'one of each, spam E/G' is the early answer). Level goal = Σ ln EXP per type. Players pluck in any order; the card tells them to pluck left to right (Eli). Explanation text follows the setup (explainNotes: mostly G vs mostly C); uniform-LV test: LV ≤ 40 G-heavy, ~60+ one of each + C), JusticePanel (head links to idleon-justice.vercel.app via cavern.link in holeMap; getJustice: starting coins/health/dismissals/popularity, 59 coins + 218.2x reward = Eli's screen; MonumentHourList shared with Bravery). Layer caverns show what they collect (images/hole/layers/<cavern id>.png, 4x); Grotto shows Gloomie Lootie/Expie/Opie (schematics 46-48, 5/25/10% per colony).
Overgrowth (Toolbox the-jars/wisdom/gambit/the-temple.ts, all = Toolbox and Eli's screens on his save): JarsPanel (getJars:
rupies = Holes[9][20..29] + white/dark Holes[11][38/39], shown 6 + 6 like the game, kinds in RUPIE_KINDS inferred from the jar
texts; production/hr, rupie value, extra rupie chance, jar slots (schematics 63/66) = Holes[25] type 0-2 + progress 3-5; jar types
= jarTypes (holesInfo[65] + Toolbox names) with req, Tall/Ornate/Enchanted chances, destroyed Holes[11][40+i]; shelf = save key
Jars = snapshot.caverns.jarShelf ({ type, tier }, tier t counts as 10^(t-1)); collectibles = 8-wide icon grid like the game, click
one to read it underneath (picked one = Holes[11][62], purple outline); Producing now has no progress bar (Eli: the save's
progress is frozen and jars take seconds); Rupie Slug = OptLacc[355]). Jar cards also show Jar Production Line (schematic 74,
getProductionLine): type i req ÷ (1 + 5% × game log10(broken of type max(0, i-1))), continuous (each ×10 = +5%, Simple feeds Simple
+ Tall), next ×10 bar in log space + time with all slots; "Make next" = soonest ×10 among types feeding an unlocked type (idea from
Corgan's jar calculator, which is all-rights-reserved: never copy its code). Chance jars: ~1 success per hoursToMake / chance in one
slot, guaranteed at T ceil(log10(1/chance)) + 1. WisdomPanel = Bravery/Justice layout (getWisdom: starting attempts 57 = 5 + study 12 + hours; the in-game hour list
always says "30" (game WisdomAttempts(1)), we copy that text). GambitPanel (getGambit: base points × multi like the in-game box,
gambitTrials names/descriptions (Eli), times cut to 0.1 s like the game, all 19 gambitBonuses with their ? text; x1 = 1 bonuses never cap (+x0 per 10x points, ↑ chip), Doublers/Opals
get a bar to the next breakpoint in log space: getGambitGrowth). TemplePanel
(getTemple: Illuminate/Search/Amplify as 3 boxes: big bonus value + label, LV and cost footer, LV = Holes[11][57]/[59], extra torch chance). Story stat icons (swords,
mental health, insta matches...) = StatIconRow under the main card number; art in images/hole/<bravery|justice|wisdom>/ (Toolbox
etc/, wisdom/match.png = HoleWisdomCard + HoleWisdomQ). Jar/collectible/rupie art = images/hole/jars/, pieces = images/hole/gambit/,
torch = images/hole/temple/torch.png (HoleUIbuildUpg77), all 4x.
Sentinel (Toolbox the-fountain / crystal-glunko-cove.ts): FountainPanel (getFountain: 9 currencies = Holes[9][30..38] (owned matched
Eli's screen), base value per coin, LUCKY bubbles = Holes[30][c] (coloured per currency, .hole-fountain-bubble--c), coins on the ground = Holes[29][space] (coin types), total currency multi
(Green water gets its sqrt), marble Holes[11][81], ducks OptLacc[601]; bars coin/marble/duck (1m 50s / 10h / 25h, 0.217% duck = Toolbox);
water tabs Blue/Yellow/Green, upgrades grouped by unlock tier (depth of the prereq chain, prereq LV 10, Blue 2/14 at LV 1), data
fountainUpgrades in holeMap (gen_hole.py), art images/hole/fountain/ (coin_c, upg_t_i, marble, 4x)). Holes[11][80] isn't the water on
screen (0 while Eli's showed Green), so no 'active water' chip. LairPanel (getLair: DR 81.55Mx and all 24 costs = Eli's screen incl.
study 17's 15% daily discount; upgrade t paid in shape floor(t%12/2) + 6 floor(t/12), odd t 5x; in-game column k = t 2k / 2k+1, shown as one card per shape;
shapes OptLacc[654..665] art images/hole/lair/shape_i.png; Double Shape = schematics 101/103/105 +10% each (Toolbox 'double pickup')).
Lair AFK = 10 + Sleepy Drops + Sleepy Drops+ (126% on Eli's save; in-game header shows 164%, extra source unknown). In-game Multikill
= base + per tier × damage tiers (4,587 = 2,700 + 51 × 37 on Eli's screen); tiers not ported. Trench = layer cavern (unchanged).
Not ported yet: villager EXP/hr, schematic Total Bonus lines, opal sources for caverns 11/15/16, Monument AFK gain, how LUCKY coins
combine into currency value.

**Death Note** (W3 Workbench, no page yet; planned World 3 section): data = deathNoteMap.js (IdleOn Resources/gen_deathnote.py
from Toolbox shared-data deathNote/mapEnemies/mapPortals + monsters.json), math = utils/deathNoteUtils.js getDeathNote: account kills
per mob = Σ characters (mapPortals[map][0] - KLA_i[map][0]) (snapshot.characters[i].mapKillsLeft), rank table 25K..100M kills →
1..10 points, > 1B = Eclipse Skull 20 (rift bonus 20), minibosses = Ninja[105] (snapshot.miniBossesKills, own table). worldPoints
(no minibosses) = Hole "Death Note Pts". Matches Toolbox on Eli's save (worlds 300/220/280/260/260/280/480, minis 51, 2080 pts).

**Islands** (World 2, components/Islands): bottles strip + Bottle unlock planner (only while islands are locked, guide path
ISLAND_PATH), then one tab per island in game order (Trash/Rando/Crystal/Seasalt/Shimmer/Fractal, IslandOverview on top; guide
text only on locked islands). Data = islandsMap.js (Toolbox parsers/world-2/islands.ts), save = snapshot.islands (parseIslands:
OptLacc 160-184, BribeStatus 26-33, Cards1 nametag, Omar QuestComplete_i). Math = islandUtils, badges = islandNotices (Trash next buy
affordable, Rando upgrade only once all islands are unlocked, Crystal 13+ days (14 spawns fewer), Shimmer trial not done this week (OptLacc[182], weekly per Eli) /
upgrade affordable, next path island affordable). Garbage/day is Toolbox's estimate. Trash bribe set counts as bought once any of
bribes 27-33 is bought. Star talent books owned = SM_i[id] > 0 on any character (Filthy 649, Rando 650, Dummy 653).
Trash buy order (getTrashBuyOrder, Eli): every one-time item as fast as possible (bribe set first, then cheapest; tries 0-10 Garbage
Gain levels first, keeps the fastest), then always the cheapest repeatable. Shimmer trial order is unknown (only this week's index
is saved); shimmerTrials req = score for 1/10/40 shimmer (40 = weekly max; Eli's table, headers inferred from the x100/x1600 and +1-per-digit pattern). Fractal Master of Nothing trophy (Trophy18 in droppedTrophies): odds 1 - (1 - 1e-5)^(hours - 24); Eli: 24 h candies
make one-character day counts the right unit.

**Hat Rack** (World 3, components/HatRack) / **The Cape Vine** (World 4, components/CapeVine): both render the shared
`PremiumCollection` (summary chips passed in, grouped Total Bonuses in two centered columns, All / Owned / Missing filter, item
cards; owned first, missing always last). Totals = utils/collectionUtils.js sumCollectionBonuses, grouped by its BONUS_GROUPS
(unlisted bonuses → Other); getBonusColumns: left = loot, damage, AFK, Other; right = Stats then Experience (Eli's layout).
Totals are shown rounded up like the game (ceil with a 1e-9 guard against float noise).
Hats on the rack = Spelunk[46] (snapshot.hatRack.hats); every rack-eligible hat = hatRackMap.js `premiumHats` (Toolbox
items.json PREMIUM_HELMET + aHelmetMTX, minus lvReqToCraft 69420). hatRackUtils: multi = 1 + (hats + Wild Boar companion 31 +
10 × event shop 30 + Minehead 21 + Sushi 36) / 100, each hat's base stats + UQ lines × multi (1.97x and every total = Toolbox on
Eli's save). Capes on the vine = Spelunk[54] (snapshot.capeVine.capes, vine order; Owned and All list them in that order); all
capes = capeVineMap.js `premiumCapes` (Lava Wings left out: dev-only cape). Cape Vine is new (Nov 1 2026), not in Toolbox.
Checked against Eli's in-game vine screen (all 15 totals match): only UQ lines count (the screen's base-stat rows equal the Hat
Rack's, not the capes'), Golden Vine slot = 100%, other slots = 25% (game text says 20%, but only 25% fits), all × Cape Vine
Bonus Multi = 1 + (capes on the vine + 10 if event shop 30) / 100 (1.28x on Eli's save; the +10 source is a guess that fits).
Golden Vines fill from the front of the vine. Count (capeVineUtils getGoldenVines, Eli) = 3 if the account owns Lovely Balloon
(EquipmentCape23, the pack cape: snapshot.capeVine.lovelyBalloon = on the vine or in Cards1) + floor(highest character LV / 500)
(6 on Eli's save, matches the game). Lovely Balloon = 20 Weapon Power, +250% Drop Rate (additive); card shows ? until
capes/EquipmentCape23.png exists.
Character Card Premium Gear: hat and cape cards show a "Bonus in Hat Rack / Cape Vine" link (CharacterCard onOpenSection)
instead of stats, since worn hats/capes give nothing.

**Buffs panel**: `BuffsPanel` (styles in global.css) is the centered unlocked/missing/unknown icon strip under the
InfoPanel — BiS Setups (Card Buffs) and Shrines use it. Pass `active: null` when the save can't tell.
Shrine building levels (Tower[18..26]) give the W7 Dancing Coral bonus past Lv 200 (`coral` in shrineMap.js).
Breeding uses it too (`breedingBuffMap` in breedingMap.js): W7 Menagerie unlock 11 (Menagerie[2][11]) raises max shiny
LV from 20 to 30. Menagerie unlock names/tooltips are Toolbox research.json [56]/[62]; icons are MenaIconO<N>.png.

**Spice territories**: Pets[27+4i..] = team on territory i (Pets[0-26] fence, PetsStored = storage), each pet
[rawName, geneId, power]. Territory[i] = [bar progress, fills, ?, then 3 reward slots of (spice name | 'Blank', amount)]. The name
slot goes 'Blank' after a claim (0 fills), so unlocked = name set, or any progress/fills, or a team on it.
Territories can unlock out of order (16 open while 14 locked). A Converter keep also keeps the spices to claim, so a
batch can be claimed again (counted as ~2 claims per batch).

**Sub tabs**: every in-page tab row uses `.page-tabs` / `.page-tabs--sub` from global.css (set `--tab-color`), Masterclasses included.

**Adding new pages**: register the section (and its sidebar icon in `sectionIcons`) in `data/sections.js` and wire up the component in `App.jsx`

**Data flow**: save file is parsed via `extractSnapshot.js` → stored in localStorage → loaded by `useSaveImport` hook → passed as props to components.
Snapshots carry `source`: 'paste', 'cloud' or 'dev' (Paste Save tab's dev-only "Load IdleOn Resources/raw-save.json" button).
Dev-only "Sync and save to raw-save.json" (Log In tab, signed in) POSTs the synced cloud bundle to `/__dev/raw-save`
(vite.config.js devRawSaveWriter), which overwrites raw-save.json but keeps guildData/tournament/accountCreateTime/extraData
from the old file (cloud has none of them, so those go stale until Eli re-exports from Toolbox). `savedFrom: 'cloud'` marks it.
**Cloud login** (Import Save > Log In; Paste Save always stays): `lib/idleonCloud.js` signs in to the game's own Firebase
project (idlemmo) with plain REST, no Firebase SDK, the same way Toolbox/Idleoneer do. Steam = OpenID to
legendsofidleon.com/steamsso, player pastes that URL, game function `asil` returns a custom token → signInWithCustomToken
(reply has no localId: uid comes from the token's user_id claim, e.g. steam_…). Google = device code (google.com/device)
→ signInWithIdp. Email = signInWithPassword. Apple not built: needs our own server relay (Cloudflare Worker), like both
other sites use. Save = Firestore `_data/{uid}` + RTDB `_uid`/`_comp` + Firestore `_vars`, assembled into the same
`{ data, charNames, companion, serverVars }` bundle as a Toolbox export. `useCloudSave` keeps { provider, uid, refreshToken }
in localStorage (`idleon_cloud_account`), renews the 1 h token via securetoken, and auto-syncs on load and on tab focus
(2 min minimum) only while the loaded save's source is 'cloud'. Toolbox is GPL-3: reimplement, never copy its files.
OptLacc (account options) is parsed once in `extractSnapshot` and passed to the parsers that read it; use `parseRaw`
for any save key that may be a JSON string. Each game system has its own `parseX` in extractSnapshot (alchemy, stamps, sneaking, grimoire, upgradeVault,
achievements, rift, killroy, sushi, companions + voteBallot from the export's top-level companion/serverVars, and
more). Snapshot shape changes only show up after re-importing a save.
**Played character**: account bonuses the game reads "as the logged-in character" (star signs, chips, skill levels,
added talent levels) use `getActiveCharacter` (newest PTimeAway_i).

**Characters come from the save**: names from `playerNames`, classes from `CharacterClass_N` (IDs mapped in
`data/classes.js`). Character count is whatever the save has, so never hard-code 10 or 11. `snapshot.characters[i]`
lines up with every `_i` save key. Card role pills ("Used for") = `CLASS_TAB_ROLES` in `data/classes.js`, keyed by
talent tab and built from that tab's talents (Toolbox talents.json); `characterUtils getClassRoles` walks the class line
(`CLASS_TALENT_TABS`), own tab first, earlier tabs shown dimmer.

**Notifications**: each count has one source so every badge agrees. `utils/characterNotices.js` (character
Overview), `utils/masterclassNotices.js` (returns `{ masterclassId: { sectionId: count } }`, feeding the sidebar
badge and the masterclass/section nav badges), `utils/minibossNotices.js`.
**Skills tab** (Character Card): in-game menu order (`getSkillMenuOrder`), EXP from Exp0_i / ExpReq0_i. Maestro hands
(`skillUtils getMaestroHandStatus`): last Maestro-line character (the Vman) gives other characters skill EXP/eff only in
skills where their LV is strictly lower (ties get nothing). Tracked for mining/chopping/fishing/catching/trapping/worship
(Eli; Smithing EXP also counts but is left out). Amber = lead ≤ `MAESTRO_LEAD_WARNING` (5). Notice on the Vman's card only (Eli: never tell other characters
to stop leveling). Mages (WIS) are skipped for Worship (`MAESTRO_HAND_SKIPS_MAGES`): their charge levels it fast, little loss.
Sidebar badges are wired in
`sectionNotices` in `App.jsx`; in-page badges use the shared `.notice-badge` class in `global.css`.
**Obol roll check**: `passesObolCheck` in `Obols/ObolUtils.js` is the only obol check (Standard / Min/Max / BiS Setup,
each stricter than the last; rules in its comment). One mode value (`useObolCheckMode`, localStorage, held in App) feeds
character notices, the family board notice (`utils/obolNotices.js`, Obols sidebar badge) and board glow. Main stat
per class = `CLASS_MAIN_STATS` (classes.js) via `characterUtils getClassMainStat`; family board = STR in every mode,
same rules as a character (`getFamilyMainStat`, Eli: STR is strongest and you're active on RG). Obols with no UQ (`obolHasUq`) can't roll one, so in Min/Max
and BiS a positive main stat roll stands in for the UQ roll; every other rule still applies (Eli). Storage obols are never checked.
Saves hold negative rolls on stats an obol doesn't have (AGI -1 on a Silver Pop); the game ignores them, so every check and
tooltip uses `getEffectiveRolls(rawName, stoneData)` first. Only negatives on the obol's base stats (or its UQ) are real.
Obols > Example Boards has sub-tabs Family Boards (your board + one picked setup) / Personal Boards (one picked setup), each
with its notice on top. Setups = `familyBoards` / `characterBoards` in obolMap.js (add a { label, slots } entry, no UI work).
Personal notice chips open that character's Obols tab (App `openCharacterTab`: bumps a visit id = CharacterCard key + initialTab).
Obol boards draw the empty in-game board art (public/images/obols/board/character.png, family.png, 356x344, title bar cropped off)
with each obol centred on its socket: shapes in reading order = `CHAR_OBOL_SHAPES` / `FAMILY_OBOL_SHAPES` (obolMap.js),
socket positions = `obol-pos--char-N` / `fam-N` classes in ObolBoard.css (measured from the art). Board slots take reading
order; character saves convert with `CHAR_OBOL_SAVE_TO_DISPLAY` (Toolbox calculateWeirdObolIndex). Example `characterBoards`
are written in reading order (rows 5/4/3/4/5). Character Obols tab = board + `ObolStatsPanel` ("What it gives",
`getObolBoardStats`: per obol max(0, base + roll); UQ1/UQ2 ("MISC") bonuses × Silver Jellyfish = `getObolMiscMulti`, Menagerie[0][9].
In-game text says MISC; Toolbox applies it to WP/DEF instead). Obol PNGs draw at 72px on the board (2x art scale).
Family board (`ObolEqO1`/`ObolEqMAPz1`) save order = on-screen order. `ObolEqO2`/`ObolEqMAPz2` (3 slots) exist but are unknown.

**Line endings**: files use Windows CRLF. Keep them CRLF when editing so git diffs stay clean.

**Class colors/icons**: one place only, the CLASS THEMES block in `global.css`. Any element with
`data-class={toClassSlug(className)}` gets `--class-color` / `--class-icon`. Icons are grouped by family in
`public/images/class icons/<beginner|warrior|archer|mage>/`. Don't add JS color maps.

---

## Deeper Reference

If more detail is needed on a specific area, ask to search past conversations:

- **Statues page** (world data, MobChip, per-world colors, statue IDs) → search "statues farming location"
- **HMR / Vite setup** (polling config, single export rule) → search "HMR hot reload idleon"
- **Data refactor** (barrel file, extractSnapshot, characters/sections split) → search "data.js refactor idleon"
- **Component naming / CSS conflicts** (PascalCase rename, namespace prefixes) → search "shrines statues CSS conflict"
- **Image processing** (Python PIL cleanup for PNG assets) → search "boosts column row image processing"

---

## Maintaining This File

Claude may add to or update this file when something would help future sessions (new conventions, file
locations, gotchas). Keep entries short, update existing lines instead of appending duplicates, and remove
anything that goes stale so the file stays compact.
