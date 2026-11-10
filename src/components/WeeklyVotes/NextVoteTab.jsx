import { getVoteSummary, formatVoteMulti } from '../../utils/voteUtils'
import { getBallotVoteEnd, getMeritocracyVoteEnd, formatCountdown, formatResetDate } from '../../utils/resetUtils'
import { useNow } from '../../hooks/useNow'
import { voteTitles, voteIcons } from '../../data'

// Next week's options for one vote, with vote shares from the save (voteUtils getVoteSummary)
export default function NextVoteTab({ kind, snapshot, savedLabel }) {
  const now = useNow()
  const vote = getVoteSummary(snapshot, kind)
  const endsAt = kind === 'ballot' ? getBallotVoteEnd(now) : getMeritocracyVoteEnd(now)
  const leader = vote?.options?.length ? Math.max(...vote.options.map(option => option.percent)) : null

  return (
    <section className="weekly-votes" data-vote={kind}>
      <header className="weekly-votes-head">
        <img
          className="weekly-votes-icon"
          src={voteIcons[kind]}
          alt=""
        />
        <div className="weekly-votes-title">
          <span className="weekly-votes-name">{voteTitles[kind]}: voting for next week</span>
          <span className="weekly-votes-sub">
            {vote && <span className="weekly-votes-multi">{formatVoteMulti(vote.multi)} multi</span>}
            {savedLabel && <span>Vote shares as of {savedLabel}</span>}
          </span>
        </div>
        <div className="weekly-votes-timer tooltip-anchor">
          <span className="weekly-votes-timer-label">Vote ends in</span>
          <span className="weekly-votes-timer-time">{formatCountdown(endsAt - now)}</span>
          <span className="tooltip">{formatResetDate(endsAt)}</span>
        </div>
      </header>

      {!vote && <p className="page-empty">Import a save to see next week's options.</p>}
      {vote && vote.options == null && (
        <p className="page-empty">Re-import your save to see next week's options.</p>
      )}
      {vote?.options && (
        <ul className="weekly-votes-options">
          {vote.options.map(option => (
            <li
              key={option.index}
              className={`weekly-votes-option${option.percent === leader && leader > 0 ? ' weekly-votes-option--leading' : ''}`}
            >
              <img
                className="weekly-votes-bonus-icon"
                src={option.icon}
                alt=""
              />
              <span className="weekly-votes-text">{option.text}</span>
              <span className="weekly-votes-percent">{option.percent}%</span>
              <span
                className="weekly-votes-bar"
                style={{ '--vote-share': `${option.percent}%` }}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
