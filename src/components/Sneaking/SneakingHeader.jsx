import { getSneakingSummary, formatSneakingNumber, toRoman } from '../../utils/sneakingUtils'

// Always-visible top of the Sneaking page: Ninja Mastery box next to the account numbers
export default function SneakingHeader({ snapshot }) {
  const summary = getSneakingSummary(snapshot)
  const masteryName = summary.mastery > 0 ? `Mastery ${toRoman(summary.mastery)}` : 'no mastery yet'
  const stats = [
    {
      label: 'Floors Open',
      value: `${summary.openFloors} / ${summary.totalFloors}`,
      tip: `Floors open on your highest mastery (${masteryName}), the game's "Currently on". `
        + `Reach floor ${summary.nextMasteryFloor} to unlock Mastery ${toRoman(summary.mastery + 1)}. `
        + 'Lower masteries always have every floor open.',
    },
    {
      label: 'Knowledge LVs',
      value: summary.knowledgeLevels.toLocaleString('en-US'),
    },
    {
      label: 'Jade Emporium',
      value: `${summary.emporiumOwned} / ${summary.emporiumTotal}`,
    },
    {
      label: 'Pristine Charms',
      value: `${summary.charmsFound} / ${summary.charmsTotal}`,
    },
    {
      label: 'Rolls Left Today',
      value: `${summary.pristineRollsLeft} / ${summary.symbolRollsLeft}`,
      tip: 'Pristine charm rolls left / symbol rolls left. Every charm roll today counts against both (120 and 75 a day).',
    },
  ]
  const playingLower = summary.selectedMastery < summary.mastery
  return (
    <div className="sneaking-header">
      <div className="sneaking-mastery-box">
        <span className="sneaking-mastery-label">Ninja Mastery</span>
        <span className="sneaking-mastery-tier">{summary.mastery > 0 ? toRoman(summary.mastery) : '—'}</span>
        <span className="sneaking-mastery-sub">
          {playingLower ? `Playing ${summary.selectedMastery > 0 ? toRoman(summary.selectedMastery) : 'base floors'}` : 'Highest reached'}
        </span>
      </div>
      <div className="sneaking-header-main">
        <div className="sneaking-jade">
          <img
            className="sneaking-jade-icon"
            src="images/sneaking/jade_coin.png"
            alt=""
          />
          <span className="sneaking-jade-value">{formatSneakingNumber(summary.jadeCoins)}</span>
          <span className="sneaking-jade-label">Jade Coins</span>
        </div>
        <div className="sneaking-stats">
          {stats.map(stat => (
            <div
              key={stat.label}
              className={`sneaking-stat${stat.tip ? ' tooltip-anchor' : ''}`}
            >
              <span className="sneaking-stat-label">
                {stat.label}
                {stat.tip && <span className="sneaking-stat-info">ⓘ</span>}
              </span>
              <span className="sneaking-stat-value">{stat.value}</span>
              {stat.tip && <span className="tooltip tooltip--wrap">{stat.tip}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
