import { cogMap } from '../../data'
import './Construction.css'

function CogCard({ cog }) {
  const cogData = cogMap[cog.name]
  const imageSrc = cogData?.image
  const displayName = cogData?.name ?? cog.name.replace(/_/g, ' ')

  return (
    <div className="cog-card">
      <div className="cog-card-top">
        <span className="cog-total">{cog.total}</span>
        <div className="cog-image-wrap">
          {imageSrc
            ? <img src={imageSrc} alt={displayName} className="cog-img" />
            : <div className="cog-img-placeholder" />
          }
          <span className="cog-badge">{cog.bonusConstructExp}%</span>
        </div>
      </div>
      <div className="cog-card-body">
        <span className="cog-name">{displayName}</span>
        <div className="cog-stats">
          <span className="cog-stat">+{cog.bonusConstructExp}% Bonus Construct EXP</span>
          <span className="cog-stat">+{cog.playerConstructExp}% Player Construct XP</span>
        </div>
        {cog.patternLabel && (
          <span className="cog-pattern">{cog.patternLabel}</span>
        )}
      </div>
    </div>
  )
}

export default function Construction({ snapshot }) {
  const { cogs = [], totalExpRate = 0 } = snapshot?.construction ?? {}

  return (
    <div className="page construction-page">
      <h2 className="page-title">Construction</h2>
      <div className="construction-total">
        Total EXP Rate: <strong>{totalExpRate}</strong>
      </div>
      <div className="cog-grid">
        {cogs.map(cog => (
          <CogCard key={cog.index} cog={cog} />
        ))}
      </div>
    </div>
  )
}