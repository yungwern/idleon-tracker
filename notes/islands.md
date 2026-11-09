# Islands (World 2)

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
