import { labBonusMap, labJewelMap } from '../../data'
import { formatBigNumber } from '../../utils/cogBoardUtils'
import { getLabJewelValue, formatLabJewelEffect, getSpelunkerObolMultiplier } from '../../utils/labUtils'
import { getMainframeConnections, getMainframeNotices, VIADUCT_OF_THE_GODS } from '../../utils/mainframeUtils'
import { toClassSlug } from '../../utils/appUtils'

// Mainframe tab: Green Tube positioning notice, the mainframe map (connections from the prism, each
// connected player's range), then every bonus and jewel with whether it's connected
// (utils/mainframeUtils getMainframeConnections).
const MAP_WIDTH = 2100
const MAP_HEIGHT = 480
const BONUS_SIZE = 44
const JEWEL_SIZE = 38
const PLAYER_RADIUS = 14

function formatPx(value) {
  return `${Math.round(value).toLocaleString()}px`
}

function GreenTubeNotice({ check }) {
  if (!check || check.missing.length === 0) return null
  return (
    <div className="char-notice lab-notice">
      <div className="char-notice-header">
        <span className="char-notice-title">
          Missing Green Tube: +{check.bonus.toFixed(1)}% Lab EXP
        </span>
      </div>
      <span className="lab-notice-text">
        Green Tube only boosts players at or left of a Bubonic Conjuror line character. Your rightmost one
        is {check.rightmost.name} (x {check.rightmost.x}). Move these left of it, or move a Bubonic further right:
      </span>
      <div className="char-notice-items lab-notice-chips">
        {check.missing.map(entry => (
          <span
            key={entry.index}
            className="char-notice-chip"
          >
            {entry.name} (x {entry.x})
          </span>
        ))}
      </div>
    </div>
  )
}

function ViaductNotice() {
  return (
    <div className="char-notice lab-notice">
      <div className="char-notice-header">
        <span className="char-notice-title">Viaduct of the Gods is connected</span>
      </div>
      <span className="lab-notice-text">
        It gives x5 liquid capacity but regenerates every alchemy liquid 30% slower. Only keep it connected while
        mass leveling bubbles or saving up liquid for alchemy shop upgrades; otherwise move it out of range.
      </span>
    </div>
  )
}

function OffBonusesNotice({ bonuses, reach }) {
  if (bonuses.length === 0) return null
  return (
    <div className="char-notice lab-notice">
      <div className="char-notice-header">
        <span className="char-notice-title">
          {bonuses.length} mainframe {bonuses.length === 1 ? 'bonus isn\'t' : 'bonuses aren\'t'} connected
        </span>
      </div>
      <span className="lab-notice-text">
        No connected character is within range. Move a tube closer or raise line width to link another character.
      </span>
      <div className="char-notice-items lab-notice-chips">
        {bonuses.map(bonus => (
          <span
            key={bonus.index}
            className="char-notice-chip"
          >
            {bonus.name}
            {reach[bonus.index]?.nearest !== null && ` (${formatPx(reach[bonus.index].nearest)} / ${formatPx(reach[bonus.index].range)})`}
          </span>
        ))}
      </div>
    </div>
  )
}

function MainframeMap({ snapshot, connections }) {
  const owned = snapshot?.lab?.jewelsOwned ?? []
  const { players, bonuses, jewels, prism, range } = connections
  const connected = players.filter(player => player.connected)
  const at = index => players[index]
  return (
    <div className="lab-map-scroll">
      <svg
        className="lab-map"
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        role="img"
        aria-label="Lab mainframe map"
      >
        <rect
          className="lab-map-bg"
          x="0"
          y="0"
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          rx="12"
        />
        {connected.map(player => (
          <circle
            key={`range-${player.index}`}
            className="lab-map-range"
            cx={player.x}
            cy={player.y}
            r={range.scaled}
          />
        ))}
        {connected.map(player => {
          const from = player.linkedFrom === 'prism' ? prism : at(player.linkedFrom)
          return (
            <line
              key={`link-${player.index}`}
              className="lab-map-link"
              x1={from.x}
              y1={from.y}
              x2={player.x}
              y2={player.y}
            />
          )
        })}
        <circle
          className="lab-map-prism"
          cx={prism.x}
          cy={prism.y}
          r="16"
        >
          <title>Prism: the chain of connections starts here</title>
        </circle>
        {labBonusMap.map(bonus => (
          <image
            key={`bonus-${bonus.index}`}
            className={bonuses[bonus.index] ? 'lab-map-node' : 'lab-map-node lab-map-node--off'}
            href={bonus.img}
            x={bonus.x - BONUS_SIZE / 2}
            y={bonus.y - BONUS_SIZE / 2}
            width={BONUS_SIZE}
            height={BONUS_SIZE}
          >
            <title>{`${bonus.name}${bonuses[bonus.index] ? '' : ' (not connected)'}`}</title>
          </image>
        ))}
        {labJewelMap.map(jewel => (
          <image
            key={`jewel-${jewel.index}`}
            className={jewels[jewel.index] ? 'lab-map-node' : 'lab-map-node lab-map-node--off'}
            href={jewel.img}
            x={jewel.x - JEWEL_SIZE / 2}
            y={jewel.y - JEWEL_SIZE / 2}
            width={JEWEL_SIZE}
            height={JEWEL_SIZE}
          >
            <title>{`${jewel.name}${owned[jewel.index] ? (jewels[jewel.index] ? '' : ' (not connected)') : ' (not owned)'}`}</title>
          </image>
        ))}
        {players.map(player => (
          <g
            key={`player-${player.index}`}
            className={player.connected ? 'lab-map-player lab-map-player--uploaded' : 'lab-map-player'}
            data-class={toClassSlug(player.className)}
          >
            <circle
              cx={player.x}
              cy={player.y}
              r={PLAYER_RADIUS}
            />
            <text
              x={player.x}
              y={player.y + PLAYER_RADIUS + 16}
              textAnchor="middle"
            >
              {player.name}
            </text>
            <title>
              {`${player.name} (x ${player.x}, y ${player.y}): ${player.connected
                ? `connected, line width ${formatPx(player.lineWidth)}`
                : player.inTube ? 'in a tube but out of reach' : 'not uploaded'}`}
            </title>
          </g>
        ))}
      </svg>
    </div>
  )
}

function ConnectionTag({ on, reach }) {
  if (on) return <span className="lab-bonus-tag lab-bonus-tag--on">Connected</span>
  const detail = reach?.nearest === null || reach?.nearest === undefined
    ? 'No player connected'
    : `Nearest player ${formatPx(reach.nearest)}, range ${formatPx(reach.range)}`
  return (
    <span
      className="lab-bonus-tag lab-bonus-tag--off"
      title={detail}
    >
      Not connected
    </span>
  )
}

// Viaduct of the Gods is meant to stay off: off = plain tag, on = amber
function ViaductTag({ on }) {
  return on
    ? <span className="lab-bonus-tag lab-bonus-tag--off">Connected</span>
    : <span className="lab-bonus-tag">Off (normal)</span>
}

function BonusCard({ bonus, on, reach }) {
  return (
    <div className={`lab-bonus-card${on ? '' : ' lab-bonus-card--off'}`}>
      <img
        className="lab-bonus-img"
        src={bonus.img}
        alt={bonus.name}
      />
      <div className="lab-bonus-text">
        <span className="lab-bonus-name">
          {bonus.name}
          {bonus.index === VIADUCT_OF_THE_GODS
            ? <ViaductTag on={on} />
            : (
              <ConnectionTag
                on={on}
                reach={reach}
              />
            )}
        </span>
        <span className="lab-bonus-desc">{bonus.description}</span>
      </div>
    </div>
  )
}

function JewelCard({ snapshot, jewel, on, reach }) {
  const owned = !!snapshot?.lab?.jewelsOwned?.[jewel.index]
  const value = getLabJewelValue(snapshot, jewel)
  return (
    <div className={`lab-bonus-card${owned ? '' : ' lab-bonus-card--missing'}${owned && !on ? ' lab-bonus-card--off' : ''}`}>
      <img
        className="lab-jewel-img"
        src={jewel.img}
        alt={jewel.name}
      />
      <div className="lab-bonus-text">
        <span className="lab-bonus-name">
          {jewel.name}
          {owned
            ? (
              <ConnectionTag
                on={on}
                reach={reach}
              />
            )
            : <span className="lab-bonus-tag">Not owned</span>}
        </span>
        <span className="lab-bonus-desc">{formatLabJewelEffect(jewel, value)}</span>
        {jewel.note && <span className="lab-bonus-note">{jewel.note}</span>}
        {!owned && jewel.requirements.length > 0 && (
          <span className="lab-bonus-note">
            Costs {jewel.requirements.map(req => `${formatBigNumber(req.amount)} ${req.name}`).join(', ')}
          </span>
        )}
      </div>
    </div>
  )
}

export default function MainframeTab({ snapshot }) {
  const connections = getMainframeConnections(snapshot)
  const notices = getMainframeNotices(snapshot)
  const { players, bonuses, jewels, range } = connections
  const connectedCount = players.filter(player => player.connected).length
  const owned = snapshot?.lab?.jewelsOwned ?? []
  const ownedCount = labJewelMap.filter(jewel => owned[jewel.index]).length
  const offBonuses = labBonusMap.filter(bonus => !bonuses[bonus.index])

  return (
    <div className="lab-mainframe-tab">
      <GreenTubeNotice check={notices.greenTube} />
      {notices.viaductOn && <ViaductNotice />}
      <OffBonusesNotice
        bonuses={notices.offBonuses}
        reach={connections.bonusReach}
      />
      <div className="lab-chips">
        <span
          className="lab-chip-stat"
          title="Players AFK in the lab or under Arctis' major bonus, chained from the prism"
        >
          <strong>{connectedCount}</strong> / {players.length} players connected
        </span>
        <span className="lab-chip-stat">
          <strong>{labBonusMap.length - offBonuses.length}</strong> / {labBonusMap.length} bonuses on
        </span>
        <span className="lab-chip-stat">
          <strong>{jewels.filter(Boolean).length}</strong> / {ownedCount} owned jewels on
        </span>
        <span
          className="lab-chip-stat"
          title={`80px × (1 + (Pyrite Rhombol ${Math.round(range.pyrite ?? 0)}% + Viral Connection ${range.viral ?? 0}%) / 100) + ${Math.round(range.flat ?? 0)}px (merit, Equinox, summoning). Some nodes have a fixed 80 or 100px range.`}
        >
          Range <strong>{formatPx(range.scaled)}</strong>
        </span>
        <span
          className="lab-chip-stat"
          title="Spelunker Obol multiplies every jewel but Pure Opal Navette, which adds to it"
        >
          Jewels <strong>{getSpelunkerObolMultiplier(snapshot).toFixed(2)}x</strong>
        </span>
      </div>
      <MainframeMap
        snapshot={snapshot}
        connections={connections}
      />
      <span className="lab-section-title">Mainframe Bonuses</span>
      <div className="lab-bonus-grid">
        {labBonusMap.map(bonus => (
          <BonusCard
            key={bonus.index}
            bonus={bonus}
            on={bonuses[bonus.index]}
            reach={connections.bonusReach[bonus.index]}
          />
        ))}
      </div>
      <span className="lab-section-title">Jewels</span>
      <div className="lab-bonus-grid">
        {labJewelMap.map(jewel => (
          <JewelCard
            key={jewel.index}
            snapshot={snapshot}
            jewel={jewel}
            on={jewels[jewel.index]}
            reach={connections.jewelReach[jewel.index]}
          />
        ))}
      </div>
    </div>
  )
}
