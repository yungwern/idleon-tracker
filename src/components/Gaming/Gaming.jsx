import { useState } from 'react'
import InfoPanel from '../InfoPanel/InfoPanel'
import { useNow } from '../../hooks/useNow'
import { getBitMulti, getGamingSummary, getFertilizer } from '../../utils/gamingBonusUtils'
import { formatBits, getBitsImage, formatGamingNumber } from '../../utils/gamingUtils'
import BitMultiPanel from './BitMultiPanel'
import BitSpendingPanel from './BitSpendingPanel'
import ImportsTab from './ImportsTab'
import SuperbitsTab from './SuperbitsTab'
import MutationsTab from './MutationsTab'
import LogBookTab from './LogBookTab'
import PaletteTab from './PaletteTab'

import './Gaming.css'

// Gaming (World 5): account tiles + bit multi / bits spent elsewhere dropdowns, then one tab per part of the
// garden. Math → utils/gamingUtils.js (Gaming only) and utils/gamingBonusUtils.js (reads other systems).

const TABS = [
  { id: 'imports', label: 'Imports' },
  { id: 'superbits', label: 'Superbits' },
  { id: 'mutations', label: 'Mutations' },
  { id: 'logbook', label: 'Log Book' },
  { id: 'palette', label: 'Palette' },
]

export default function Gaming({ snapshot, tomePoints }) {
  const [activeTab, setActiveTab] = useState('imports')
  const now = useNow()

  if (!snapshot?.gaming?.fertilizerLevels) {
    return (
      <div className="page">
        <h2 className="page-title">Gaming</h2>
        <p className="page-empty">No Gaming data. Import (or re-import) a save to see your garden.</p>
      </div>
    )
  }
  if (!(snapshot.gaming.bits > 0)) {
    return (
      <div className="page">
        <h2 className="page-title">Gaming</h2>
        <p className="page-empty">This account hasn't started Gaming yet (World 5).</p>
      </div>
    )
  }

  const summary = getGamingSummary(snapshot, now)
  const bitMulti = getBitMulti(snapshot)
  const [fertValue, fertSpeed, fertCapacity] = getFertilizer(snapshot)
  const nextLevel = upgrade => (
    <span className="gaming-tip-cost">
      Next LV: {formatBits(upgrade.cost)}
      <img
        className="gaming-bits-icon"
        src={getBitsImage(upgrade.cost)}
        alt="bits"
      />
    </span>
  )
  const tiles = [
    {
      label: 'Bits',
      value: formatBits(summary.bits),
      icon: getBitsImage(summary.bits),
      iconAfter: true,
      tip: `${formatGamingNumber(summary.bits)} bits. The game shows bits in tiers of 1e18, each with its own sprite.`,
    },
    {
      label: 'Bit Multi',
      value: `${formatGamingNumber(bitMulti.total)}x`,
      tip: 'Every bit multiplier together. Open Bit Multi Sources below for each one, and the ones you\'re still missing.',
    },
    {
      label: 'Sprout Value',
      value: `LV ${formatGamingNumber(fertValue.level)}`,
      icon: 'images/gaming/FertValue.png',
      tip: (
        <>
          Fertilizer: plants are worth {formatBits(fertValue.bits)}
          <img
            className="gaming-bits-icon"
            src={getBitsImage(fertValue.bits)}
            alt="bits"
          />
          {' '}before multipliers.
          {nextLevel(fertValue)}
        </>
      ),
    },
    {
      label: 'Sprout Speed',
      value: `LV ${formatGamingNumber(fertSpeed.level)}`,
      icon: 'images/gaming/FertSpeed.png',
      tip: (
        <>
          Fertilizer: a sprout grows every {fertSpeed.text}, with every speed bonus and the Kitsune Rock.
          {nextLevel(fertSpeed)}
        </>
      ),
    },
    {
      label: 'Sprout Capacity',
      value: summary.sproutCapacity,
      icon: 'images/gaming/FertCapacity.png',
      tip: (
        <>
          Sprouts your garden holds at once (Sprout Capacity fertilizer LV {fertCapacity.level} + gem shop, max 24).
          {summary.sproutCapacity < 24 && nextLevel(fertCapacity)}
        </>
      ),
    },
    {
      label: 'Envelopes',
      value: formatGamingNumber(summary.envelopes),
      icon: 'images/gaming/GamingEnvelope.png',
    },
    {
      label: 'Rat Tokens',
      value: formatGamingNumber(summary.ratTokens),
      icon: 'images/gaming/GamingRatCrown.png',
      tip: 'King Tokens, spent in the King Rat shop (Imports tab).',
    },
    summary.acorns !== null && {
      label: 'Acorns',
      value: formatGamingNumber(summary.acorns),
      icon: 'images/gaming/GamingItem2.png',
      tip: 'Acorns the Autumn Squirrel has found since your last visit, counting time since the save. Collect them to spend in the Acorn Shop.',
    },
    summary.kitsune && {
      label: 'Kitsune Roxie',
      value: summary.kitsune.on ? 'ON' : 'OFF',
      valueClass: summary.kitsune.on ? 'gaming-good' : 'gaming-muted',
      icon: 'images/gaming/GamingItem4.png',
      tip: `Kitsune Rock ON: plants grow ${formatGamingNumber(summary.kitsune.speed)}x faster but all give 3x less bits. Tap the rock in game to switch it (only while every plant is picked).`,
    },
  ].filter(Boolean)

  return (
    <div className="page">
      <h2 className="page-title">Gaming</h2>
      <InfoPanel
        intro="Your World 5 Gaming garden: bits, imports, superbits, mutations, the Log Book and the palette."
        items={[
          'Bit Multi Sources: every multiplier on bits and which ones you don\'t have yet. Spend Bits Elsewhere: things outside Gaming that cost bits.',
          'Hover a tile for more. The fertilizer tiles show what the next LV costs.',
          'Imports: each garden import with its timers and shops, plus the Immortal Snail odds for each encouragement.',
          'Superbits, Mutations and Log Book: what\'s owned, what\'s next and what it costs.',
          'Palette: every colour on the board, your selected slots, Palette Luck, and which colours level fastest.',
        ]}
      />

      <div className="gaming-summary">
        {tiles.map(tile => (
          <div
            key={tile.label}
            className={`gaming-stat${tile.tip ? ' tooltip-anchor' : ''}`}
          >
            {tile.icon && !tile.iconAfter && (
              <img
                className="gaming-stat-icon"
                src={tile.icon}
                alt=""
              />
            )}
            <span className={`gaming-stat-value${tile.valueClass ? ` ${tile.valueClass}` : ''}`}>{tile.value}</span>
            {tile.icon && tile.iconAfter && (
              <img
                className="gaming-stat-icon"
                src={tile.icon}
                alt=""
              />
            )}
            <span className="gaming-stat-label">{tile.label}{tile.tip && <span className="info-icon" />}</span>
            {tile.tip && <span className="tooltip tooltip--wrap">{tile.tip}</span>}
          </div>
        ))}
      </div>

      <div className="gaming-panels">
        <BitMultiPanel bitMulti={bitMulti} />
        <BitSpendingPanel snapshot={snapshot} />
      </div>

      <div className="page-tabs gaming-tabs">
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

      {activeTab === 'imports' && (
        <ImportsTab
          snapshot={snapshot}
          now={now}
        />
      )}
      {activeTab === 'superbits' && <SuperbitsTab snapshot={snapshot} />}
      {activeTab === 'mutations' && <MutationsTab snapshot={snapshot} />}
      {activeTab === 'logbook' && <LogBookTab snapshot={snapshot} />}
      {activeTab === 'palette' && (
        <PaletteTab
          snapshot={snapshot}
          tomePoints={tomePoints}
        />
      )}
    </div>
  )
}
