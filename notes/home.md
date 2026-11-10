# Home

Landing page (`components/Home/`). A first visit lands here; after that App reopens the last page
(`idleon_last_page` in localStorage) and falls back to Home when that page is gone (a character from another save).
Sidebar: its own nav button above the Characters group (logo.png icon, never folded); the sidebar logo also goes Home.
Home is imported eagerly in App (not lazy) because it's the first page most visits see.
Page header is the sidebar brand at a larger size (64px logo + YungWern's / IdleOn Hub), not a "Home" title (Eli).

## Layout
Order (Eli): header with a divider line under it, account summary, Tome reminder, Resets, Weekly votes, To do last
(so a long To do list never pushes the rest off screen). Summary tiles are three per row, a short last row centred.
- **No save:** "Get started" card with `ImportModal/ImportPanel.jsx` (the same Log In / Paste Save body the Import modal uses).
- **Account summary** (`AccountSummary.jsx`, `utils/accountSummaryUtils.js`): icon + value tiles with no titles; the
  tooltip says what each number is (Eli). Characters; total level (tooltip: highest and lowest character); money =
  MoneyBANK + every Money_i shown as the three highest coin tiers (`getTopCoins`, each tier = 100 of the one below,
  Coins1-30 sprites in `public/images/coins/`), tooltip total in e-notation (1.78e58); colosseum tickets
  (`CYColosseumTickets` → `currencies.colosseumTickets`); arcade balls (OptLacc[74]), tooltip lists gold [75],
  super [324] (Toolbox "royal"; shown as Super balls, Eli) and omega [625] balls (`snapshot.arcade`). Eli may add more stats later.
- **Sidebar badge:** Home's badge = every character badge + every section badge (App `homeNoticeTotal`), i.e. the
  To do total.
- **Tome reminder:** amber line with an Open Settings button while Tome points are empty (save loaded only).
- **To do** (`TodoPanel.jsx`, `utils/homeTodo.js`): every active notification as readable lines, one card per page
  (characters first, then sections in sidebar order); clicking a card opens that page. Lines come from the same notice
  utils as the badges, and each card's count is App's own badge number, so they always agree and follow Settings.
  `minibossNotices getMinibossNotices` returns the ready bosses by name for this.
- **Resets** (`ResetTimers.jsx`, math in `utils/resetUtils.js`, from Toolbox components/dashboard/Etc.jsx Resets),
  in this order (Eli):
  - Daily = save's `TimeAway.GlobalTime + TimeAway.ShopRestock`, Weekly = that + `OptLacc[39]` days, both rolled
    forward on the clock (`snapshot.resets`, parseResets). Need a save; older snapshots say "Re-import save".
  - Server weekly = `(floor(now / week) + 1) * week` (Thursday 00:00 UTC, same for everyone). Its tooltip lists what it
    resets: Weekly Bosses, Lab Chips (jewel spinner + chip repo), Exotic Market. No icons or pills under it and no click-through:
    Eli wants all three tiles the same size and look.
  - The two vote timers are on the vote cards, not in this row.
  - Never show the chip / exotic market rotation itself, only timers (Eli).
- **Weekly votes** (`VoteCard.jsx`, `voteUtils getVoteSummary`): two equal cards side by side in the Resets tile style
  (Eli asked for a redo; rows with an inner bordered box looked off): header row = box sprite, grey vote name over the
  multi in the vote colour, countdown on the right (Ballot offset 197860 s, Meritocracy 543460 s); thin divider; this
  week's winning bonus large underneath with no inner box. Next week's options are on the Weekly Votes page.
  Bonus icons: `public/images/vote/VoteBon<i>.png`, `MeritBon<i>.png` (Toolbox data/ game sprites; MeritBon0 doesn't exist).
- Art in `public/images/home/`: daily/weekly/server-weekly are our own 16px pixel art in the logo palette, saved at 8x
  (generator: `IdleOn Resources/home-icons/make_icons.py <out_dir>`). Eli doesn't want art made by other fan sites
  (e.g. Toolbox's own etc/ icons), only game sprites or our own. vote-ballot.png = in-game ballot box (2x);
  meritocracy.png = in-game Meritocracy box, cut from Eli's game screenshot (4x) since no site hosts it.

## Settings popup (`SettingsModal.jsx`)
Gear button on Home opens it over the page (modal frame from ImportModal.css); closing it stays on Home.
- **Notifications:** `utils/noticeSettings.js` holds `NOTICE_SECTIONS` (sidebar section → notice types) and the stored
  choices `{ [section]: { off, hidden: [typeId] } }` (`idleon_notice_settings`). The section switch is separate from the
  per-type list, so turning a section back on restores the finer picks. Character types apply to every character.
  Every notice util calls `isNoticeOn(section, type)`, so sidebar, folded group totals and in-page badges/cards agree.
  `hooks/useNoticeSettings.js` re-renders App on change (it's in the sectionNotices memo deps).
  Turning off MasterClasses > outposts only zeroes the badges; the per-world outpost advice lines stay (Eli).
- **Inputs:** Obol roll check (also still on the Obols page) and Tome points (moved here from the Import modal).

## Adding things
- New notice kind: add it to `NOTICE_SECTIONS` and gate it with `isNoticeOn` in its util.
- New reset: add a tile in `getResetTiles`, or a label in an existing tile's `covers` (tooltip) if it resets at the same moment.
