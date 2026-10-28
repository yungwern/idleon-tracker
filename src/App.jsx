import { useState, useMemo } from 'react'
import { toClassSlug } from './utils/appUtils.js'
import { getCharacterNotices } from './utils/characterNotices.js'
import { getMasterclassNoticeCount } from './utils/masterclassNotices.js'
import { getMinibossNoticeCount } from './utils/minibossNotices.js'
import { getObolNoticeCount } from './utils/obolNotices.js'
import { getClassRoles } from './utils/characterUtils.js'
import { sections, sectionIcons } from './data'
import { useSaveImport } from './hooks/useSaveImport.js'
import { useTomePoints } from './hooks/useTomePoints.js'
import { useObolCheckMode } from './hooks/useObolCheckMode.js'
import { useCollapsedGroups } from './hooks/useCollapsedGroups.js'
import { useCloudSave } from './hooks/useCloudSave.js'
import { PROVIDER_LABELS } from './lib/idleonCloud.js'
import ImportModal from './components/ImportModal/ImportModal.jsx'
import CharacterCard from './components/CharacterCard/CharacterCard.jsx'
import MasterClasses from './components/MasterClasses/MasterClasses.jsx'
import Minibosses from './components/Minibosses/minibosses.jsx'
import GearOptimizer from './components/GearOptimizer/GearOptimizer.jsx'
import Statues from './components/Statues/statues.jsx'
import Obols from './components/Obols/Obols.jsx'
import Construction from './components/Construction/Construction.jsx'
import Shrines from './components/Shrines/shrines.jsx'
import Worship from './components/Worship/Worship.jsx'
import Bubba from './components/Bubba/Bubba.jsx'
import Cooking from './components/Cooking/Cooking.jsx'
import Breeding from './components/Breeding/Breeding.jsx'
import Farming from './components/Farming/Farming.jsx'
import Spelunking from './components/Spelunking/Spelunking.jsx'

import './App.css'
import './styles/global.css'

// ============================================================
// APP
// ============================================================
export default function App() {
  const [selected, setSelected] = useState(null)
  // Opening a character from another page (e.g. Obols > Personal Boards) remounts its card on a tab.
  // Sidebar clicks keep the same visit, so the card keeps its current tab like before.
  const [characterVisit, setCharacterVisit] = useState({ id: 0, tab: 'overview' })
  const [showModal, setShowModal] = useState(false)
  const { snapshot, importFromJson, importFromText, clearSnapshot, importedAt, cloudSavedAt } = useSaveImport()
  const { tomePoints, setTomePoints } = useTomePoints()
  const { obolCheckMode, setObolCheckMode } = useObolCheckMode()
  const { isCollapsed, toggleGroup } = useCollapsedGroups()
  // Logged-in cloud save: auto-syncs only while the loaded save came from the cloud (or there is none),
  // so a pasted or test save is never overwritten behind the player's back
  const isCloudSave = snapshot?.source === 'cloud'
  const cloud = useCloudSave(raw => importFromJson(raw, 'cloud'), !snapshot || isCloudSave)

  // ── Characters come straight from the imported save (any account, any count) ──
  const mergedCharacters = (snapshot?.characters ?? []).map((c, i) => {
    const equipOrder = c.equipOrder ?? {}
    const nametagId = equipOrder['nametagSlot'] ?? 'Blank'   // adjust slot key as needed
    const trophyId  = equipOrder['trophySlot']  ?? 'Blank'   // adjust slot key as needed
    return {
      id:      `char${i + 1}`,
      name:    c.name,
      class:   c.class,
      level:   c.level,
      roles:   getClassRoles(c.class),
      nametag: nametagId !== 'Blank' ? { id: nametagId, equipped: true } : null,
      trophy:  trophyId  !== 'Blank' ? { id: trophyId,  equipped: true } : null,
      superTalentPresets: c.superTalentPresets ?? null,
      noticeCount: getCharacterNotices(c, obolCheckMode).count,
    }
  })

  // Default to the first character once a save is loaded
  const current = selected ?? mergedCharacters[0]?.name ?? null
  const charIndex = mergedCharacters.findIndex(c => c.name === current)
  const character = charIndex >= 0 ? mergedCharacters[charIndex] : null
  const sectionItems = Object.values(sections).flat()
  // Notification badges for section buttons (same style as the character badges)
  const sectionNotices = useMemo(() => ({
    MasterClasses: getMasterclassNoticeCount(snapshot),
    Minibosses: getMinibossNoticeCount(snapshot),
    Obols: getObolNoticeCount(snapshot, obolCheckMode),
  }), [snapshot, obolCheckMode])

  function handleClearSave() {
    cloud.signOut()
    clearSnapshot()
    setSelected(null)
  }

  const characterNoticeTotal = mergedCharacters.reduce((sum, c) => sum + c.noticeCount, 0)

  function renderNoticeBadge(count, where = '') {
    if (!(count > 0)) return null
    return (
      <span
        className="sidebar-notice-badge"
        title={`${count} ${count === 1 ? 'notification' : 'notifications'}${where}`}
      >
        {count}
      </span>
    )
  }

  // Click a group name to fold it; a folded group still shows its notification total
  function renderGroupHeader(group, noticeTotal) {
    const collapsed = isCollapsed(group)
    return (
      <button
        className={`sidebar-group-header${collapsed ? ' collapsed' : ''}`}
        onClick={() => toggleGroup(group)}
        aria-expanded={!collapsed}
      >
        <span className="sidebar-group-chevron">▾</span>
        <span className="sidebar-group-name">{group}</span>
        {collapsed && renderNoticeBadge(noticeTotal)}
      </button>
    )
  }

  function openCharacterTab(name, tab) {
    setSelected(name)
    setCharacterVisit(visit => ({ id: visit.id + 1, tab }))
  }

  function renderContent() {
    if (character) {
      return (
        <CharacterCard
          key={characterVisit.id}
          initialTab={characterVisit.tab}
          character={character}
          charIndex={charIndex}
          snapshot={snapshot}
          obolCheckMode={obolCheckMode}
        />
      )
    }
    if (current === 'MasterClasses')  return <MasterClasses snapshot={snapshot} />
    if (current === 'Minibosses')     return <Minibosses snapshot={snapshot} />
    if (current === 'BiS Setups')     return <GearOptimizer snapshot={snapshot} />
    if (current === 'Statues')        return <Statues snapshot={snapshot} />
    if (current === 'Obols') {
      return (
        <Obols
          snapshot={snapshot}
          obolCheckMode={obolCheckMode}
          onObolCheckModeChange={setObolCheckMode}
          onOpenCharacterObols={name => openCharacterTab(name, 'obols')}
        />
      )
    }
    if (current === 'Construction')   return <Construction snapshot={snapshot} />
    if (current === 'Shrines')        return <Shrines snapshot={snapshot} />
    if (current === 'Worship') return <Worship snapshot={snapshot} />
    if (current === 'Bubba') return <Bubba />
    if (current === 'Cooking') return <Cooking snapshot={snapshot} />
    if (current === 'Breeding') return <Breeding snapshot={snapshot} />
    if (current === 'Farming') return <Farming snapshot={snapshot} tomePoints={tomePoints} />
    if (current === 'Spelunking') return <Spelunking snapshot={snapshot} tomePoints={tomePoints} />
    if (!sectionItems.includes(current)) {
      return (
        <div className="page">
          <h2 className="page-title">Welcome to the IdleOn Hub</h2>
          <p className="page-empty">Import your save with the 📂 Import Save button to see your characters.</p>
        </div>
      )
    }
    return (
      <div className="page">
        <h2 className="page-title">{current}</h2>
        <p className="page-empty">Content for this section coming soon!</p>
      </div>
    )
  }

  return (
    <div className="app">

      {/* ── Import Modal (conditional) ── */}
      {showModal && (
        <ImportModal
          onImport={importFromText}
          onImportJson={importFromJson}
          hasSave={!!snapshot}
          cloud={cloud}
          importedAt={importedAt}
          cloudSavedAt={cloudSavedAt}
          isCloudSave={isCloudSave}
          tomePoints={tomePoints}
          onTomePointsChange={setTomePoints}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <div className="sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <img
            className="sidebar-brand-logo"
            src="images/brand/logo.png"
            alt=""
          />
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-owner">YungWern's</span>
            <span className="sidebar-brand-title">IdleOn Hub</span>
          </div>
        </div>

        {/* Save Import: one compact row of actions, status underneath */}
        <div className="save-import">
          <div className="save-actions">
            <button
              className="save-action-btn save-action-import"
              onClick={() => setShowModal(true)}
              title="Import a save or log in"
            >
              <span className="save-action-icon">📂</span>
              Import
            </button>
            {cloud.account && (
              <button
                className="save-action-btn save-action-sync"
                onClick={cloud.sync}
                disabled={cloud.syncing}
                title="Pull your latest save from your IdleOn account"
              >
                <span className="save-action-icon">{cloud.syncing ? '⏳' : '🔄'}</span>
                {cloud.syncing ? 'Syncing' : 'Sync'}
              </button>
            )}
            {importedAt && (
              <button
                className="save-action-btn save-action-delete"
                onClick={handleClearSave}
                title={cloud.account ? 'Delete save (also signs you out of your IdleOn account)' : 'Delete save'}
              >
                <span className="save-action-icon">🗑️</span>
                Delete
              </button>
            )}
          </div>
          <div className="import-status">
            {cloud.account && (
              <span className="import-cloud">
                <span
                  className="provider-icon"
                  data-provider={cloud.account.provider}
                />
                {PROVIDER_LABELS[cloud.account.provider]}{snapshot && !isCloudSave ? ' (paused)' : ''}
              </span>
            )}
            {importedAt ? (
              <span className="import-timestamp">
                {isCloudSave ? 'Synced' : 'Imported'} {importedAt}
              </span>
            ) : (
              <span className="import-timestamp import-timestamp-empty">No save imported</span>
            )}
            {cloud.error && <span className="import-error">{cloud.error}</span>}
          </div>
        </div>

        {/* Character List */}
        <div className="sidebar-group">
          {renderGroupHeader('Characters', characterNoticeTotal)}
          {!isCollapsed('Characters') && (
            <>
              {mergedCharacters.length === 0 && (
                <p className="sidebar-empty">Import a save to see your characters</p>
              )}
              {mergedCharacters.map(c => (
                <button
                  key={c.id}
                  className={`sidebar-nav-btn${current === c.name ? ' active' : ''}`}
                  data-class={toClassSlug(c.class)}
                  onClick={() => setSelected(c.name)}
                >
                  <span className="sidebar-nav-label">{c.name}</span>
                  {/* Notifications take the spot; with none left, show the level instead */}
                  {renderNoticeBadge(c.noticeCount, ' in Overview') ?? (
                    <span className="sidebar-level">Lv {c.level || '?'}</span>
                  )}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Other Sections (groups with nothing in them yet are hidden) */}
        {Object.entries(sections)
          .filter(([, items]) => items.length > 0)
          .map(([category, items]) => (
            <div key={category} className="sidebar-group">
              {renderGroupHeader(category, items.reduce((sum, item) => sum + (sectionNotices[item] ?? 0), 0))}
              {!isCollapsed(category) && items.map(item => (
                <button
                  key={item}
                  className={`sidebar-nav-btn${current === item ? ' active' : ''}`}
                  onClick={() => setSelected(item)}
                >
                  {sectionIcons[item] && (
                    <img
                      className="sidebar-nav-icon"
                      src={sectionIcons[item]}
                      alt=""
                    />
                  )}
                  <span className="sidebar-nav-label">{item}</span>
                  {renderNoticeBadge(sectionNotices[item])}
                </button>
              ))}
            </div>
          ))}
      </div>

      {/* ── Main Content ── */}
      <div className="content">
        {renderContent()}
      </div>
    </div>
  )
}
