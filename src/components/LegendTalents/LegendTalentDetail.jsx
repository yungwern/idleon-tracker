import { LEGEND_TALENT_TIERS, LEGEND_TALENT_TIER_NOTES } from '../../data'

// Info box under the board / tier list for the selected talent (like the game's info box).
// hasSave = false: no levels to show, so max LV lists what can raise it instead.

function maxLevelLines(maxLevel, hasSave) {
  const { base, fever, menagerie } = maxLevel
  if (!hasSave) {
    const boosts = [
      fever && `+3 from ${fever.color} Fever (Research grid)`,
      menagerie && `+${menagerie.bonus} from a Menagerie unlock`,
    ].filter(Boolean)
    return {
      raised: `${base}${boosts.length ? `, ${boosts.join(', ')}` : ''}`,
      missing: null,
    }
  }
  const raised = [
    fever?.level > 0 && `+${fever.level} ${fever.color} Fever`,
    menagerie?.owned && `+${menagerie.bonus} Menagerie`,
  ].filter(Boolean)
  const missing = [
    fever && fever.level < 3 && `${fever.color} Fever (Research grid, ${fever.level}/3)`,
    menagerie && !menagerie.owned && `Menagerie unlock (+${menagerie.bonus})`,
  ].filter(Boolean)
  return {
    raised: raised.length ? [`${base} base`, ...raised].join(' · ') : null,
    missing: missing.join(' · ') || null,
  }
}

export default function LegendTalentDetail({ talent, hasSave }) {
  const tier = LEGEND_TALENT_TIERS.find(entry => entry.talents.includes(talent.index))
  const note = LEGEND_TALENT_TIER_NOTES[talent.index]
  const lines = maxLevelLines(talent.maxLevel, hasSave)
  const isMaxed = hasSave && talent.level >= talent.maxLevel.value

  return (
    <div className={`legend-detail legend-detail--${talent.row.toLowerCase()}`}>
      <img
        className="legend-detail-img"
        src={talent.img}
        alt=""
      />
      <div className="legend-detail-body">
        <div className="legend-detail-head">
          <span className="legend-detail-name">{talent.name}</span>
          <span className="legend-detail-spot">{talent.row} {talent.spot}</span>
          {tier && (
            <span
              className="legend-detail-tier"
              data-tier={tier.id}
            >
              {tier.id === 'must' ? 'Must buy' : `${tier.label} tier`}
            </span>
          )}
          {hasSave && (
            <span className={`legend-detail-level${isMaxed ? ' legend-detail-level--maxed' : ''}`}>
              LV {talent.level} / {talent.maxLevel.value}
            </span>
          )}
        </div>
        <span className="legend-detail-text">{talent.description}</span>
        {note && (
          <span className="legend-detail-note">{note}</span>
        )}
        {lines.raised && (
          <span className="legend-detail-meta">Max LV: {lines.raised}</span>
        )}
        {lines.missing && (
          <span className="legend-detail-meta legend-detail-meta--missing">Max LV can go up with: {lines.missing}</span>
        )}
      </div>
    </div>
  )
}
