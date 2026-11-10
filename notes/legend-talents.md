# Legend Talents (World 7)

Page: `components/LegendTalents/LegendTalents.jsx` (sidebar World 7). Data: `data/legendTalentMap.js`.
Math: `utils/legendTalentUtils.js` (ported from Toolbox parsers/world-7/legendTalents.ts).

## Save layout
- `Spelunk[18][index]` = talent LV by talent index → `snapshot.legendTalents`.
- Grid order = `LEGEND_TALENT_ORDER` (Toolbox generalSpelunky[26]): position 0-9 = row 1, etc.
- **Icons are numbered by grid position, not talent index** (`LegendTalentIcon0.png` = Yellow I =
  Super Talent Points, talent 39). The map's `img` already points at the position icon.

## Rows
Yellow, Red, Brown, Green (match the Research grid "Legendary <colour> Fever" squares), White (row 5;
its talents are unlocked through the Menagerie, only 2 so far, the rest show as "?" slots like in game). The game labels a
talent "<Row> <spot>", e.g. "Super Talent Points (Yellow 1)".

## Max LV
base (`maxLevel` in the map) + Fever grid square LV (130 Yellow, 131 Red, 132 Brown, 152 Green; max 3
each, `snapshot.research.gridLevels`) + 3 if Menagerie unlock 19 is owned. Groups:
`LEGEND_TALENT_MAX_LEVEL_GROUPS` (Toolbox shared-data legendTalentMaxLevelGroups). Fever groups don't
line up with rows (Brown Fever also covers two Green-row talents).

## Points
Available = earned - spent. Spent = sum of all LVs. Earned (`getLegendPointsOwned`, breakdown in the
points tooltip): per character floor((class LV - 400) / 100), Clam Work bonuses 1 and 4, companion 37
(x10), gem shop item 42, Obsidian artifact (max 6), event shop 32 (x2), sushi unique 19.
Matched the game on Eli's save (181 earned - 174 spent = 7 available).

## Text placeholders
`{` bonus, `}` multi, `$` talent-specific. The page passes the `$` values that need other systems
(`getLegendTalentDollars` in LegendTalents.jsx; passing them in avoids import loops):
- 39: LVs per super talent point, talentUtils `getSuperTalentBonus`
- 33: total trimmed slot speed, cogBoardUtils `getTrimmedSlotSpeedMulti` ((3 + Nitrogen atom 6 LV × 15%) × talent multi)
- 37: daily guaranteed crystal mobs, crystalMobUtils `getGuaranteedCrystalMobs`
Both matched Toolbox on Eli's save (65.55x, 412). No save: texts use base max LV, 39 shows "+50+", 33 has no
Nitrogen, and 37's "You currently get $" sentence is dropped (`dollar = null`).

## Tabs
`LegendTalents.jsx` holds the tab + selected talent; `LegendTalentTierList.jsx` (default tab, works with no
save), `LegendTalentBoard.jsx` (in-game grid + points, needs a save), `LegendTalentDetail.jsx` (shared info box).

## Tier list
`LEGEND_TALENT_TIERS` in legendTalentMap.js, shown through the shared `TierList` component (getImageSrc,
getCaption, getItemClass, onItemClick props). Source: Pulse's Legend Talent Tier List (patch 12.03.2026 ver
1.1, Bright Hollow), balanced around W7 progression. Eli's changes: Must Buy row above S (Super Talent
Points, Shrine World Order Bill, May the Best Man Win: 1 point each); White talents (not on Pulse's list)
in A, since they're 6 points each for one minigame. Notes per talent: `LEGEND_TALENT_TIER_NOTES`
(Meritocracy depends on the vote). Tier colours: TIER LISTS block in global.css (`must` = #22d3ee).
With a save, items show LV/max and maxed ones fade.

## Notification
`utils/legendTalentNotices.js` `getLegendTalentNoticeCount`: sidebar badge (App sectionNotices) and the Board tab
badge. Count = available points, capped at LVs still left to buy (vs current max LV); 0 if either is 0.
