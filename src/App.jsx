import { useState, useMemo } from 'react'
import { toClassSlug } from './utils/appUtils.js'
import { getCharacterNotices } from './utils/characterNotices.js'
import { getMasterclassNoticeCount } from './utils/masterclassNotices.js'
import { getMinibossNoticeCount } from './utils/minibossNotices.js'
import { sections, CLASS_BEST_FOR } from './data'
import { useSaveImport } from './hooks/useSaveImport.js'
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

import './App.css'
import './styles/global.css'

// ============================================================
// APP
// ============================================================
export default function App() {
  const [selected, setSelected] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const { snapshot, importFromText, clearSnapshot, importedAt } = useSaveImport()

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
      bestFor: CLASS_BEST_FOR[c.class] ?? [],
      nametag: nametagId !== 'Blank' ? { id: nametagId, equipped: true } : null,
      trophy:  trophyId  !== 'Blank' ? { id: trophyId,  equipped: true } : null,
      superTalentPresets: c.superTalentPresets ?? null,
      noticeCount: getCharacterNotices(c).count,
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
  }), [snapshot])

  function handleClearSave() {
    clearSnapshot()
    setSelected(null)
  }

  function renderContent() {
    if (character) return <CharacterCard character={character} charIndex={charIndex} snapshot={snapshot} />
    if (current === 'MasterClasses')  return <MasterClasses snapshot={snapshot} />
    if (current === 'Minibosses')     return <Minibosses snapshot={snapshot} />
    if (current === 'BiS Setups')     return <GearOptimizer snapshot={snapshot} />
    if (current === 'Statues')        return <Statues snapshot={snapshot} />
    if (current === 'Obols') return <Obols snapshot={snapshot} />
    if (current === 'Construction')   return <Construction snapshot={snapshot} />
    if (current === 'Shrines')        return <Shrines snapshot={snapshot} />
    if (current === 'Worship') return <Worship snapshot={snapshot} />
    if (current === 'Bubba') return <Bubba />
    if (current === 'Cooking') return <Cooking snapshot={snapshot} />
    if (current === 'Breeding') return <Breeding snapshot={snapshot} />
    if (current === 'Farming') return <Farming snapshot={snapshot} />
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
          onClose={() => setShowModal(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <div className="sidebar">
        <h1>⚔️ YungWern's IdleOn Hub</h1>

        {/* Save Import */}
        <div className="save-import">
          <button className="import-btn" onClick={() => setShowModal(true)}>
            📂 Import Save
          </button>
          <div className="import-status">
            {importedAt ? (
              <>
                <span className="import-timestamp">Last imported: {importedAt}</span>
                <button className="clear-btn" onClick={handleClearSave}>
                  🗑️ Delete Save
                </button>
              </>
            ) : (
              <span className="import-timestamp no-save">No save imported</span>
            )}
          </div>
        </div>

        {/* Character List */}
        <h2>Characters</h2>
        {mergedCharacters.length === 0 && (
          <p className="sidebar-empty">Import a save to see your characters</p>
        )}
        {mergedCharacters.map(c => (
          <button
            key={c.id}
            className={current === c.name ? 'active' : ''}
            data-class={toClassSlug(c.class)}
            onClick={() => setSelected(c.name)}
          >
            {c.name}
            <span className="sidebar-level">Lv {c.level || '?'}</span>
            {c.noticeCount > 0 && (
              <span
                className="sidebar-notice-badge"
                title={`${c.noticeCount} ${c.noticeCount === 1 ? 'notification' : 'notifications'} in Overview`}
              >
                {c.noticeCount}
              </span>
            )}
          </button>
        ))}

        {/* Other Sections */}
        {Object.entries(sections).map(([category, items]) => (
          <div key={category}>
            <h2>{category}</h2>
            {items.map(item => (
              <button
                key={item}
                className={current === item ? 'active' : ''}
                onClick={() => setSelected(item)}
              >
                {item}
                {sectionNotices[item] > 0 && (
                  <span
                    className="sidebar-notice-badge"
                    title={`${sectionNotices[item]} ${sectionNotices[item] === 1 ? 'notification' : 'notifications'}`}
                  >
                    {sectionNotices[item]}
                  </span>
                )}
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