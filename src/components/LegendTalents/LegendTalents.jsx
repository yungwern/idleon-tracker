import { useState } from 'react'
import InfoPanel from '../InfoPanel/InfoPanel'
import LegendTalentBoard from './LegendTalentBoard'
import LegendTalentTierList from './LegendTalentTierList'
import LegendTalentDetail from './LegendTalentDetail'
import {
  getLegendTalentList,
  getLegendPointsOwned,
  getLegendPointsSpent,
} from '../../utils/legendTalentUtils'
import { getSuperTalentBonus } from '../../utils/talentUtils'
import { getTrimmedSlotSpeedMulti } from '../../utils/cogBoardUtils'
import { getGuaranteedCrystalMobs } from '../../utils/crystalMobUtils'
import { legendTalentMap } from '../../data'
import { getLegendTalentNoticeCount } from '../../utils/legendTalentNotices'

// Legend Talents (World 7). Tier List tab works without a save (it's a guide for anyone);
// Board tab is the in-game grid and needs one. Both share the info box below.
// See notes/legend-talents.md.

// $ values in talent texts that come from other systems. Without a save: Super Talent Points shows
// '+50+ LV' (50 base, more with Super Duper Talents), Inevitable Builder's total speed is at base max LV
// with no Nitrogen atom, and 6 O'Clock Crystals drops its "You currently get $" sentence.
const SUPER_TALENT_POINTS = 39
const INEVITABLE_BUILDER = 33
const SIX_OCLOCK_CRYSTALS = 37

function getLegendTalentDollars(snapshot, hasSave) {
  if (!hasSave) {
    return {
      [SUPER_TALENT_POINTS]: '50+',
      [INEVITABLE_BUILDER]: getTrimmedSlotSpeedMulti(null, legendTalentMap[INEVITABLE_BUILDER].maxLevel),
      [SIX_OCLOCK_CRYSTALS]: null,
    }
  }
  return {
    [SUPER_TALENT_POINTS]: getSuperTalentBonus(snapshot),
    [INEVITABLE_BUILDER]: getTrimmedSlotSpeedMulti(snapshot),
    [SIX_OCLOCK_CRYSTALS]: getGuaranteedCrystalMobs(snapshot),
  }
}

const TABS = [
  { id: 'tiers', label: 'Tier List' },
  { id: 'board', label: 'Board' },
]

export default function LegendTalents({ snapshot }) {
  const [tab, setTab] = useState('tiers')
  const [selectedIndex, setSelectedIndex] = useState(null)

  const hasSave = Boolean(snapshot?.legendTalents?.length)
  const talents = getLegendTalentList(hasSave ? snapshot : null, getLegendTalentDollars(snapshot, hasSave))
  const selected = talents.find(talent => talent.index === selectedIndex) ?? talents[0]
  const noticeCount = getLegendTalentNoticeCount(snapshot)

  return (
    <div className="page">
      <h2 className="page-title">Legend Talents</h2>
      <InfoPanel
        intro="World 7 Legend Talents: which ones are worth your points, and your own board. Their bonuses affect every character."
        items={[
          'Tier List is based on Pulse\'s Legend Talent Tier List (Bright Hollow), balanced around World 7 progression. Some talents may rank higher or lower for your account.',
          'Must buy talents cost 1 point each and are worth it right away. Each talent shows your LV, and maxed ones are faded so you can see what\'s left.',
          'Click a talent to see what it does and what can raise its max level. You get +1 Legend Point for every 100 Class LVs a character has past LV 400, plus a few account bonuses.',
        ]}
      />

      <div className="page-tabs legend-tabs">
        {TABS.map(entry => (
          <button
            key={entry.id}
            type="button"
            className={`page-tab-btn${tab === entry.id ? ' page-tab-btn--active' : ''}`}
            onClick={() => setTab(entry.id)}
          >
            {entry.label}
            {entry.id === 'board' && noticeCount > 0 && (
              <span className="notice-badge">{noticeCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="legend-card">
        {tab === 'tiers' && (
          <LegendTalentTierList
            talents={talents}
            hasSave={hasSave}
            selectedIndex={selected.index}
            onSelect={setSelectedIndex}
          />
        )}
        {tab === 'board' && hasSave && (
          <LegendTalentBoard
            talents={talents}
            points={{
              owned: getLegendPointsOwned(snapshot),
              spent: getLegendPointsSpent(snapshot.legendTalents),
            }}
            selectedIndex={selected.index}
            onSelect={setSelectedIndex}
          />
        )}
        {tab === 'board' && !hasSave && (
          <p className="page-empty">Import (or re-import) a save to see your Legend Talent board.</p>
        )}
        {(tab === 'tiers' || hasSave) && (
          <LegendTalentDetail
            talent={selected}
            hasSave={hasSave}
          />
        )}
      </div>
    </div>
  )
}
