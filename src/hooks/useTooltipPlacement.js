import { useEffect } from 'react'

// Keeps every hovered .tooltip fully on screen, on every page. Without it, tooltips near the left/right of a page
// are cut off: .content scrolls (overflow-y: auto), so it clips them at the sidebar and the page edge, and a
// scroll box (e.g. Sneaking storage) clips them too.
// On hover, each shown tooltip gets .tooltip--placed (global.css: position: fixed) and is placed above its anchor,
// centred, then nudged sideways to stay inside .content and flipped below when there is no room above.
// Used once in App.jsx; pages just use .tooltip-anchor + .tooltip as usual.

const EDGE = 8 // px kept between a tooltip and the edge of the content area
const GAP = 6 // px between a tooltip and its anchor (same as global .tooltip)

function placeTooltip(anchor, tip) {
  tip.classList.add('tooltip--placed')
  tip.style.setProperty('--tip-left', '0px')
  tip.style.setProperty('--tip-top', '0px')
  const size = tip.getBoundingClientRect()
  if (size.width === 0 && size.height === 0) return // not shown (e.g. hidden by its own rules)

  const frame = (anchor.closest('.content') ?? document.documentElement).getBoundingClientRect()
  const minLeft = Math.max(frame.left, 0) + EDGE
  const maxRight = Math.min(frame.right, window.innerWidth) - EDGE
  const minTop = Math.max(frame.top, 0) + EDGE
  const maxBottom = Math.min(frame.bottom, window.innerHeight) - EDGE
  const box = anchor.getBoundingClientRect()

  let left = box.left + box.width / 2 - size.width / 2
  left = Math.max(minLeft, Math.min(left, maxRight - size.width))
  let top = box.top - GAP - size.height
  if (top < minTop && box.bottom + GAP + size.height <= maxBottom) top = box.bottom + GAP

  // position: fixed is relative to the viewport, unless an ancestor has a transform/filter (hover lifts etc.).
  // Measure where (0, 0) actually landed and offset by it, so both cases end up in the same place.
  const origin = tip.getBoundingClientRect()
  tip.style.setProperty('--tip-left', `${Math.round(left - origin.left)}px`)
  tip.style.setProperty('--tip-top', `${Math.round(top - origin.top)}px`)
}

function placeTooltipsFor(target) {
  // Every hovered anchor (nested anchors included) shows its own tooltips, so place all of them
  let anchor = target?.closest?.('.tooltip-anchor')
  while (anchor) {
    const owner = anchor
    owner.querySelectorAll('.tooltip')
      .forEach(tip => {
        if (tip.closest('.tooltip-anchor') === owner) placeTooltip(owner, tip)
      })
    anchor = owner.parentElement?.closest('.tooltip-anchor')
  }
}

export function useTooltipPlacement() {
  useEffect(() => {
    function onOver(event) {
      placeTooltipsFor(event.target)
      // Again before the next paint, in case :hover hadn't shown the tooltip yet when the event fired
      requestAnimationFrame(() => placeTooltipsFor(event.target))
    }
    document.addEventListener('mouseover', onOver)
    return () => document.removeEventListener('mouseover', onOver)
  }, [])
}
