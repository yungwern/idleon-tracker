import { useState, useEffect, useRef } from 'react'
import {
  PROVIDER_LABELS,
  STEAM_RETURN_URL,
  getSteamLoginUrl,
  signInWithSteamUrl,
  signInWithEmail,
  startGoogleSignIn,
  pollGoogleSignIn,
} from '../../lib/idleonCloud'

const PROVIDERS = ['steam', 'google', 'email']

// Dev server only (vite.config.js devRawSaveWriter): writes the synced save to IdleOn Resources/raw-save.json
const DEV_RAW_SAVE_ENDPOINT = '/__dev/raw-save'

// "Log in" tab of the Import Save modal. `cloud` is the useCloudSave() object from App.
export default function CloudLogin({ cloud, cloudSavedAt, importedAt, isCloudSave }) {
  const [provider, setProvider] = useState('steam')
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState(null)
  const [devStatus, setDevStatus] = useState(null)

  // Dev only: sync, then save that fresh cloud save over IdleOn Resources/raw-save.json
  async function handleDevWrite() {
    setDevStatus(null)
    const raw = await cloud.sync()
    if (!raw) return
    try {
      const res = await fetch(DEV_RAW_SAVE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(raw),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`)
      setDevStatus({ ok: true, text: `Saved to IdleOn Resources/raw-save.json at ${new Date().toLocaleTimeString()}` })
    } catch (err) {
      setDevStatus({ ok: false, text: `Couldn't write raw-save.json: ${err.message}` })
    }
  }

  // Shared runner for the three sign-ins: shows progress, then hands the session to useCloudSave
  async function runSignIn(signIn) {
    setBusy(true)
    setFormError(null)
    try {
      const session = await signIn()
      if (session) await cloud.completeSignIn(session)
    } catch (err) {
      setFormError(err.message || 'Sign-in failed.')
    } finally {
      setBusy(false)
    }
  }

  if (cloud.account) {
    return (
      <div className="cloud-login">
        <div className="cloud-login-account">
          <div className="cloud-login-account-head">
            <span className="cloud-login-dot" />
            Signed in with {PROVIDER_LABELS[cloud.account.provider] ?? 'your IdleOn account'}
          </div>
          <div className="cloud-login-account-meta">
            {cloud.syncing
              ? 'Syncing your cloud save…'
              : isCloudSave
                ? <>Synced {importedAt}{cloudSavedAt && <> · game last saved {cloudSavedAt}</>}</>
                : 'A pasted save is loaded. Sync to switch back to your cloud save.'}
          </div>
          <p className="cloud-login-note">
            The hub syncs when you open it and when you come back to the tab. The game uploads your save
            every few minutes while you play.
          </p>
          <div className="cloud-login-buttons">
            <button className="modal-import" onClick={cloud.sync} disabled={cloud.syncing}>
              {cloud.syncing ? 'Syncing…' : '🔄 Sync now'}
            </button>
            <button className="modal-cancel" onClick={cloud.signOut}>Sign out</button>
          </div>
          {import.meta.env.DEV && (
            <>
              <button className="modal-dev-load" onClick={handleDevWrite} disabled={cloud.syncing}>
                🧪 Sync and save to IdleOn Resources/raw-save.json (dev only)
              </button>
              {devStatus && (
                <div className={`modal-dev-status${devStatus.ok ? '' : ' modal-dev-status--error'}`}>
                  {devStatus.text}
                </div>
              )}
            </>
          )}
        </div>
        {cloud.error && <div className="modal-error">{cloud.error}</div>}
      </div>
    )
  }

  return (
    <div className="cloud-login">
      <p className="modal-description">
        Sign in with the account you play IdleOn with and your save loads automatically, no copying needed.
        You sign in directly with Steam, Google or the game's servers; this site never sees your password.
        Your login stays in this browser only. Rather not? Use the Paste Save tab.
      </p>

      <div className="cloud-login-providers">
        {PROVIDERS.map(p => (
          <button
            key={p}
            className={`cloud-login-provider${provider === p ? ' cloud-login-provider--active' : ''}`}
            onClick={() => {
              setProvider(p)
              setFormError(null)
            }}
            disabled={busy}
          >
            <span
              className="provider-icon"
              data-provider={p}
            />
            {PROVIDER_LABELS[p]}
          </button>
        ))}
      </div>

      {provider === 'steam' && <SteamForm busy={busy} onSubmit={url => runSignIn(() => signInWithSteamUrl(url))} />}
      {provider === 'google' && <GoogleForm busy={busy} setBusy={setBusy} runSignIn={runSignIn} />}
      {provider === 'email' && <EmailForm busy={busy} onSubmit={(email, pw) => runSignIn(() => signInWithEmail(email, pw))} />}

      {(formError || cloud.error) && <div className="modal-error">{formError || cloud.error}</div>}
    </div>
  )
}

function SteamForm({ busy, onSubmit }) {
  const [url, setUrl] = useState('')

  return (
    <div className="cloud-login-form">
      <ol className="cloud-login-steps">
        <li>
          <button className="cloud-login-link-btn" onClick={() => window.open(getSteamLoginUrl(), '_blank', 'popup')}>
            Open Steam sign-in
          </button>{' '}
          and sign in on Steam's page.
        </li>
        <li>Steam sends you to a Legends of IdleOn page. Copy its full address from the address bar.</li>
        <li>Paste it here and log in.</li>
      </ol>
      <div className="modal-manual-warning">
        Don't click anything on the IdleOn page. Each sign-in link works only once.
      </div>
      <input
        className="cloud-login-input"
        placeholder={`${STEAM_RETURN_URL}?openid...`}
        value={url}
        onChange={e => setUrl(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && url.trim() && onSubmit(url)}
        autoComplete="off"
        spellCheck={false}
        disabled={busy}
      />
      <div className="cloud-login-buttons">
        <button className="modal-import" onClick={() => onSubmit(url)} disabled={busy || !url.trim()}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>
      </div>
    </div>
  )
}

function EmailForm({ busy, onSubmit }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const ready = email.trim() && password

  return (
    <div className="cloud-login-form">
      <p className="cloud-login-hint">Only for IdleOn accounts made with an email and password.</p>
      <input
        className="cloud-login-input"
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        autoComplete="username"
        disabled={busy}
      />
      <input
        className="cloud-login-input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && ready && onSubmit(email, password)}
        autoComplete="current-password"
        disabled={busy}
      />
      <div className="cloud-login-buttons">
        <button className="modal-import" onClick={() => onSubmit(email, password)} disabled={busy || !ready}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>
      </div>
    </div>
  )
}

function GoogleForm({ busy, setBusy, runSignIn }) {
  const [code, setCode] = useState(null)
  const [copied, setCopied] = useState(false)
  const cancelledRef = useRef(false)

  // Stop polling Google if the modal closes or the player switches provider
  useEffect(() => {
    cancelledRef.current = false
    return () => {
      cancelledRef.current = true
      setBusy(false)
    }
  }, [setBusy])

  function start() {
    cancelledRef.current = false
    runSignIn(async () => {
      const device = await startGoogleSignIn()
      setCode(device)
      let wait = device.intervalMs
      while (!cancelledRef.current && Date.now() < device.expiresAt) {
        await new Promise(resolve => setTimeout(resolve, wait))
        if (cancelledRef.current) break
        const result = await pollGoogleSignIn(device.deviceCode)
        if (result?.slowDown) wait += 5000
        else if (result) {
          setCode(null)
          return result
        }
      }
      setCode(null)
      if (cancelledRef.current) return null
      throw new Error('The Google code expired. Start again for a new one.')
    })
  }

  async function copyAndOpen() {
    window.open(code.verificationUrl, '_blank', 'noopener,noreferrer')
    try {
      await navigator.clipboard.writeText(code.userCode)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  if (!code) {
    return (
      <div className="cloud-login-form">
        <p className="cloud-login-hint">
          You'll get a short code to enter on Google's own sign-in page, then this page finishes on its own.
        </p>
        <div className="cloud-login-buttons">
          <button className="modal-import" onClick={start} disabled={busy}>
            {busy ? 'Getting a code…' : 'Get sign-in code'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="cloud-login-form">
      <p className="cloud-login-hint">
        Go to <a className="cloud-login-anchor" href={code.verificationUrl} target="_blank" rel="noreferrer">{code.verificationUrl}</a>{' '}
        and enter this code:
      </p>
      <div className="cloud-login-code">{code.userCode}</div>
      <div className="cloud-login-buttons">
        <button className="modal-import" onClick={copyAndOpen}>Copy code and open Google</button>
        <button className="modal-cancel" onClick={() => { cancelledRef.current = true }}>Cancel</button>
      </div>
      <p className="cloud-login-hint">
        {copied ? 'Code copied. ' : ''}Waiting for you to approve on Google…
      </p>
    </div>
  )
}
