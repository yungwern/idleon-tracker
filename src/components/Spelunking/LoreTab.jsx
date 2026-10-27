import { useMemo, useState } from 'react'
import { getLoreChapters, getReadLevelTable, getReadOdds, getReadMulti, getMaxDailyReads, planSpread, READ_SPREADS } from '../../utils/spelunkingUtils'
import { formatBigNumber } from '../../utils/cogBoardUtils'

const hideBrokenImg = e => {
  e.currentTarget.style.display = 'none'
}

const CHAPTER_NUMBERS = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven']

// 1234.5 → "1,235", 12.345 → "12.35"
function formatValue(value) {
  if (!Number.isFinite(value)) return '∞'
  if (Math.abs(value) >= 100) return Math.round(value).toLocaleString('en-US')
  return (Math.round(value * 100) / 100).toString()
}

const formatCount = value => Math.round(value ?? 0).toLocaleString('en-US')

// "+{%_Total|Spelunking_Efficiency" with its value → "+1,245% Total Spelunking Efficiency"
function bonusText(name, value) {
  return name
    .replace(/\|/g, ' ')
    .replace(/\{/g, formatValue(value))
    .replace(/\}/g, formatValue(value))
}

// Just the number with its unit, for caps and per-level amounts: "+2,800%", "14x", "+14"
function amountText(name, value) {
  if (/^\}x/.test(name)) return `${formatValue(value)}x`
  const sign = name.startsWith('+') ? '+' : ''
  return /\{%/.test(name) ? `${sign}${formatValue(value)}%` : `${sign}${formatValue(value)}`
}

// Name without its number, for bonuses not unlocked yet: "}x_Total|Spelunking_POW" → "Total Spelunking POW"
function bareName(name) {
  return name.replace(/\|/g, ' ').replace(/^\+?[{}](%|x)?\s*/, '')
}

// 548335627 → "548M"
const formatPages = value => (value >= 1e6 ? formatBigNumber(value) : formatCount(value))

// ============================================================
// CHAPTERS
// ============================================================

function ChapterBonus({ bonus, index }) {
  const unlocked = bonus.level > 0
  return (
    <div className={`spelunk-chapter-bonus${unlocked ? '' : ' spelunk-chapter-bonus--locked'}`}>
      <div className="spelunk-chapter-bonus-head">
        <span className="spelunk-chapter-bonus-name">{unlocked ? bonusText(bonus.name, bonus.value) : bareName(bonus.name)}</span>
        <span className="spelunk-chapter-bonus-level">Lv {formatCount(bonus.level)}</span>
      </div>

      <span className="spelunk-chapter-read">
        <span className="spelunk-chapter-read-tag">{index + 1}</span>
        Rolls on reads of {formatCount(bonus.pages)}+ pages
      </span>

      {unlocked && bonus.isDecay && (
        <>
          <progress
            className="spelunk-chapter-bar"
            value={Math.min(1, bonus.progress)}
            max={1}
          />
          <div className="spelunk-chapter-cap-row">
            <span className="spelunk-chapter-note">
              {Math.floor(bonus.progress * 100)}% of cap ({amountText(bonus.name, bonus.cap)})
            </span>
            <span className="spelunk-chapter-milestones">
              {bonus.milestones.map(milestone => (
                <span
                  key={milestone.percent}
                  className={`spelunk-milestone tooltip-anchor${milestone.reached ? ' spelunk-milestone--reached' : ''}`}
                >
                  {milestone.percent}
                  <span className="tooltip tooltip--right">
                    {milestone.percent}% of cap at Lv {formatCount(milestone.level)}
                    {milestone.reached ? ' ✓' : ` (${formatCount(milestone.level - bonus.level)} to go)`}
                  </span>
                </span>
              ))}
            </span>
          </div>
        </>
      )}

      {unlocked && !bonus.isDecay && (
        <span className="spelunk-chapter-note">{amountText(bonus.name, bonus.perLevel)} per LV, no cap</span>
      )}
    </div>
  )
}

function ChapterCard({ chapter }) {
  return (
    <div className="spelunk-chapter">
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
        <ChapterPages pagesOwned={chapter.pagesOwned} />
      </div>
      {chapter.bonuses.map((bonus, i) => (
        <ChapterBonus
          key={i}
          bonus={bonus}
          index={i}
        />
      ))}
    </div>
  )
}

// ============================================================
// READING PAGES
// ============================================================

// Pages owned, in the chapter header
function ChapterPages({ pagesOwned }) {
  return (
    <span className="spelunk-chapter-pages tooltip-anchor">
      <span className="spelunk-chapter-pages-count">{formatPages(pagesOwned)}</span>
      <span className="spelunk-chapter-pages-best">pages owned</span>
      <span className="tooltip tooltip--right">{formatCount(pagesOwned)} pages (storage + inventories)</span>
    </span>
  )
}

// Pick a chapter and how long its pages should last → what each read should be and what it gives
function ReadPlanner({ snapshot, chapters }) {
  const defaultChapter = chapters.reduce((best, chapter) => (chapter.pagesOwned > chapters[best].pagesOwned ? chapter.index : best), 0)
  const [chapterIndex, setChapterIndex] = useState(defaultChapter)
  const [days, setDays] = useState(7)
  const maxReads = getMaxDailyReads(snapshot)
  const [readsPerDay, setReadsPerDay] = useState(maxReads)

  const chapter = chapters[chapterIndex]
  const pages = chapter?.pagesOwned ?? 0
  const options = READ_SPREADS.map(option => ({
    ...option,
    plan: planSpread(snapshot, chapterIndex, pages, option.days, readsPerDay),
  }))
  const plan = options.find(option => option.days === days)?.plan ?? options[0].plan

  return (
    <div className="spelunk-planner">
      <div className="spelunk-planner-chapters">
        {chapters.map(c => (
          <button
            key={c.index}
            type="button"
            className={`spelunk-planner-chapter${c.index === chapterIndex ? ' spelunk-planner-chapter--active' : ''}${c.pagesOwned > 0 ? '' : ' spelunk-planner-chapter--empty'}`}
            onClick={() => setChapterIndex(c.index)}
          >
            <img
              src={`images/spelunking/Spelunking${c.index}.png`}
              alt=""
              className="spelunk-planner-chapter-icon"
              onError={hideBrokenImg}
            />
            <span className="spelunk-planner-chapter-name">Chapter {c.index + 1}</span>
            <span className="spelunk-planner-chapter-pages">{formatPages(c.pagesOwned)}</span>
          </button>
        ))}
      </div>

      {plan.tooFew ? (
        <p className="spelunk-planner-empty">
          {pages > 0
            ? `${formatCount(pages)} pages isn't enough to plan with yet. Reads are mapped out from 25,000 pages up, so save up for a bigger stack.`
            : `You don't have any Chapter ${chapterIndex + 1} pages yet.`}
        </p>
      ) : (
        <div className="spelunk-planner-body">
          <div className="spelunk-planner-left">
            <span className="spelunk-planner-label">Reads per day on this chapter ({maxReads} a day in total)</span>
            <div className="spelunk-planner-reads">
              {Array.from({ length: maxReads }, (_, i) => i + 1).map(count => (
                <button
                  key={count}
                  type="button"
                  className={`spelunk-planner-read${count === readsPerDay ? ' spelunk-planner-read--active' : ''}`}
                  onClick={() => setReadsPerDay(count)}
                >
                  {count}
                </button>
              ))}
            </div>

            <span className="spelunk-planner-label">Make your {formatPages(pages)} pages last</span>
            <div className="spelunk-planner-spreads">
              {options.map(option => (
                <button
                  key={option.days}
                  type="button"
                  className={`spelunk-planner-spread${option.days === days ? ' spelunk-planner-spread--active' : ''}`}
                  onClick={() => setDays(option.days)}
                >
                  <span className="spelunk-planner-spread-label">{option.label}</span>
                  <span className="spelunk-planner-spread-value">{formatCount(option.plan.totalExact)} LVs</span>
                </button>
              ))}
            </div>

            <div className="spelunk-planner-answer">
              <span className="spelunk-planner-answer-main">
                Read <strong>{formatCount(plan.perRead)}</strong> pages at a time
              </span>
              <span className="spelunk-planner-answer-sub">
                {plan.capped
                  ? `${formatCount(plan.reads)} ${plan.reads === 1 ? 'read' : 'reads'} in total`
                  : `${plan.dailyReads} reads a day${plan.days > 1 ? ` for ${plan.days} days` : ''}`}
                {' '}· ≈ {formatValue(plan.read.exact)} LVs per read · ≈ {formatCount(plan.totalExact)} LVs total
              </span>
            </div>
            {plan.capped && (
              <span className="spelunk-planner-hint">
                Only enough pages for {formatCount(plan.reads)} {plan.reads === 1 ? 'read' : 'reads'} of 25,000+, so it uses fewer reads instead of tiny stacks.
              </span>
            )}
          </div>

          <div className="spelunk-planner-right">
            <span className="spelunk-planner-label">Where the levels go</span>
            <div className="spelunk-planner-bonuses">
              {plan.bonuses.map((bonus, i) => (
                <div
                  key={i}
                  className={`spelunk-planner-bonus${bonus.open ? '' : ' spelunk-planner-bonus--closed'}`}
                >
                  <span className="spelunk-chapter-read-tag">{i + 1}</span>
                  <span className="spelunk-planner-bonus-name">{bareName(bonus.name)}</span>
                  <span className="spelunk-planner-bonus-value">
                    {bonus.open ? `≈ ${formatCount(bonus.expected)} LVs` : `needs ${formatPages(bonus.pages)}+ per read`}
                  </span>
                </div>
              ))}
            </div>
            <span className="spelunk-planner-hint">
              Totals for all {formatCount(plan.reads)} reads. Spreading pages out gives more levels overall, just slower.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Closed by default: the guide's numbers the planner is built on
function ReadingReference({ snapshot }) {
  const table = getReadLevelTable(snapshot, 40)
  return (
    <details className="dropdown-panel spelunk-reference">
      <summary className="dropdown-panel-head">
        <span className="dropdown-panel-title">Reference</span>
        <span className="dropdown-panel-stat">How reading works · pages per level · bonus odds</span>
      </summary>
      <div className="dropdown-panel-body spelunk-reference-body">
        <div className="spelunk-reference-col">
          <span className="spelunk-planner-label">Pages for a whole read LV</span>
          <div className="spelunk-read-grid">
            {table.map(row => (
              <span
                key={row.level}
                className={`spelunk-read-cell${row.extended ? ' spelunk-read-cell--extended' : ''}`}
              >
                <span className="spelunk-read-level">Lv {row.level}</span>
                <span className="spelunk-read-pages">{formatPages(row.pages)}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="spelunk-reference-col">
          <span className="spelunk-planner-label">Which bonus gets the boost</span>
          <div className="spelunk-odds-table">
            <div className="spelunk-odds-row spelunk-odds-row--head">
              <span>Open</span>
              {[1, 2, 3, 4].map(i => <span key={i}>#{i}</span>)}
            </div>
            {[1, 2, 3, 4].map(open => (
              <div
                key={open}
                className="spelunk-odds-row"
              >
                <span>{open}</span>
                {[0, 1, 2, 3].map(i => (
                  <span key={i}>{getReadOdds(open)[i] !== undefined ? `${getReadOdds(open)[i]}%` : '–'}</span>
                ))}
              </div>
            ))}
          </div>
          <ul className="spelunk-reading-points">
            <li>Each read spends a stack of pages and levels up one random bonus.</li>
            <li>Bigger stacks give more levels, but each extra page is worth a little less.</li>
            <li>A bonus can only be picked once your stack reaches its page amount.</li>
            <li>Your Chapter Four bonus adds +{formatValue((getReadMulti(snapshot) - 1) * 100)}% levels to every read.</li>
          </ul>
          <p className="spelunk-reading-note">Source: Pulse's Lore Breakpoints guide (Bright Hollow), checked in game past Lv 30.</p>
        </div>
      </div>
    </details>
  )
}

// ============================================================
// LORE TAB
// ============================================================

export default function LoreTab({ snapshot }) {
  const chapters = useMemo(() => getLoreChapters(snapshot), [snapshot])

  return (
    <>
      <div className="spelunk-section-label">Read Planner</div>
      <ReadPlanner
        snapshot={snapshot}
        chapters={chapters}
      />
      <ReadingReference snapshot={snapshot} />

      <div className="spelunk-section-label">Chapters</div>
      <div className="spelunk-chapter-grid">
        {chapters.map(chapter => (
          <ChapterCard
            key={chapter.index}
            chapter={chapter}
          />
        ))}
      </div>

    </>
  )
}
