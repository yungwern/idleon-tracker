import { useState } from 'react'
import { cogMap, COG_BORDER_CLASS } from '../../data'
import './Construction.css'
import CogBoardMap from '../CogBoardMap/CogBoardMap'

// ============================================================
// NUMPAD
// ============================================================

function Numpad({ value, onChange }) {
  function handleKey(key) {
    if (key === 'backspace') {
      onChange(value.slice(0, -1))
    } else {
      if (value.length >= 6) return
      onChange(value + key)
    }
  }

  return (
    <div className="numpad">
      {['7','8','9','4','5','6','1','2','3'].map(k => (
        <button key={k} className="numpad-key" onClick={() => handleKey(k)}>{k}</button>
      ))}
      <button className="numpad-key numpad-zero" onClick={() => handleKey('0')}>0</button>
      <button className="numpad-key numpad-back" onClick={() => handleKey('backspace')}>⌫</button>
    </div>
  )
}

// ============================================================
// COMPARE TOOL
// ============================================================

const STEPS = ['pattern', 'bonus', 'player', 'result']

function CompareTool({ cogs, onClose, onResult }) {
  const [step, setStep] = useState('pattern')
  const [pattern, setPattern] = useState(null)
  const [bonusExp, setBonusExp] = useState('')
  const [playerExp, setPlayerExp] = useState('')

  const total = (parseInt(bonusExp) || 0) + (parseInt(playerExp) || 0)

  const matchingCogs = cogs.filter(c => {
    if (pattern === 'row')    return c.patternLabel === 'Boosts entire Row'
    if (pattern === 'column') return c.patternLabel === 'Boosts entire Column'
    return false
  })

  const lowestEquipped = matchingCogs.length > 0
    ? Math.min(...matchingCogs.map(c => c.total))
    : 0

  const isUpgrade = total > lowestEquipped

  function goToResult() {
    onResult({ pattern, total, isUpgrade })
    setStep('result')
  }

  function reset() {
    setStep('pattern')
    setPattern(null)
    setBonusExp('')
    setPlayerExp('')
    onResult(null)
  }

  return (
    <div className="compare-tool">
      <div className="compare-header">
        <span className="compare-title">Compare New Cog</span>
        <button className="compare-close" onClick={onClose}>✕</button>
      </div>

      {/* ── Step 1: Pattern ── */}
      {step === 'pattern' && (
        <div className="compare-step">
          <p className="compare-label">Does this cog boost a Row or Column?</p>
          <div className="compare-pattern-btns">
            <button className="compare-pattern-btn" onClick={() => { setPattern('row'); setStep('bonus') }}>
              Boosts entire Row
            </button>
            <button className="compare-pattern-btn" onClick={() => { setPattern('column'); setStep('bonus') }}>
              Boosts entire Column
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Bonus Construct EXP ── */}
      {step === 'bonus' && (
        <div className="compare-step">
          <p className="compare-label">Enter Bonus Construct EXP</p>
          <div className="compare-input-display">{bonusExp || '0'}</div>
          <Numpad value={bonusExp} onChange={setBonusExp} />
          <div className="compare-nav">
            <button className="compare-back-btn" onClick={() => setStep('pattern')}>Back</button>
            <button
              className="compare-next-btn"
              disabled={!bonusExp}
              onClick={() => setStep('player')}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Player Construct XP ── */}
      {step === 'player' && (
        <div className="compare-step">
          <p className="compare-label">Enter Player Construct XP</p>
          <div className="compare-input-display">{playerExp || '0'}</div>
          <Numpad value={playerExp} onChange={setPlayerExp} />
          <div className="compare-nav">
            <button className="compare-back-btn" onClick={() => setStep('bonus')}>Back</button>
            <button
              className="compare-next-btn"
              disabled={!playerExp}
              onClick={goToResult}
            >
              Compare
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: Result ── */}
      {step === 'result' && (
        <div className="compare-step">
          <div className={`compare-result ${isUpgrade ? 'upgrade' : 'no-upgrade'}`}>
            <span className="compare-result-label">{isUpgrade ? '✓ Upgrade' : '✗ Not an upgrade'}</span>
            <span className="compare-result-detail">
              New cog total: <strong>+{total}%</strong>
            </span>
            <span className="compare-result-detail">
              Lowest {pattern} cog: <strong>+{lowestEquipped}%</strong>
            </span>
          </div>
          <button className="compare-next-btn" style={{ marginTop: 12 }} onClick={reset}>
            Compare Another
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================================
// COG CARD
// ============================================================

function CogCard({ cog, highlight }) {
  const cogData = cogMap[cog.name]
  const displayName = cogData?.name ?? cog.name.replace(/_/g, ' ')
  const cogColor = cogData?.color ?? '#e5e7eb'
  const patternColor = cog.patternLabel === 'Boosts entire Row'
    ? COG_BORDER_CLASS.green.color
    : cog.patternLabel === 'Boosts entire Column'
      ? COG_BORDER_CLASS.garnet.color
      : '#9ca3af'

  return (
    <div
      className={`cog-card ${highlight === 'upgrade' ? 'highlight-upgrade' : highlight === 'lowest' ? 'highlight-lowest' : ''}`}
      style={{ '--cog-color': cogColor }}
    >
      <div className="cog-card-top">
        <span className="cog-total">+{cog.total}%</span>
        <div className="cog-image-wrap">
          <img
            src={`/images/cogs/${cog.name}.png`}
            alt={displayName}
            className="cog-img"
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
        </div>
      </div>
      <div className="cog-card-body">
        <span className="cog-name">{displayName}</span>
        <div className="cog-stats">
          <span className="cog-stat">+{cog.bonusConstructExp}% Bonus Construct EXP</span>
          <span className="cog-stat">+{cog.playerConstructExp}% Player Construct XP</span>
        </div>
        {cog.patternLabel && (
          <span className="cog-pattern" style={{ color: patternColor }}>{cog.patternLabel}</span>
        )}
      </div>
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Construction({ snapshot }) {
  const { cogs = [], totalExpRate = 0 } = snapshot?.construction ?? {}
  const [showCompare, setShowCompare] = useState(false)
  const [showBoard, setShowBoard] = useState(false)
  const [compareResult, setCompareResult] = useState(null)

  // Work out which cog to highlight after a comparison
  function getHighlight(cog, compareResult) {
    if (!compareResult) return null
    const { pattern, total, isUpgrade } = compareResult
    const patternLabel = pattern === 'row' ? 'Boosts entire Row' : 'Boosts entire Column'
    if (cog.patternLabel !== patternLabel) return null
    const matchingCogs = cogs.filter(c => c.patternLabel === patternLabel)
    const lowestTotal = Math.min(...matchingCogs.map(c => c.total))
    if (cog.total === lowestTotal) return isUpgrade ? 'upgrade' : 'lowest'
    return null
  }

  return (
    <div className="page construction-page">
      <h2 className="page-title">Construction</h2>

      <div className="construction-toolbar">
        <button className="compare-open-btn" onClick={() => setShowCompare(v => !v)}>
          {showCompare ? 'Hide Compare' : '+ Compare New Cog'}
        </button>
        <button className="compare-open-btn" onClick={() => setShowBoard(v => !v)}>
          {showBoard ? 'Hide Cog Board' : 'View Optimal Cog Layout'}
        </button>
      </div>

      {showCompare && (
        <CompareTool
          cogs={cogs}
          onClose={() => { setShowCompare(false); setCompareResult(null) }}
          onResult={setCompareResult}
        />
      )}

      {showBoard && <CogBoardMap />}

      <div className="cog-grid">
        <div className="cog-grid-label">
          <span>Row Boosters</span>
        </div>
        {cogs.slice(0, 6).map(cog => (
          <CogCard key={cog.index} cog={cog} highlight={getHighlight(cog, compareResult)} />
        ))}
        <div className="cog-grid-label">
          <span>Column Boosters</span>
        </div>
        {cogs.slice(6).map(cog => (
          <CogCard key={cog.index} cog={cog} highlight={getHighlight(cog, compareResult)} />
        ))}
      </div>
    </div>
  )
}