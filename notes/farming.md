# Farming (World 6)

**farmingUtils.js**:
farmingUtils.js — Farming market costs, exotic rotation, land rank totals + optimizer
(ported from Toolbox parsers/world-6/farming.ts: per-plot goal scores in log space,
greedy over Toolbox's "all" goal; default spends only unspent points and never lowers a level,
Full Reset replans every point). Market costs include the Emperor discount.
getCropEvolutionBreakdown = every crop evo multi (Toolbox getCropEvolution), each read
from its own system's utils; sources marked exact / partial (missing inner boosts) /
input (waits on a typed-in value, e.g. Crop Chapter needs Tome points) / missing.
All match Toolbox on Eli's save; lab mainframe parts read real connections (mainframeUtils).
Tome points are a per-browser input (see tomeUtils).
getCropPushOutlook (Crop Evolution tab) = odds/time to the next undiscovered crops (stops at
crop 330): one evo roll per plot per growth, chance 30% × decay^tier × plot multi (cap 100%),
fresh plants climb one tier per growth; walks each plot's tier odds growth by growth.
Medal growth is a fixed 7 h. Insta grows (FarmUpg[19] banked, +2/day per gem shop 139
purchase) = one extra roll each, all modelled on one plot (getInstaGrows); with Mass
Irrigation (talent 205) one insta grow rolls a whole column (rows of 9 → 4 plots).
Verdict (getPushVerdict): banked insta grows cover a 50% shot, else the last-roll wait.
Crop Evo reads Button slot 5 (not the slot 7 the name list calls "Crop Evo"; confirmed in game).
