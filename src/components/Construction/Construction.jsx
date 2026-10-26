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
                  setStep('pattern')
                }}
              >
                <img src={`images/construction/CogCry${i}.png`} alt={`CogCry${i}`} className="compare-color-img" />
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
            <span className="compare-result-detail">Lowest {pattern} cog: <strong>+{lowestEquipped}%</strong> (highlighted on the board)</span>
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
        highlight === 'no-upgrade' ? 'highlight-no-upgrade' : ''
      }`}
      style={{ '--cog-color': cogColor }}
    >
      <div className="cog-card-top">
        <span className="cog-total">+{cog.total}%</span>
        <div className="cog-image-wrap">
          <img
            src={`images/construction/${cog.name}.png`}
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

// The 12 Row/Column booster slots from the Optimal Cog Layout. First 6 are the Row slots.
const ROW_SLOT_COUNT = 6
const PATTERN_LABELS = {
  row: 'Boosts entire Row',
  column: 'Boosts entire Column',
}

export default function Construction({ snapshot }) {
  const { cogs = [], board = null } = snapshot?.construction ?? {}
  const [showCompare, setShowCompare] = useState(false)
  const [showBoard, setShowBoard] = useState(false)
  const [compareResult, setCompareResult] = useState(null)
  // { boardIndex: cell } — cogs swapped in by the compare tool, on top of the real board
  const [overrides, setOverrides] = useState({})

  const displayBoard = board?.map(cell => overrides[cell.index] ?? cell) ?? null

  // Booster slots, with their role set by position on the board (not by whatever cog sits there)
  const boosterSlots = displayBoard
    ? cogs.map(({ index }, i) => {
        const cell = displayBoard[index]
        const role = i < ROW_SLOT_COUNT ? 'row' : 'column'
        return {
          index,
          role,
          total: cell.bonusConstructExp + cell.playerConstructExp,
          patternLabel: PATTERN_LABELS[role],
        }
      })
    : []

  function lowestSlot(role) {
    return boosterSlots
      .filter(slot => slot.role === role)
      .reduce((low, slot) => (!low || slot.total < low.total ? slot : low), null)
  }

  // Swap the new cog into the weakest slot of its type
  function applyReplacement(newCog) {
    const role = newCog.patternLabel === PATTERN_LABELS.row ? 'row' : 'column'
    const target = lowestSlot(role)
    if (!target) return
    setOverrides(prev => ({
      ...prev,
      [target.index]: {
        ...displayBoard[target.index],
        name: newCog.name,
        pattern: role,
        bonusConstructExp: newCog.bonusConstructExp,
        playerConstructExp: newCog.playerConstructExp,
        isNew: true,
      },
    }))
  }

  // Board highlights: swapped-in cogs, plus the slot the current comparison is measured against
  const highlights = {}
  for (const index of Object.keys(overrides)) highlights[index] = 'new'
  if (compareResult) {
    const target = lowestSlot(compareResult.pattern)
    if (target) highlights[target.index] = compareResult.isUpgrade ? 'replace' : 'cant-beat'
  }

  return (
    <div className="page construction-page">
      <h2 className="page-title">Construction</h2>
      <InfoPanel
      intro="This page shows your Construction Board as it is in your save and helps you upgrade its Row and Column Boosters. If you're unfamiliar with how the board works, check out the Optimal Cog Layout. A few things to keep in mind:"
      items={[
        'Each cog shows its total EXP. Hover a cog for the full breakdown.',
        'Click "+ Compare New Cog" and enter the cog\'s color, whether it boosts a Row or Column, and its EXP values.',
        'The tool compares it against your weakest Row or Column Booster slot, which gets highlighted on the board.',
        'If it is an upgrade, clicking "Compare Another" swaps it onto the board in that slot. "Reset to Real Data" undoes all swaps.',
        'Only the 6 Row and 6 Column slots from the Optimal Cog Layout are compared — which slot each cog sits in doesn\'t matter.',
      ]}
      />

      <div className="construction-toolbar">
        <button className="compare-open-btn" onClick={() => setShowCompare(v => !v)}>
          {showCompare ? 'Hide Compare' : '+ Compare New Cog'}
        </button>
        <button className="compare-open-btn" onClick={() => setShowBoard(v => !v)}>
          {showBoard ? 'Hide Optimal Layout' : 'View Optimal Cog Layout'}
        </button>
        {Object.keys(overrides).length > 0 && (
          <button className="compare-open-btn" onClick={() => setOverrides({})}>
            Reset to Real Data
          </button>
        )}
      </div>

      {showCompare && displayBoard && (
        <CompareTool
          cogs={boosterSlots}
          onClose={() => { setShowCompare(false); setCompareResult(null) }}
          onResult={setCompareResult}
          onReplace={applyReplacement}
        />
      )}

      {showBoard && <CogBoardMap title="Optimal Cog Layout" />}

      {displayBoard
        ? <CogBoardMap board={displayBoard} highlights={highlights} title="My Cog Board" />
        : <p className="construction-board-empty">Re-import your save to see your cog board.</p>}
    </div>
  )
}
