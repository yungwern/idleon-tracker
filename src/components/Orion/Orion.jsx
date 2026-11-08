import { getOrion } from '../../utils/orionUtils'
import { formatClickerNumber, formatClickerBonus } from '../../utils/clickerUtils'
import InfoPanel from '../InfoPanel/InfoPanel'
import ClickerStats from '../Clicker/ClickerStats'
import ClickerMegas from '../Clicker/ClickerMegas'
import ClickerBonuses from '../Clicker/ClickerBonuses'
import ClickerUpgrades from '../Clicker/ClickerUpgrades'

// Orion the Horned Owl (Clickers): feathers, Megafeathers, the bonuses Orion gives the rest of the game, upgrades.
// Math = utils/orionUtils.js (Toolbox owl.ts).

const FEATHER_ICON = 'images/orion/Owlb_0.png'

export default function Orion({ snapshot }) {
  const orion = getOrion(snapshot)

  if (!orion) {
    return (
      <div className="page">
        <h2 className="page-title">Orion</h2>
        <p className="page-empty">No Orion data. Import (or re-import) a save to see Orion the Horned Owl.</p>
      </div>
    )
  }

  const stats = [
    {
      label: 'Feathers',
      icon: FEATHER_ICON,
      value: formatClickerNumber(orion.feathers),
    },
    {
      label: 'Feathers / sec',
      value: formatClickerNumber(orion.featherRate),
      sub: `${formatClickerNumber(orion.featherRate * 3600)} / hr`,
    },
    {
      label: 'Next upgrade',
      value: orion.nextUnlock === null ? 'All unlocked' : formatClickerNumber(orion.nextUnlock),
      sub: orion.nextUnlock === null ? null : `${formatClickerNumber(orion.feathersMade)} feathers made`,
    },
    {
      label: 'Shiny feathers',
      icon: 'images/orion/Owlb_7.png',
      value: orion.shinyFeathers.toLocaleString('en-US'),
    },
  ]

  return (
    <div className="page clicker-page clicker--orion">
      <h2 className="page-title">Orion</h2>
      <InfoPanel
        intro="Orion the Horned Owl: your feathers, Megafeathers, the bonuses Orion gives the rest of the game and every upgrade."
        items={[
          'Bonuses of Orion: every 6 levels of the Bonuses of Orion upgrade adds one step to each bonus, in order. The total is boosted by Megafeathers, the Furry Friends Forever legend talent and the Santas Little Helper companion.',
          'Upgrade costs turn green when your current feathers cover them.',
          'Hover a Megafeather to read what it does.',
        ]}
      />

      <div className="clicker-hero">
        <img
          src="images/orion/Orion.png"
          alt="Orion"
          className="clicker-hero-img"
        />
        <ClickerStats stats={stats} />
      </div>

      <ClickerMegas
        title="Megafeathers"
        name="Megafeather"
        megas={orion.megas}
        iconFor={i => `images/orion/Feaz${i}.png`}
      />

      <ClickerBonuses
        title="Bonuses of Orion"
        note={`Bonuses of Orion LV ${orion.upgrades[1].level} · ${formatClickerBonus(orion.bonusMulti)}x total multi`}
        bonuses={orion.bonuses}
      />

      <ClickerUpgrades
        title="Upgrades"
        currencyIcon={FEATHER_ICON}
        currencyName="Feathers"
        have={orion.feathers}
        upgrades={orion.upgrades.map(upgrade => ({
          ...upgrade,
          lockedText: `Unlocks at ${formatClickerNumber(upgrade.unlockAt)} feathers made`,
        }))}
      />
    </div>
  )
}
