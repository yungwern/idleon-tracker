import { useState } from 'react'
import './TalentsTab.css'

function TalentCard({ talent }) {
  return (
    <div className="talent-card">
      <div className="talent-icon" />
      <span className="talent-name">{talent.name}</span>
    </div>
  )
}

export default function TalentsTab({ character }) {
  const [activePreset, setActivePreset] = useState(0)

  if (!character.superTalentPresets) {
    return (
      <div className="talents-empty">
        <p>Import your save to see your super talents.</p>
      </div>
    )
  }

  const presets = character.superTalentPresets ?? [
    { label: 'Fighting', superedTalents: [] },
    { label: 'Skilling', superedTalents: [] },
  ]

  const preset = presets[activePreset]
  const totalSupered = presets.reduce((sum, p) => sum + p.superedTalents.length, 0)

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
  )
}