# Hat Rack and The Cape Vine

**Hat Rack** (World 3, components/HatRack) / **The Cape Vine** (World 4, components/CapeVine): both render the shared
`PremiumCollection` (summary chips passed in, grouped Total Bonuses in two centered columns, All / Owned / Missing filter, item
cards; owned first, missing always last). Totals = utils/collectionUtils.js sumCollectionBonuses, grouped by its BONUS_GROUPS
(unlisted bonuses → Other); getBonusColumns: left = loot, damage, AFK, Other; right = Stats then Experience (Eli's layout).
Totals are shown rounded up like the game (ceil with a 1e-9 guard against float noise).
Hats on the rack = Spelunk[46] (snapshot.hatRack.hats); every rack-eligible hat = hatRackMap.js `premiumHats` (Toolbox
items.json PREMIUM_HELMET + aHelmetMTX, minus lvReqToCraft 69420). hatRackUtils: multi = 1 + (hats + Wild Boar companion 31 +
10 × event shop 30 + Minehead 21 + Sushi 36) / 100, each hat's base stats + UQ lines × multi (1.97x and every total = Toolbox on
Eli's save). Capes on the vine = Spelunk[54] (snapshot.capeVine.capes, vine order; Owned and All list them in that order); all
capes = capeVineMap.js `premiumCapes` (Lava Wings left out: dev-only cape). Cape Vine is new (Nov 1 2026), not in Toolbox.
Checked against Eli's in-game vine screen (all 15 totals match): only UQ lines count (the screen's base-stat rows equal the Hat
Rack's, not the capes'), Golden Vine slot = 100%, other slots = 25% (game text says 20%, but only 25% fits), all × Cape Vine
Bonus Multi = 1 + (capes on the vine + 10 if event shop 30) / 100 (1.28x on Eli's save; the +10 source is a guess that fits).
Golden Vines fill from the front of the vine. Count (capeVineUtils getGoldenVines, Eli) = 3 if the account owns Lovely Balloon
(EquipmentCape23, the pack cape: snapshot.capeVine.lovelyBalloon = on the vine or in Cards1) + floor(highest character LV / 500)
(6 on Eli's save, matches the game). Lovely Balloon = 20 Weapon Power, +250% Drop Rate (additive); card shows ? until
capes/EquipmentCape23.png exists.
Character Card Premium Gear: hat and cape cards show a "Bonus in Hat Rack / Cape Vine" link (CharacterCard onOpenSection)
instead of stats, since worn hats/capes give nothing.
