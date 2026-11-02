import { useState } from 'react'
import InfoPanel from '../InfoPanel/InfoPanel'
import BossesTab from './BossesTab'
import DoublersTab from './DoublersTab'

import './Summoning.css'

// Summoning (World 6): one tab per part of the summoning system. Bosses = the 7 summoning stone bosses,
// Doublers = where to put Gambit summoning doublers for a Damage or Essence Gain setup.

const TABS = [
  { id: 'bosses', label: 'Bosses' },
  { id: 'doublers', label: 'Doublers' },
]

export default function Summoning({ snapshot }) {
  const [activeTab, setActiveTab] = useState('bosses')
  if (!snapshot?.summoning) {
    return (
      <div className="page">
        <h2 className="page-title">Summoning</h2>
        <p className="page-empty">No summoning data. Import (or re-import) a save to see your summoning.</p>
      </div>
    )
  }
  return (
    <div className="page">
      <h2 className="page-title">Summoning</h2>
      <InfoPanel
        intro="Your World 6 Summoning: the stone bosses and where to put your summoning doublers."
        items={[
          'Bosses: each essence colour has a stone boss on a regular map. Every kill multiplies most of that colour\'s summoning upgrades by 1 + kills, but makes the next fight 4,000x tougher. Hover the bonus for what the next kill brings, the ⓘ next to HP for the fights after that, and the mob next to the map name to see which mob lives there.',
          'Doublers: where to put your Gambit summoning doublers for a Damage push or for Essence Gain, and what to move from your current placement. Re-import after moving them.',
        ]}
      />
      <div className="page-tabs summoning-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`page-tab-btn${activeTab === tab.id ? ' page-tab-btn--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'bosses' && <BossesTab snapshot={snapshot} />}
      {activeTab === 'doublers' && <DoublersTab snapshot={snapshot} />}
    </div>
  )
}
