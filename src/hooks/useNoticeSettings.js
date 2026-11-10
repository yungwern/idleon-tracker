import { useState } from 'react'
import { getNoticeSettings, setNoticeSettings } from '../utils/noticeSettings.js'

// Notification on/off choices (Home > Settings). The store lives in utils/noticeSettings.js so the
// notice utils can read it; this hook re-renders App when it changes, so every badge updates at once.
export function useNoticeSettings() {
  const [noticeSettings, setState] = useState(getNoticeSettings)

  function update(section, change) {
    const prev = getNoticeSettings()
    const next = {
      ...prev,
      [section]: change(prev[section] ?? { off: false, hidden: [] }),
    }
    setNoticeSettings(next)
    setState(next)
  }

  // Section switch: off hides every type, on brings back the per-type picks
  function setSectionOn(section, on) {
    update(section, entry => ({ ...entry, off: !on }))
  }

  function setTypeOn(section, type, on) {
    update(section, entry => {
      const hidden = (entry.hidden ?? []).filter(id => id !== type)
      return { ...entry, hidden: on ? hidden : [...hidden, type] }
    })
  }

  function resetAll() {
    setNoticeSettings({})
    setState({})
  }

  return {
    noticeSettings,
    setSectionOn,
    setTypeOn,
    resetAll,
  }
}
