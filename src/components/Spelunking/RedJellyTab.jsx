import { useMemo } from 'react'
import { getRedJellyRead, getRedJellyRestTable, formatPages, loreBonusName } from '../../utils/spelunkingUtils'

const hideBrokenImg = e => {
  e.currentTarget.style.display = 'none'
}

const CHAPTER_NUMBERS = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven']

const formatCount = value => Math.round(value ?? 0).toLocaleString('en-US')
const formatChance = value => `${Math.round(value * 100)}%`

// ============================================================
// HEADER STRIP
// ============================================================

function JellyStats({ jelly }) {
  return (
    <div className="spelunk-stats">
      <div className={`spelunk-stat${jelly.ready ? '' : ' spelunk-stat--done'}`}>
        <span className="spelunk-stat-label">Read</span>
        <span className="spelunk-stat-value">{jelly.ready ? 'Ready' : 'Done today'}</span>
      </div>
      <div className="spelunk-stat">
        <span className="spelunk-stat-label">Days rested</span>
        <span className="spelunk-stat-value">{formatCount(jelly.daysRested)}</span>
      </div>
      <div className="spelunk-stat">
        <span className="spelunk-stat-label">Reading multi</span>
        <span className="spelunk-stat-value">{jelly.multi}x</span>
      </div>
      <div className="spelunk-stat">
        <span className="spelunk-stat-label">LVs per read</span>
        <span className="spelunk-stat-value">≈ {formatCount(jelly.multiTotal)}</span>
      </div>
      <div className="spelunk-stat">
        <span className="spelunk-stat-label">Chapters tracked</span>
        <span className="spelunk-stat-value">
          {jelly.tracked} / {jelly.chapters.length}
        </span>
      </div>
    </div>
  )
}

// ============================================================
// CHAPTERS
// ============================================================

function JellyChapter({ chapter }) {
  const { read } = chapter
  const tracked = chapter.pages > 0
  return (
    <div className={`spelunk-chapter${tracked ? '' : ' spelunk-jelly-chapter--empty'}`}>
      <div className="spelunk-chapter-head">
        <img
          src={`images/spelunking/Spelunking${chapter.index}.png`}
          alt=""
          className="spelunk-chapter-icon"
          onError={hideBrokenImg}
        />
        <div className="spelunk-chapter-title">
          <span className="spelunk-chapter-number">Chapter {CHAPTER_NUMBERS[chapter.index] ?? chapter.index + 1}</span>
          <span className="spelunk-chapter-name">{chapter.title}</span>
        </div>
        <span className="spelunk-chapter-pages tooltip-anchor">
          <span className="spelunk-chapter-pages-count">{tracked ? formatPages(chapter.pages) : '???'}</span>
          <span className="spelunk-chapter-pages-best">pages tracked</span>
          <span className="tooltip tooltip--right">{formatCount(chapter.pages)} pages read since the Red Jellyfish came out</span>
        </span>
      </div>

      <div className="spelunk-jelly-read">
        {tracked ? (
          <>
            <span className="spelunk-jelly-read-main">+{formatCount(read.guaranteed)} LVs</span>
            <span className="spelunk-jelly-read-sub">
              {read.chance > 0.005
                ? `${formatChance(read.chance)} chance of +${formatCount(read.guaranteed + 1)}`
                : 'no chance of 1 more'}
              {' '}· read LV {read.level.toFixed(2)}
            </span>
          </>
        ) : (
          <span className="spelunk-jelly-read-sub">Read some Chapter {chapter.index + 1} pages and the jelly starts tracking them.</span>
        )}
      </div>

      {chapter.bonuses.map((bonus, i) => (
        <div
          key={i}
          className={`spelunk-jelly-bonus${bonus.open ? '' : ' spelunk-jelly-bonus--closed'}`}
        >
          <span className="spelunk-chapter-read-tag">{i + 1}</span>
          <span className="spelunk-jelly-bonus-name">{loreBonusName(bonus.name)}</span>
          <span className="spelunk-jelly-bonus-odds">
            {bonus.open ? `${bonus.chance}%` : `needs ${formatPages(bonus.pages)}`}
          </span>
        </div>
      ))}
    </div>
  )
}

// ============================================================
// HOW IT WORKS
// ============================================================

function JellyNotes() {
  const rest = getRedJellyRestTable()
  return (
    <details className="dropdown-panel spelunk-reference">
      <summary className="dropdown-panel-head">
        <span className="dropdown-panel-title">How it works</span>
        <span className="dropdown-panel-stat">What READ does · why to read every day</span>
      </summary>
      <div className="dropdown-panel-body spelunk-reference-body">
        <div className="spelunk-reference-col">
          <ul className="spelunk-reading-points">
            <li>READ does one normal page read per chapter, using every page that chapter has tracked as the stack. Same LVs and bonus odds as reading those pages yourself.</li>
            <li>Tracked pages are never used up. Every page you read normally adds to them, so each jelly read gets a little bigger.</li>
            <li>Each chapter's first bonus also gets a small extra +1 to +3 LVs. It's not counted in the numbers above.</li>
            <li>Days rested goes up by 1 a day and back to 0 when you READ.</li>
          </ul>
          <p className="spelunk-reading-note">Checked with before/after saves: every chapter's read matched these numbers.</p>
        </div>

        <div className="spelunk-reference-col">
          <span className="spelunk-planner-label">Resting vs reading daily</span>
          <div className="spelunk-jelly-rest">
            <div className="spelunk-odds-row spelunk-odds-row--head">
              <span>Days</span>
              <span>Multi</span>
              <span>Daily</span>
            </div>
            {rest.map(row => (
              <div
                key={row.days}
                className="spelunk-odds-row"
              >
                <span>{row.days}</span>
                <span>{row.multi}x</span>
                <span>{row.days}x</span>
              </div>
            ))}
          </div>
          <p className="spelunk-reading-note">
            Waiting always gives a smaller multi than the reads you skipped, so READ every day.
          </p>
        </div>
      </div>
    </details>
  )
}

// ============================================================
// RED JELLYFISH TAB
// ============================================================

export default function RedJellyTab({ snapshot }) {
  const jelly = useMemo(() => getRedJellyRead(snapshot), [snapshot])

  if (!snapshot?.spelunking?.redJelly) {
    return <p className="page-empty">Re-import your save to see the Red Jellyfish.</p>
  }

  return (
    <>
      <div className="spelunk-jelly-intro">
        <img
          src="images/menagerie/MenaJelly3.png"
          alt=""
          className="spelunk-jelly-icon"
          onError={hideBrokenImg}
        />
        <div className="spelunk-jelly-intro-text">
          <span className="spelunk-jelly-intro-title">Red Jellyfish</span>
          <span className="spelunk-jelly-intro-sub">
            {jelly.unlocked
              ? 'Luminous Menagerie · once a day, re-reads every Spelunking page you\'ve read'
              : 'Not unlocked yet. Unlock it in the W7 Luminous Menagerie.'}
          </span>
        </div>
      </div>

      <JellyStats jelly={jelly} />

      <div className="spelunk-section-label">Next read</div>
      <div className="spelunk-chapter-grid">
        {jelly.chapters.map(chapter => (
          <JellyChapter
            key={chapter.index}
            chapter={chapter}
          />
        ))}
      </div>

      <JellyNotes />
    </>
  )
}
