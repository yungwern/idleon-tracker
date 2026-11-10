import { useState } from 'react'
import InfoPanel from '../InfoPanel/InfoPanel'
import SneakingHeader from './SneakingHeader'
import InventoryTab from './InventoryTab'
import EmporiumTab from './EmporiumTab'
import KnowledgeTab from './KnowledgeTab'
import CharmsTab from './CharmsTab'
import GemstonesTab from './GemstonesTab'
import MasteryTab from './MasteryTab'
import DetectionTab from './DetectionTab'
import SetupsTab from './SetupsTab'

import './Sneaking.css'

// Sneaking (World 6): the header (Jade Coins, Ninja Mastery and other account numbers) stays on every tab.
// Data: snapshot.sneaking (extractSnapshot parseSneaking), math in utils/sneakingUtils.js. See notes/sneaking.md.

const TABS = [
  { id: 'inventory', label: 'Inventory' },
  { id: 'setups', label: 'Setups' },
  { id: 'detection', label: 'Detection' },
  { id: 'gemstones', label: 'Gemstones' },
  { id: 'charms', label: 'Pristine Charms' },
  { id: 'emporium', label: 'Jade Emporium' },
  { id: 'upgrades', label: 'Upgrades' },
  { id: 'mastery', label: 'Mastery' },
]

export default function Sneaking({ snapshot, tomePoints }) {
  const [activeTab, setActiveTab] = useState('inventory')
  if (!snapshot?.sneaking?.ninjas) {
    return (
      <div className="page">
        <h2 className="page-title">Sneaking</h2>
        <p className="page-empty">No sneaking data. Import (or re-import) a save to see your Ninja Twins.</p>
      </div>
    )
  }
  return (
    <div className="page sneaking-page">
      <h2 className="page-title">Sneaking</h2>
      <InfoPanel
        intro="Your World 6 Ninja Twins: what each one has equipped, your storage, and every Sneaking upgrade."
        items={[
          'Inventory: each ninja\'s hat, gloves/nunchaku/kunai and two charms, then your 39 storage slots. Slot colours are symbol levels (each LV = +50% to the charm in that slot). Hover a slot for its stats.',
          'Jade Emporium, Upgrades, Pristine Charms and Mastery: what you own and what\'s left.',
          'Gemstones: each bar fills toward the bonus at a full 10M counter, with breakpoints along the way.',
          'Detection: each ninja\'s stealth and detection on its floor. Click a ninja to see every stealth source, including the ones you don\'t have yet. The Stealth Chapter bubble needs your Tome points (Home > Settings).',
          'Setups: gear setups for door breaking, Funeral Flower pushes, item farming and EXP, with how many of each item you own.',
        ]}
      />
      <SneakingHeader snapshot={snapshot} />
      <div className="page-tabs sneaking-tabs">
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
      {activeTab === 'inventory' && <InventoryTab snapshot={snapshot} />}
      {activeTab === 'emporium' && <EmporiumTab snapshot={snapshot} />}
      {activeTab === 'upgrades' && <KnowledgeTab snapshot={snapshot} />}
      {activeTab === 'charms' && <CharmsTab snapshot={snapshot} />}
      {activeTab === 'gemstones' && <GemstonesTab snapshot={snapshot} />}
      {activeTab === 'mastery' && <MasteryTab snapshot={snapshot} />}
      {activeTab === 'detection' && (
        <DetectionTab
          snapshot={snapshot}
          tomePoints={tomePoints}
        />
      )}
      {activeTab === 'setups' && <SetupsTab snapshot={snapshot} />}
    </div>
  )
}
