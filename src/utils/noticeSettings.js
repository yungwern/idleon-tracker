// ── Notification settings ─────────────────────────────────────────────────────
// Which notifications the player turned off (Home > Settings). Every *Notices util asks isNoticeOn
// before counting or listing a notice, so the sidebar, folded group totals and in-page badges all
// drop it together. Character types apply to every character.
//
// Stored per browser as { [section]: { off: true|false, hidden: [typeId] } }. The section switch
// (`off`) is kept apart from the per-type list, so turning a section back on restores the finer picks.
// hooks/useNoticeSettings.js keeps React in step; settings only change on Home, so pages that memo
// their notices on [snapshot] still read fresh values when they next open.

export const NOTICE_SETTINGS_KEY = 'idleon_notice_settings'

// Sections are the sidebar names (sectionNotices in App.jsx). Add a type here when a notice util gets a new kind.
export const NOTICE_SECTIONS = [
  {
    id: 'Characters',
    icon: 'images/class icons/beginner/beginner.png',
    types: [
      { id: 'obolBonus', label: 'Obols missing their bonus' },
      { id: 'obolEmpty', label: 'Empty obol slots' },
      { id: 'superTalents', label: 'Unspent super talent points' },
      { id: 'maestroHands', label: 'Maestro hand bonus lost' },
    ],
  },
  {
    id: 'MasterClasses',
    types: [
      { id: 'outposts', label: 'Royal Guardian outposts to rearrange' },
      { id: 'resources', label: 'Resource Depots to reconnect' },
    ],
  },
  {
    id: 'Minibosses',
    types: [
      { id: 'spawns', label: 'Miniboss stacks ready' },
      { id: 'deathNote', label: 'Death Note mission to claim' },
    ],
  },
  {
    id: 'Obols',
    types: [
      { id: 'familyBonus', label: 'Family board obols missing their bonus' },
    ],
  },
  {
    id: 'Islands',
    types: [
      { id: 'bottles', label: 'Next island affordable' },
      { id: 'trash', label: 'Garbage Tuna buy affordable' },
      { id: 'rando', label: 'Rando upgrade affordable' },
      { id: 'crystal', label: 'Crystal Island near its cap' },
      { id: 'shimmerTrial', label: 'Weekly Shimmer Trial not done' },
      { id: 'shimmerShop', label: 'Shimmer upgrade affordable' },
    ],
  },
  {
    id: 'Lab',
    types: [
      { id: 'greenTube', label: 'Green Tube missing players' },
      { id: 'viaduct', label: 'Viaduct of the Gods connected' },
      { id: 'offBonuses', label: 'Mainframe bonuses not connected' },
    ],
  },
  {
    id: 'The Hole',
    types: [
      { id: 'bell', label: 'Bell: Ring or Ping is faster' },
      { id: 'harp', label: 'Harp strings off the best setup' },
    ],
  },
  {
    id: 'Legend Talents',
    types: [
      { id: 'points', label: 'Unspent legend talent points' },
    ],
  },
]

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(NOTICE_SETTINGS_KEY))
    return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {}
  } catch {
    return {}
  }
}

let current = loadSettings()

export function getNoticeSettings() {
  return current
}

export function setNoticeSettings(next) {
  current = next
  try {
    localStorage.setItem(NOTICE_SETTINGS_KEY, JSON.stringify(next))
  } catch {
    // Storage unavailable: the choice just won't persist
  }
}

export function isSectionNoticeOn(section, settings = current) {
  return !settings[section]?.off
}

export function isNoticeTypeHidden(section, type, settings = current) {
  return settings[section]?.hidden?.includes(type) ?? false
}

// The one check the notice utils use
export function isNoticeOn(section, type, settings = current) {
  return isSectionNoticeOn(section, settings) && !isNoticeTypeHidden(section, type, settings)
}
