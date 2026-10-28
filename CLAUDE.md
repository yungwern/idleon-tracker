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
│   │                   MasterClasses, Minibosses, Obols, Shrines, Spelunking (+ LoreTab.jsx, RedJellyTab.jsx), Statues, Worship
│   └── Shared/sub:     AnvilProduction (Overview tab), BuffsPanel, CharacterCard, CogBoardMap, ImportModal, InfoPanel,
│                       ObolBoard (in Obols/), PremiumGear, TierList
├── data/               # Game data; index.js barrel file re-exports everything, grouped by world
│                       # sections.js = sidebar sections; statueWorlds lives in statueMap.js
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
│                       #   Red Jellyfish (W7 Menagerie, snapshot.spelunking.redJelly): Menagerie[2][7] unlocked, [0][6] days
│                       #   rested, [4][c] pages tracked per chapter (never spent). READ = one normal read per chapter of its
│                       #   whole tracked stack (checked with before/after saves) + a small uncounted +1-3 to each chapter's
│                       #   bonus #1. Reading multi = floor(days^0.74) (Toolbox), always worse than reading daily.
│                       # classes.js also has CLASS_TALENT_TABS (class lines) and CLASS_FAMILY_BONUSES.
│                       # Data files never import utils; computed tables (e.g. ribbonData) live in utils.
├── hooks/              # useSaveImport.js, useTomePoints.js (Tome points typed into the Import Save modal's
                        #   Manual Inputs, held in App and passed to pages; add new uses to TOME_POINTS_USES)
├── lib/                # extractSnapshot.js — parses raw save JSON
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

**Buffs panel**: `BuffsPanel` (styles in global.css) is the centered unlocked/missing/unknown icon strip under the
InfoPanel — BiS Setups (Card Buffs) and Shrines use it. Pass `active: null` when the save can't tell.
Shrine building levels (Tower[18..26]) give the W7 Dancing Coral bonus past Lv 200 (`coral` in shrineMap.js).
Breeding uses it too (`breedingBuffMap` in breedingMap.js): W7 Menagerie unlock 11 (Menagerie[2][11]) raises max shiny
LV from 20 to 30. Menagerie unlock names/tooltips are Toolbox research.json [56]/[62]; icons are MenaIconO<N>.png.

**Spice territories**: Pets[27+4i..] = team on territory i (Pets[0-26] fence, PetsStored = storage), each pet
[rawName, geneId, power]. Territory[i] = [bar progress, fills, ?, 'CookingSpice{i}' | 'Blank' if locked, spices to claim].
Territories can unlock out of order (16 open while 14 locked). A Converter keep also keeps the spices to claim, so a
batch can be claimed again (counted as ~2 claims per batch).

**Adding new pages**: register the section in `data/sections.js` and wire up the component in `App.jsx`

**Data flow**: save file is parsed via `extractSnapshot.js` → stored in localStorage → loaded by `useSaveImport` hook → passed as props to components.
OptLacc (account options) is parsed once in `extractSnapshot` and passed to the parsers that read it; use `parseRaw`
for any save key that may be a JSON string. Each game system has its own `parseX` in extractSnapshot (alchemy, stamps, sneaking, grimoire, upgradeVault,
achievements, rift, killroy, sushi, companions + voteBallot from the export's top-level companion/serverVars, and
more). Snapshot shape changes only show up after re-importing a save.
**Played character**: account bonuses the game reads "as the logged-in character" (star signs, chips, skill levels,
added talent levels) use `getActiveCharacter` (newest PTimeAway_i).

**Characters come from the save**: names from `playerNames`, classes from `CharacterClass_N` (IDs mapped in
`data/classes.js`). Character count is whatever the save has, so never hard-code 10 or 11. `snapshot.characters[i]`
lines up with every `_i` save key. Class "best for" pills live in `CLASS_BEST_FOR` in `data/classes.js`.

**Notifications**: each count has one source so every badge agrees. `utils/characterNotices.js` (character
Overview), `utils/masterclassNotices.js` (returns `{ masterclassId: { sectionId: count } }`, feeding the sidebar
badge and the masterclass/section nav badges), `utils/minibossNotices.js`. Sidebar badges are wired in
`sectionNotices` in `App.jsx`; in-page badges use the shared `.notice-badge` class in `global.css`.

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
