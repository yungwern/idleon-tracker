import { useState, useRef, useEffect, useCallback } from 'react'
import { CloudError, fetchCloudSave, refreshSession } from '../lib/idleonCloud'

// Kept in this browser only: which sign-in was used, the account id and the refresh token.
// The short-lived login token stays in memory.
const ACCOUNT_KEY = 'idleon_cloud_account'

// Coming back to the tab re-syncs if the last sync is older than this
const RESYNC_AFTER_MS = 2 * 60 * 1000

function loadAccount() {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY)
    const account = raw ? JSON.parse(raw) : null
    return account?.refreshToken && account?.uid ? account : null
  } catch {
    return null
  }
}

function saveAccount(account) {
  try {
    if (account) localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account))
    else localStorage.removeItem(ACCOUNT_KEY)
  } catch {
    // Storage unavailable: the login just won't survive a reload
  }
}

// Logged-in cloud save. onSave(rawExport) gets every fresh save; autoSync turns the on-load and
// on-tab-focus refresh on (App passes false while a pasted or test save is loaded).
export function useCloudSave(onSave, autoSync) {
  const [account, setAccount] = useState(loadAccount)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState(null)

  const sessionRef = useRef(null)
  const syncingRef = useRef(false)
  const lastSyncRef = useRef(0)
  const onSaveRef = useRef(onSave)
  useEffect(() => {
    onSaveRef.current = onSave
  })

  const signOut = useCallback(() => {
    sessionRef.current = null
    saveAccount(null)
    setAccount(null)
    setError(null)
  }, [])

  // A fresh login token, renewing it with the refresh token when it has run out
  async function getSession(current) {
    const session = sessionRef.current
    if (session && session.uid === current.uid && Date.now() < session.expiresAt) return session
    const renewed = await refreshSession(current)
    sessionRef.current = renewed
    // Google can hand back a new refresh token; keep the stored one current
    if (renewed.refreshToken && renewed.refreshToken !== current.refreshToken) {
      const next = { ...current, refreshToken: renewed.refreshToken }
      saveAccount(next)
      setAccount(next)
    }
    return renewed
  }

  const sync = useCallback(async (current = loadAccount()) => {
    if (!current || syncingRef.current) return
    syncingRef.current = true
    setSyncing(true)
    setError(null)
    try {
      let session = await getSession(current)
      let raw
      try {
        raw = await fetchCloudSave(session)
      } catch (err) {
        // Token rejected early (clock skew, revoked): renew once and retry
        if (!err.expired) throw err
        sessionRef.current = null
        session = await getSession(current)
        raw = await fetchCloudSave(session)
      }
      onSaveRef.current(raw)
      lastSyncRef.current = Date.now()
    } catch (err) {
      if (err instanceof CloudError && err.expired) signOut()
      setError(err.message || 'Cloud sync failed.')
    } finally {
      syncingRef.current = false
      setSyncing(false)
    }
  }, [signOut])

  // Called by the login forms with the session a sign-in returned
  const completeSignIn = useCallback(async session => {
    const next = {
      provider: session.provider,
      uid: session.uid,
      refreshToken: session.refreshToken,
    }
    sessionRef.current = session
    saveAccount(next)
    setAccount(next)
    await sync(next)
  }, [sync])

  // Sync on load, and again when the player comes back to the tab
  useEffect(() => {
    if (!autoSync || !account) return undefined
    if (Date.now() - lastSyncRef.current > RESYNC_AFTER_MS) sync(account)
    function handleVisible() {
      if (document.visibilityState === 'visible' && Date.now() - lastSyncRef.current > RESYNC_AFTER_MS) {
        sync(account)
      }
    }
    document.addEventListener('visibilitychange', handleVisible)
    return () => document.removeEventListener('visibilitychange', handleVisible)
  }, [autoSync, account, sync])

  return {
    account,
    syncing,
    error,
    sync: () => sync(account),
    completeSignIn,
    signOut,
  }
}
