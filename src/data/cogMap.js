export const cogMap = {
  CogCry0: { name: 'Topaz Cog',    color: '#4fd1c5' },
  CogCry1: { name: 'Ruby Cog',     color: '#f87171' },
  CogCry2: { name: 'Amethyst Cog', color: '#f58dec' },
  CogCry3: { name: 'Garnet Cog',   color: '#fb923c' },
  CogCry4: { name: 'Emerald Cog',  color: '#4ade80' },
}

export const BOARD_ROWS = 8
export const BOARD_COLS = 12

export const COG_BORDER_CLASS = {
  green:   { class: 'border-green',   color: '#4ade80' },
  garnet:  { class: 'border-garnet',  color: '#fb923c' },
  purple:  { class: 'border-purple',  color: '#b253c5' },
  gemshop: { class: 'border-gemshop', color: '#46b6f7' },
  white:   { class: 'border-white',   color: '#ffffff' },
  none:    { class: '',               color: 'transparent' },
}

export const COG_PLACEMENTS = [
  { cog: 'Cog3cr',  
    positions: [[0,0],[0,5],[4,0],[4,5]],                         border: COG_BORDER_CLASS.purple     
},
  { cog: 'Cog3do',  
    positions: [[0,1],[0,2],[0,3],[0,4]],                         border: COG_BORDER_CLASS.purple     
},
  { cog: 'Cog3ri',  
    positions: [[1,0],[1,1],[3,0],[3,1]],                         border: COG_BORDER_CLASS.purple     
},
  { cog: 'Cog3le',  
    positions: [[1,4],[1,5],[3,4],[3,5]],                         border: COG_BORDER_CLASS.purple     
},
  { cog: 'Cog3up',  
    positions: [[4,1],[4,2],[4,3],[4,4]],                         border: COG_BORDER_CLASS.purple     
},
  { cog: 'CogY',    
    positions: [[1,2],[1,3],[2,0],[2,1],[2,4],[2,5],[3,2],[3,3]], border: COG_BORDER_CLASS.gemshop 
},
  { cog: 'CogZA00', 
    positions: [[5,0],[5,4]],                                     border: COG_BORDER_CLASS.gemshop 
},
  { cog: 'CogZA01', 
    positions: [[5,1],[5,5]],                                     border: COG_BORDER_CLASS.gemshop 
},
  { cog: 'CogZA02', 
    positions: [[6,0],[6,4]],                                     border: COG_BORDER_CLASS.gemshop 
},
  { cog: 'CogZA03', 
    positions: [[6,1],[6,5]],                                     border: COG_BORDER_CLASS.gemshop 
},
  { cog: 'headBig', 
    positions: [[2,2],[2,3]],                                     border: COG_BORDER_CLASS.white   
},
  { cog: 'CogCry4', 
    positions: [[2,6],[2,7],[2,8],[2,9],[2,10],[2,11]],           border: COG_BORDER_CLASS.green   
},
  { cog: 'CogCry3', 
    positions: [[5,2],[5,3],[6,2],[6,3],[7,2],[7,3]],             border: COG_BORDER_CLASS.garnet    
},
]