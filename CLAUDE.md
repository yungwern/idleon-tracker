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
├── components/         # PascalCase folders, one per feature
│                       # ActionBars, Anvil, Breeding, CharacterCard, CogBoardMap,
│                       # Construction, Cooking, GearOptimizer, ImportModal, InfoPanel,
│                       # MasterClasses, MiniBosses, PremiumGear, Shrines, Statues,
│                       # TalentsTab, TierList, TodoList
├── data/               # Game data; index.js barrel file + statueWorlds.js for farming locations
├── hooks/              # useSaveImport.js
├── lib/                # extractSnapshot.js — parses raw save JSON
├── styles/             # global.css — shared layout classes and reusable components
└── utils/              # appUtils.js (toClassSlug, classColor), premiumGearUtils.js

IdleOn Resources/       # Outside src/ — save data copy + website-data.json
                        # website-data.json is a large game data mapping file from IdleOn Toolbox GitHub
                        # Reference for working out data mappings for new components
                        # Ask Eli to parse out the relevant section rather than loading the whole file
```

---

## Key Conventions

**CSS naming**: namespace all classes with a component prefix to avoid conflicts
- e.g. `shrine-preview-*`, `statue-preview-*`, `miniboss-*`
- Shared layout classes and reusable components live in `global.css` — adding to global is preferred where it makes sense so future components can reuse them

**CSS formatting**: multi-line format — each property on its own line

**CSS values**: `px` for sizing, hex codes for colors (e.g. `#c084fc`), class-based styling always — no inline styles

**Adding new pages**: register the section in `data/sections.js` and wire up the component in `App.jsx`

**Data flow**: save file is parsed via `extractSnapshot.js` → stored in localStorage → loaded by `useSaveImport` hook → passed as props to components

---

## Deeper Reference

If more detail is needed on a specific area, ask to search past conversations:

- **Statues page** (world data, MobChip, per-world colors, statue IDs) → search "statues farming location"
- **HMR / Vite setup** (polling config, single export rule) → search "HMR hot reload idleon"
- **Data refactor** (barrel file, extractSnapshot, characters/sections split) → search "data.js refactor idleon"
- **Component naming / CSS conflicts** (PascalCase rename, namespace prefixes) → search "shrines statues CSS conflict"
- **Image processing** (Python PIL cleanup for PNG assets) → search "boosts column row image processing"