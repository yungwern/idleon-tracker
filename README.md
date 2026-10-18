# YungWern's IdleOn Hub

A personal React + Vite companion app for **Legends of IdleOn**. Paste in an exported save and it
shows character cards (talents, action bars, obols, to-dos) plus per-world trackers and guides.

## Live site

**https://yungwern.github.io/idleon-tracker/**. Every push to `main` rebuilds and redeploys it
automatically (see `.github/workflows/deploy.yml`, progress under the repo's **Actions** tab).
Each visitor imports their own save; it's stored only in their browser.

## Running it locally

```
npm install
npm run dev
```

To preview the production build exactly as GitHub Pages serves it: `npm run build && npm run preview`.

If hot reload stops working, clear Vite's cache: `rmdir /s /q node_modules\.vite` (Windows).

## Sections

| Area    | Pages                                    |
|---------|------------------------------------------|
| Global  | MasterClasses, Minibosses, Gear Optimizer |
| World 1 | Statues, Anvil                           |
| World 2 | Obols                                    |
| World 3 | Construction, Shrines, Worship           |
| World 4 | Cooking, Breeding                        |
| World 6 | Farming (Sneaking planned)               |

## How data flows

Save JSON → `src/lib/extractSnapshot.js` → localStorage → `useSaveImport` hook → props into each page.
Static game data lives in `src/data/` (re-exported from `src/data/index.js`).

## Adding a page

1. Add the name to `src/data/sections.js`.
2. Create `src/components/<Name>/<Name>.jsx` + `<Name>.css`.
3. Import it and add a line to `renderContent()` in `src/App.jsx`.

See `CLAUDE.md` for code conventions and `future-features.md` for the idea list.

## Credits

IdleOn and its art belong to Lavaflame2. Game data mappings referenced from IdleOn Toolbox.
