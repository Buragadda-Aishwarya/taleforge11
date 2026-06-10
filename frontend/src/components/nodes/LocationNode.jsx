import React from 'react';
import BaseNodeUI from './BaseNodeUI';

export default function LocationNode(props) {
  return (
    <BaseNodeUI 
      {...props} 
      typeLabel="Location"
      ringColor="border-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.4)]" 
    />
  );
}
