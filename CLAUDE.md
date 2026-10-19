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
│   ├── Section pages:  Anvil, Breeding, Construction, Cooking, Farming, GearOptimizer,
│   │                   MasterClasses, Minibosses, Obols, Shrines, Statues, Worship
│   └── Shared/sub:     CharacterCard, CogBoardMap, ImportModal, InfoPanel,
│                       ObolBoard (in Obols/), PremiumGear, TierList
├── data/               # Game data; index.js barrel file re-exports everything, grouped by world
│                       # sections.js = sidebar sections; statueWorlds lives in statueMap.js
├── hooks/              # useSaveImport.js
├── lib/                # extractSnapshot.js — parses raw save JSON
├── styles/             # global.css — shared layout classes and reusable components
└── utils/              # appUtils.js (toClassSlug, statueLevelColor, shrineLevelColor),
                        # talentUtils.js (super talent points for Overview notifications)

public/images/          # Game sprites — Vite serves public/ at the site root, so code uses /images/...
IdleOn Resources/       # Outside src/ — not shipped with the site
                        # raw-save.json — Eli's latest IdleOn Toolbox export ({ data, charNames, ... })
                        # items.json — every item (displayName, UQ1txt/UQ1val stats, rawName keys),
                        #   from the Morta1/IdleonToolbox GitHub repo's split data files
                        # More Toolbox data files get added here as needed — ask Eli for the one you need
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

**Image paths**: images live in `public/images/`. In JS/JSX write them **without** a leading slash
(`images/mobs/Penguin.png`) so they work both locally and under the GitHub Pages subpath. In CSS write
them **with** one (`url("/images/...")`) so Vite can prefix the base path at build time. Filenames are
case-sensitive on the live site even though Windows ignores case.

**Deployment**: pushing to `main` deploys to https://yungwern.github.io/idleon-tracker/ via
`.github/workflows/deploy.yml`. `vite.config.js` sets `base: '/idleon-tracker/'` for builds only.

**Adding new pages**: register the section in `data/sections.js` and wire up the component in `App.jsx`

**Data flow**: save file is parsed via `extractSnapshot.js` → stored in localStorage → loaded by `useSaveImport` hook → passed as props to components

**Characters come from the save**: names from `playerNames`, classes from `CharacterClass_N` (IDs mapped in
`data/classes.js`). Character count is whatever the save has, so never hard-code 10 or 11. `snapshot.characters[i]`
lines up with every `_i` save key. Class "best for" pills live in `CLASS_BEST_FOR` in `data/classes.js`.

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