# Shrines (World 3)

**Shrines** (World 3, components/Shrines, math in utils/shrineUtils.js = Toolbox shrines.ts getShrineExpBonus): each character adds
its own EXP/hr to every shrine it levels (same map, World Tour same world, or legend 38 anywhere): account multi (superbit 8, Moai
Head form %, construction mastery 15, ballot 19) × building (1 + 10% LV) × (1 + (Crystal Shrine where it applies + Post Office box 17
2nd bonus (POu_i) + Shrine Architect 639 + ShrineSpd vials + Golden Cheese)/100). Level req = floor(20 (L-1) + 6 L 1.63^(L-1)).
Golden Cheese simulator (Eli): toggle Your setup / Beanstalk only / No Golden Cheese + 'Simulate +N levels'; simulateShrineLevels
steps every shrine level up at once (Crystal LV ups speed the rest). 3,505,091/hr vs Toolbox 3,505,484 on Eli's save (RG Haungry
for Gold added levels). Cheese = ~99% of his shrine EXP (91x). Golden food multi = foodUtils getGoldenFoodMulti (Toolbox
getGoldenFoodMulti; Shimmeron × Warriors Rule for STR chars via getBubbleBonus mainStat, wows = Death Note maps + 3 extra, 107;
gear/obol Gold Food lines not read) = Toolbox to 0.001%. getGoldenFoodBonus adds the Beanstalk copy (Jade 1, Ninja[104] rank,
stack 1000 × 10^rank). Sigils: alchemyUtils getSigilBonus (refinery.sigilTiers × Chilled Yarn × Meritocracy 21).
