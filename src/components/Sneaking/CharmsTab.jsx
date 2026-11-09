import { pristineCharmMap } from '../../data'
import { fillSneakingText } from '../../utils/sneakingUtils'

// Sneaking > Pristine Charms: the 23 collection charms (Ninja[107]) as compact rows, like the game's shelf with
// each charm's click text beside it. Charms not found yet are greyed out.
export default function CharmsTab({ snapshot }) {
  const owned = snapshot?.sneaking?.pristineCharms ?? []
  const found = pristineCharmMap.filter((_, i) => owned[i]).length
  return (
    <>
      <p className="sneaking-charms-count">
        Found <strong>{found}</strong> / {pristineCharmMap.length}
      </p>
      <div className="sneaking-charms">
        {pristineCharmMap.map((charm, i) => (
          <div
            key={charm.name}
            className={`sneaking-charm${owned[i] ? '' : ' sneaking-charm--missing'}`}
          >
            <img
              className="sneaking-charm-icon"
              src={`images/sneaking/${charm.img}.png`}
              alt=""
            />
            <span className="sneaking-charm-text">
              <span className="sneaking-charm-name">{charm.name}</span>
              <span className="sneaking-charm-bonus">{fillSneakingText(charm.bonus, charm.value)}</span>
            </span>
          </div>
        ))}
      </div>
    </>
  )
}
