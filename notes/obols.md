# Obols (World 2)

**Obol roll check**: `passesObolCheck` in `Obols/ObolUtils.js` is the only obol check (Standard / Min/Max / BiS Setup,
each stricter than the last; rules in its comment). One mode value (`useObolCheckMode`, localStorage, held in App) feeds
character notices, the family board notice (`utils/obolNotices.js`, Obols sidebar badge) and board glow. Main stat
per class = `CLASS_MAIN_STATS` (classes.js) via `characterUtils getClassMainStat`; family board = STR in every mode,
same rules as a character (`getFamilyMainStat`, Eli: STR is strongest and you're active on RG). Obols with no UQ (`obolHasUq`) can't roll one, so in Min/Max
and BiS a positive main stat roll stands in for the UQ roll; every other rule still applies (Eli). Storage obols are never checked.
Saves hold negative rolls on stats an obol doesn't have (AGI -1 on a Silver Pop); the game ignores them, so every check and
tooltip uses `getEffectiveRolls(rawName, stoneData)` first. Only negatives on the obol's base stats (or its UQ) are real.
Obols > Example Boards has sub-tabs Family Boards (your board + one picked setup) / Personal Boards (one picked setup), each
with its notice on top. Setups = `familyBoards` / `characterBoards` in obolMap.js (add a { label, slots } entry, no UI work).
Personal notice chips open that character's Obols tab (App `openCharacterTab`: bumps a visit id = CharacterCard key + initialTab).
Obol boards draw the empty in-game board art (public/images/obols/board/character.png, family.png, 356x344, title bar cropped off)
with each obol centred on its socket: shapes in reading order = `CHAR_OBOL_SHAPES` / `FAMILY_OBOL_SHAPES` (obolMap.js),
socket positions = `obol-pos--char-N` / `fam-N` classes in ObolBoard.css (measured from the art). Board slots take reading
order; character saves convert with `CHAR_OBOL_SAVE_TO_DISPLAY` (Toolbox calculateWeirdObolIndex). Example `characterBoards`
are written in reading order (rows 5/4/3/4/5). Character Obols tab = board + `ObolStatsPanel` ("What it gives",
`getObolBoardStats`: per obol max(0, base + roll); UQ1/UQ2 ("MISC") bonuses × Silver Jellyfish = `getObolMiscMulti`, Menagerie[0][9].
In-game text says MISC; Toolbox applies it to WP/DEF instead). Obol PNGs draw at 72px on the board (2x art scale).
Family board (`ObolEqO1`/`ObolEqMAPz1`) save order = on-screen order. `ObolEqO2`/`ObolEqMAPz2` (3 slots) exist but are unknown.
