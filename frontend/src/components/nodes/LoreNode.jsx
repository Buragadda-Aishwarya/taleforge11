import React from 'react';
import BaseNodeUI from './BaseNodeUI';

export default function LoreNode(props) {
  return (
    <BaseNodeUI 
      {...props} 
      typeLabel="Lore"
      ringColor="border-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.4)]" 
    />
  );
}
