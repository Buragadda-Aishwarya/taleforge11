import React from 'react';
import BaseNodeUI from './BaseNodeUI';

export default function ArtifactNode(props) {
  return (
    <BaseNodeUI 
      {...props} 
      typeLabel="Artifact"
      ringColor="border-pink-400 shadow-[0_0_15px_rgba(244,114,182,0.4)]" 
    />
  );
}
