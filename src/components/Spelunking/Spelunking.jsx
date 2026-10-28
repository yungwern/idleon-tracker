import { useMemo, useState } from 'react'
import { spelunkingUpgradeGroups, spelunkingUpgradeMap, MAX_GRAND_DISCOVERIES } from '../../data'
import { getSpelunkingSummary, getSpelunkingUpgrades, getSpelunkingPow, getAmberGain, getTunnelDiscoveries, getBestGrandDiscoveryCharacter, getGrandVein, formatAmber } from '../../utils/spelunkingUtils'
import { toClassSlug } from '../../utils/appUtils'
import { getMaxPossibleTalentLevel } from '../../utils/talentUtils'
import { formatBigNumber } from '../../utils/cogBoardUtils'
import InfoPanel from '../InfoPanel/InfoPanel'
import LoreTab from './LoreTab'
import ElixirTab from './ElixirTab'
import './Spelunking.css'

const TABS = [
  { id: 'upgrades', label: 'Shop Upgrades' },
  { id: 'tunnels', label: 'Tunnels' },
  { id: 'lore', label: 'Lore' },
  { id: 'elixirs', label: 'Elixirs' },
]

const hideBrokenImg = e => {
  e.currentTarget.style.display = 'none'
}

const formatCount = value => Math.round(value ?? 0).toLocaleString('en-US')

const formatPow = value => (value >= 1e7 ? formatBigNumber(value) : formatCount(value))

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

// icon: image under images/spelunking/ shown before the value (or pass a custom one as children)
function StatTile({ label, value, sub, done, tooltip, icon, children }) {
  return (
    <div className={`spelunk-stat${done ? ' spelunk-stat--done' : ''}${tooltip ? ' tooltip-anchor' : ''}`}>
      <span className="spelunk-stat-label">{label}</span>
      <span className="spelunk-stat-value">
        {icon && (
          <img
            src={`images/spelunking/${icon}`}
            alt=""
            className="spelunk-stat-icon"
            onError={hideBrokenImg}
          />
        )}
        {children}
        {value}
      </span>
      {[].concat(sub ?? []).filter(Boolean).map(line => (
        <span
          key={typeof line === 'string' ? line : line.key}
          className="spelunk-stat-sub"
        >
          {line}
        </span>
      ))}
      {tooltip && <span className="tooltip tooltip--wrap">{tooltip}</span>}
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

// Gold = best depth, blue = Manic Mode depth, like under each tunnel in game
function DepthTrophy({ manic }) {
  return (
    <img
      src={`images/spelunking/${manic ? 'ManicTrophy' : 'DepthTrophy'}.png`}
      alt={manic ? 'Manic depth' : 'Best depth'}
      className="spelunk-trophy"
      onError={hideBrokenImg}
    />
  )
}

const percentToNext = meter => `${Math.floor((meter.progress / meter.required) * 100)}% to next LV`

function Overview({ summary, pow, amberGain, tomeMissing }) {
  const { totals, amberTier, overstim, trackometer } = summary
  return (
    <div className="spelunk-stats">
      <StatTile
        label="Amber"
        value={formatAmber(summary.amber, amberTier)}
        sub={[
          amberTier.name,
          `${formatPow(amberGain)}x Amber gain${tomeMissing ? '*' : ''}`,
        ]}
        tooltip={tomeMissing
          ? '*Leaves out the Tome lore bonus to Amber: enter your Tome points in Import Save to include it.'
          : null}
      >
        <AmberIcon tier={amberTier} />
      </StatTile>
      <StatTile
        label="POW"
        icon="CaveShopUpg0.png"
        value={formatPow(pow)}
        sub="Total Spelunking POW"
      />
      <StatTile
        label="Tunnels Cleared"
        icon="CaveSkull.png"
        value={`${summary.tunnelsCleared} / ${summary.tunnels}`}
        sub="Lore bosses defeated"
        done={summary.tunnels > 0 && summary.tunnelsCleared >= summary.tunnels}
      />
      <StatTile
        label="Total Depth"
        value={formatCount(totals.bestDepths)}
        sub={[
          'Best runs, all tunnels',
          summary.manicUnlocked && (
            <span
              key="manic"
              className="spelunk-stat-manic"
            >
              <DepthTrophy manic />
              Manic: {formatCount(totals.manicDepths)}
            </span>
          ),
        ]}
      >
        <DepthTrophy />
      </StatTile>
      <StatTile
        label="Discoveries"
        icon="CaveRock_0.png"
        value={`${totals.discoveries} / ${summary.maxDiscoveries}`}
        done={summary.maxDiscoveries > 0 && totals.discoveries >= summary.maxDiscoveries}
      />
      <StatTile
        label="Grand Discoveries"
        icon="CaveShopUpg43.png"
        value={`${totals.grandDiscoveries} / ${summary.maxGrandDiscoveries}`}
        done={summary.maxGrandDiscoveries > 0 && totals.grandDiscoveries >= summary.maxGrandDiscoveries}
      />
      <StatTile
        label="Overstim"
        icon="CaveShopUpg6.png"
        value={`Lv ${formatCount(overstim.level)}`}
        sub={[
          `${percentToNext(overstim)}`,
          formatHours(overstim.hoursToNext) && `Next LV in ~${formatHours(overstim.hoursToNext)}`,
          overstim.amberBonus > 0 && `+${formatBigNumber(overstim.amberBonus)}% Amber`,
        ]}
      />
      <StatTile
        label="Trackometer"
        icon="CaveShopUpg59.png"
        value={trackometer.unlocked ? `Lv ${formatCount(trackometer.level)}` : 'Locked'}
        sub={trackometer.unlocked
          ? [
            `${percentToNext(trackometer)} (${formatBigNumber(trackometer.progress)} / ${formatBigNumber(trackometer.required)})`,
            `+${formatBigNumber(trackometer.expBonus)}% Stamina EXP`,
            trackometer.amberBonus > 0 && `+${formatBigNumber(trackometer.amberBonus)}% Amber`,
          ]
          : 'Needs the Stamina Trackometer upgrade'}
      />
      <StatTile
        label="Total Upgrade LV"
        icon="CaveSign1.png"
        value={formatCount(totals.upgradeLevels)}
        sub="All shop upgrades"
      />
    </div>
  )
}

// ============================================================
// TUNNELS TAB
// ============================================================

// Defeated: the reward it gave. Not yet: hidden behind a button so it isn't spoiled.
function LoreBossReward({ boss, defeated }) {
  const [revealed, setRevealed] = useState(false)
  const showReward = defeated || revealed

  return (
    <div className={`spelunk-lore${defeated ? ' spelunk-lore--defeated' : ''}`}>
      <div className="spelunk-lore-head">
        <span className="spelunk-lore-label">
          {defeated ? '✓ Lore Boss Defeated' : `Lore Boss · Depth ${boss.depth}`}
        </span>
        {!defeated && (
          <button
            type="button"
            className="spelunk-lore-btn"
            onClick={() => setRevealed(!revealed)}
          >
            {revealed ? 'Hide reward' : 'Show reward'}
          </button>
        )}
      </div>
      {showReward && boss.reward.map(line => (
        <p
          key={line}
          className="spelunk-lore-line"
        >
          {line}
        </p>
      ))}
    </div>
  )
}

// 1 / chance: "1 in 1.3", "1 in 42"
function oneIn(chance) {
  const n = 1 / chance
  return n < 10 ? (Math.round(n * 10) / 10).toString() : formatCount(n)
}

// Click-to-open list of a tunnel's discoveries with the POW each one needs
function TunnelDiscoveries({ discoveries }) {
  const complete = discoveries.foundCount >= discoveries.rocks.length
  return (
    <details className="dropdown-panel spelunk-disc">
      <summary className="dropdown-panel-head spelunk-disc-head">
        <span className="dropdown-panel-title">Discoveries</span>
        <span className={`spelunk-disc-count${complete ? ' spelunk-disc-count--done' : ''}`}>
          {discoveries.foundCount} / {discoveries.rocks.length}
        </span>
      </summary>
      <div className="dropdown-panel-body spelunk-disc-body">
        {discoveries.rocks.map(rock => (
          <div
            key={rock.name}
            className={`spelunk-disc-row${rock.found ? '' : ' spelunk-disc-row--missing'}`}
          >
            <span className="spelunk-disc-icon">
              <img
                src={`images/spelunking/${rock.image}`}
                alt=""
                className="spelunk-disc-img"
                onError={hideBrokenImg}
              />
            </span>
            <span className="spelunk-disc-name">{rock.name}</span>
            <span className={`spelunk-disc-pow${rock.scaling ? ' tooltip-anchor' : ''}`}>
              {formatPow(rock.powRequired)}{rock.scaling ? '+' : ''} POW
              {rock.scaling && <span className="tooltip tooltip--right">Needs more POW the deeper it shows up</span>}
            </span>
          </div>
        ))}
      </div>
    </details>
  )
}

const formatMulti = value => `${(Math.round(value * 100) / 100).toLocaleString('en-US')}x`

// Who to delve on for Grand Discoveries, and the Max Grand Vein toggle
function GrandDiscoveryPanel({ best, vein, maxGrandVein, setMaxGrandVein }) {
  const { character, played } = best
  if (!character) return null
  const samePlayed = played === character
  return (
    <div className="spelunk-gd">
      <div className="spelunk-gd-head">
        <span className="spelunk-gd-title">Best for Grand Discoveries</span>
        {vein.maxLevel > 0 && (
          <label className="styled-checkbox tooltip-anchor spelunk-gd-toggle">
            <input
              type="checkbox"
              checked={maxGrandVein}
              onChange={e => setMaxGrandVein(e.target.checked)}
            />
            Max Grand Vein
            <span className="tooltip tooltip--wrap tooltip--right">
              Shows the odds as if your Royal Guardian had the Grand Vein talent at Lv {vein.maxLevel}: its max
              level plus added and super talent levels. Grand Vein is normally left empty and only filled
              before going for Grand Discoveries.
            </span>
          </label>
        )}
      </div>
      <div
        className="spelunk-gd-character"
        data-class={toClassSlug(character.class)}
      >
        <span className="spelunk-gd-class-icon" />
        <span className="spelunk-gd-name">{character.name}</span>
        <span className="spelunk-gd-level">Spelunking LV {formatCount(best.level)}</span>
        <span className="spelunk-gd-multi">{formatMulti(best.multi)} from Spelunking LV</span>
      </div>
      <p className="spelunk-gd-text">
        Delve on your highest-level Spelunker: the game multiplies the chance by the logged-in character's Spelunking LV
        {` (+${best.percentPerLevel}% per LV from Minehead and Sushi).`}
        {!samePlayed && ` ${character.name} gets ${formatMulti(best.multi)} from that vs ${formatMulti(best.playedMulti)} on ${played?.name} (LV ${formatCount(best.playedLevel)}), the character this save was taken on.`}
      </p>
      <p className="spelunk-gd-text">
        Grand Vein is leveled on a Royal Guardian but boosts whoever delves: Lv {formatCount(vein.level)} now ({formatMulti(vein.multi)})
        {vein.maxLevel > 0 && `, Lv ${formatCount(vein.maxLevel)} at most (${formatMulti(vein.maxMulti)})`}.
        {' '}Odds below use {character.name}'s LV, Grand Vein {maxGrandVein ? 'maxed' : 'as it is now'}, and no elixirs.
      </p>
    </div>
  )
}

function TunnelsTab({ snapshot, summary }) {
  const [maxGrandVein, setMaxGrandVein] = useState(false)
  const best = useMemo(() => getBestGrandDiscoveryCharacter(snapshot), [snapshot])
  const vein = useMemo(() => getGrandVein(snapshot), [snapshot])
  const tunnelDiscoveries = useMemo(
    () => getTunnelDiscoveries(snapshot, { maxGrandVein }),
    [snapshot, maxGrandVein],
  )
  const grandLeft = summary.totals.grandDiscoveries < summary.maxGrandDiscoveries
  return (
    <>
      {summary.manicUnlocked && (
        <div className="spelunk-manic">
          <img
            src={`images/spelunking/ManicMode${summary.manicMode ? 'On' : 'Off'}.png`}
            alt={`Manic Mode ${summary.manicMode ? 'on' : 'off'}`}
            title={`Manic Mode is ${summary.manicMode ? 'on' : 'off'}`}
            className="spelunk-manic-img"
            onError={hideBrokenImg}
          />
        </div>
      )}
      {grandLeft && (
        <GrandDiscoveryPanel
          best={best}
          vein={vein}
          maxGrandVein={maxGrandVein}
          setMaxGrandVein={setMaxGrandVein}
        />
      )}
      <div className="spelunk-tunnel-grid">
        {summary.tunnelList.map((tunnel, i) => {
          const gdDone = tunnel.grandDiscoveries >= MAX_GRAND_DISCOVERIES
          const discoveries = tunnelDiscoveries[i]
          const nextChance = discoveries?.nextGrandChance ?? 0
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
                <img
                  src={`images/spelunking/CaveBoss${i}.png`}
                  alt=""
                  className={`spelunk-tunnel-boss-img${tunnel.cleared ? '' : ' spelunk-tunnel-boss-img--alive'}`}
                  onError={hideBrokenImg}
                />
              </div>
              <div className="spelunk-tunnel-body">
                <div className="spelunk-tunnel-row">
                  <span>Best Depth</span>
                  <span className="spelunk-tunnel-value spelunk-tunnel-depth">
                    <DepthTrophy />
                    {formatCount(tunnel.bestDepth)}
                  </span>
                </div>
                {summary.manicUnlocked && (
                  <div className="spelunk-tunnel-row">
                    <span>Manic Depth</span>
                    <span className="spelunk-tunnel-value spelunk-tunnel-depth">
                      <DepthTrophy manic />
                      {formatCount(tunnel.bestManicDepth)}
                    </span>
                  </div>
                )}
                <div className="spelunk-tunnel-row">
                  <span>Biggest Haul</span>
                  <span className="spelunk-tunnel-value spelunk-tunnel-haul">
                    <AmberIcon
                      tier={summary.amberTier}
                      small
                    />
                    {formatAmber(tunnel.biggestHaul, summary.amberTier)}
                  </span>
                </div>
                <div className="spelunk-tunnel-row">
                  <span>Grand Discoveries</span>
                  <span className={`spelunk-tunnel-value${gdDone ? ' spelunk-tunnel-value--done' : ''}`}>
                    {tunnel.grandDiscoveries} / {MAX_GRAND_DISCOVERIES}
                  </span>
                </div>
                {!gdDone && nextChance > 0 && (
                  <div className="spelunk-tunnel-row">
                    <span>Next Grand Discovery</span>
                    <span className="spelunk-tunnel-value">
                      {nextChance >= 1 ? 'Guaranteed' : `${(Math.round(nextChance * 10000) / 100)}% (1 in ${oneIn(nextChance)})`}
                    </span>
                  </div>
                )}
                {discoveries && (
                  <TunnelDiscoveries discoveries={discoveries} />
                )}
              </div>
              {tunnel.loreBoss && (
                <LoreBossReward
                  boss={tunnel.loreBoss}
                  defeated={tunnel.cleared}
                />
              )}
            </div>
          )
        })}
      </div>
    </>
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
        <div className="spelunk-toggles">
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

export default function Spelunking({ snapshot, tomePoints }) {
  const [activeTab, setActiveTab] = useState('upgrades')
  const summary = useMemo(() => getSpelunkingSummary(snapshot), [snapshot])
  const pow = useMemo(() => getSpelunkingPow(snapshot).value, [snapshot])
  const amberGain = useMemo(() => getAmberGain(snapshot, { tomePoints }), [snapshot, tomePoints])

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
          'POW and Amber gain at the top are your account totals. Amber gain uses the Tome points you entered in Import Save for the Tome\'s Amber lore bonus.',
          'Costs include your shop discounts (Woahtermelon meal, sushi, jelly and the Royal Guardian Amber Hoard talent) and are shown in your current amber color, like in game.',
          'Turn on Max Amber Hoard to see prices with Amber Hoard at the highest level your account can reach, the way you\'d set it before a shopping trip.',
          'Green upgrades are affordable with the amber you have right now. Faded ones are locked behind the upgrade named on them.',
          'Tunnels shows each tunnel\'s discoveries and the odds of its next Grand Discovery, as if delving on your highest-level Spelunker (the game uses the logged-in character\'s Spelunking LV) with no elixirs. Grand Vein is leveled on a Royal Guardian but works for any character. Max Grand Vein shows the odds with that Royal Guardian talent at its highest possible level.',
          'Lore has three parts: Page Reads plans how to spend your pages, Breakpoints shows every chapter bonus and how close it is to its cap, and Red Jellyfish predicts the Luminous Menagerie\'s daily re-read.',
          'Elixirs shows your belt limits and what\'s equipped, every elixir, and a recommended belt for each kind of delve (Depth, Manic, Amber, Grand Discovery...) with a check that it fits your belt.',
        ]}
      />

      <Overview
        summary={summary}
        pow={pow}
        amberGain={amberGain.value}
        tomeMissing={amberGain.missing.some(note => note.startsWith('Tome'))}
      />

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
      {activeTab === 'tunnels' && (
        <TunnelsTab
          snapshot={snapshot}
          summary={summary}
        />
      )}
      {activeTab === 'lore' && <LoreTab snapshot={snapshot} />}
      {activeTab === 'elixirs' && <ElixirTab snapshot={snapshot} />}
    </div>
  )
}
