import { getVoteSummary, formatVoteMulti } from '../../utils/voteUtils'
import { voteTitles, voteIcons } from '../../data'
import { formatCountdown, formatResetDate } from '../../utils/resetUtils'

// One weekly vote on Home: a header row (vote, multi, countdown) over this week's winning bonus,
// which is the focus. Next week's options live on the Weekly Votes page.
export default function VoteCard({ kind, snapshot, endsAt, now }) {
  const vote = getVoteSummary(snapshot, kind)
  const meritLocked = kind === 'meritocracy' && vote && vote.multi === 0

  return (
    <section className="home-vote" data-vote={kind}>
      <header className="home-vote-head">
        <img
          className="home-vote-icon"
          src={voteIcons[kind]}
          alt=""
        />
        <div className="home-vote-title">
          <span className="home-vote-name">{voteTitles[kind]}</span>
          {vote && (
            <span className="home-vote-multi tooltip-anchor">
              {formatVoteMulti(vote.multi)} multi
              <span className="tooltip tooltip--wrap">
                Your {voteTitles[kind]} multi. This week's bonus is shown at this multi.
              </span>
            </span>
          )}
        </div>
        <div className="home-vote-timer tooltip-anchor">
          <span className="home-vote-timer-label">Vote ends in</span>
          <span className="home-vote-timer-time">{formatCountdown(endsAt - now)}</span>
          <span className="tooltip">{formatResetDate(endsAt)}</span>
        </div>
      </header>

      <div className="home-vote-current">
        {vote?.current ? (
          <>
            <img
              className="home-vote-bonus-icon"
              src={vote.current.icon}
              alt=""
            />
            <span className="home-vote-text">{vote.current.text}</span>
          </>
        ) : (
          <span className="home-vote-empty">
            {vote ? 'No winning bonus in this save.' : 'Import a save to see this week\'s bonus.'}
          </span>
        )}
      </div>
      {meritLocked && (
        <p className="home-vote-warning">
          Gives nothing until a character clears Spirit Village (the World 6 town).
        </p>
      )}
    </section>
  )
}
