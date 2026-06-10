import React from 'react';
import Navbar from './Navbar';
import BottomNavigation from './BottomNavigation';

export default function PageContainer({ children }) {
  return (
    <div className="relative min-h-screen bg-[#050505] text-[#e5e2e1] font-body overflow-x-hidden antialiased selection:bg-primary/30">
      {/* Fixed Grid Blueprint Background */}
      <div className="fixed inset-0 grid-blueprint pointer-events-none z-0 opacity-40"></div>
      
      {/* Shared Navbar */}
      <Navbar />
      
      {/* Main viewport */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Shared Mobile Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
