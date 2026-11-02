import { useState } from 'react'
import { itemMap, printerBuffMap } from '../../data'
import { toClassSlug } from '../../utils/appUtils'
import { formatBigNumber } from '../../utils/cogBoardUtils'
import { getPrinterUnlocks, getPrinterMultis, getPrinterHiddenMultis, getPrinterTotalMulti } from '../../utils/printerUtils'
import InfoPanel from '../InfoPanel/InfoPanel'
import BuffsPanel from '../BuffsPanel/BuffsPanel'
import SaltMaterialsTab from './SaltMaterialsTab'

import './Printer.css'

const EMPTY_PRINTER = {
  library: [],
  extraLibrary: [],
  printing: [],
}

const isBlank = sample => !sample || sample.item === 'Blank'

function getItemName(rawName) {
  return itemMap[rawName] ?? rawName
}

function SampleTooltip({ sample, status }) {
  return (
    <span className="tooltip printer-tooltip">
      <span className="printer-tooltip-name">{getItemName(sample.item)}</span>
      <span className="printer-tooltip-line">{formatBigNumber(sample.value)} / hr</span>
      <span className="printer-tooltip-status">{status}</span>
    </span>
  )
}

// One sample library slot (what the character can swap to)
function LibrarySlot({ sample, printing }) {
  if (isBlank(sample)) {
    return <div className="printer-slot" />
  }
  return (
    <div className={`printer-slot tooltip-anchor${printing ? ' printer-slot--printing' : ''}`}>
      <img
        className="printer-slot-img"
        src={`images/items/${sample.item}.png`}
        alt={getItemName(sample.item)}
      />
      <SampleTooltip
        sample={sample}
        status={printing ? 'Printing now' : 'In library: can swap to this'}
      />
    </div>
  )
}

// One of the two glass cases on the right (what is being printed now)
function PrintCase({ sample, position, locked }) {
  if (locked) {
    return (
      <div className={`printer-case printer-case--${position} printer-case--locked tooltip-anchor`}>
        <span className="printer-case-empty">Locked</span>
        <span className="tooltip tooltip--wrap printer-tooltip">
          <span className="printer-tooltip-name">{printerBuffMap.crystalPrinter.name}</span>
          <span className="printer-tooltip-status">Gem shop purchase that unlocks this 2nd chamber</span>
        </span>
      </div>
    )
  }
  if (isBlank(sample)) {
    return (
      <div className={`printer-case printer-case--${position}`}>
        <span className="printer-case-empty">Empty</span>
      </div>
    )
  }
  return (
    <div className={`printer-case printer-case--${position} tooltip-anchor`}>
      <span className="printer-case-rate">{formatBigNumber(sample.value)}/hr</span>
      <img
        className="printer-case-img"
        src={`images/items/${sample.item}.png`}
        alt={getItemName(sample.item)}
      />
      <SampleTooltip
        sample={sample}
        status="Printing now"
      />
    </div>
  )
}

// Library slots in save order (Print, then PrinterXtra). With gem shop data: 4 base + 1 per
// More Sample Spaces purchase. Without it, the 5 Print slots plus any filled extra slot.
// A filled slot is never hidden, even past the unlocked count.
function getLibrarySlots(printer, librarySlots) {
  const all = [
    ...printer.library,
    ...printer.extraLibrary,
  ]
  if (librarySlots === null) {
    return all.filter((sample, i) => i < printer.library.length || !isBlank(sample))
  }
  return all.filter((sample, i) => i < librarySlots || !isBlank(sample))
}

function getPrinterBuffs(unlocks) {
  const { crystalPrinter, sampleSpaces } = printerBuffMap
  const spacesBought = unlocks.sampleSpaces === null ? '' : ` (${unlocks.sampleSpaces} / ${sampleSpaces.maxPurchases} bought)`
  return [
    {
      key: 'crystalPrinter',
      ...crystalPrinter,
      active: unlocks.secondChamber,
    },
    {
      key: 'sampleSpaces',
      ...sampleSpaces,
      effect: `${sampleSpaces.effect}${spacesBought}`,
      active: unlocks.sampleSpaces === null ? null : unlocks.sampleSpaces >= sampleSpaces.maxPurchases,
    },
  ]
}

function formatMulti(value) {
  return `${value.toFixed(2)}x`
}

function getMultiDetail(multi) {
  if (multi.detail) return multi.detail
  if (multi.key === 'kingOfTheRemembered') {
    return `+${multi.perKillPower.toFixed(2)}% per power of 10 · ${formatBigNumber(multi.orbKills)} orb kills`
  }
  if (multi.key === 'goldRelic' && multi.maxDays === null) return 'Gold Relic not found yet'
  const days = multi.maxDays ? `${multi.days} / ${multi.maxDays} days` : `${multi.days} days`
  return `+${multi.perDay}% per day · ${days}`
}

function MultiChip({ multi }) {
  return (
    <div className={`printer-multi printer-multi--${multi.key} tooltip-anchor`}>
      <img
        className="printer-multi-img"
        src={multi.img}
        alt={multi.name}
      />
      <span className="printer-multi-value">{formatMulti(multi.multi)}{multi.partial ? '+' : ''}</span>
      <span className="tooltip tooltip--wrap buff-tooltip">
        <span className="buff-tooltip-name">{multi.name}</span>
        <span className="buff-tooltip-source">{multi.source}</span>
        <span className="buff-tooltip-line">
          {multi.effect.replace('{', multi.perDay ?? '?').replace('$', multi.maxDays ?? '?')}
        </span>
        <span className="buff-tooltip-line">{getMultiDetail(multi)}</span>
        {multi.partial && <span className="buff-tooltip-warning">⚠ At least this much: the vote multi isn't calculated yet</span>}
      </span>
    </div>
  )
}

// The five MULTI lines from the in-game printer screen, the ones that apply without being listed,
// and the product of all of them
function PrintMultis({ multis, hiddenMultis }) {
  if (multis.length === 0) return null
  const total = getPrinterTotalMulti(multis, hiddenMultis)
  const partial = hiddenMultis.some(multi => multi.partial)
  return (
    <div className="printer-multis">
      <span className="printer-multis-title">Print Multis</span>
      <div className="printer-multis-list">
        {multis.map(multi => (
          <MultiChip
            key={multi.key}
            multi={multi}
          />
        ))}
      </div>
      {hiddenMultis.length > 0 && (
        <>
          <span className="printer-multis-subtitle">Also applies (not on the in-game screen)</span>
          <div className="printer-multis-list printer-multis-list--hidden">
            {hiddenMultis.map(multi => (
              <MultiChip
                key={multi.key}
                multi={multi}
              />
            ))}
          </div>
        </>
      )}
      <div className="printer-multi printer-multi--total tooltip-anchor">
        <span className="printer-multi-label">Total</span>
        <span className="printer-multi-value">{formatMulti(total)}{partial ? '+' : ''}</span>
        <span className="tooltip tooltip--wrap buff-tooltip">
          <span className="buff-tooltip-name">Total printer multi</span>
          <span className="buff-tooltip-line">Every multi above multiplied together.</span>
          <span className="buff-tooltip-line">Per character on top: Wired In (lab) 2x, Harriep's major bonus 3x.</span>
        </span>
      </div>
    </div>
  )
}

function PrinterRow({ character, printer, unlocks }) {
  const printingItems = new Set(printer.printing.filter(s => !isBlank(s)).map(s => s.item))
  const library = getLibrarySlots(printer, unlocks.librarySlots)
  const [left, right] = printer.printing
  // Only lock the 2nd chamber when the save says it isn't bought and nothing is printing there
  const rightLocked = unlocks.secondChamber === false && isBlank(right)

  return (
    <div
      className="printer-row"
      data-class={toClassSlug(character.class)}
    >
      <div className="printer-name">{character.name}</div>
      <div
        className="printer-class-icon"
        title={character.class}
      />
      <div className="printer-library">
        {library.map((sample, i) => (
          <LibrarySlot
            key={i}
            sample={sample}
            printing={printingItems.has(sample.item)}
          />
        ))}
      </div>
      <PrintCase
        sample={left}
        position="left"
      />
      <PrintCase
        sample={right}
        position="right"
        locked={rightLocked}
      />
    </div>
  )
}

const TABS = [
  { id: 'printers', label: 'Printers' },
  { id: 'salts', label: 'Salt Materials' },
]

export default function Printer({ snapshot }) {
  const [activeTab, setActiveTab] = useState('printers')
  const printer = snapshot?.printer
  const characters = snapshot?.characters ?? []
  const unlocks = getPrinterUnlocks(snapshot)
  const multis = getPrinterMultis(snapshot)
  const hiddenMultis = getPrinterHiddenMultis(snapshot)

  if (!printer) {
    return (
      <div className="page">
        <h2 className="page-title">Printer</h2>
        <p className="page-empty">No printer data. Import (or re-import) a save to see your 3D Printer.</p>
      </div>
    )
  }

  return (
    <div className="page">
      <h2 className="page-title">Printer</h2>
      <InfoPanel
        intro="Every character's 3D Printer: use the Salt Materials tab to optimize your prints for the World 3 Refinery."
        items={[
          'Library slots hold the samples a character can swap to. Slots glowing green are the ones printing right now.',
          'Two gem shop purchases max the printer out: Crystal 3D Printer prints 2 samples at once, and 6 More Sample Spaces take the library from 4 to 10 slots.',
          'Print Multis are the five MULTI lines from the in-game printer screen, plus three that apply without being listed there. They multiply together into the Total. Hover any of them for details.',
          'Salt Materials lists the printable materials your refinery salts use, by salt, and plans the fewest characters that keep them printed so the rest are free (Copper Ore for atoms). Every print goes to the class with that skill\'s own talents (★): Warrior for mining, Barbarian for fishing, Mage for chopping, Bowman for catching, even if that means re-sampling something printing on the wrong class. Leftovers go to non-warriors so warriors stay on Copper. The Vman always prints Spore Caps.',
        ]}
      />
      <div className="page-tabs printer-tabs">
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

      {activeTab === 'printers' && (
        <>
          <BuffsPanel
            title="Printer Upgrades"
            buffs={getPrinterBuffs(unlocks)}
          />
          <PrintMultis
            multis={multis}
            hiddenMultis={hiddenMultis}
          />
          <div className="printer-board">
            {characters.map((character, i) => (
              <PrinterRow
                key={character.name}
                character={character}
                printer={printer.characters[i] ?? EMPTY_PRINTER}
                unlocks={unlocks}
              />
            ))}
          </div>
        </>
      )}

      {activeTab === 'salts' && <SaltMaterialsTab snapshot={snapshot} />}
    </div>
  )
}
