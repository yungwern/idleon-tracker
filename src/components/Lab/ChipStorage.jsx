import { formatBigNumber } from '../../utils/cogBoardUtils'
import { getChipEffect } from '../../utils/consoleOptimizer'

// Tooltips open toward the middle of the grid, so tiles on either edge of any row (rows wrap with the
// page width) never run off the page
function pickTooltipSide(event) {
  const tile = event.currentTarget
  const grid = tile.parentElement.getBoundingClientRect()
  const box = tile.getBoundingClientRect()
  tile.dataset.tip = box.left + box.width / 2 < grid.left + grid.width / 2 ? 'right' : 'left'
}

// Chip storage: every chip with how many copies are not equipped (owned - equipped).
// Chips never made are faded and show their Lab shop cost.
export default function ChipStorage({ snapshot, storage, title }) {
  return (
    <div className="lab-storage">
      <span className="lab-section-title">{title}</span>
      <div className="lab-storage-grid">
        {storage.map(({ chip, owned, equipped, stored }) => (
          <div
            key={chip.index}
            className={`lab-storage-tile tooltip-anchor${owned === 0 ? ' lab-storage-tile--missing' : ''}`}
            onMouseEnter={pickTooltipSide}
          >
            <img
              className="lab-chip-img"
              src={chip.img}
              alt={chip.name}
            />
            <span className="lab-storage-count">{stored}</span>
            <span className="tooltip tooltip--wrap lab-tooltip">
              <span className="lab-tooltip-name">{chip.name}</span>
              <span className="lab-tooltip-line">{getChipEffect(chip, snapshot)}</span>
              {chip.onePerPlayer && <span className="lab-tooltip-note">One per character</span>}
              {owned === 0 ? (
                <span className="lab-tooltip-status lab-tooltip-status--muted">Not made yet</span>
              ) : (
                <span className="lab-tooltip-status">
                  {stored} in storage · {equipped} equipped
                </span>
              )}
              {owned === 0 && chip.requirements?.length > 0 && (
                <span className="lab-tooltip-note">
                  Costs {chip.requirements.map(req => `${formatBigNumber(req.amount)} ${req.name}`).join(', ')}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
