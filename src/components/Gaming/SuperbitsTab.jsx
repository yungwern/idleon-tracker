import { useState } from 'react'
import { getSuperbits } from '../../utils/gamingBonusUtils'
import { SUPERBIT_GROUPS, formatBits, getBitsImage } from '../../utils/gamingUtils'

// Superbits tab: one group at a time (Super first), owned ones can be hidden. Each card shows a sprite
// for what it boosts, or the bits sprite of its cost when there's no fitting one.
export default function SuperbitsTab({ snapshot }) {
  const [group, setGroup] = useState('super')
  const [hideOwned, setHideOwned] = useState(false)
  const bits = snapshot.gaming.bits
  const superbits = getSuperbits(snapshot)
  const inGroup = superbits.filter(s => s.group === group)
  const list = inGroup.filter(s => !(hideOwned && s.unlocked))
  const groupOwned = inGroup.filter(s => s.unlocked).length

  return (
    <div className="gaming-body">
      <div className="gaming-toolbar">
        <div className="segmented-control">
          {SUPERBIT_GROUPS.map(option => (
            <button
              key={option.id}
              type="button"
              className={`segmented-control-btn${group === option.id ? ' segmented-control-btn--active' : ''}`}
              onClick={() => setGroup(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <label className="gaming-check">
          <input
            type="checkbox"
            className="styled-checkbox"
            checked={hideOwned}
            onChange={event => setHideOwned(event.target.checked)}
          />
          Hide owned
        </label>
        <span className="gaming-muted gaming-toolbar-count">{groupOwned} / {inGroup.length} owned</span>
      </div>

      {list.length === 0 && <p className="gaming-text gaming-text--note">You own every superbit in this group.</p>}

      <div className="gaming-card-grid">
        {list.map(s => (
          <div
            key={s.index}
            className={`gaming-card${s.unlocked ? ' gaming-card--owned' : ''}`}
          >
            <div className="gaming-import-head">
              <img
                className="gaming-superbit-img"
                src={s.image ? `images/gaming/${s.image}.png` : getBitsImage(s.cost)}
                alt=""
              />
              <div className="gaming-import-head-text">
                <div className="gaming-card-title">
                  {s.name}
                  {s.unlocked && <span className="gaming-pill gaming-pill--good">Owned</span>}
                </div>
                {s.lines.map(line => (
                  <p
                    key={line}
                    className="gaming-text"
                  >
                    {line}
                  </p>
                ))}
                {s.info && <p className="gaming-text gaming-text--accent">{s.info}</p>}
              </div>
            </div>
            {!s.unlocked && (
              <div className="gaming-card-foot">
                <span className="gaming-muted">Cost</span>
                <span className={`gaming-cost ${s.cost <= bits ? 'gaming-good' : 'gaming-short'}`}>
                  {formatBits(s.cost)}
                  <img
                    className="gaming-bits-icon"
                    src={getBitsImage(s.cost)}
                    alt="bits"
                  />
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
