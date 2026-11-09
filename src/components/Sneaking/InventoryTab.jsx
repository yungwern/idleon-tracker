import { toClassSlug } from '../../utils/appUtils'
import { getNinjaLoadouts } from '../../utils/sneakingUtils'
import NinjaSlot from './NinjaSlot'

// Sneaking > Inventory: every ninja's 4 slots (hat, gloves/nunchaku/kunai, charm, charm), then the storage as the
// game's 3 rows of 13. At half width the rows don't fit, so the storage box scrolls sideways (Eli's pick over
// wrapping, which scrambled the game order).
const STORAGE_ROW = 13

export default function InventoryTab({ snapshot }) {
  const { ninjas, storage } = getNinjaLoadouts(snapshot)
  const rows = []
  for (let i = 0; i < storage.length; i += STORAGE_ROW) rows.push(storage.slice(i, i + STORAGE_ROW))
  return (
    <>
      <div className="sneaking-section-title">Loadout</div>
      <div className="sneaking-ninjas">
        {ninjas.map(ninja => (
          <div
            key={ninja.index}
            className="sneaking-ninja"
            data-class={toClassSlug(ninja.className)}
          >
            <div className="sneaking-ninja-info">
              <span className="sneaking-ninja-name">{ninja.name}</span>
              <span className="sneaking-ninja-level">Sneak LV {ninja.sneakingLevel.toLocaleString('en-US')}</span>
              <span className={`sneaking-ninja-status sneaking-ninja-status--${ninja.status.id}`}>
                <img
                  className="sneaking-ninja-status-icon"
                  src={`images/sneaking/${ninja.status.icon}.png`}
                  alt=""
                />
                {ninja.status.label} · Floor {ninja.floor + 1}
              </span>
            </div>
            <div className="sneaking-ninja-slots">
              {ninja.equipment.map((slot, i) => (
                <NinjaSlot
                  key={i}
                  slot={slot}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="sneaking-section-title">Storage</div>
      <div className="sneaking-storage">
        {rows.map((row, r) => (
          <div
            key={r}
            className="sneaking-storage-row"
          >
            {row.map((slot, i) => (
              <NinjaSlot
                key={i}
                slot={slot}
              />
            ))}
          </div>
        ))}
      </div>
    </>
  )
}
