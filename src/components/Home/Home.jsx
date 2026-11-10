import { useState } from 'react'
import { useNow } from '../../hooks/useNow'
import ImportPanel from '../ImportModal/ImportPanel.jsx'
import ResetTimers from './ResetTimers.jsx'
import VoteCard from './VoteCard.jsx'
import SettingsModal from './SettingsModal.jsx'
import AccountSummary from './AccountSummary.jsx'
import TodoPanel from './TodoPanel.jsx'
import { getBallotVoteEnd, getMeritocracyVoteEnd } from '../../utils/resetUtils'

// Home: where a new visit lands. Without a save it shows the import panel; with one, account-wide
// things that don't need their own page (account totals, reset timers, weekly votes, then To do last
// so a long list never pushes the rest down).
// The gear opens Settings. sectionNotices = App's sidebar badge counts; onOpenPage = sidebar navigation.
export default function Home({
  snapshot,
  importProps,
  settingsProps,
  sectionNotices,
  onOpenPage,
}) {
  const now = useNow()
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="page home-page">
      <div className="home-head">
        {/* Same brand as the sidebar, larger; the page is still called Home in the sidebar */}
        <h2 className="home-brand">
          <img
            className="home-brand-logo"
            src="images/brand/logo.png"
            alt=""
          />
          <span className="home-brand-text">
            <span className="home-brand-owner">YungWern's</span>
            <span className="home-brand-title">IdleOn Hub</span>
          </span>
        </h2>
        <button
          type="button"
          className="home-settings-btn"
          onClick={() => setShowSettings(true)}
        >
          <span className="home-settings-btn-icon">⚙</span>
          Settings
        </button>
      </div>

      {!snapshot && (
        <section className="home-card home-import">
          <h3 className="home-card-title">Get started</h3>
          <p className="home-card-desc">
            Log in with your IdleOn account or paste a save to see your characters and every page's numbers.
          </p>
          <ImportPanel
            onImport={importProps.onImport}
            onImportJson={importProps.onImportJson}
            cloud={importProps.cloud}
            importedAt={importProps.importedAt}
            cloudSavedAt={importProps.cloudSavedAt}
            isCloudSave={importProps.isCloudSave}
          />
        </section>
      )}

      {snapshot && (
        <AccountSummary snapshot={snapshot} />
      )}

      {snapshot && !settingsProps.tomePoints && (
        <div className="home-tome-reminder">
          <span>
            Add your Tome points in Settings: Farming, Spelunking, The Hole and Sneaking read lower without them.
          </span>
          <button
            type="button"
            className="home-tome-reminder-btn"
            onClick={() => setShowSettings(true)}
          >
            Open Settings
          </button>
        </div>
      )}

      <section className="home-section">
        <h3 className="home-section-title">Resets</h3>
        <ResetTimers
          snapshot={snapshot}
          now={now}
        />
      </section>

      <section className="home-section">
        <h3 className="home-section-title">Weekly votes</h3>
        <div className="home-votes">
          <VoteCard
            kind="ballot"
            snapshot={snapshot}
            endsAt={getBallotVoteEnd(now)}
            now={now}
          />
          <VoteCard
            kind="meritocracy"
            snapshot={snapshot}
            endsAt={getMeritocracyVoteEnd(now)}
            now={now}
          />
        </div>
      </section>

      {snapshot && (
        <section className="home-section">
          <h3 className="home-section-title">To do</h3>
          <TodoPanel
            snapshot={snapshot}
            obolCheckMode={settingsProps.obolCheckMode}
            sectionNotices={sectionNotices}
            onOpenPage={onOpenPage}
          />
        </section>
      )}

      {showSettings && (
        <SettingsModal
          {...settingsProps}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
