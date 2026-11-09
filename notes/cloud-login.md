# Cloud login

**Cloud login** (Import Save > Log In; Paste Save always stays): `lib/idleonCloud.js` signs in to the game's own Firebase
project (idlemmo) with plain REST, no Firebase SDK, the same way Toolbox/Idleoneer do. Steam = OpenID to
legendsofidleon.com/steamsso, player pastes that URL, game function `asil` returns a custom token → signInWithCustomToken
(reply has no localId: uid comes from the token's user_id claim, e.g. steam_…). Google = device code (google.com/device)
→ signInWithIdp. Email = signInWithPassword. Apple not built: needs our own server relay (Cloudflare Worker), like both
other sites use. Save = Firestore `_data/{uid}` + RTDB `_uid`/`_comp` + Firestore `_vars`, assembled into the same
`{ data, charNames, companion, serverVars }` bundle as a Toolbox export. `useCloudSave` keeps { provider, uid, refreshToken }
in localStorage (`idleon_cloud_account`), renews the 1 h token via securetoken, and auto-syncs on load and on tab focus
(2 min minimum) only while the loaded save's source is 'cloud'. Toolbox is GPL-3: reimplement, never copy its files.
