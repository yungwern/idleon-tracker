# IdleOn Hub — Project Context

A React fan companion app for the idle game **IdleOn**. Reads a player's exported save file and displays character stats, talents, statues, shrines, minibosses, premium gear, and more in a clean dashboard UI.

---

## Stack & Environment

- **React + Vite** (Windows dev environment)
- **Plain CSS** per component — no CSS framework
- **HMR fix**: if hot reload stops working → `rmdir /s /q node_modules\.vite`
- **HMR rule**: one default export per `.jsx` file. All utilities/constants go in `.js` files.

---

## Feature notes

Each page/system has its own notes file in `notes/` (save layout, formulas, what matches Toolbox, Eli's decisions).
**Before changing a feature, read its notes file; after changing it, update that file.** Rules that apply everywhere stay here.

| Notes file | Covers |
|---|---|
| `notes/breeding.md` | Spice Formations + Shiny Planner optimizers, spice territories |
| `notes/character-card.md` | Food, Prayers and Skills tabs (carry cap, golden food, Maestro hands) |
| `notes/clickers.md` | Orion, Poppy, Bubba pages |
| `notes/cloud-login.md` | Steam/Google/email login, cloud save assembly |
| `notes/construction.md` | Cog board |
| `notes/death-note.md` | Death Note kill ranks and points |
| `notes/farming.md` | Market, land rank optimizer, crop evolution + push outlook |
| `notes/hat-rack-cape-vine.md` | Hat Rack and The Cape Vine (PremiumCollection) |
| `notes/hole.md` | The Hole: villagers, opal planner, every cavern panel |
| `notes/islands.md` | Islands (World 2) |
| `notes/lab.md` | Lab console, chip planner, mainframe connections |
| `notes/obols.md` | Obol roll check, boards, stats panel |
| `notes/printer-refinery.md` | Printer, print planner, Salt Materials, Refinery rank planner |
| `notes/royal-guardian.md` | Royal Guardian outposts optimizer and chips |
| `notes/shrines.md` | Shrine EXP, Golden Cheese simulator, sigils |
| `notes/sneaking.md` | Sneaking page: inventory/symbols, emporium, knowledge, charms, gemstones, mastery |
| `notes/spelunking.md` | Lore reads, elixirs, Red Jellyfish, spelunkingUtils |
| `notes/summoning.md` | Summoning stone bosses, doubler planner |
| `notes/talents.md` | Max possible / added talent levels |
| `notes/vote-ballot.md` | Meritocracy and Bonus Ballot multis |

---

## Project Structure

```
src/
├── components/         # One folder per feature (see casing note below)
│   ├── Section pages:  Breeding, Bubba, Orion, Poppy, Construction, Cooking, Farming, GearOptimizer, CapeVine, HatRack,
│   │                   Lab, Hole, Islands (one tab file per island), MasterClasses, Minibosses, Obols, Printer, Refinery,
│   │                   Shrines, Sneaking, Spelunking, Statues, Summoning, Worship (sub-tab files: see each notes file)
│   └── Shared/sub:     AnvilProduction (Overview tab), BuffsPanel, Clicker, PremiumCollection (Hat Rack + Cape Vine body),
│                       CharacterCard, CogBoardMap, ImportModal, InfoPanel, Keychains, ObolBoard (in Obols/), PremiumGear, TierList
├── data/               # Game data; index.js barrel file re-exports everything, grouped by world
│                       # sections.js = sidebar groups (empty ones hidden) + sectionIcons (sidebar sprite per section); statueWorlds + statueBases live in statueMap.js
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
│                       #   from Toolbox: grimoireMap, upgradeVaultMap, sushiMap, sneakingMap (gen_sneaking.py:
│                       #   ninja items, knowledge, emporium, gems, mastery, charms, door HP, floor difficulty; sneakingSetups.js is hand-written), mealMap (every meal: baseStat/stat),
│                       #   companionMap, tesseractMap, arcadeMap, jellyMap, meritMap, emperorMap, artifactMap, summoningMap, cavernsMap, zenithMap,
│                       #   starSignMap, researchMap (grid squares, observations, stickers), buttonMap,
│                       #   divinityMap (godMap by slot), gamingMap (paletteMap), spelunkingMap (shop upgrades with
│                       #   readable keys for Toolbox x1-x8, lore chapters, tunnel rocks/lore bosses, amber tiers),
│                       #   mineheadMap (opponent bonuses), cavernsMap glunkoUpgradeValues (Crystal Glunko Cove).
│                       # classes.js also has CLASS_TALENT_TABS (class lines) and CLASS_FAMILY_BONUSES.
│                       # Data files never import utils; computed tables (e.g. ribbonData) live in utils.
├── hooks/              # useTooltipPlacement.js (keeps every tooltip on screen), useSaveImport.js, useTomePoints.js (Tome points typed into the Import Save modal's
                        #   Manual Inputs, held in App and passed to pages; add new uses to TOME_POINTS_USES),
                        #   useCloudSave.js (logged-in cloud save, see notes/cloud-login.md)
├── lib/                # extractSnapshot.js — parses raw save JSON; idleonCloud.js — cloud login + save read
├── styles/             # global.css — shared layout classes and reusable components
└── utils/              # appUtils.js (toClassSlug, statueLevelColor, shrineLevelColor),
                        # talentUtils.js (super talent points for Overview notifications),
                        # cogBoardUtils.js (cog names, board border groups, big-number format),
                        # cookingUtils.js (ribbonMulti/ribbonTierClass from the game formula, max rank 25;
                        #   masteryNodeMulti for Cooking Mastery yellow nodes = snapshot.cooking.masteryNodes),
                        # *Notices.js (notification counts, see Notifications below)
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
                        #   researchUtils (grid, stickers), buttonUtils, labUtils (jewels + mainframe bonuses, on/off from mainframeUtils connections),
                        #   divinityUtils (minor link bonuses), familyUtils (family bonus walk), coralReefUtils,
                        #   prayerUtils (bonus/curse at PrayOwned level = snapshot.worship.prayerLevels; cards sort prayers by id, utility prayers 3 and 5 last),
                        #   gamingUtils (superbits, palette), spelunkingUtils (notes/spelunking.md), mineheadUtils,
                        #   cavernUtils getGlunkoBonus.
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
- **Tooltips**: always `.tooltip-anchor` + `.tooltip` (+ `.tooltip--wrap` for long text) from global.css. `hooks/useTooltipPlacement.js`
  (run once in App) places every hovered tooltip with `position: fixed` inside `.content`: nudged away from the sidebar and page edge,
  flipped below when there's no room above, and shown outside scroll boxes. So don't add per-page tooltip positioning
  (left/right/transform tweaks, edge variants, JS placement) or custom tooltip elements; if one still gets cut off, fix the hook.
- `global.css` `.dropdown-panel` = shared click-to-open `<details>` section.

**CSS formatting**: multi-line format — each property on its own line

**CSS values**: `px` for sizing, hex codes for colors (e.g. `#c084fc`), class-based styling always — no inline styles

**Pixel art sizing**: obol PNGs are 36px art saved at 4x (144px, nearest-neighbor) and shown with normal
smooth scaling, which keeps pixels even at any size and Windows display scaling. Don't use `pixelated` on
them (looks blocky), and never smooth-scale a small file up (looks fuzzy). New obol art: upscale to 144px first.

**Image paths**: images live in `public/images/`. In JS/JSX write them **without** a leading slash
(`images/mobs/Penguin.png`) so they work both locally and under the GitHub Pages subpath. In CSS write
them **with** one (`url("/images/...")`) so Vite can prefix the base path at build time. Filenames are
case-sensitive on the live site even though Windows ignores case.

**Page width**: the PAGE FRAME block in `global.css` caps `#root` at 1126px on purpose (Eli): pages are laid out for a
half-width browser next to the game, so wider windows just get side margins. It also sets the 18px root font (rem sizes)
and base `h2` style, and fixes the dark colours (`color-scheme: dark`) so nothing follows the OS light/dark setting.

**Deployment**: pushing to `main` deploys to https://yungwern.github.io/idleon-tracker/ via
`.github/workflows/deploy.yml`. `vite.config.js` sets `base: '/idleon-tracker/'` for builds only.

---

## Shared Components & Data Flow

**Buffs panel**: `BuffsPanel` (styles in global.css) is the centered unlocked/missing/unknown icon strip under the
InfoPanel — BiS Setups (Card Buffs) and Shrines use it. Pass `active: null` when the save can't tell.
Shrine building levels (Tower[18..26]) give the W7 Dancing Coral bonus past Lv 200 (`coral` in shrineMap.js).
Breeding uses it too (`breedingBuffMap` in breedingMap.js): W7 Menagerie unlock 11 (Menagerie[2][11]) raises max shiny
LV from 20 to 30. Menagerie unlock names/tooltips are Toolbox research.json [56]/[62]; icons are MenaIconO<N>.png.

**Sub tabs**: every in-page tab row uses `.page-tabs` / `.page-tabs--sub` from global.css (set `--tab-color`), Masterclasses included.

**Adding new pages**: register the section (and its sidebar icon in `sectionIcons`) in `data/sections.js` and wire up the component in `App.jsx`.
Section pages are lazy-loaded (`const X = lazy(() => import(...))`, rendered inside the `<Suspense>` in App) so the main bundle stays small.
Also add the page's CSS file(s) to the ordered page-CSS import block in `App.jsx` (before `App.css` / `global.css`): page CSS must keep
loading before global.css, because some page rules tie with global rules and global has to win.

**Data flow**: save file is parsed via `extractSnapshot.js` → stored in localStorage → loaded by `useSaveImport` hook → passed as props to components.
Snapshots carry `source`: 'paste', 'cloud' or 'dev' (Paste Save tab's dev-only "Load IdleOn Resources/raw-save.json" button).
Dev-only "Sync and save to raw-save.json" (Log In tab, signed in) POSTs the synced cloud bundle to `/__dev/raw-save`
(vite.config.js devRawSaveWriter), which overwrites raw-save.json but keeps guildData/tournament/accountCreateTime/extraData
from the old file (cloud has none of them, so those go stale until Eli re-exports from Toolbox). `savedFrom: 'cloud'` marks it.
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
Sidebar badges are wired in `sectionNotices` in `App.jsx`; in-page badges use the shared `.notice-badge` class in `global.css`.

**Line endings**: files use Windows CRLF. Keep them CRLF when editing so git diffs stay clean.

**Class colors/icons**: one place only, the CLASS THEMES block in `global.css`. Any element with
`data-class={toClassSlug(className)}` gets `--class-color` / `--class-icon`. Icons are grouped by family in
`public/images/class icons/<beginner|warrior|archer|mage>/`. Don't add JS color maps.

---

## Maintaining This File

Claude may add to or update this file when something would help future sessions (new conventions, file
locations, gotchas). Keep entries short, update existing lines instead of appending duplicates, and remove
anything that goes stale so the file stays compact. Feature-specific details go in that feature's `notes/` file
(add a row to the Feature notes table for a new one), not here.
