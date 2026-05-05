export const anvilMap = {
  CraftMat1:  { id: 0,  displayName: 'Thread',        
    exp: 6,   requiredAmount: 100   },
  CraftMat5:  { id: 1,  displayName: 'Trusty Nails',  
    exp: 10,  requiredAmount: 200   },
  CraftMat6:  { id: 2,  displayName: 'Boring Brick',  
    exp: 16,  requiredAmount: 350   },
  CraftMat7:  { id: 3,  displayName: 'Chain Link',    
    exp: 25,  requiredAmount: 700   },
  CraftMat9:  { id: 4,  displayName: 'Leather Hide',  
    exp: 35,  requiredAmount: 1200  },
  CraftMat8:  { id: 5,  displayName: 'Pinion Spur',   
    exp: 50,  requiredAmount: 2000  },
  CraftMat10: { id: 6,  displayName: 'Lugi Bracket',  
    exp: 65,  requiredAmount: 3000  },
  CraftMat11: { id: 7,  displayName: 'Purple Screw',  
    exp: 75,  requiredAmount: 4000  },
  CraftMat12: { id: 8,  displayName: 'Thingymabob',   
    exp: 90,  requiredAmount: 6000  },
  CraftMat13: { id: 9,  displayName: 'Tangled Cords', 
    exp: 110, requiredAmount: 8500  },
  CraftMat14: { id: 10, displayName: 'PVC Pipe',      
    exp: 140, requiredAmount: 12000 },
}

// Lookup by numeric ID (used when reading AnvilPAselect indices)
export const anvilMapById = Object.fromEntries(
  Object.entries(anvilMap).map(([rawName, data]) => [data.id, { rawName, ...data }])
)