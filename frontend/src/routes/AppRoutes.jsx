import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import Landing from '../pages/Landing';
import IngestionHub from '../pages/IngestionHub';
import StoryBible from '../pages/StoryBible';
import ContinuityDashboard from '../pages/ContinuityDashboard';
import NexusResearch from '../pages/NexusResearch';
import KnowledgeGraph from '../pages/KnowledgeGraph';
import EngineDashboard from '../pages/EngineDashboard';
import ProofOfConceptDashboard from '../pages/ProofOfConceptDashboard';
import SceneGenerationLab from '../pages/SceneGenerationLab';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Landing page has its own custom navbar/header, no BottomNav */}
      <Route path="/" element={<Landing />} />
      
      {/* IngestionHub and ContinuityDashboard wrap themselves inside PageContainer */}
      <Route path="/upload" element={<IngestionHub />} />
      <Route path="/continuity" element={<ContinuityDashboard />} />
      
      {/* The remaining views are wrapped in PageContainer here */}
      <Route path="/story-bible" element={<PageContainer><StoryBible /></PageContainer>} />
      <Route path="/research" element={<PageContainer><NexusResearch /></PageContainer>} />
      <Route path="/graph" element={<PageContainer><KnowledgeGraph /></PageContainer>} />
      <Route path="/engine" element={<PageContainer><EngineDashboard /></PageContainer>} />
      <Route path="/evaluation" element={<PageContainer><ProofOfConceptDashboard /></PageContainer>} />
      <Route path="/scenes" element={<PageContainer><SceneGenerationLab /></PageContainer>} />
    </Routes>
  );
}
