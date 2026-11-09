# Character Card tabs (Food, Prayers, Skills)

**Food / Prayers tabs** (Character Card, components/CharacterCard/FoodTab.jsx + PrayersTab.jsx, math in utils/foodUtils.js):
food slots = snapshot.characters[i].food (EquipOrder_i[2] / EquipQTY_i[2], first 6). Unlocked = 2 + W3 merit 0 (2nd/4th buy) +
gem shop 59 (max 2), labels in foodMap.js foodSlotUnlocks. getFoodCarryCap = Toolbox getItemCapacity('cFood') (bag, vault 11, bundles
bon_w/x/y, gem 58, all-carry stamps, star sign Carry_Cap, guild Rucksack = snapshot.guildBonusLevels (export guildData only), star talent 634,
Pantheon shrine × Chizoar card, Gigafrog, Ram Pet Mart+, bribe 23, Zerg curse floor 0.4 × Ruck Sack); every setup = Toolbox on all 11 of
Eli's characters. Golden food stack factor = 0.05·L·(1 + L/2.14), L = log10(1 + qty): ratio of two = exact bonus change. Stacks persist after a
carry prayer comes off (Eli). prayerUtils getEffectivePrayer: no prayers + superbit 9 or 39 → 1/5 per superbit (9/39/53) of every levelled
prayer's bonus (not 5 Tachion), no curses (Toolbox getPrayerBonusAndCurse).

**Skills tab** (Character Card): in-game menu order (`getSkillMenuOrder`), EXP from Exp0_i / ExpReq0_i. Maestro hands
(`skillUtils getMaestroHandStatus`): last Maestro-line character (the Vman) gives other characters skill EXP/eff only in
skills where their LV is strictly lower (ties get nothing). Tracked for mining/chopping/fishing/catching/trapping/worship
(Eli; Smithing EXP also counts but is left out). Amber = lead ≤ `MAESTRO_LEAD_WARNING` (5). Notice on the Vman's card only (Eli: never tell other characters
to stop leveling). Mages (WIS) are skipped for Worship (`MAESTRO_HAND_SKIPS_MAGES`): their charge levels it fast, little loss.
