import { getBubba } from '../../utils/bubbaUtils'
import { formatClickerBonus } from '../../utils/clickerUtils'
import ClickerStats from '../Clicker/ClickerStats'
import ClickerMegas from '../Clicker/ClickerMegas'
import ClickerBonuses from '../Clicker/ClickerBonuses'

// Bubba > Megaflesh & Bonuses: Megaflesh owned and Bubba's IdleOn bonuses (utils/bubbaUtils.js, Toolbox bubba.ts)
export default function MegafleshTab({ snapshot }) {
  const bubba = getBubba(snapshot)

  if (!bubba) {
    return <p className="page-empty">No Bubba data. Import (or re-import) a save to see your Megaflesh and bonuses.</p>
  }

  const stats = [
    {
      label: 'Megaflesh',
      icon: 'images/bubba/BubbaMF0.png',
      value: bubba.megaCount.toLocaleString('en-US'),
    },
    {
      label: 'Bubba Boon',
      icon: 'images/bubba/Bubbo_Upgrade_3.png',
      value: `LV ${bubba.boonLevel.toLocaleString('en-US')}`,
    },
    {
      label: 'Bonus multi',
      value: `${formatClickerBonus(bubba.bonusMulti)}x`,
    },
  ]

  return (
    <div className="clicker--bubba">
      <div className="clicker-hero">
        <ClickerStats stats={stats} />
      </div>

      <ClickerMegas
        title="Megaflesh"
        name="Megaflesh"
        megas={bubba.megas}
        iconFor={i => `images/bubba/BubbaMF${i}.png`}
      />

      <ClickerBonuses
        title="Bubba's IdleOn Bonuses"
        note="One step per 7 Bubba Boon levels, boosted by Megaflesh 2, 4, 7, 10 and every 12th copy (+20% each) and the Santas Little Helper companion."
        bonuses={bubba.bonuses}
      />
    </div>
  )
}
