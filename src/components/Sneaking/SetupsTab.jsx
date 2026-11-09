import { ninjaItemMap, sneakingSetups, BEST_NUNCHAKU } from '../../data'
import { getOwnedNinjaItems, getSetupPlan, getNinjaItemText } from '../../utils/sneakingUtils'

// Sneaking > Setups: Eli's gear setups per goal (data/sneakingSetups.js). Each role lists its gloves/weapon and
// two charms; the bottom row totals what the setup needs for your ninja count against what you own.

function SetupItem({ raw, owned }) {
  const isBest = raw === BEST_NUNCHAKU
  const shownRaw = isBest ? owned.bestNunchaku?.raw ?? 'NjWep8' : raw
  const item = ninjaItemMap[shownRaw]
  const bestSlot = owned.best[shownRaw]
  return (
    <span className="sneaking-setup-item tooltip-anchor">
      <img
        className="sneaking-setup-item-img"
        src={`images/sneaking/${shownRaw}.png`}
        alt=""
      />
      <span className="sneaking-setup-item-name">{isBest ? 'Best Nunchaku' : item?.name}</span>
      <span className="tooltip tooltip--wrap buff-tooltip">
        <span className="buff-tooltip-name">{isBest ? `Best Nunchaku (yours: ${item?.name ?? 'none'})` : item?.name}</span>
        {item?.desc && <span className="buff-tooltip-line">{getNinjaItemText(item, bestSlot)}</span>}
        <span className="buff-tooltip-source">
          {bestSlot ? `Your best: LV ${bestSlot.level.toLocaleString('en-US')}` : 'Not owned yet (shown at LV 0)'}
        </span>
      </span>
    </span>
  )
}

export default function SetupsTab({ snapshot }) {
  const owned = getOwnedNinjaItems(snapshot)
  const characterCount = snapshot?.sneaking?.ninjas?.length ?? 0
  return (
    <div className="sneaking-setups">
      {sneakingSetups.map(setup => {
        const plan = getSetupPlan(setup, characterCount, owned, owned.bestNunchaku?.raw)
        return (
          <div
            key={setup.id}
            className="sneaking-setup"
          >
            <div className="sneaking-setup-head">
              <span className="sneaking-setup-name">{setup.name}</span>
              <span className="sneaking-setup-goal">{setup.goal}</span>
            </div>
            <div className="sneaking-setup-roles">
              {plan.roles.map(role => (
                <div
                  key={role.name}
                  className="sneaking-setup-role"
                >
                  <span className="sneaking-setup-role-name">
                    {role.name}
                    <span className="sneaking-setup-role-count">
                      {role.ninjas} ninja{role.ninjas === 1 ? '' : 's'}
                    </span>
                  </span>
                  <span className="sneaking-setup-items">
                    {role.items.map((raw, i) => (
                      <SetupItem
                        key={i}
                        raw={raw}
                        owned={owned}
                      />
                    ))}
                  </span>
                </div>
              ))}
            </div>
            {setup.why.map((text, i) => (
              <p
                key={i}
                className="sneaking-card-desc"
              >
                {text}
              </p>
            ))}
            <div className="sneaking-setup-needs">
              {plan.items.map(need => (
                <span
                  key={need.raw}
                  className={`sneaking-setup-need tooltip-anchor${need.owned < need.needed ? ' sneaking-setup-need--short' : ''}`}
                >
                  <img
                    className="sneaking-setup-need-img"
                    src={`images/sneaking/${need.raw}.png`}
                    alt=""
                  />
                  {need.owned}/{need.needed}
                  <span className="tooltip">
                    {ninjaItemMap[need.raw]?.name}: you own {need.owned}, this setup uses {need.needed}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
