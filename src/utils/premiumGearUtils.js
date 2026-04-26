export function getPremiumGear(snapshot, charIndex) {
  const equipOrder = snapshot?.characters?.[charIndex]?.equipOrder ?? {}
  const slots = {
    hat:     { slot: '8',  folder: 'hats',     label: 'Hat',     base: 'premium gear' },
    cape:    { slot: '12', folder: 'capes',    label: 'Cape',    base: 'premium gear' },
    armor:   { slot: '15', folder: 'armor',    label: 'Armor',   base: 'premium gear' },
    ring:    { slot: '13', folder: 'rings',    label: 'Ring',    base: 'premium gear' },
    trophy:  { slot: '10', folder: 'trophies', label: 'Trophy',  base: 'cosmetics'    },
    nametag: { slot: '14', folder: 'nametags', label: 'Nametag', base: 'cosmetics'    },
  }
  return Object.fromEntries(
    Object.entries(slots).map(([key, { slot, folder, label, base }]) => {
      const id = equipOrder[slot] ?? 'Blank'
      const equipped = id !== 'Blank'
      return [key, {
        id,
        src: equipped ? `/images/${base}/${folder}/${id}.png` : null,
        label,
        equipped,
      }]
    })
  )
}