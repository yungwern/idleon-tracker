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

const TAB_INFO = {
  bosses: {
    intro: 'Each essence colour has a summoning stone boss, fought at a stone on a regular map. Every kill multiplies most of that colour\'s summoning upgrades, but makes the next fight 4,000x tougher.',
    items: [
      'Bonus: a colour\'s stone-boosted summoning upgrades are multiplied by 1 + kills (6 kills = 7x). Hover the bonus to see what the next kill brings.',
      'HP is the boss\'s health on your next fight. Hover the ⓘ next to it for the fights after that.',
      'Found at: the map with the stone. Hover the mob next to it to see which mob lives on that map, to help find it in game.',
    ],
  },
  doublers: {
    intro: 'Summoning doublers (from the Gambit cavern) multiply one upgrade each. Push in the Damage setup; when you stall, swap to Essence Gain for a while, then swap back.',
    items: [
      'Doublers = the Gambit count from your save. Each doubler multiplies its upgrade by 2 + Absolute Stardom past 100%, plus Allstar.',
      'Damage fills in tiers: every damage and spike upgrade first, then every mana upgrade, then HP, then essence with whatever is left. Within a tier, the biggest gain comes first.',
      'Essence Gain: essence per hour of every colour, and cheaper upgrades (which helps every colour). Once nothing adds at least 1% essence, the rest follow the Damage tiers.',
      'Seeing Red, Hundredaire and Final Card only work part of the fight (noted on their row) but are ranked as if always on.',
      'Take off / Put on is what to change from your current placement. Re-import after moving them.',
      'Merciless Units, Unit Blood, Unit Obliteration and Glombolic Units are treated as their own multipliers (from the in-game text; Toolbox\'s formula differs or is missing them).',
    ],
  },
}

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
        intro={TAB_INFO[activeTab].intro}
        items={TAB_INFO[activeTab].items}
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
