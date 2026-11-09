# Spelunking (World 7)

Files: components/Spelunking = Spelunking.jsx + LoreTab.jsx, RedJellyTab.jsx, ElixirTab.jsx.

**Lore, Elixirs, Red Jellyfish** (data/spelunkingMap.js):
Lore page reading (spelunkingReadLevels/Odds) is from Pulse's Lore Breakpoints guide (Eli's
screenshot), not Toolbox. Confirmed by Eli's in-game reads: read LV is continuous
(30 + log(pages/3,865,564)/log(1.4394), no cap at 30), × (1 + Chapter 4 bonus 4 %), and the
fraction is a chance at +1 LV. 8 daily reads (with Rift mastery) are shared by all chapters.
Lore tab = sub-tabs Page Reads (planner) / Breakpoints (chapter bonuses) / Red Jellyfish. Planner: equal stacks + all reads is always optimal; user picks reads/day + days.
Elixirs: spelunkingElixirMap (text/bonus from Toolbox generalSpelunky[16]/[17]; names and colors
are ours) + spelunkingElixirSetups (Eli's belt guide, per-delve explanations). Spelunk[7] = belt,
Spelunk[48] = memorized (matched his in-game picks). Max copies of one elixir = 1 + Duplicate
Elixirs LV. Fit/active checks: spelunkingUtils getElixirBelt / checkElixirSetup.
Red Jellyfish (W7 Menagerie, snapshot.spelunking.redJelly): Menagerie[2][7] unlocked, [0][6] days
rested, [4][c] pages tracked per chapter (never spent). READ = one normal read per chapter of its
whole tracked stack (checked with before/after saves) + a small uncounted +1-3 to each chapter's
bonus #1. Reading multi = floor(days^0.74) (Toolbox), always worse than reading daily.

**spelunkingUtils**: shop upgrade bonus/cost/descriptions,
cost discount (optional max Amber Hoard), amber tier, chapter bonuses, stamina regen, overstim
timer, Grand Discovery odds, tunnel discoveries; all match Toolbox on Eli's save. Spelunk[1]
has 15 tunnel slots, only 10 tunnels exist. Best Nova Blast tool only knows the 4 shop tools:
how Scepter/Mjolnir unlock isn't in Toolbox data), mineheadUtils, cavernUtils getGlunkoBonus.
spelunkingUtils getSpelunkingPow / getAmberGain = Toolbox getPower / getAmberGain (both
match on Eli's saves); amber's Tome lore bonus needs the typed-in Tome points (TOME_POINTS_KEY
in tomeUtils, entered in the Import Save modal). Their sources: menagerieUtils (unlocks/boosts),
clamWorkUtils, lootyUtils (Slab), breedingUtils getCrucibleBonus, gamingUtils MSA,
farmingUtils getCropDepotBonus, coralReefUtils getDancingCoralBonus, labUtils
getLabBonus (Slab Sovereignty / Depot Studies + jewel).
