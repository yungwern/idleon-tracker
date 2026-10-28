// ============================================================
// IDLEON CLOUD LOGIN
// Signs in to the game's own account system (Lavaflame's Firebase project "idlemmo") and reads the
// player's cloud save, the same way IdleOn Toolbox and Idleoneer do. Plain REST calls, no Firebase SDK.
// Passwords and Steam/Google proofs go straight to Steam, Google and the game's servers; this site only
// keeps the resulting refresh token (in localStorage, see useCloudSave).
// ============================================================

// Public web settings of the game's Firebase project (the same values the game itself ships)
const API_KEY = 'AIzaSyAU62kOE6xhSrFqoXQPv6_WHxYilmoUxDk'
const PROJECT_ID = 'idlemmo'
const RTDB_URL = 'https://idlemmo.firebaseio.com'
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`
const AUTH_URL = 'https://identitytoolkit.googleapis.com/v1/accounts'
const TOKEN_URL = 'https://securetoken.googleapis.com/v1/token'

// The game's Google client (a "TV / limited input" client, so its secret is not really secret)
const GOOGLE_CLIENT_ID = '267901585099-u6fjd75v6k9gefq7bcokcndv99riir5j'
const GOOGLE_CLIENT_SECRET = 'HzoZF-UKUNfFwBuz4vafwsaR'
export const GOOGLE_DEVICE_URL = 'https://www.google.com/device'

// Steam signs in through OpenID and returns to the game's page; the player pastes that page's address back
export const STEAM_RETURN_URL = 'https://www.legendsofidleon.com/steamsso/'
const STEAM_EXCHANGE_URL = 'https://us-central1-idlemmo.cloudfunctions.net/asil'

export const PROVIDER_LABELS = {
  steam: 'Steam',
  google: 'Google',
  email: 'Email',
}

// Error the UI can show as-is. `expired` = the saved login no longer works, so the player must sign in again
export class CloudError extends Error {
  constructor(message, { expired = false } = {}) {
    super(message)
    this.expired = expired
  }
}

async function request(url, options) {
  let res
  try {
    res = await fetch(url, { cache: 'no-store', credentials: 'omit', ...options })
  } catch {
    throw new CloudError("Couldn't reach the game's servers. Check your connection and try again.")
  }
  const text = await res.text()
  let body = null
  try {
    body = JSON.parse(text)
  } catch {
    body = { raw: text }
  }
  return { res, body }
}

function postJson(url, data) {
  return request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

function postForm(url, data) {
  return request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(data),
  })
}

// Account id from the login token itself (some sign-in replies leave out localId)
function uidFromToken(idToken) {
  try {
    const payload = idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const claims = JSON.parse(atob(payload))
    return claims.user_id ?? claims.sub ?? null
  } catch {
    return null
  }
}

// Turns any Firebase sign-in reply into the session shape the rest of the app uses
function toSession(body, provider) {
  const idToken = body.idToken ?? body.id_token
  const refreshToken = body.refreshToken ?? body.refresh_token
  const expiresIn = Number(body.expiresIn ?? body.expires_in ?? 3600)
  return {
    provider,
    uid: body.localId ?? body.user_id ?? uidFromToken(idToken),
    idToken,
    refreshToken,
    // Refresh a minute early so a request never goes out with a token that dies on the way
    expiresAt: Date.now() + (expiresIn - 60) * 1000,
  }
}

const AUTH_ERRORS = {
  INVALID_LOGIN_CREDENTIALS: 'Email or password is incorrect.',
  EMAIL_NOT_FOUND: 'Email or password is incorrect.',
  INVALID_PASSWORD: 'Email or password is incorrect.',
  INVALID_EMAIL: 'That email address doesn\'t look right.',
  USER_DISABLED: 'This IdleOn account has been disabled.',
  TOO_MANY_ATTEMPTS_TRY_LATER: 'Too many attempts. Wait a few minutes and try again.',
}

function authError(body, fallback) {
  const code = String(body?.error?.message ?? '').split(' ')[0]
  return new CloudError(AUTH_ERRORS[code] ?? `${fallback}${code ? ` (${code})` : ''}`)
}

// ── Steam ──────────────────────────────────────────────────

export function getSteamLoginUrl() {
  const ns = 'http://specs.openid.net/auth/2.0'
  const params = new URLSearchParams({
    'openid.ns': ns,
    'openid.claimed_id': `${ns}/identifier_select`,
    'openid.identity': `${ns}/identifier_select`,
    'openid.return_to': STEAM_RETURN_URL,
    'openid.realm': STEAM_RETURN_URL,
    'openid.mode': 'checkid_setup',
  })
  return `https://steamcommunity.com/openid/login?${params}`
}

export async function signInWithSteamUrl(pastedUrl) {
  const text = pastedUrl.trim()
  if (!text.startsWith(STEAM_RETURN_URL)) {
    throw new CloudError(`Paste the full address of the IdleOn page, starting with ${STEAM_RETURN_URL}`)
  }
  const params = new URL(text).searchParams
  if (params.get('openid.mode') === 'cancel') throw new CloudError('Steam sign-in was cancelled.')
  const claimedId = params.get('openid.claimed_id')?.match(/\/(\d+)$/)?.[1]
  if (!claimedId) throw new CloudError('That address is missing the Steam sign-in details. Copy the whole thing.')

  // The game's own login function swaps the Steam proof for a game login token
  const exchange = await postJson(STEAM_EXCHANGE_URL, {
    data: {
      claimedId,
      nonce: params.get('openid.response_nonce'),
      assocHandle: params.get('openid.assoc_handle'),
      sig: params.get('openid.sig'),
      signed: params.get('openid.signed'),
    },
  })
  const customToken = exchange.body?.result
  if (!exchange.res.ok || typeof customToken !== 'string' || !customToken) {
    throw new CloudError('That Steam sign-in link has expired or was already used. Sign in through Steam again and paste the new address.')
  }

  const { res, body } = await postJson(`${AUTH_URL}:signInWithCustomToken?key=${API_KEY}`, {
    token: customToken,
    returnSecureToken: true,
  })
  if (!res.ok || !body.idToken) throw authError(body, 'The game refused the Steam sign-in')
  return toSession(body, 'steam')
}

// ── Email ──────────────────────────────────────────────────

export async function signInWithEmail(email, password) {
  const { res, body } = await postJson(`${AUTH_URL}:signInWithPassword?key=${API_KEY}`, {
    email: email.trim(),
    password,
    returnSecureToken: true,
  })
  if (!res.ok || !body.idToken) throw authError(body, 'Email sign-in failed')
  return toSession(body, 'email')
}

// ── Google (device code: the player types a short code at google.com/device) ──

export async function startGoogleSignIn() {
  const { res, body } = await postForm('https://oauth2.googleapis.com/device/code', {
    client_id: GOOGLE_CLIENT_ID,
    scope: 'email profile',
  })
  if (!res.ok || !body.device_code) throw new CloudError("Couldn't get a sign-in code from Google. Try again.")
  return {
    userCode: body.user_code,
    deviceCode: body.device_code,
    verificationUrl: body.verification_url ?? GOOGLE_DEVICE_URL,
    intervalMs: Math.max(5, Number(body.interval) || 5) * 1000,
    expiresAt: Date.now() + (Number(body.expires_in) || 1800) * 1000,
  }
}

// Returns a session once the player approves, null while still waiting ({ slowDown } if Google asks to poll slower)
export async function pollGoogleSignIn(deviceCode) {
  const { body } = await postForm('https://oauth2.googleapis.com/token', {
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    device_code: deviceCode,
    grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
  })
  if (body?.error === 'authorization_pending') return null
  if (body?.error === 'slow_down') return { slowDown: true }
  if (body?.error === 'access_denied') throw new CloudError('Google sign-in was declined.')
  if (body?.error === 'expired_token') throw new CloudError('The Google code expired. Start again for a new one.')
  if (!body?.id_token) throw new CloudError('Google sign-in failed. Try again.')

  const { res, body: auth } = await postJson(`${AUTH_URL}:signInWithIdp?key=${API_KEY}`, {
    postBody: `id_token=${body.id_token}&providerId=google.com`,
    requestUri: window.location.origin,
    returnSecureToken: true,
  })
  if (!res.ok || !auth.idToken) throw authError(auth, 'The game refused the Google sign-in')
  return toSession(auth, 'google')
}

// ── Staying signed in ──────────────────────────────────────

const EXPIRED_CODES = ['TOKEN_EXPIRED', 'INVALID_REFRESH_TOKEN', 'USER_NOT_FOUND', 'USER_DISABLED']

export async function refreshSession({ provider, refreshToken }) {
  const { res, body } = await postForm(`${TOKEN_URL}?key=${API_KEY}`, {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })
  if (!res.ok || !body.id_token) {
    const code = String(body?.error?.message ?? '')
    if (res.status === 400 || EXPIRED_CODES.some(c => code.startsWith(c))) {
      throw new CloudError('Your IdleOn login has expired. Sign in again.', { expired: true })
    }
    throw new CloudError("Couldn't renew your IdleOn login. Try again in a moment.")
  }
  return toSession(body, provider)
}

// ── Reading the save ───────────────────────────────────────

// Firestore's REST API wraps every value in its type ({ stringValue }, { mapValue }...); unwrap to plain JSON
function fromFirestore(value) {
  if (value == null) return null
  if ('stringValue' in value) return value.stringValue
  if ('integerValue' in value) return Number(value.integerValue)
  if ('doubleValue' in value) return value.doubleValue
  if ('booleanValue' in value) return value.booleanValue
  if ('nullValue' in value) return null
  if ('timestampValue' in value) return value.timestampValue
  if ('arrayValue' in value) return (value.arrayValue.values ?? []).map(fromFirestore)
  if ('mapValue' in value) return fromFields(value.mapValue.fields)
  return null
}

function fromFields(fields = {}) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, fromFirestore(value)]))
}

// Returns the same { data, charNames, companion, serverVars } bundle as an IdleOn Toolbox export,
// so extractSnapshot reads it exactly like a pasted save
export async function fetchCloudSave({ uid, idToken }) {
  const id = encodeURIComponent(uid)
  const auth = { headers: { Authorization: `Bearer ${idToken}` } }
  const rtdb = path => request(`${RTDB_URL}/${path}/${id}.json?auth=${idToken}`)

  const [save, names, companion, vars] = await Promise.all([
    request(`${FIRESTORE_URL}/_data/${id}`, auth),
    rtdb('_uid'),
    rtdb('_comp'),
    request(`${FIRESTORE_URL}/_vars/_vars`, auth),
  ])

  if (save.res.status === 401) throw new CloudError('Your IdleOn login has expired. Sign in again.', { expired: true })
  if (save.res.status === 404) throw new CloudError('No cloud save found for this account. Log in to the game once so it saves to the cloud.')
  if (!save.res.ok || !save.body?.fields) {
    throw new CloudError(`Couldn't read your cloud save (HTTP ${save.res.status}). Try again in a moment.`)
  }

  // The extras are nice to have: the save still loads without them
  return {
    data: fromFields(save.body.fields),
    charNames: names.res.ok && Array.isArray(names.body) ? names.body : undefined,
    companion: companion.res.ok && companion.body && !companion.body.error ? companion.body : undefined,
    serverVars: vars.res.ok && vars.body?.fields ? fromFields(vars.body.fields) : undefined,
    cloudSavedAt: save.body.updateTime ?? null,
  }
}
