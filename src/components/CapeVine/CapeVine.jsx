import { CAPE_VINE_SHARE, GOLDEN_VINE_PACK, GOLDEN_VINE_LEVEL_STEP } from '../../data'
import { getCapeVine } from '../../utils/capeVineUtils'
import InfoPanel from '../InfoPanel/InfoPanel'
import PremiumCollection from '../PremiumCollection/PremiumCollection'

// The Cape Vine (World 4, Catherine): every cape, which ones are on the vine and the vine's total bonuses.
// Golden Vines = Lovely Balloon pack (3) + 1 per 500 levels of the highest character; the first that many
// capes on the vine are golden. Totals match Eli's in-game Cape Vine screen. Math in utils/capeVineUtils.js.

const percent = share => `${Math.round(share * 100)}%`

function getCapeTag(cape) {
  if (!cape.owned) {
    return {
      text: 'Missing',
      className: 'collection-item-tag--missing',
    }
  }
  if (cape.golden) {
    return {
      text: 'Golden',
      className: 'collection-item-tag--golden',
    }
  }
  return { text: 'Vine' }
}

const byVineSlot = (a, b) => a.slot - b.slot

export default function CapeVine({ snapshot }) {
  if (!snapshot?.capeVine) {
    return (
      <div className="page">
        <h2 className="page-title">The Cape Vine</h2>
        <p className="page-empty">No Cape Vine data. Import (or re-import) a save to see your capes.</p>
      </div>
    )
  }

  const { capes, ownedCount, goldenVines, multi, goldenUsed, bonuses } = getCapeVine(snapshot)

  const summary = (
    <>
      <div className="collection-chip">
        <span className="collection-chip-label">Capes on the vine</span>
        <span className="collection-chip-value">{ownedCount} / {capes.length}</span>
      </div>
      <div className="collection-chip tooltip-anchor">
        <span className="collection-chip-label">Golden Vines</span>
        <span className="collection-chip-value collection-chip-value--gold">{goldenVines.count}</span>
        <span className="collection-chip-sub">{goldenUsed} filled</span>
        <span className="tooltip">
          <span className="collection-tooltip-row">
            <span>Lovely Balloon pack</span>
            <span>{goldenVines.pack > 0 ? `+${goldenVines.pack}` : 'not owned'}</span>
          </span>
          <span className="collection-tooltip-row">
            <span>Highest character Lv {goldenVines.highestLevel.toLocaleString()} (1 per {GOLDEN_VINE_LEVEL_STEP} LV)</span>
            <span>+{goldenVines.fromLevels}</span>
          </span>
          <span className="collection-tooltip-row collection-tooltip-total">
            <span>Next at Lv {goldenVines.nextLevel.toLocaleString()}</span>
            <span>{goldenVines.levelsToNext.toLocaleString()} LV to go</span>
          </span>
        </span>
      </div>
      <div className="collection-chip tooltip-anchor">
        <span className="collection-chip-label">Cape Vine multi</span>
        <span className="collection-chip-value collection-chip-value--accent">{multi.value.toFixed(2)}x</span>
        <span className="tooltip">
          {multi.parts.map(part => (
            <span
              key={part.label}
              className="collection-tooltip-row"
            >
              <span>{part.label}</span>
              <span>+{part.value}%</span>
            </span>
          ))}
          <span className="collection-tooltip-row collection-tooltip-total">
            <span>Total</span>
            <span>{multi.value.toFixed(2)}x</span>
          </span>
        </span>
      </div>
    </>
  )

  return (
    <div className="page">
      <h2 className="page-title">The Cape Vine</h2>
      <InfoPanel
        intro="Capes on Catherine's World 4 Cape Vine give their bonuses to all characters. Worn capes give nothing, so wear whichever one you like."
        items={[
          `A cape on a Golden Vine gives all of its bonuses; on the rest of the vine it gives ${percent(CAPE_VINE_SHARE)} (the game says 20%, but your in-game totals only add up with ${percent(CAPE_VINE_SHARE)}). Every cape's bonus is then × the Cape Vine multi: +1% per cape on the vine. Only a cape's bonus lines count, not its base stats.`,
          `Golden Vines: ${GOLDEN_VINE_PACK} from the Lovely Balloon pack, plus 1 for every ${GOLDEN_VINE_LEVEL_STEP} levels your highest character has reached (claim them from Catherine). Hover the count for yours.`,
          'Your capes fill the vine in order and the first ones take the Golden Vines, so put your best capes there in game.',
          'Owned capes show what they give you now (multi included), in vine order (Golden Vines first). Missing capes are listed last with their full bonuses: pick Missing to see only those.',
        ]}
      />
      <PremiumCollection
        summary={summary}
        bonuses={bonuses}
        items={capes}
        itemLabel="cape"
        imgFolder="capes"
        bonusesNote="Rounded up, the same way the vine shows them."
        roundUp
        getTag={getCapeTag}
        sortOwned={byVineSlot}
        includeStats={false}
      />
    </div>
  )
}
