import { useMemo } from 'react'
import { buildOutpostSummary } from '../../data'
import { getResourceTotals, planOvernightSetup, formatBig } from '../../utils/resourcePlanner'
import InfoPanel from '../InfoPanel/InfoPanel'

import './RoyalResources.css'

function ResourceIcon({ imageFolder, resource }) {
  return <img src={`images/${imageFolder}/RGres${resource}.png`} alt={`Resource ${resource}`} className="mc-res-icon" />
}

function NodeChip({ node, imageFolder, muted }) {
  return (
    <span className={`mc-res-node tooltip-anchor${muted ? ' mc-res-node--muted' : ''}`}>
      <ResourceIcon imageFolder={imageFolder} resource={node.resource} />
      {formatBig(node.capacity)}
      <span className="tooltip">Node level {node.level} · holds {formatBig(node.capacity)}</span>
    </span>
  )
}

function Stockpile({ totals, imageFolder }) {
  const worlds = [...new Set(totals.map(t => t.world))]
  return (
    <div className="mc-res-stock">
      {worlds.map(world => (
        <div key={world} className={`mc-res-stock-world mc-res-world--w${world}`}>
          <span className="mc-res-stock-title">World {world}</span>
          <div className="mc-res-stock-grid">
            {totals.filter(t => t.world === world).map(t => (
              <div key={t.resource} className="mc-res-stock-item tooltip-anchor">
                <ResourceIcon imageFolder={imageFolder} resource={t.resource} />
                <span className="mc-res-stock-amount">{formatBig(t.stored)}</span>
                <span className="mc-res-stock-daily">+{formatBig(t.perDay)}/day</span>
                <span className="tooltip">
                  {formatBig(t.stored)} stored · up to {formatBig(t.perDay)} a day from {t.nodes} nodes
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function OvernightWorld({ plan, imageFolder }) {
  const changed = plan.rows.filter(r => r.changed)
  const setCount = plan.rows.filter(r => !r.changed && !r.spare).length
  const spareCount = plan.rows.filter(r => r.spare).length

  return (
    <details className={`mc-res-world mc-res-world--w${plan.world}`}>
      <summary className="mc-res-world-head">
        <span className="mc-res-world-title">World {plan.world}</span>
        <span className="mc-res-world-stat tooltip-anchor">
          {formatBig(plan.bisTotal)} overnight
          <span className="tooltip">
            Best setup collects {formatBig(plan.bisTotal)} of the {formatBig(plan.allTotal)} this world&apos;s nodes hold.
            Current connections: {formatBig(plan.currentTotal)}.
          </span>
        </span>
        <span className="mc-res-world-chips">
          {changed.length > 0
            ? <span className="mc-res-chip mc-res-chip--change">{changed.length} to reconnect</span>
            : <span className="mc-res-chip mc-res-chip--ok">✓ Best setup</span>}
        </span>
      </summary>

      <div className="mc-res-world-body">
        {changed.map(row => (
          <div key={row.mapIndex} className="mc-res-row">
            <span className="mc-res-row-name">{row.name}</span>
            <span className="mc-res-row-nodes">
              {row.target.map(n => <NodeChip key={n.index} node={n} imageFolder={imageFolder} muted={n.alreadyLinked} />)}
            </span>
            {row.current.length > 0 && (
              <span className="mc-res-row-now">
                now: {row.current.map(n => <NodeChip key={n.index} node={n} imageFolder={imageFolder} muted />)}
              </span>
            )}
          </div>
        ))}
        <p className="mc-res-note">
          {changed.length > 0
            ? `${setCount} other ${setCount === 1 ? 'depot is' : 'depots are'} already on their best nodes.`
            : 'Every Resource Depot is on its best nodes.'}
          {spareCount > 0 && ` ${spareCount} ${spareCount === 1 ? 'depot has' : 'depots have'} no node left to take, so ${spareCount === 1 ? 'it' : 'they'} can stay as is.`}
          {plan.unreachable.length > 0 && ` ${plan.unreachable.length} nodes are out of every outpost's range.`}
        </p>
      </div>
    </details>
  )
}

export default function RoyalResources({ snapshot, imageFolder }) {
  const rg = snapshot?.royalGuardian
  const summary = useMemo(() => buildOutpostSummary(rg), [rg])
  const totals = useMemo(() => getResourceTotals(rg, summary.outposts), [rg, summary])
  const overnight = useMemo(() => planOvernightSetup(rg, summary.outposts), [rg, summary])

  if (snapshot && !rg?.resourceStorage) {
    return <p>Re-import your save to see your resources.</p>
  }

  return (
    <div className="mc-res">
      <InfoPanel
        intro="Your Kingdom's resources and the best overnight connections for your Resource Depots."
        items={[
          'Per day assumes every node is drained once a day, like they are in your save.',
          'Overnight setup: which depot should connect to which node so the biggest nodes are collected while you\'re away. Faded nodes are already connected.',
        ]}
      />

      <h3 className="mc-res-heading">Stockpile</h3>
      <Stockpile totals={totals} imageFolder={imageFolder} />

      <h3 className="mc-res-heading">Overnight setup</h3>
      {!overnight.restock && (
        <p className="mc-res-note">Resource Replenish (Armory) isn&apos;t bought yet, so drained nodes won&apos;t refill.</p>
      )}
      {overnight.worlds.map(plan => (
        <OvernightWorld key={plan.world} plan={plan} imageFolder={imageFolder} />
      ))}
    </div>
  )
}
