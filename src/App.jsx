import { useState, useEffect } from 'react'
import './App.css'
import './styles/global.css'
import { characters, sections} from './data/data.js'
import { useSaveImport } from './hooks/useSaveImport.js'
import ImportModal from './components/ImportModal/ImportModal.jsx'
import TodoList from './components/TodoList/TodoList.jsx'
import PremiumGearTab, { getPremiumGear } from './components/PremiumGear/PremiumGear.jsx'

// ============================================================
// UTILITIES
// ============================================================

// Converts a class name to a kebab-case slug for data-class attributes
const toClassSlug = (className) => className.toLowerCase().replace(/\s+/g, '-')

// Add future utility imports below this line

// ── Class Colors ──
// Maps class names to their theme accent colors, used for active sidebar buttons
function classColor(cls) {
  const colors = {
    'Blood Berserker':    '#f87171',
    'Divine Knight':      '#fbbf24',
    'Siege Breaker':      '#16a34a',
    'Beast Master':       '#059669',
    'Elemental Sorcerer': '#7c3aed',
    'Bubonic Conjuror':   '#65a30d',
    'Voidwalker':         '#af9dce',
  }
  return colors[cls] ?? '#fff'
}

// ============================================================
// CHARACTER CARD
// ============================================================
function CharacterCard({ character, charIndex, snapshot }) {
  const [activeTab, setActiveTab] = useState('to-do list:')
  const slug = toClassSlug(character.class)

  return (
    <div className="character-card" data-class={slug}>

      {/* ── Header: name, level, class badge, nametag, trophy ── */}
      <div className="card-header">
        <div className="card-header-left">
          <div className="class-label">Character — Lv {character.level || '?'}</div>
          <h2>{character.name}</h2>
          {character.trophy && (
            <div className="trophy-icon-wrapper">
              <img
                src={character.trophy.src}
                alt={character.trophy.label}
                className="trophy-icon"
                title={character.trophy.label}
              />
            </div>
          )}
        </div>
        <div className="card-header-right">
          {character.nametag && (
            <img
              src={character.nametag.src}
              alt={character.nametag.label}
              className="nametag-image"
              title={character.nametag.label}
            />
          )}
          <div className="class-badge">{character.class}</div>
        </div>
      </div>

      {/* ── Best For Bar ── */}
      {character.bestFor.length > 0 && (
        <div className="best-for-bar">
          {character.bestFor.map(b => (
            <span key={b} className="best-for-pill">{b}</span>
          ))}
        </div>
      )}

      {/* ── Tab Navigation ── */}
      <div className="card-tabs">
        {['to-do list:', 'premium gear', 'super talents', 'action bar'].map(tab => (
          <button
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="card-body">

        {/* To-Do List */}
        {activeTab === 'to-do list:' && (
          <TodoList
            characterId={character.id}
            defaultTodos={character.todos}
          />
        )}

        {/* Premium Gear */}
        {activeTab === 'premium gear' && (
          <PremiumGearTab charIndex={charIndex} snapshot={snapshot} />
        )}

        {/* Super Talents */}
        {activeTab === 'super talents' && (
          <TalentsTab character={character} />
        )}

        {/* Action Bar */}
        {activeTab === 'action bar' && (
          <div>
            {character.actionBarImages && character.actionBarImages.length > 0
              ? character.actionBarImages.map((img, i) => (
                  <div key={i}>
                    {img.label && <p className="action-bar-label">{img.label}</p>}
                    <img src={img.src} alt={img.label || `Action bar ${i + 1}`} className="action-bar-image" />
                  </div>
                ))
              : <div className="action-bar-placeholder">📷 Add action bar screenshot paths to data.js</div>
            }
            {character.actionBarNotes && (
              <p className="action-bar-notes">{character.actionBarNotes}</p>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

// ============================================================
// SUPER TALENT TAB
// ============================================================

function TalentCard({ talent }) {
  return (
    <div className="talent-card">
      <div className="talent-icon" />
      <span className="talent-name">{talent.name}</span>
    </div>
  );
}

function TalentsTab({ character }) {
  const [activePreset, setActivePreset] = useState(0)

  if(!character.superTalentPresets) {
    return(
      <div className="talents-empty">
        <p>Import your save to see your super talents.</p>
      </div>
    )
  }

  const presets = character.superTalentPresets ?? [
    { label: "Fighting", superedTalents: [] },
    { label: "Skilling", superedTalents: [] },
  ]

  const preset = presets[activePreset];
  const totalSupered = presets.reduce((sum, p) => sum + p.superedTalents.length, 0)

  return (
    <div className="talents-tab">
      <div className="talents-header">
        <div className="preset-switcher">
          {presets.map((p, i) => (
            <button
              key={i}
              className={`preset-btn ${activePreset === i ? "active" : ""}`}
              onClick={() => setActivePreset(i)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <span className="talents-total">
          {totalSupered} Total Super'd
        </span>
      </div>

      {preset.superedTalents.length === 0 ? (
        <div className="talents-empty">
          <p>No super'd talents in this preset.</p>
        </div>
      ) : (
        <div className="talents-list">
          {preset.superedTalents.map((t) => (
            <TalentCard key={t.id} talent={t} />
          ))}
        </div>
      )}
    </div>
  );
}

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
        {character
          ? <CharacterCard character={character} charIndex={charIndex} snapshot={snapshot} />
          : (
            // Placeholder for non-character sections
            <div>
              <h1 style={{ color: '#a0c4ff', marginBottom: 10 }}>{selected}</h1>
              <p style={{ color: '#6b7280' }}>Content for this section coming soon!</p>
            </div>
          )
        }
      </div>

    </div>
  )
}