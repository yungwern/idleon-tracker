# Breeding (World 4)

**Optimizers** (utils):
spiceOptimizer.js — Breeding > Spice Formations: forage model (Toolbox TotalTrekkingHR/REQ,
checked against real saves) + best gene-type formation per territory (owned types,
typical power, not specific pets); runs in spiceOptimizer.worker.js.
shinyPlanner.js — Breeding > Shiny Planner: getShinyRate (= Toolbox calcShinyLvMulti, matches
446,114/day on Eli's save) + getShinyPlan (fence = 3 copies each (Eli's choice, SHINY_COPIES_PER_SPECIES) of
the species with the cheapest next level; copies add evenly, levels cost ~1.7x each, OverLV +10% rate). Only fence type 5 pets
are shiny (snapshot.breeding.fenceShiny); pet upgrade levels = Breeding[2] (petUpgradeLevels).
Plan size = shinies in the fence; with none (emptyFence) it uses the fence yard's slots, getFenceSlots =
Toolbox 5 + Breeding[2][4] + 2 x gem shop 125 (max 27), and the page shows only the Put in list.
getShinyFencePlan = the plan without the 30-day outlook (cheap, for notices).
**Notice** (utils/breedingNotices.js, Settings type Breeding/shinySwap): swap ready = fenced species the plan takes out
(levelled past the plan or maxed). An empty fence isn't a notice. Sidebar badge, Shiny Planner tab badge, Home To do.

**Spice territories**: Pets[27+4i..] = team on territory i (Pets[0-26] fence, PetsStored = storage), each pet
[rawName, geneId, power]. Territory[i] = [bar progress, fills, ?, then 3 reward slots of (spice name | 'Blank', amount)]. The name
slot goes 'Blank' after a claim (0 fills), so unlocked = name set, or any progress/fills, or a team on it.
Territories can unlock out of order (16 open while 14 locked). A Converter keep also keeps the spices to claim, so a
batch can be claimed again (counted as ~2 claims per batch).
