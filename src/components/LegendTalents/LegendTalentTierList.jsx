import TierList from '../TierList/TierList'
import { LEGEND_TALENT_TIERS } from '../../data'

// Tier List tab: LEGEND_TALENT_TIERS through the shared TierList, talents in grid order.
// With a save, each talent shows its LV and maxed ones fade so what's left stands out.

export default function LegendTalentTierList({ talents, hasSave, selectedIndex, onSelect }) {
  const byIndex = Object.fromEntries(talents.map(talent => [talent.index, talent]))
  const tiers = LEGEND_TALENT_TIERS.map(tier => ({
    ...tier,
    items: [...tier.talents].sort((a, b) => byIndex[a].position - byIndex[b].position),
  }))
  const isMaxed = index => byIndex[index].level >= byIndex[index].maxLevel.value

  return (
    <>
      <h3 className="legend-card-title">
        Tier List
        <span className="legend-card-stat">Balanced around World 7 progression</span>
      </h3>
      <TierList
        tiers={tiers}
        itemMap={byIndex}
        getImageSrc={index => byIndex[index].img}
        getCaption={index => hasSave
          ? (isMaxed(index) ? 'MAX' : `${byIndex[index].level}/${byIndex[index].maxLevel.value}`)
          : null}
        getItemClass={index => hasSave && isMaxed(index) ? 'legend-tier-item--maxed' : ''}
        onItemClick={onSelect}
        selectedId={selectedIndex}
        variant="legend-talents"
      />
    </>
  )
}
