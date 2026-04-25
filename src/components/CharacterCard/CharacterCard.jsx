import { useState } from 'react'
import TodoList from '../TodoList/TodoList.jsx'
import PremiumGearTab from '../PremiumGear/PremiumGear.jsx'
import TalentsTab from '../TalentsTab/TalentsTab.jsx'
import { prayerMap } from '../../data/prayerMap'
import './CharacterCard.css'
import '../ActionBars/actionbars.css'

const toClassSlug = (className) => className.toLowerCase().replace(/\s+/g, '-')

export default function CharacterCard({ character, charIndex, snapshot }) {
  const [activeTab, setActiveTab] = useState('to-do list:')
  const slug = toClassSlug(character.class)

  return (
    <div className="character-card" data-class={slug}>

      {/* ── Header ── */}
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

      {/* ── Prayers ── */}
      {snapshot?.characters?.[charIndex]?.prayers?.length > 0 && (
        <div className="prayers-bar">
          <span className="prayers-label">Prayers:</span>
          {snapshot.characters[charIndex].prayers.map(id => (
            <img
              key={id}
              src={`/images/prayers/Prayer${id}.png`}
              alt={prayerMap[id] ?? `Prayer ${id}`}
              className="prayer-icon"
              title={prayerMap[id] ?? `Prayer ${id}`}
            />
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

        {activeTab === 'to-do list:' && (
          <TodoList
            characterId={character.id}
            defaultTodos={character.todos}
          />
        )}

        {activeTab === 'premium gear' && (
          <PremiumGearTab charIndex={charIndex} snapshot={snapshot} />
        )}

        {activeTab === 'super talents' && (
          <TalentsTab character={character} />
        )}

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