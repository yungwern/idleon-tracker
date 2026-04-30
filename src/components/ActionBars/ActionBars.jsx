import { useState } from 'react'
import { talentMap } from '../../data/talentMap'
import './ActionBars.css'

const ROWS = [0, 1, 2]
const SLOTS = [0, 1, 2, 3, 4, 5]

function SkillSlot({ id }) {
  if (!id) return <div className="action-bar-slot empty" />

  const name = talentMap[id] ?? `Unknown (${id})`

  return (
    <div className="action-bar-slot filled tooltip-anchor">
      <img
        src={`/images/talents/UISkillIcon${id}.png`}
        alt={name}
        className="action-bar-slot-icon"
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
      <span className="tooltip">{name}</span>
    </div>
  )
}

export default function ActionBar({ actionBar }) {
  const [preset, setPreset] = useState('active')

  if (!actionBar) return (
    <div className="no-save">
        <span className="no-save-icon">📂</span>
        <p>Import your save to see equipped premium gear.</p>
      </div>
  )

  const rows = actionBar[preset] ?? []

  return (
    <div className="action-bar-wrap">
      <div className="action-bar-controls">
        <div className="action-bar-toggle">
          <button
            className={preset === 'active' ? 'active' : ''}
            onClick={() => setPreset('active')}
          >Active</button>
          <button
            className={preset === 'alternate' ? 'active' : ''}
            onClick={() => setPreset('alternate')}
          >Alternate</button>
        </div>
      </div>

      <div className="action-bar-rows">
        {ROWS.map(ri => (
          <div key={ri} className="action-bar-row">
            <span className="action-bar-row-label">{ri + 1}</span>
            <div className="action-bar-slots">
              {SLOTS.map(si => (
                <SkillSlot key={si} id={rows[ri]?.[si] ?? null} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}