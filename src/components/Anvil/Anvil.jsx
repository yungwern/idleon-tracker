import { useState, useEffect, useRef } from 'react'
import { anvilMap } from '../../data/anvilMap'
import { classColor } from '../../utils/appUtils'
import InfoPanel from '../InfoPanel/InfoPanel'

import './Anvil.css'

const STORAGE_SPEEDS = 'idleon-anvil-speeds'
const STORAGE_CAPACITIES = 'idleon-anvil-capacities'
const STORAGE_DISPLAYS = 'idleon-anvil-displays'

const SPEED_SUFFIXES = [
  { label: 'K', value: 1_000 },
  { label: 'M', value: 1_000_000 },
  { label: 'B', value: 1_000_000_000 },
  { label: 'T', value: 1_000_000_000_000 },
]

const CAPACITY_SUFFIXES = [
  { label: 'K', value: 1_000 },
  { label: 'M', value: 1_000_000 },
]

const MAX_CAPACITY = 2_000_000_000
const ALL_ITEMS = Object.entries(anvilMap).map(([rawName, data]) => ({ rawName, ...data }))

// ============================================================
// HELPERS
// ============================================================

function formatNumber(n) {
  if (n >= 1_000_000_000_000) return `${(n / 1_000_000_000_000).toFixed(2)}T`
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`
  return String(n)
}

function formatLocked(value, suffixes) {
  const entry = [...suffixes].reverse().find(s => value >= s.value)
  if (!entry) return String(value)
  return `${value / entry.value}${entry.label}`
}

function loadStorage(key) {
  try { return JSON.parse(localStorage.getItem(key)) ?? {} }
  catch { return {} }
}

// ============================================================
// SUFFIX INPUT
// ============================================================

function SuffixInput({ suffixes, maxM, onConfirm, initialValue, activeSuffix, onSuffixChange }) {
  const [raw, setRaw] = useState('')
  const [error, setError] = useState('')
  const userConfirmed = useRef(false)

  useEffect(() => {
    if (userConfirmed.current) {
      userConfirmed.current = false
      return
    }
    if (initialValue > 0) {
      const entry = [...suffixes].reverse().find(s => initialValue >= s.value)
      if (entry) {
        setRaw(String(initialValue / entry.value))
        onSuffixChange(entry.label)
      }
    } else {
      setRaw('')
      onSuffixChange(null)
      setError('')
    }
  }, [initialValue])

  const handleSuffix = (s) => {
    const num = parseFloat(raw)
    if (!raw || isNaN(num) || num <= 0) {
      setError('Enter a value first')
      return
    }
    if (s.label === 'M' && maxM && num > maxM) {
      setError(`Max is ${maxM}M`)
      return
    }
    setError('')
    userConfirmed.current = true
    onSuffixChange(s.label)
    onConfirm(num * s.value, `${raw}${s.label}`)
  }

  return (
    <div className="anvil-suffix-wrap">
      <div className="anvil-suffix-input">
        <input
          type="text"
          className="anvil-suffix-field"
          value={raw}
          onChange={e => { setRaw(e.target.value); setError('') }}
          placeholder="0"
        />
        <div className="anvil-suffix-btns">
          {suffixes.map(s => {
            const isActive = activeSuffix === s.label
            return (
              <button
                key={s.label}
                className={`anvil-suffix-btn${isActive ? ' anvil-suffix-btn--active' : ''}`}
                onClick={() => handleSuffix(s)}
              >
                {s.label}
              </button>
            )
          })}
        </div>
      </div>
      {error && <span className="anvil-input-error">{error}</span>}
    </div>
  )
}

// ============================================================
// COMPUTE OPTIMAL
// ============================================================

function computeOptimal(speed, capacity, totalHammers, afkHours) {
  if (!speed || !capacity || !totalHammers || !afkHours) return []

  const thread = ALL_ITEMS.find(item => item.id === 0)

  const results = ALL_ITEMS.map(item => {
    const produced = Math.min(capacity, (speed / item.requiredAmount) * afkHours)
    const exp = produced * item.exp
    return { ...item, produced, exp, hammers: 1 }
  })

  results.sort((a, b) => b.exp - a.exp)
  const topN = results.slice(0, totalHammers)

  const threadInTopN = topN.some(item => item.id === 0)
  if (!threadInTopN) return topN

  const threadCaps = (speed / thread.requiredAmount) * afkHours >= capacity
  if (threadCaps) return topN

  const thread2Caps = (speed / thread.requiredAmount) * 2 * afkHours >= capacity
  if (thread2Caps) {
    return topN.map(item =>
      item.id === 0 ? { ...item, hammers: 2 } : item
    )
  }

  const threadProduced = Math.min(capacity, (speed / thread.requiredAmount) * 3 * afkHours)
  return [{ ...thread, produced: threadProduced, exp: threadProduced * thread.exp, hammers: 3 }]
}

// ============================================================
// ANVIL CARD
// ============================================================

function AnvilCard({ row, matchState = 'none' }) {
  const { item, hammers } = row
  const borderClass = matchState === 'match'
    ? ' anvil-card--match'
    : matchState === 'mismatch'
    ? ' anvil-card--mismatch'
    : ''

  return (
    <div className={`anvil-card${borderClass}`}>
      <div className="anvil-card-top">
        <img
          src={`/images/anvil/${item.rawName}.png`}
          alt={item.displayName}
          className="anvil-item-img"
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
        {hammers > 1 && <span className="anvil-slots-badge">×{hammers}</span>}
      </div>
      <div className="anvil-card-body">
        <span className="anvil-item-name">{item.displayName}</span>
      </div>
    </div>
  )
}

// ============================================================
// OPTIMAL CARD
// ============================================================

function OptimalCard({ item }) {
  const { rawName, displayName, produced, exp, hammers } = item
  return (
    <div className="anvil-card">
      <div className="anvil-card-top">
        <img
          src={`/images/anvil/${rawName}.png`}
          alt={displayName}
          className="anvil-item-img"
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
        {hammers > 1 && <span className="anvil-slots-badge">×{hammers}</span>}
      </div>
      <div className="anvil-card-body">
        <span className="anvil-item-name">{displayName}</span>
        <span className="anvil-item-stat">{formatNumber(Math.round(produced))} items</span>
        <span className="anvil-item-stat anvil-item-exp">{formatNumber(Math.round(exp))} EXP</span>
      </div>
    </div>
  )
}

// ============================================================
// CONFIRM DIALOG
// ============================================================

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="anvil-confirm">
      <span className="anvil-confirm-msg">{message}</span>
      <div className="anvil-confirm-btns">
        <button className="anvil-confirm-btn anvil-confirm-btn--yes" onClick={onConfirm}>Yes</button>
        <button className="anvil-confirm-btn anvil-confirm-btn--no" onClick={onCancel}>No</button>
      </div>
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Anvil({ snapshot }) {
  const { rows = [], charStats = [] } = snapshot?.anvil ?? {}

  const [activeTab, setActiveTab] = useState('production')
  const [afkHours, setAfkHours] = useState(1)
  const [speeds, setSpeeds] = useState(() => loadStorage(STORAGE_SPEEDS))
  const [capacities, setCapacities] = useState(() => loadStorage(STORAGE_CAPACITIES))
  const [confirmReset, setConfirmReset] = useState(null)
  const [activeSuffixes, setActiveSuffixes] = useState({})
  const [displayValues, setDisplayValues] = useState(() => loadStorage(STORAGE_DISPLAYS))

  const isLocked = (charIndex) =>
    speeds[charIndex] > 0 && capacities[charIndex] > 0

  const setSpeed = (charIndex, value, display) => {
    const updated = { ...speeds, [charIndex]: value }
    setSpeeds(updated)
    localStorage.setItem(STORAGE_SPEEDS, JSON.stringify(updated))
    if (display) {
      const updatedDisplay = { ...displayValues, [charIndex]: display }
      setDisplayValues(updatedDisplay)
      localStorage.setItem(STORAGE_DISPLAYS, JSON.stringify(updatedDisplay))
    }
  }

  const setCapacity = (charIndex, value) => {
    const updated = { ...capacities, [charIndex]: value }
    setCapacities(updated)
    localStorage.setItem(STORAGE_CAPACITIES, JSON.stringify(updated))
  }

  const resetChar = (charIndex) => {
    const updatedSpeeds = { ...speeds, [charIndex]: 0 }
    const updatedCaps = { ...capacities, [charIndex]: 0 }
    const updatedDisplay = { ...displayValues }
    delete updatedDisplay[charIndex]
    setSpeeds(updatedSpeeds)
    setCapacities(updatedCaps)
    setDisplayValues(updatedDisplay)
    localStorage.setItem(STORAGE_SPEEDS, JSON.stringify(updatedSpeeds))
    localStorage.setItem(STORAGE_CAPACITIES, JSON.stringify(updatedCaps))
    localStorage.setItem(STORAGE_DISPLAYS, JSON.stringify(updatedDisplay))
    setActiveSuffixes(prev => {
      const updated = { ...prev }
      delete updated[`speed-${charIndex}`]
      delete updated[`cap-${charIndex}`]
      return updated
    })
    setConfirmReset(null)
  }

  const resetAll = () => {
    const zeroed = {}
    charStats.forEach((_, i) => { zeroed[i] = 0 })
    setSpeeds(zeroed)
    setCapacities(zeroed)
    setDisplayValues({})
    setActiveSuffixes({})
    localStorage.removeItem(STORAGE_SPEEDS)
    localStorage.removeItem(STORAGE_CAPACITIES)
    localStorage.removeItem(STORAGE_DISPLAYS)
    setConfirmReset(null)
  }

  const fillAllCapacities = () => {
    const updated = { ...capacities }
    charStats.forEach((_, i) => {
      if (!updated[i]) updated[i] = MAX_CAPACITY
    })
    setCapacities(updated)
    localStorage.setItem(STORAGE_CAPACITIES, JSON.stringify(updated))
  }

  const byChar = {}
  rows.forEach(row => {
    if (!byChar[row.charIndex]) byChar[row.charIndex] = []
    byChar[row.charIndex].push(row)
  })

  return (
    <div className="page anvil-page">
      <h2 className="page-title">Anvil</h2>

      <InfoPanel
        intro="Use this page to find the best anvil items to produce for maximum EXP gain based on your AFK interval. A few things to keep in mind:"
        items={[
          'Anvil speed and capacity cannot be calculated automatically, so you will need to enter them manually for each character. Both values can be found on the anvil screen in-game.',
          'If all of your characters have the maximum capacity of 2000M, use the Fill All Capacities button to set it for everyone at once before entering speeds.',
          'Speed and capacity are saved to local storage — you only need to enter them once and they will persist across save imports until you choose to update or reset them.',
          'Once speed and capacity are entered, set your AFK interval at the top and the Production tab will recommend the highest EXP items for each character to produce in that time window.',
          'Switch to the Active Items tab to compare your current production against the recommendations. Items that match will be highlighted green, items that don\'t match will be highlighted red.',
          'If you don\'t have the ability to craft 3 items at once, check the Gem Shop for "The Infinity Hammer" upgrade. The other possibility is that you don\'t have all big bubbles always equipped so you\'ll have to manually equip the "Hammer Hammer" bubble in Alchemy.' 
        ]}
      />

      {/* ── Nav ── */}
      <div className="anvil-nav">
        <button
          className={`anvil-nav-btn${activeTab === 'production' ? ' anvil-nav-btn--active' : ''}`}
          onClick={() => setActiveTab('production')}
        >
          Production
        </button>
        <button
          className={`anvil-nav-btn${activeTab === 'active' ? ' anvil-nav-btn--active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Items
        </button>
      </div>

      {/* ── Active Items Tab ── */}
      {activeTab === 'active' && (
        <div className="anvil-list">
          {rows.length === 0 ? (
            <p className="anvil-empty">No active anvil production found.</p>
          ) : (
            Object.entries(byChar).map(([charIndex, charRows]) => {
              const idx = parseInt(charIndex)
              const stat = charStats[idx]
              const speed = speeds[idx] ?? 0
              const capacity = capacities[idx] ?? 0
              const optimal = speed > 0 && capacity > 0 && stat
                ? computeOptimal(speed, capacity, stat.totalHammers, afkHours)
                : []
              const optimalIds = new Set(optimal.map(item => item.id))

              return (
                <div key={charIndex} className="anvil-char-group">
                  <div className="anvil-char-header">
                    <span className="anvil-char-label" style={{ color: classColor(charRows[0].charClass) }}>
                      {charRows[0].charName}
                    </span>
                  </div>
                  <div className="anvil-cards">
                    {charRows.map((row, i) => (
                      <AnvilCard
                        key={i}
                        row={row}
                        matchState={optimalIds.size === 0 ? 'none' : optimalIds.has(row.itemId) ? 'match' : 'mismatch'}
                      />
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ── Production Tab ── */}
      {activeTab === 'production' && (
        <div className="anvil-production">

          {/* ── Top Controls ── */}
          <div className="anvil-top-controls">
            <div className="anvil-afk-row">
              <span className="anvil-afk-label">AFK Interval (hours)</span>
              <input
                type="number"
                className="anvil-afk-input"
                value={afkHours}
                min="1"
                step="1"
                onChange={e => setAfkHours(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
            <div className="anvil-top-btns">
              <button className="anvil-action-btn" onClick={fillAllCapacities}>
                Fill All Capacities to 2000M
              </button>
              <button className="anvil-action-btn anvil-action-btn--danger" onClick={() => setConfirmReset('all')}>
                Reset All
              </button>
            </div>
          </div>

          {/* ── Global Confirm ── */}
          {confirmReset === 'all' && (
            <ConfirmDialog
              message="Reset all character speeds and capacities?"
              onConfirm={resetAll}
              onCancel={() => setConfirmReset(null)}
            />
          )}

          {/* ── Per Character ── */}
          <div className="anvil-list">
            {charStats.map((stat, charIndex) => {
              const charRows = byChar[charIndex]
              if (!charRows?.length) return null
              const charName = charRows[0].charName
              const charClass = charRows[0].charClass
              const speed = speeds[charIndex] ?? 0
              const capacity = capacities[charIndex] ?? 0
              const locked = isLocked(charIndex)
              const optimal = locked
                ? computeOptimal(speed, capacity, stat.totalHammers, afkHours)
                : []

              return (
                <div key={charIndex} className="anvil-char-group">

                  {/* Header */}
                  <div className="anvil-char-header">
                    <span className="anvil-char-label" style={{ color: classColor(charClass) }}>
                      {charName}
                    </span>
                    {locked && confirmReset !== charIndex && (
                      <button
                        className="anvil-char-reset-btn"
                        onClick={() => setConfirmReset(charIndex)}
                        title="Reset this character"
                      >
                        ↺
                      </button>
                    )}
                  </div>

                  {/* Per-char confirm */}
                  {confirmReset === charIndex && (
                    <ConfirmDialog
                      message={`Reset ${charName}?`}
                      onConfirm={() => resetChar(charIndex)}
                      onCancel={() => setConfirmReset(null)}
                    />
                  )}

                  {/* Inputs or locked display */}
                  {locked ? (
                    <div className="anvil-locked-row">
                      <div className="anvil-locked-group">
                        <span className="anvil-input-label">Anvil Speed</span>
                        <span className="anvil-locked-value">
                          {displayValues[charIndex] ?? formatLocked(speed, SPEED_SUFFIXES)}
                        </span>
                      </div>
                      <div className="anvil-locked-group">
                        <span className="anvil-input-label">Capacity</span>
                        <span className="anvil-locked-value">{formatLocked(capacity, CAPACITY_SUFFIXES)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="anvil-inputs-row">
                      <div className="anvil-input-group">
                        <span className="anvil-input-label">Anvil Speed</span>
                        <SuffixInput
                          suffixes={SPEED_SUFFIXES}
                          onConfirm={(v, display) => setSpeed(charIndex, v, display)}
                          initialValue={speeds[charIndex] ?? 0}
                          activeSuffix={activeSuffixes[`speed-${charIndex}`] ?? null}
                          onSuffixChange={label => setActiveSuffixes(prev => ({ ...prev, [`speed-${charIndex}`]: label }))}
                        />
                      </div>
                      <div className="anvil-input-group">
                        <span className="anvil-input-label">Capacity</span>
                        <SuffixInput
                          suffixes={CAPACITY_SUFFIXES}
                          maxM={2000}
                          onConfirm={v => setCapacity(charIndex, v)}
                          initialValue={capacities[charIndex] ?? 0}
                          activeSuffix={activeSuffixes[`cap-${charIndex}`] ?? null}
                          onSuffixChange={label => setActiveSuffixes(prev => ({ ...prev, [`cap-${charIndex}`]: label }))}
                        />
                      </div>
                    </div>
                  )}

                  {/* Optimal cards */}
                  {locked && optimal.length > 0 && (
                    <div className="anvil-cards">
                      {optimal.map((item, i) => <OptimalCard key={i} item={item} />)}
                    </div>
                  )}

                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}