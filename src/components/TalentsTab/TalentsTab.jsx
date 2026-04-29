import { useState } from 'react'
import './TalentsTab.css'

function TalentCard({ talent }) {
  return (
    <div className="talent-card">
      <div className="talent-icon" >
        <img
          src={`/images/talents/UISkillIcon${talent.id}.png`}
          alt={talent.name}
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      </div>
      <span className="talent-name">{talent.name}</span>
    </div>
  )
}

export default function TalentsTab({ character }) {
  const [activePreset, setActivePreset] = useState(0)

  if (!character.superTalentPresets) {
    return (
      <div className="no-save">
        <span className="no-save-icon">📂</span>
        <p>Import your save to see equipped premium gear.</p>
      </div>
    )
  }

  const presets = character.superTalentPresets ?? [
    { label: 'Fighting', superedTalents: [] },
    { label: 'Skilling', superedTalents: [] },
  ]

  const preset = presets[activePreset]
  const totalPoints = Math.max(0, Math.floor(((character.level ?? 0) - 400) / 100) + 1)
  const unspent = totalPoints - preset.superedTalents.length

  return (
    <div className="talents-tab">
      <div className="talents-header">
        <div className="preset-switcher">
          {presets.map((p, i) => (
            <button
              key={i}
              className={`preset-btn ${activePreset === i ? 'active' : ''}`}
              onClick={() => setActivePreset(i)}
            >
              {p.label}
            </button>
          ))}
        </div>
        {unspent > 0 && (
          <span className="talents-total talents-total--unspent">
            {unspent} Point Unspent
          </span>
        )}
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
  )
}