import { useState, useEffect } from 'react'

// Clock for countdowns (Home resets, vote timers): Date.now(), ticking every second while mounted
export function useNow() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}
