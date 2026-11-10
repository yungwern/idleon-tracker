import { useState } from 'react'
import InfoPanel from '../InfoPanel/InfoPanel'
import NextVoteTab from './NextVoteTab'
import { voteTitles } from '../../data'

import './WeeklyVotes.css'

// Weekly Votes (Global): one tab per weekly vote, W2 Bonus Ballot and W7 Meritocracy.
// For now each tab shows next week's options; this week's winner is on Home.

const TABS = [
  { id: 'ballot', label: voteTitles.ballot },
  { id: 'meritocracy', label: voteTitles.meritocracy },
]

export default function WeeklyVotes({ snapshot, importedAt, cloudSavedAt }) {
  const [activeTab, setActiveTab] = useState('ballot')
  return (
    <div className="page">
      <h2 className="page-title">Weekly Votes</h2>
      <InfoPanel
        intro="The bonuses being voted on for next week. This week's winners are on Home."
        items={[
          'Bonus Ballot (World 2) and Meritocracy (World 7) each pick one bonus a week from three options.',
          'Vote shares are from when your save was pulled, so they can be out of date. Sync or re-import to refresh them.',
          'Each bonus is shown at your current multi, so it\'s what you would get if it won this week.',
        ]}
      />
      <div className="page-tabs weekly-votes-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            data-vote={tab.id}
            className={`page-tab-btn${activeTab === tab.id ? ' page-tab-btn--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <NextVoteTab
        key={activeTab}
        kind={activeTab}
        snapshot={snapshot}
        savedLabel={cloudSavedAt ?? importedAt}
      />
    </div>
  )
}
