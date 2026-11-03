import { getHarp } from '../../utils/holeCavernUtils'
import { formatHoleNumber } from '../../utils/holeUtils'
import HarpSetups from './HarpSetups'

// The Harp (cavern 6): notes owned, the strings on the harp and each string type's LV / EXP bar.
// "Makes" values are per pluck at the current Harp Power.

export default function HarpPanel({ snapshot, lead, tomePoints }) {
  const harp = getHarp(snapshot, tomePoints)
  const tunedNote = harp.notes[harp.tuned]

  return (
    <>
      <div className="hole-stats">
        {lead}
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Harp Power</span>
          <span className="hole-stat-card-value">{formatHoleNumber(harp.power)}%</span>
          <span className="hole-stat-card-hint">+{formatHoleNumber(harp.powerRate)}% per hour (E string LV bonus).</span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Tuned to</span>
          <span className="hole-stat-card-value">
            {tunedNote && (
              <img
                className="hole-harp-stat-icon"
                src={tunedNote.image}
                alt=""
              />
            )}
            {tunedNote ? `${tunedNote.name} Note` : '—'}
          </span>
          <span className="hole-stat-card-hint">
            {harp.newNoteCost == null
              ? `All ${harp.notes.length} notes learned.`
              : `${harp.notesKnown} / ${harp.notes.length} notes learned. Next note: ${formatHoleNumber(harp.newNoteCost)}.`}
          </span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Opal chance</span>
          <span className="hole-stat-card-value">{formatHoleNumber(harp.opalChance * 100)}%</span>
          <span className="hole-stat-card-hint">Per D string pluck (drops 5x with every opal found here).</span>
        </div>
      </div>

      <div className="hole-card">
        <h3 className="hole-card-title">Notes</h3>
        <div className="hole-harp-notes">
          {harp.notes.map(note => (
            <div
              key={note.index}
              className={`hole-harp-note tooltip-anchor${note.known ? '' : ' hole-harp-note--locked'}${note.tuned ? ' hole-harp-note--tuned' : ''}`}
            >
              <img
                className="hole-harp-note-icon"
                src={note.image}
                alt={note.name}
              />
              <span className="hole-harp-note-value">{formatHoleNumber(note.owned)}</span>
              <span className="tooltip">
                {note.name} Note{note.tuned ? ' (tuned)' : ''}{note.known ? '' : ' (not learned yet)'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="hole-card">
        <h3 className="hole-card-title">
          Strings on the harp
          <span className="hole-card-title-stat">{harp.slots} strings · {harp.uniqueTypes} types</span>
        </h3>
        <div className="hole-harp-strings">
          {harp.strings.map((type, slot) => (
            <div
              key={slot}
              className={`hole-harp-string hole-harp--${type}`}
            >
              <span className="hole-harp-string-line" />
              <img
                className="hole-harp-string-letter"
                src={`images/hole/harp/string_${type}.png`}
                alt={harp.types[type]?.letter ?? '?'}
              />
            </div>
          ))}
        </div>
      </div>

      <HarpSetups
        harp={harp}
        snapshot={snapshot}
      />

      <div className="hole-card">
        <h3 className="hole-card-title">String types</h3>
        <div className="hole-harp-types">
          {harp.types.map(type => (
            <div
              key={type.index}
              className={`hole-harp-type hole-harp--${type.index}${type.unlocked ? '' : ' hole-harp-type--locked'}`}
            >
              <img
                className="hole-harp-type-letter"
                src={type.image}
                alt={type.letter}
              />
              <div className="hole-harp-type-body">
                <div className="hole-harp-type-head">
                  <span className="hole-harp-type-level">LV {type.level.toLocaleString()}</span>
                  <span className="hole-harp-type-exp">
                    {formatHoleNumber(type.exp)} / {formatHoleNumber(type.req)}
                  </span>
                </div>
                <div
                  className="hole-harp-bar"
                  style={{ '--hole-progress': `${Math.round(type.progress * 100)}%` }}
                >
                  <div className="hole-harp-bar-fill" />
                </div>
                <span className="hole-bell-desc">{type.text}</span>
                <span className="hole-text--note">
                  {type.onHarp > 0 ? `${type.onHarp} on the harp` : 'Not on the harp'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
