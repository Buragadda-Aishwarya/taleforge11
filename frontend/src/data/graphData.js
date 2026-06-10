



export const initialNodes = [
  { 
    id: 'aria', 
    type: 'character', 
    position: { x: 500, y: 400 }, 
    data: { 
      label: 'Aria', 
      subtitle: 'Awakened Soul', 
      central: true, 
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      dbId: 'uuid-1',
      vectorId: 'vec-1'
    } 
  },
  { 
    id: 'kiran', 
    type: 'character', 
    position: { x: 200, y: 250 }, 
    data: { label: 'Kiran', subtitle: 'Mentor', icon: 'User', dbId: 'uuid-2' } 
  },
  { 
    id: 'glass_kingdom', 
    type: 'location', 
    position: { x: 800, y: 200 }, 
    data: { label: 'Glass Kingdom', subtitle: 'Capital', icon: 'Castle', dbId: 'uuid-3' } 
  },
  { 
    id: 'fragment', 
    type: 'artifact', 
    position: { x: 300, y: 650 }, 
    data: { label: 'The Fragment', subtitle: 'Relic', icon: 'Diamond', dbId: 'uuid-4' } 
  },
  { 
    id: 'archives', 
    type: 'lore', 
    position: { x: 850, y: 600 }, 
    data: { label: 'Archives', subtitle: 'Ancient History', icon: 'Book', dbId: 'uuid-5' } 
  },
];

// React Flow edges support labels natively
export const initialEdges = [
  { id: 'e1', source: 'kiran', target: 'aria', label: 'Mentored By', animated: true, style: { stroke: 'rgba(168, 85, 247, 0.4)', strokeWidth: 2 } },
  { id: 'e2', source: 'aria', target: 'glass_kingdom', label: 'Lives In', animated: true, style: { stroke: 'rgba(34, 211, 238, 0.4)', strokeWidth: 2 } },
  { id: 'e3', source: 'aria', target: 'fragment', label: 'Possesses', animated: true, style: { stroke: 'rgba(168, 85, 247, 0.4)', strokeWidth: 2 } },
  { id: 'e4', source: 'fragment', target: 'archives', label: 'Referenced In', animated: true, style: { stroke: 'rgba(34, 211, 238, 0.4)', strokeWidth: 2 } },
  { id: 'e5', source: 'kiran', target: 'glass_kingdom', label: 'Knows', animated: true, style: { stroke: 'rgba(168, 85, 247, 0.4)', strokeWidth: 2 } },
];
