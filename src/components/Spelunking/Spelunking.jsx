import { useMemo, useState } from 'react'
import { spelunkingUpgradeGroups, spelunkingUpgradeMap, MAX_GRAND_DISCOVERIES, MAX_ELIXIR_TYPES } from '../../data'
import { getSpelunkingSummary, getSpelunkingUpgrades, formatAmber } from '../../utils/spelunkingUtils'
import { getMaxPossibleTalentLevel } from '../../utils/talentUtils'
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

const AMBER_HOARD = 235

// 54.4 → "2d 6h", 3.5 → "3h 30m"
function formatHours(hours) {
  if (hours === null || !Number.isFinite(hours)) return null
  const minutes = Math.max(1, Math.round(hours * 60))
  const days = Math.floor(minutes / 1440)
  const h = Math.floor((minutes % 1440) / 60)
  const m = minutes % 60
  if (days > 0) return `${days}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

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
      {[].concat(sub ?? []).filter(Boolean).map(line => (
        <span
          key={line}
          className="spelunk-stat-sub"
        >
          {line}
        </span>
      ))}
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
        sub="All tunnels, normal runs"
      />
      {summary.manicUnlocked && (
        <StatTile
          label="Total Manic Depth"
          value={formatCount(totals.manicDepths)}
          sub="Separate record, Manic Mode runs"
        />
      )}
      <StatTile
        label="Discoveries"
        value={`${totals.discoveries} / ${summary.maxDiscoveries}`}
        done={summary.maxDiscoveries > 0 && totals.discoveries >= summary.maxDiscoveries}
      />
      <StatTile
        label="Grand Discoveries"
        value={`${totals.grandDiscoveries} / ${summary.maxGrandDiscoveries}`}
        done={summary.maxGrandDiscoveries > 0 && totals.grandDiscoveries >= summary.maxGrandDiscoveries}
      />
      <StatTile
        label="Overstim"
        value={`Lv ${formatCount(overstim.level)}`}
        sub={[
          `${Math.floor((overstim.progress / overstim.required) * 100)}% to next LV`,
          formatHours(overstim.hoursToNext) && `Next LV in ~${formatHours(overstim.hoursToNext)}`,
        ]}
      />
      <StatTile
        label="Elixirs"
        value={`${summary.elixirTypes} / ${MAX_ELIXIR_TYPES}`}
        done={summary.elixirTypes >= MAX_ELIXIR_TYPES}
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
              <img
                src={`images/spelunking/CaveMainBG${i}.png`}
                alt=""
                className="spelunk-tunnel-bg"
                onError={hideBrokenImg}
              />
              <img
                src={`images/spelunking/CaveDoor${i}.png`}
                alt=""
                className="spelunk-tunnel-door"
                onError={hideBrokenImg}
              />
              <div className="spelunk-tunnel-title">
                <span className="spelunk-tunnel-index">Tunnel {i + 1}</span>
                <span className="spelunk-tunnel-name">{tunnel.name}</span>
              </div>
              <div className="spelunk-tunnel-boss tooltip-anchor">
                <img
                  src={`images/spelunking/CaveBoss${i}.png`}
                  alt=""
                  className={`spelunk-tunnel-boss-img${tunnel.cleared ? '' : ' spelunk-tunnel-boss-img--alive'}`}
                  onError={hideBrokenImg}
                />
                <span className="tooltip tooltip--right">{tunnel.cleared ? 'Lore boss defeated' : 'Lore boss not defeated'}</span>
              </div>
            </div>
            <div className="spelunk-tunnel-body">
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
            </div>
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

function UpgradesTab({ snapshot, amberTier }) {
  const [search, setSearch] = useState('')
  const [hideMaxed, setHideMaxed] = useState(false)
  const [onlyAffordable, setOnlyAffordable] = useState(false)
  const [maxAmberHoard, setMaxAmberHoard] = useState(false)
  const upgrades = useMemo(() => getSpelunkingUpgrades(snapshot, { maxAmberHoard }), [snapshot, maxAmberHoard])
  const hoardLevel = useMemo(() => getMaxPossibleTalentLevel(snapshot, AMBER_HOARD).value, [snapshot])

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
        {hoardLevel > 0 && (
          <label className="styled-checkbox tooltip-anchor spelunk-hoard-toggle">
            <input
              type="checkbox"
              checked={maxAmberHoard}
              onChange={e => setMaxAmberHoard(e.target.checked)}
            />
            Max Amber Hoard
            <span className="tooltip tooltip--wrap">
              Prices the shop as if your Royal Guardian had the Amber Hoard talent at Lv {hoardLevel}: its max
              level plus added and super talent levels. Amber Hoard is normally left empty and only filled
              before buying upgrades.
            </span>
          </label>
        )}
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
          'Turn on Max Amber Hoard to see prices with Amber Hoard at the highest level your account can reach, the way you\'d set it before a shopping trip.',
          'Green upgrades are affordable with the amber you have right now. Faded ones are locked behind the upgrade named on them.',
          'Two numbers still show as "?": Grand Discovery odds and the best tool for Nova Blasts.',
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
          snapshot={snapshot}
          amberTier={summary.amberTier}
        />
      )}
      {activeTab === 'tunnels' && <TunnelsTab summary={summary} />}
    </div>
  )
}
