import React from 'react';
import BaseNodeUI from './BaseNodeUI';

export default function CharacterNode(props) {
  return (
    <BaseNodeUI 
      {...props} 
      typeLabel="Character"
      ringColor="border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]" 
    />
  );
}
