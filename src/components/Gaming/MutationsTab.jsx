import { getMutations } from '../../utils/gamingBonusUtils'
import { formatBits, getBitsImage, formatGamingNumber } from '../../utils/gamingUtils'

// Mutations tab: DNA, the chance to research a new species (shown even once all 8 are found, like the game),
// how that chance flattens with DNA (claim often), the Mutation upgrade cost, and the 8 mutations

function pct(value) {
  return `${formatGamingNumber(value)}%`
}

// Small chances keep 3 significant digits (0.0716%) so the table still shows the curve
function pctFine(value) {
  if (value <= 0) return '0%'
  return value < 1 ? `${Number(value.toPrecision(3))}%` : pct(Math.round(value * 100) / 100)
}

export default function MutationsTab({ snapshot }) {
  const mutations = getMutations(snapshot)
  const bits = snapshot.gaming.bits

  return (
    <div className="gaming-body">
      <div className="gaming-summary gaming-summary--left">
        <div className="gaming-stat">
          <img
            className="gaming-stat-icon"
            src="images/gaming/DNA.png"
            alt=""
          />
          <span className="gaming-stat-value">{formatGamingNumber(mutations.dna)}</span>
          <span className="gaming-stat-label">DNA</span>
        </div>
        <div className="gaming-stat">
          <span className="gaming-stat-value">{mutations.unlocked} / {mutations.list.length}</span>
          <span className="gaming-stat-label">Species found</span>
        </div>
        <div className="gaming-stat tooltip-anchor">
          <span className="gaming-stat-value">{pct(mutations.newChance)}</span>
          <span className="gaming-stat-label">New species chance<span className="info-icon" /></span>
          <span className="tooltip tooltip--wrap">
            Chance to research a new mutant species with the DNA you have, as the game shows it. Lower for every
            species already found{mutations.voteActive ? '; includes this week\'s Bonus Ballot' : ''}.
          </span>
        </div>
        <div className="gaming-stat tooltip-anchor">
          <span className={`gaming-stat-value ${mutations.cost <= bits ? 'gaming-good' : ''}`}>{formatBits(mutations.cost)}</span>
          <img
            className="gaming-stat-icon"
            src={getBitsImage(mutations.cost)}
            alt=""
          />
          <span className="gaming-stat-label">Mutation upgrade<span className="info-icon" /></span>
          <span className="tooltip tooltip--wrap">
            Next LV of the Mutation upgrade (LV {formatGamingNumber(mutations.evolutionLevel)}), which raises every
            sprout's chance to evolve.
          </span>
        </div>
      </div>

      <section className="gaming-card">
        <div className="gaming-card-title">
          Claim often, don't save up DNA
          {mutations.splitGain > 1.01 && (
            <span className="gaming-card-stat">2 small claims ≈ {formatGamingNumber(Math.round(mutations.splitGain * 100) / 100)}x the finds</span>
          )}
        </div>
        <p className="gaming-text gaming-text--note">
          The new species chance flattens as DNA grows: it reaches half its max at 100 DNA, and each DNA after that
          adds less. So if a research attempt uses up your DNA, many small claims find more species on average than
          a few big ones: two claims at 100 DNA find about {formatGamingNumber(Math.round(mutations.splitGain * 100) / 100)}x
          as many as one claim at 200. Odds for one claim with {mutations.unlocked} species found:
        </p>
        <div className="gaming-dna-table">
          <div className="gaming-dna-head">
            <span>DNA per claim</span>
            <span>Chance</span>
            <span>Chance per 100 DNA</span>
          </div>
          {mutations.dnaTable.map(row => (
            <div
              key={row.dna}
              className="gaming-dna-row"
            >
              <span>{formatGamingNumber(row.dna)}</span>
              <span>{pctFine(row.chance)}</span>
              <span className="gaming-muted">{pctFine(row.per100)}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="gaming-card-grid">
        {mutations.list.map(mutation => (
          <div
            key={mutation.name}
            className={`gaming-card${mutation.unlocked ? ' gaming-card--owned' : ' gaming-card--dim'}`}
          >
            <div className="gaming-import-head">
              <img
                className="gaming-mutation-img"
                src={`images/gaming/Mutation_${mutation.index}.png`}
                alt=""
              />
              <div className="gaming-import-head-text">
                <div className="gaming-card-title">
                  {mutation.name}
                  {mutation.unlocked && <span className="gaming-pill gaming-pill--good">Unlocked</span>}
                </div>
                {mutation.lines.map(line => (
                  <p
                    key={line}
                    className="gaming-text"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
