import { useState } from 'react'
import { toClassSlug } from '../../utils/appUtils'
import { getNinjaStealth, formatDetection, formatSneakingNumber } from '../../utils/sneakingUtils'

// Sneaking > Detection: each ninja's stealth and detection on its current floor (the mastery being played), then
// the selected ninja's stealth split into every source. Inactive sources (1x) stay listed, dimmed, as the places
// left to gain stealth. Math: sneakingUtils getNinjaStealth (matches Toolbox). See notes/sneaking.md.

const SCOPES = [
  { id: 'ninja', title: 'This ninja' },
  { id: 'floor', title: 'This floor' },
  { id: 'account', title: 'Account-wide' },
]

function detectionClass(detection) {
  if (detection <= 0) return 'sneaking-detect--safe'
  if (detection >= 1) return 'sneaking-detect--caught'
  return 'sneaking-detect--risky'
}

function formatMulti(multi) {
  return `${formatSneakingNumber(multi)}x`
}

// How far the ninja is from 0% detection: "10.5x over" or "needs 3.2x more"
function zeroLabel(ninja) {
  if (!ninja.stealthForZero) return '—'
  const ratio = ninja.stealth / ninja.stealthForZero
  return ratio >= 1
    ? `${formatSneakingNumber(ratio)}x over`
    : `needs ${formatSneakingNumber(1 / ratio)}x more`
}

export default function DetectionTab({ snapshot, tomePoints }) {
  const ninjas = getNinjaStealth(snapshot, tomePoints)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selected = ninjas.find(ninja => ninja.index === selectedIndex) ?? ninjas[0]
  if (!selected) return null

  return (
    <>
      <div className="sneaking-section-title">Current detection</div>
      <div className="sneaking-detect-table">
        <div className="sneaking-detect-row sneaking-detect-row--head">
          <span>Ninja</span>
          <span>Floor</span>
          <span>Stealth</span>
          <span>Detection</span>
          <span className="tooltip-anchor">
            0% detection
            <span className="tooltip tooltip--wrap">0% detection needs stealth of 10x the floor's difficulty</span>
          </span>
        </div>
        {ninjas.map(ninja => (
          <button
            key={ninja.index}
            type="button"
            className={`sneaking-detect-row${ninja.index === selected.index ? ' sneaking-detect-row--selected' : ''}`}
            data-class={toClassSlug(ninja.className)}
            onClick={() => setSelectedIndex(ninja.index)}
          >
            <span className="sneaking-detect-name">{ninja.name}</span>
            <span>{ninja.floor + 1}</span>
            <span>{formatSneakingNumber(ninja.stealth)}</span>
            <span className={detectionClass(ninja.detection)}>{formatDetection(ninja.detection)}</span>
            <span className="sneaking-detect-zero">{zeroLabel(ninja)}</span>
          </button>
        ))}
      </div>

      <div className="sneaking-section-title">Stealth breakdown: {selected.name}</div>
      <div className="sneaking-breakdown">
        <div className="sneaking-breakdown-total">
          <span>
            Floor {selected.floor + 1} difficulty <strong>{formatSneakingNumber(selected.difficulty)}</strong>
          </span>
          <span>
            Stealth <strong>{formatSneakingNumber(selected.stealth)}</strong>
          </span>
          <span className={detectionClass(selected.detection)}>
            Detection <strong>{formatDetection(selected.detection)}</strong>
          </span>
        </div>
        <div className="sneaking-breakdown-line">
          <span className="sneaking-breakdown-label">
            Base stealth
            <span className="sneaking-breakdown-detail">{selected.baseDetail}</span>
          </span>
          <span className="sneaking-breakdown-value">{formatSneakingNumber(selected.base)}</span>
        </div>
        {SCOPES.map(scope => (
          <div
            key={scope.id}
            className="sneaking-breakdown-group"
          >
            <div className="sneaking-breakdown-group-title">{scope.title}</div>
            {selected.sources
              .filter(source => source.scope === scope.id)
              .map(source => (
                <div
                  key={source.id}
                  className={`sneaking-breakdown-line${source.active ? '' : ' sneaking-breakdown-line--off'}`}
                >
                  <span className="sneaking-breakdown-label">
                    {source.label}
                    {source.detail && <span className="sneaking-breakdown-detail">{source.detail}</span>}
                  </span>
                  <span className="sneaking-breakdown-value">{source.active ? formatMulti(source.multi) : 'not active'}</span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </>
  )
}
