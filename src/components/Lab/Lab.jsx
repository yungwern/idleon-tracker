import { useState } from 'react'
import InfoPanel from '../InfoPanel/InfoPanel'
import ConsoleTab from './ConsoleTab'
import ChipPlannerTab from './ChipPlannerTab'
import MainframeTab from './MainframeTab'
import { getMainframeNotices } from '../../utils/mainframeUtils'

import './Lab.css'

// Lab (World 4): page InfoPanel (PAGE_INFO) stays put; tabs with more detail get their own under the tabs. Console = every character's chips + storage, Chip Planner = best spread of every
// owned chip (utils/consoleOptimizer), Mainframe = bonuses, jewels and the map.

const TABS = [
  { id: 'console', label: 'Console' },
  { id: 'planner', label: 'Chip Planner' },
  { id: 'mainframe', label: 'Mainframe' },
]

// Page-wide info (always shown, like every other section), then a tab info panel under the tabs for the
// tabs that need more detail (TAB_INFO)
const PAGE_INFO = {
  intro: 'Your World 4 Lab: every character\'s console chips, a planner for where each chip should go, and the mainframe connections.',
  items: [
    'Console: every character\'s 7 chip slots like the in-game Console (slots open at Lab LV 5, 10, 15, 25, 35, 50 and 75) and Chip Storage with everything not equipped. Hover a chip for what it does and, for doubling chips, what it doubles on that character.',
    'Chip Planner: pick a role for each character and get the best spread of every chip you own. Green slots are chips to put on.',
    'Mainframe: which characters, bonuses and jewels are connected, with notices for Green Tube positioning, Viaduct of the Gods and unconnected bonuses.',
  ],
}

const TAB_INFO = {
  planner: [
    'Roles start from each character\'s AFK target; the ones you pick are saved in this browser. "Set all to" changes everyone but your Active character.',
    'Fighting and Skilling take their own chips first and fill leftover slots from the other side. Crystals is a Fighting setup that always gets a Chocolatey Chip. Active is your main: only one character can have it (picking another moves the old one to Fighting), and it gets first pick of every black and orange chip plus a Chocolatey Chip.',
    'Black and orange chips are stacked onto as few characters as possible: Active first, then Crystals, Fighting and Skilling characters (those already holding the most go first). Galvanic Nanochips then fill every free slot of Fighting characters one at a time, unless that would leave another Fighting character short of fighting chips; then they spread out.',
    'Extra copies of a stackable chip count less each, one-per-character chips never double up, and the Omega/Silkrode chips only count when the card, keychain or pendant they double is equipped. Equal choices keep the chips you already have on.',
  ],
  mainframe: [
    'Connections like the game works them out: the chain starts at the prism and links uploaded characters (AFK in the lab, or everyone with Arctis\' major bonus), each within its own line width of the prism or of a connected character. The map draws each character\'s closest link, so short line widths show the daisy chain you need. A bonus or owned jewel is on when a connected character is within its range (the faint circles).',
    'Green Tube gives Lab EXP to characters at or left of your rightmost Bubonic Conjuror. Line width counts every source: Lab LV, meals, Line Width cards, Pet Arena, chips, shiny pets, Purple Tube and Souped Up Tubes.',
  ],
}

export default function Lab({ snapshot }) {
  const [activeTab, setActiveTab] = useState('console')
  if (!snapshot?.lab) {
    return (
      <div className="page">
        <h2 className="page-title">Lab</h2>
        <p className="page-empty">No lab data. Import (or re-import) a save to see your Lab.</p>
      </div>
    )
  }
  const mainframeNotices = getMainframeNotices(snapshot).count
  return (
    <div className="page">
      <h2 className="page-title">Lab</h2>
      <InfoPanel
        intro={PAGE_INFO.intro}
        items={PAGE_INFO.items}
      />
      <div className="page-tabs lab-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`page-tab-btn${activeTab === tab.id ? ' page-tab-btn--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.id === 'mainframe' && mainframeNotices > 0 && (
              <span className="notice-badge">{mainframeNotices}</span>
            )}
          </button>
        ))}
      </div>
      {TAB_INFO[activeTab] && (
        <div className="lab-tab-info">
          <InfoPanel items={TAB_INFO[activeTab]} />
        </div>
      )}
      {activeTab === 'console' && <ConsoleTab snapshot={snapshot} />}
      {activeTab === 'planner' && <ChipPlannerTab snapshot={snapshot} />}
      {activeTab === 'mainframe' && <MainframeTab snapshot={snapshot} />}
    </div>
  )
}
