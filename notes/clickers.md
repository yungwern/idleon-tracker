# Clickers (Orion, Poppy, Bubba)

Bubba page tabs: Run Guide (static, bubbaMap.js; Megaflesh gifts card = BUBBA_MEGAFLESH_GIFTS, Eli: only Beeg Slice + Slabcakes are worth taking) / Megaflesh & Bonuses = MegafleshTab.jsx.

**Clickers** (sidebar group: Orion, Poppy, Bubba): Orion/Poppy pages = hero portrait + ClickerStats, Mega grid (hover text, last Mega
stacks: ×copies), 'rest-of-the-game' bonuses, upgrade cards (cost green when affordable). Shared panels in components/Clicker
(--clicker-color via .clicker--orion/poppy/bubba). Data = orionMap.js / poppyMap.js (IdleOn Resources/gen_clickers.py <Toolbox clone>:
owlData, poppyBonuses, poppyTarBonuses + Mega texts/bonus lines copied from Toolbox owl.ts / kangaroo.ts), BUBBA_MEGAFLESH / BUBBA_BONUSES
in bubbaMap.js. Save: snapshot.orion (OptLacc 253-264, levels 254+i, 262 = Megafeathers), snapshot.poppy (OptLacc 267-305, levels 268+i,
279 = Megafish, Tar Pit 297+i, fish/tar banks 288/305 added like the game does when the menu opens), snapshot.bubba (Bubba[1] levels,
[1][8] = Megaflesh, [1][3] = Bubba Boon). Math = orionUtils / poppyUtils / bubbaUtils + clickerUtils (Furry Friends legend 26 ×, Santas
Little Helper companion 51 ×). Rates, costs, bonuses and Mega multis all = Toolbox on Eli's save (Orion 643.5x, Poppy 239.25x, Bubba 10.2x).
Sprites 4x nearest-neighbor in images/orion, images/poppy, images/bubba (Bubba_<r> bonus icons); Mega art (Feaz/RooMG/BubbaMF) native
size. Poppy.png = Poppy cropped from Toolbox RooA (her fishing sprite). Not ported: Poppy reset bonuses/shiny multis, Bubba upgrades/meat rate.
