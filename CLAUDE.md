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
│   ├── Section pages:  Breeding, Construction, Cooking, Farming, GearOptimizer,
│   │                   MasterClasses, Minibosses, Obols, Shrines, Statues, Worship
│   └── Shared/sub:     AnvilProduction (Overview tab; Anvil page removed), BuffsPanel, CharacterCard, CogBoardMap, ImportModal, InfoPanel,
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
│                       #   charms), mealMap (every meal: baseStat/stat).
├── hooks/              # useSaveImport.js
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
                        #   Full Reset replans every point). Not parsed yet: Emperor cost discount, Dank Ranks added
                        #   talent levels (Evo Boost % box calibrates).
                        #   getCropEvolutionBreakdown = every crop evo multi (Toolbox getCropEvolution), each read
                        #   from its own system's utils; sources marked exact / partial (missing inner boosts) /
                        #   missing. Still missing: summoning winner bonus, lamp, monument, Crop Chapter (tome
                        #   points), star sign, button, sticker.
                        # One util per game system, each returning plain numbers or { value, missing }:
                        #   alchemyUtils (bubbles, prisma, vials), stampUtils, cookingUtils (meals), breedingUtils
                        #   (shiny levels/passives), talentUtils (highest base level bonus), grimoireUtils,
                        #   upgradeVaultUtils, killroyUtils, sushiUtils, sneakingUtils (charms), riftUtils,
                        #   skillUtils (Lv0_i skill index map, skill rank), achievementUtils, voteUtils, mapUtils.
                        #   New bonus sources go in their system's util, never in the page that uses them.

public/images/          # Game sprites — Vite serves public/ at the site root, so code uses /images/...
                        # Data source of truth: the IdleonToolbox repo (github.com/Morta1/IdleonToolbox) —
                        #   data/website-data/*.json (items, cards, shared-data: chips, cardSets…). Eli
                        #   grabs PNGs from Toolbox (public/data/), so its ids match our image filenames.
                        #   Prefer it over the wiki; clone it shallow when you need data.
IdleOn Resources/       # Outside src/ — not shipped with the site
                        # raw-save.json — Eli's latest IdleOn Toolbox export ({ data, charNames, ... })
                        # make_obol_farm_thumbs.py — rebuilds public/images/obols/farm/ (40px farm-card
                        #   sprites); run `python make_obol_farm_thumbs.py ../public` after adding a farm mob
                        # items.json — every item (displayName, UQ1txt/UQ1val stats, rawName keys),
                        #   from the Morta1/IdleonToolbox GitHub repo's split data files
                        # More Toolbox data files get added here as needed — ask Eli for the one you need
                        # Game formulas (odds, bonuses) live in Toolbox's parsers/ folder on GitHub
                        #   (Morta1/IdleonToolbox), e.g. parsers/class-specific/royalGuardian.ts
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
Each game system has its own `parseX` in extractSnapshot (talents, alchemy, stamps, sneaking, grimoire, upgradeVault,
achievements, rift, killroy, sushi, voteBallot from the export's top-level serverVars). Snapshot shape changes only
show up after re-importing a save.

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
