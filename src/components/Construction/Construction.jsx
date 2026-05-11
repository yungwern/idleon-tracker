import { useState, useEffect } from 'react'
import { cogMap, COG_BORDER_CLASS } from '../../data'
import CogBoardMap from '../CogBoardMap/CogBoardMap'
import InfoPanel from '../InfoPanel/InfoPanel'

import './Construction.css'

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

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Backspace') handleKey('backspace')
      else if (e.key >= '0' && e.key <= '9') handleKey(e.key)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [value])

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

function CompareTool({ cogs, onClose, onResult, onReplace }) {
  const [step, setStep] = useState('color')
  const [cogColor, setCogColor] = useState(null)
  const [cogName, setCogName] = useState(null)
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
    if (isUpgrade) {
      onReplace({
        name: cogColor,
        total,
        bonusConstructExp: parseInt(bonusExp) || 0,
        playerConstructExp: parseInt(playerExp) || 0,
        patternLabel: pattern === 'row' ? 'Boosts entire Row' : 'Boosts entire Column',
        index: Date.now(),
      })
    }
    setStep('color')
    setCogColor(null)
    setCogName(null)
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

      {/* ── Step 1: Color ── */}
      {step === 'color' && (
        <div className="compare-step">
          <p className="compare-label">What color is this cog?</p>
          <div className="compare-color-btns">
            {[0,1,2,3,4,5].map(i => (
              <button
                key={i}
                className="compare-color-btn"
                onClick={() => {
                  setCogColor(`CogCry${i}`)
                  setCogName(cogMap[`CogCry${i}`]?.name ?? `CogCry${i}`)
                  setStep('pattern')
                }}
              >
                <img src={`/images/construction/CogCry${i}.png`} alt={`CogCry${i}`} className="compare-color-img" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 2: Pattern ── */}
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
          <div className="compare-nav">
            <button className="compare-back-btn" onClick={() => setStep('color')}>Back</button>
          </div>
        </div>
      )}

      {/* ── Step 3: Bonus Construct EXP ── */}
      {step === 'bonus' && (
        <div className="compare-step">
          <p className="compare-label">Enter Bonus Construct EXP</p>
          <div className="compare-input-display">{bonusExp || '0'}</div>
          <Numpad value={bonusExp} onChange={setBonusExp} />
          <div className="compare-nav">
            <button className="compare-back-btn" onClick={() => setStep('pattern')}>Back</button>
            <button className="compare-next-btn" disabled={!bonusExp} onClick={() => setStep('player')}>Next</button>
          </div>
        </div>
      )}

      {/* ── Step 4: Player Construct XP ── */}
      {step === 'player' && (
        <div className="compare-step">
          <p className="compare-label">Enter Player Construct XP</p>
          <div className="compare-input-display">{playerExp || '0'}</div>
          <Numpad value={playerExp} onChange={setPlayerExp} />
          <div className="compare-nav">
            <button className="compare-back-btn" onClick={() => setStep('bonus')}>Back</button>
            <button className="compare-next-btn" disabled={!playerExp} onClick={goToResult}>Compare</button>
          </div>
        </div>
      )}

      {/* ── Step 5: Result ── */}
      {step === 'result' && (
        <div className="compare-step">
          <div className={`compare-result-banner ${isUpgrade ? 'upgrade' : 'no-upgrade'}`}>
            <span className="compare-result-label">{isUpgrade ? '✓ Upgrade' : '✗ Not an upgrade'}</span>
            <span className="compare-result-detail">New cog total: <strong>+{total}%</strong></span>
            <span className="compare-result-detail">Lowest {pattern} cog: <strong>+{lowestEquipped}%</strong></span>
          </div>
          <CogCard
            cog={{
              name: cogColor,
              total,
              bonusConstructExp: parseInt(bonusExp) || 0,
              playerConstructExp: parseInt(playerExp) || 0,
              patternLabel: pattern === 'row' ? 'Boosts entire Row' : 'Boosts entire Column',
            }}
            highlight={isUpgrade ? 'upgrade' : 'no-upgrade'}
          />
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
      className={`cog-card ${
        highlight === 'upgrade'    ? 'highlight-upgrade' :
        highlight === 'no-upgrade' ? 'highlight-no-upgrade' :
        highlight === 'replace'    ? 'highlight-replace' :
        highlight === 'cant-beat'  ? 'highlight-cant-beat' : ''
      }`}
      style={{ '--cog-color': cogColor }}
    >
      <div className="cog-card-top">
        <span className="cog-total">+{cog.total}%</span>
        <div className="cog-image-wrap">
          <img
            src={`/images/construction/${cog.name}.png`}
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
  const [overrides, setOverrides] = useState([])

  const displayCogs = overrides.length > 0 ? overrides : cogs

  function applyReplacement(newCog) {
    const base = overrides.length > 0 ? overrides : cogs
    const patternLabel = newCog.patternLabel
    const matching = base.filter(c => c.patternLabel === patternLabel)

    // Find and remove the lowest
    const lowestTotal = Math.min(...matching.map(c => c.total))
    const lowestIndex = base.findIndex(c => c.patternLabel === patternLabel && c.total === lowestTotal)

    // Find insert position (highest cog the new one beats)
    const beatable = matching.filter(c => newCog.total > c.total)
    const highestBeatable = Math.max(...beatable.map(c => c.total))
    const insertIndex = base.findIndex(c => c.patternLabel === patternLabel && c.total === highestBeatable)

    const updated = [...base]
    updated.splice(lowestIndex, 1)
    updated.splice(insertIndex, 0, newCog)
    setOverrides(updated)
  }

  // Work out which cog to highlight after a comparison
  function getHighlight(cog, compareResult) {
    if (!compareResult) return null
    const { pattern, total, isUpgrade } = compareResult
    const patternLabel = pattern === 'row' ? 'Boosts entire Row' : 'Boosts entire Column'
    if (cog.patternLabel !== patternLabel) return null
    if (!isUpgrade) {
      const matchingCogs = displayCogs.filter(c => c.patternLabel === patternLabel)
      const lowestTotal = Math.min(...matchingCogs.map(c => c.total))
      return cog.total === lowestTotal ? 'cant-beat' : null
    }
    const beatable = displayCogs
      .filter(c => c.patternLabel === patternLabel && total > c.total)
      .map(c => c.total)
    if (beatable.length === 0) return null
    const highestBeatable = Math.max(...beatable)
    return cog.total === highestBeatable ? 'replace' : null
  }

  return (
    <div className="page construction-page">
      <h2 className="page-title">Construction</h2>
      <InfoPanel
      intro="This page helps you optimize the Row and Column Boosters on your Construction Board. If you're unfamiliar with how the board works, check out the Optimal Cog Layout. A few things to keep in mind:"
      items={[
        'Click "+ Compare New Cog" to get started.',
        'You\'ll be prompted to select the cog\'s color, whether it boosts a Row or Column, and its EXP values.',
        'The tool will then tell you whether the cog is an upgrade over what you currently have equipped.',
        'If it is an upgrade, clicking "Compare Another" will automatically update the cog list to reflect the replacement.',
        'The order of cogs in the list doesn\'t matter — what\'s important is that all 6 Row and Column slots on your board match the Optimal Cog Layout.',
      ]}
      />

      <div className="construction-toolbar">
        <button className="compare-open-btn" onClick={() => setShowCompare(v => !v)}>
          {showCompare ? 'Hide Compare' : '+ Compare New Cog'}
        </button>
        <button className="compare-open-btn" onClick={() => setShowBoard(v => !v)}>
          {showBoard ? 'Hide Cog Board' : 'View Optimal Cog Layout'}
        </button>
        {overrides.length > 0 && (
          <button className="compare-open-btn" onClick={() => setOverrides([])}>
            Reset to Real Data
          </button>
        )}
      </div>

      {showCompare && (
        <CompareTool
          cogs={displayCogs}
          onClose={() => { setShowCompare(false); setCompareResult(null) }}
          onResult={setCompareResult}
          onReplace={applyReplacement}
        />
      )}

      {showBoard && <CogBoardMap />}

      <div className="cog-grid">
        <div className="cog-grid-label">
          <span>Row Boosters</span>
        </div>
        {displayCogs.slice(0, 6).map(cog => (
          <CogCard key={cog.index} cog={cog} highlight={getHighlight(cog, compareResult)} />
        ))}
        <div className="cog-grid-label">
          <span>Column Boosters</span>
        </div>
        {displayCogs.slice(6).map(cog => (
          <CogCard key={cog.index} cog={cog} highlight={getHighlight(cog, compareResult)} />
        ))}
      </div>
    </div>
  )
}