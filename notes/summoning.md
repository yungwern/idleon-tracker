# Summoning (World 6)

Files: components/Summoning = Summoning.jsx + BossesTab.jsx, DoublersTab.jsx.

**Summoning** (World 6, components/Summoning): tab row like Refinery (InfoPanel text per tab = TAB_INFO), tabs Bosses / Doublers. Bosses = 7 summoning stone
bosses (`summoningStoneBosses` in summoningMap.js: Toolbox summoningEnemies[106+i] + stone maps). Kills = KRbest SummzTrz<i> =
`snapshot.summoning.stoneKills`; next fight HP = 2 × baseHp × 4000^kills; colour upgrades × (1 + kills) (summoningUtils
getSummoningStoneBosses, matched IT on Eli's save). Stone art = public/images/summoning/SumStone_<i>.png (Toolbox etc/).
Doublers (DoublersTab.jsx, summoningUtils getDoublerPlans): count = cavernUtils getSummoningDoublers (Gambit points from Holes[11][65..70]
trial times × points multi, first gambit bonus + 10 from event shop 15; multi includes Measurement 13 (Death Note pts), 8.18x and
33 = Toolbox on Eli's save). Placed = Holes[28] (upgrade index, -1 empty) = snapshot.caverns.gambitDoublers. Doubler multi = 2 + max(0,
Absolute Stardom (talent 597) / 100 - 1) + Allstar (upgrade 78) % (3.33 on Eli's save, = Toolbox). Upgrade bonus = Summon[0] LV × qty ×
stone multi (summoningUpgrades in summoningMap.js, stoneBoosted = Toolbox filler). Planner fills tiers, greedy log gain inside
each (summoningDoublerModel; army DMG/HP = Toolbox getArmyDamage/Health, Merciless 51 / Unit Blood 50 stay in the shared pools: Eli
says doubling them does ~nothing; 74/81 own multipliers). Damage setup = one combat tier (damage, spikes, mana, Jeweled Cards;
score = ln mana regen + ln jeweled + ½ ln unit DMG + ½ ln spikes + ½ ln starting mana: output ≈ units summoned × damage) > HP (Eli:
always last) > essence. Jeweled Cards = raised chance, not sure even past 100% (Eli tested), valued as 1 + bonus/100 (estimate).
Essence setup = essence while a doubler adds 1% (Σ colours ln(knowledge × victories × summoning × Infinite Essence) + colours ×
ln(cost cuts)), then combat, then HP. Take off / Put on chips = icon only, name in a tooltip. Icons = public/images/summoning/upgrades/SumUpgIc<i>.png (Toolbox data/). Career wins per colour =
won enemies by mapEnemyData world (Pet* = white).
