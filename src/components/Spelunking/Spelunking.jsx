import { useMemo, useState } from 'react'
import { spelunkingUpgradeGroups, spelunkingUpgradeMap, MAX_GRAND_DISCOVERIES, MAX_ELIXIR_TYPES, MAX_ELIXIR_SLOTS, MAX_ELIXIR_DUPLICATES } from '../../data'
import { getSpelunkingSummary, getSpelunkingUpgrades, formatAmber } from '../../utils/spelunkingUtils'
import InfoPanel from '../InfoPanel/InfoPanel'
import './Spelunking.css'

const TABS = [
  { id: 'upgrades', label: 'Shop Upgrades' },
  { id: 'tunnels', label: 'Tunnels' },
]

const hideBrokenImg = e => {
  e.currentTarget.style.display = 'none'
}

const formatCount = value => Math.round(value ?? 0).toLocaleString('en-US')

// ============================================================
// OVERVIEW STRIP
// ============================================================

function StatTile({ label, value, sub, done, children }) {
  return (
    <div className={`spelunk-stat${done ? ' spelunk-stat--done' : ''}`}>
      <span className="spelunk-stat-label">{label}</span>
      <span className="spelunk-stat-value">
        {children}
        {value}
      </span>
      {sub && <span className="spelunk-stat-sub">{sub}</span>}
    </div>
  )
}

function AmberIcon({ tier, small }) {
  return (
    <img
      src={`images/spelunking/CaveAmber${tier.index}.png`}
      alt={tier.name}
      className={small ? 'spelunk-amber-icon spelunk-amber-icon--small' : 'spelunk-amber-icon'}
      onError={hideBrokenImg}
    />
  )
}

function Overview({ summary }) {
  const { totals, amberTier, overstim } = summary
  return (
    <div className="spelunk-stats">
      <StatTile
        label="Amber"
        value={formatAmber(summary.amber, amberTier)}
        sub={amberTier.name}
      >
        <AmberIcon tier={amberTier} />
      </StatTile>
      <StatTile
        label="Tunnels Cleared"
        value={`${summary.tunnelsCleared} / ${summary.tunnels}`}
        sub="Lore bosses defeated"
        done={summary.tunnels > 0 && summary.tunnelsCleared >= summary.tunnels}
      />
      <StatTile
        label="Total Best Depth"
        value={formatCount(totals.bestDepths)}
        sub={summary.manicUnlocked ? `Manic: ${formatCount(totals.manicDepths)}` : 'All tunnels added up'}
      />
      <StatTile
        label="Discoveries"
        value={formatCount(totals.discoveries)}
      />
      <StatTile
        label="Grand Discoveries"
        value={`${totals.grandDiscoveries} / ${summary.maxGrandDiscoveries}`}
        done={summary.maxGrandDiscoveries > 0 && totals.grandDiscoveries >= summary.maxGrandDiscoveries}
      />
      <StatTile
        label="Daily Page Reads"
        value={`${summary.pageReads} / ${summary.maxPageReads}`}
        sub="Read today"
        done={summary.pageReads >= summary.maxPageReads}
      />
      <StatTile
        label="Overstim"
        value={`Lv ${formatCount(overstim.level)}`}
        sub={`${Math.floor((overstim.progress / overstim.required) * 100)}% to next LV`}
      />
      <StatTile
        label="Elixirs"
        value={`${summary.elixirTypes} / ${MAX_ELIXIR_TYPES}`}
        sub={`${summary.elixirSlots} / ${MAX_ELIXIR_SLOTS} slots · ${summary.elixirDuplicates} / ${MAX_ELIXIR_DUPLICATES} dupes`}
        done={summary.elixirTypes >= MAX_ELIXIR_TYPES && summary.elixirSlots >= MAX_ELIXIR_SLOTS && summary.elixirDuplicates >= MAX_ELIXIR_DUPLICATES}
      />
      <StatTile
        label="Total Upgrade LV"
        value={formatCount(totals.upgradeLevels)}
        sub={summary.manicUnlocked ? `Manic Mode ${summary.manicMode ? 'ON' : 'OFF'}` : null}
      />
    </div>
  )
}

// ============================================================
// TUNNELS TAB
// ============================================================

function TunnelsTab({ summary }) {
  return (
    <div className="spelunk-tunnel-grid">
      {summary.tunnelList.map((tunnel, i) => {
        const gdDone = tunnel.grandDiscoveries >= MAX_GRAND_DISCOVERIES
        return (
          <div
            key={tunnel.name}
            className={`spelunk-tunnel${tunnel.cleared ? '' : ' spelunk-tunnel--locked'}`}
          >
            <div className="spelunk-tunnel-head">
              <span className="spelunk-tunnel-index">{i + 1}</span>
              <span className="spelunk-tunnel-name">{tunnel.name}</span>
            </div>
            <div className="spelunk-tunnel-row">
              <span>Best Depth</span>
              <span className="spelunk-tunnel-value">{formatCount(tunnel.bestDepth)}</span>
            </div>
            {summary.manicUnlocked && (
              <div className="spelunk-tunnel-row">
                <span>Manic Depth</span>
                <span className="spelunk-tunnel-value">{formatCount(tunnel.bestManicDepth)}</span>
              </div>
            )}
            <div className="spelunk-tunnel-row">
              <span>Grand Discoveries</span>
              <span className={`spelunk-tunnel-value${gdDone ? ' spelunk-tunnel-value--done' : ''}`}>
                {tunnel.grandDiscoveries} / {MAX_GRAND_DISCOVERIES}
              </span>
            </div>
            {!tunnel.cleared && <span className="spelunk-tunnel-note">Lore boss not defeated</span>}
          </div>
        )
      })}
    </div>
  )
}

// ============================================================
// UPGRADES TAB
// ============================================================

function UpgradeRow({ upgrade, amberTier }) {
  const levelText = upgrade.capped ? `Lv ${upgrade.level} / ${upgrade.maxLevel}` : `Lv ${formatCount(upgrade.level)}`
  const stateClass = upgrade.maxed
    ? ' spelunk-upgrade--maxed'
    : !upgrade.unlocked
      ? ' spelunk-upgrade--locked'
      : upgrade.affordable
        ? ' spelunk-upgrade--affordable'
        : ''

  return (
    <div className={`spelunk-upgrade${stateClass}`}>
      <img
        src={`images/spelunking/CaveShopUpg${upgrade.index}.png`}
        alt=""
        className="spelunk-upgrade-icon"
        onError={hideBrokenImg}
      />
      <div className="spelunk-upgrade-body">
        <div className="spelunk-upgrade-head">
          <span className="spelunk-upgrade-name">{upgrade.name}</span>
          <span className="spelunk-upgrade-level">{upgrade.maxed ? 'MAX' : levelText}</span>
        </div>
        {upgrade.lines.map((line, i) => (
          <p
            key={i}
            className="spelunk-upgrade-line"
          >
            {line}
          </p>
        ))}
        {!upgrade.maxed && !upgrade.unlocked && (
          <span className="spelunk-upgrade-cost spelunk-upgrade-cost--locked">
            Locked — needs {spelunkingUpgradeMap[upgrade.requires]?.name}
          </span>
        )}
        {!upgrade.maxed && upgrade.unlocked && (
          <span className="spelunk-upgrade-cost">
            <AmberIcon
              tier={amberTier}
              small
            />
            Next LV: {formatAmber(upgrade.cost, amberTier)}
            {upgrade.costToMax !== null && upgrade.maxLevel - upgrade.level > 1 && (
              <span className="spelunk-upgrade-tomax">
                · To max: {formatAmber(upgrade.costToMax, amberTier)}
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  )
}

function UpgradesTab({ upgrades, amberTier }) {
  const [search, setSearch] = useState('')
  const [hideMaxed, setHideMaxed] = useState(false)
  const [onlyAffordable, setOnlyAffordable] = useState(false)

  const affordableCount = upgrades.filter(upgrade => upgrade.affordable).length
  const query = search.trim().toLowerCase()

  const groups = spelunkingUpgradeGroups
    .map((name, column) => {
      const all = upgrades
        .filter(upgrade => upgrade.column === column)
        .sort((a, b) => a.row - b.row)
      const shown = all.filter(upgrade => (
        (!hideMaxed || !upgrade.maxed)
        && (!onlyAffordable || upgrade.affordable)
        && (!query || `${upgrade.name} ${upgrade.lines.join(' ')}`.toLowerCase().includes(query))
      ))
      const toMax = all.reduce((total, upgrade) => total + (upgrade.costToMax ?? 0), 0)
      return {
        name,
        column,
        shown,
        toMax,
        maxed: all.every(upgrade => upgrade.maxed),
      }
    })
    .filter(group => group.shown.length > 0)

  return (
    <>
      <div className="spelunk-controls">
        <input
          type="search"
          className="spelunk-search"
          placeholder="Search upgrades..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <label className="styled-checkbox">
          <input
            type="checkbox"
            checked={hideMaxed}
            onChange={e => setHideMaxed(e.target.checked)}
          />
          Hide maxed
        </label>
        <label className="styled-checkbox">
          <input
            type="checkbox"
            checked={onlyAffordable}
            onChange={e => setOnlyAffordable(e.target.checked)}
          />
          Affordable now
          {affordableCount > 0 && <span className="notice-badge">{affordableCount}</span>}
        </label>
      </div>

      {groups.length === 0 && <p className="page-empty spelunk-empty">No upgrades match.</p>}

      <div className="spelunk-group-grid">
        {groups.map(group => (
          <div
            key={group.column}
            className="spelunk-group"
          >
            <div className="spelunk-group-head">
              <span className="spelunk-group-name">{group.name}</span>
              {group.maxed ? (
                <span className="spelunk-group-done">All maxed</span>
              ) : group.toMax > 0 && (
                <span className="spelunk-group-tomax">
                  <AmberIcon
                    tier={amberTier}
                    small
                  />
                  {formatAmber(group.toMax, amberTier)} to max
                </span>
              )}
            </div>
            {group.shown.map(upgrade => (
              <UpgradeRow
                key={upgrade.index}
                upgrade={upgrade}
                amberTier={amberTier}
              />
            ))}
          </div>
        ))}
      </div>
    </>
  )
}

// ============================================================
// PAGE
// ============================================================

export default function Spelunking({ snapshot }) {
  const [activeTab, setActiveTab] = useState('upgrades')
  const summary = useMemo(() => getSpelunkingSummary(snapshot), [snapshot])
  const upgrades = useMemo(() => getSpelunkingUpgrades(snapshot), [snapshot])

  if (!snapshot?.spelunking?.upgradeLevels) {
    return (
      <div className="page">
        <h2 className="page-title">Spelunking</h2>
        <p className="page-empty">Import (or re-import) your save to see Spelunking.</p>
      </div>
    )
  }

  return (
    <div className="page spelunk-page">
      <h2 className="page-title">Spelunking</h2>

      <InfoPanel
        intro="Your World 7 Spelunking progress and the Amber shop."
        items={[
          'Costs include your shop discounts (Woahtermelon meal, sushi, jelly and the Royal Guardian Amber Hoard talent) and are shown in your current amber color, like in game.',
          'Green upgrades are affordable with the amber you have right now. Faded ones are locked behind the upgrade named on them.',
          'A few numbers that need stamina, POW or drop-chance math (regen rate, Grand Discovery odds, fragment odds) show as "?" for now.',
        ]}
      />

      <Overview summary={summary} />

      <div className="page-tabs spelunk-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`page-tab-btn${activeTab === tab.id ? ' page-tab-btn--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'upgrades' && (
        <UpgradesTab
          upgrades={upgrades}
          amberTier={summary.amberTier}
        />
      )}
      {activeTab === 'tunnels' && <TunnelsTab summary={summary} />}
    </div>
  )
}
