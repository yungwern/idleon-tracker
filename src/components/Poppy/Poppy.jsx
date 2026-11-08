import { getPoppy } from '../../utils/poppyUtils'
import { formatClickerNumber, formatClickerBonus } from '../../utils/clickerUtils'
import InfoPanel from '../InfoPanel/InfoPanel'
import ClickerStats from '../Clicker/ClickerStats'
import ClickerMegas from '../Clicker/ClickerMegas'
import ClickerBonuses from '../Clicker/ClickerBonuses'
import ClickerUpgrades from '../Clicker/ClickerUpgrades'

// Poppy the Kangaroo Mouse (Clickers): fish, Megafish, the bonuses Poppy gives the rest of the game, upgrades and
// Tar Pit upgrades. Math = utils/poppyUtils.js (Toolbox kangaroo.ts).

const FISH_ICON = 'images/poppy/KFish.png'
const TAR_ICON = 'images/poppy/KTar.png'

export default function Poppy({ snapshot }) {
  const poppy = getPoppy(snapshot)

  if (!poppy) {
    return (
      <div className="page">
        <h2 className="page-title">Poppy</h2>
        <p className="page-empty">No Poppy data. Import (or re-import) a save to see Poppy the Kangaroo Mouse.</p>
      </div>
    )
  }

  const stats = [
    {
      label: 'Fish',
      icon: FISH_ICON,
      value: formatClickerNumber(poppy.fish),
    },
    {
      label: 'Fish / min',
      value: formatClickerNumber(poppy.fishPerMinute),
      sub: `${formatClickerNumber(poppy.fishPerMinute * 60)} / hr`,
    },
    {
      label: 'Next upgrade',
      value: poppy.nextUnlock === null ? 'All unlocked' : formatClickerNumber(poppy.nextUnlock),
      sub: poppy.nextUnlock === null ? null : `${formatClickerNumber(poppy.fishCaught)} fish caught`,
    },
    {
      label: 'Tar fish',
      icon: TAR_ICON,
      value: formatClickerNumber(poppy.tarFish),
      sub: `${formatClickerNumber(poppy.tarPerHour)} / hr`,
    },
  ]

  return (
    <div className="page clicker-page clicker--poppy">
      <h2 className="page-title">Poppy</h2>
      <InfoPanel
        intro="Poppy the Kangaroo Mouse: your fish, Megafish, the bonuses Poppy gives the rest of the game and every upgrade."
        items={[
          'Bonuses from Poppy: every 7 levels of the Bonuses from Poppy upgrade adds one step to each bonus, in order. The total is boosted by Megafish, the Furry Friends Forever legend talent and the Santas Little Helper companion.',
          'Fish and tar fish include what Poppy caught since you last opened her menu (the game adds it when you do).',
          'Upgrade costs turn green when your fish (or tar fish) cover them. Hover a Megafish to read what it does.',
        ]}
      />

      <div className="clicker-hero">
        <img
          src="images/poppy/Poppy.png"
          alt="Poppy"
          className="clicker-hero-img"
        />
        <ClickerStats stats={stats} />
      </div>

      <ClickerMegas
        title="Megafish"
        name="Megafish"
        megas={poppy.megas}
        iconFor={i => `images/poppy/RooMG${i}.png`}
      />

      <ClickerBonuses
        title="Bonuses from Poppy"
        note={`Bonuses from Poppy LV ${poppy.upgrades[3].level} · ${formatClickerBonus(poppy.bonusMulti)}x total multi`}
        bonuses={poppy.bonuses}
      />

      <ClickerUpgrades
        title="Upgrades"
        currencyIcon={FISH_ICON}
        currencyName="Fish"
        have={poppy.fish}
        upgrades={poppy.upgrades.map(upgrade => ({
          ...upgrade,
          lockedText: `Unlocks at ${formatClickerNumber(upgrade.unlockAt)} fish caught`,
        }))}
      />

      <ClickerUpgrades
        title="Tar Pit"
        currencyIcon={TAR_ICON}
        currencyName="Tar fish"
        have={poppy.tarFish}
        upgrades={poppy.tarUpgrades.map(upgrade => ({
          ...upgrade,
          lockedText: `Unlocks with ${upgrade.unlockText}`,
        }))}
      />
    </div>
  )
}
