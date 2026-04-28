import { useState, useEffect } from 'react'
import './App.css'
import './styles/global.css'
import { characters, sections } from './data'
import { useSaveImport } from './hooks/useSaveImport.js'
import ImportModal from './components/ImportModal/ImportModal.jsx'
import TodoList from './components/TodoList/TodoList.jsx'
import PremiumGearTab from './components/PremiumGear/PremiumGear.jsx'
import { getPremiumGear } from './utils/premiumGearUtils.js'
import TalentsTab from './components/TalentsTab/TalentsTab.jsx'
import CharacterCard from './components/CharacterCard/CharacterCard.jsx'
import Statues from './components/Statues/Statues.jsx'
import Shrines from './components/Shrines/Shrines.jsx'
import Minibosses from './components/MiniBosses/MiniBosses.jsx'
import MasterClasses from './components/MasterClasses/MasterClasses.jsx'
import { toClassSlug, classColor } from './utils/appUtils.js'

// ============================================================
// APP
// ============================================================
export default function App() {
  const [selected, setSelected] = useState(characters[0]?.name || '')
  const [showModal, setShowModal] = useState(false)
  const { snapshot, importFromText, clearSnapshot, importedAt } = useSaveImport()

  // ── Merge imported levels into characters, falling back to data.js values ──
  const mergedCharacters = characters.map((c, i) => {
    const gear = snapshot ? getPremiumGear(snapshot, i) : {}
    return {
      ...c,
      level:   snapshot?.characters?.[i]?.level ?? c.level,
      nametag: gear.nametag?.equipped ? gear.nametag : c.nametag,
      trophy:  gear.trophy?.equipped  ? gear.trophy  : c.trophy,
      superTalentPresets: snapshot?.characters?.[i]?.superTalentPresets ?? null,
    }
  })

  const charIndex = mergedCharacters.findIndex(c => c.name === selected)
  const character = charIndex >= 0 ? mergedCharacters[charIndex] : null

  function renderContent() {
    if (character) return <CharacterCard character={character} charIndex={charIndex} snapshot={snapshot} />
    if (selected === 'Statues')       return <Statues snapshot={snapshot} />
    if (selected === 'Shrines')       return <Shrines snapshot={snapshot} />
    if (selected === 'Minibosses')    return <Minibosses snapshot={snapshot} />
    if (selected === 'MasterClasses') return <MasterClasses />
    return (
      <div className="page">
        <h2 className="page-title">{selected}</h2>
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
                <button className="clear-btn" onClick={clearSnapshot}>
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
        {mergedCharacters.map(c => (
          <button
            key={c.id}
            className={selected === c.name ? 'active' : ''}
            style={selected === c.name ? { color: classColor(c.class) } : {}}
            onClick={() => setSelected(c.name)}
          >
            {c.name}
            <span className="sidebar-level">Lv {c.level || '?'}</span>
          </button>
        ))}

        {/* Other Sections */}
        {Object.entries(sections).map(([category, items]) => (
          <div key={category}>
            <h2>{category}</h2>
            {items.map(item => (
              <button
                key={item}
                className={selected === item ? 'active' : ''}
                onClick={() => setSelected(item)}
              >
                {item}
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