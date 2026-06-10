import React from 'react';
import { NavLink } from 'react-router-dom';
import { Upload, BookOpen, Search, Network, Brain } from 'lucide-react';

export default function BottomNavigation() {
  const tabs = [
    { label: 'Upload', path: '/upload', icon: Upload },
    { label: 'Bible', path: '/story-bible', icon: BookOpen },
    { label: 'Research', path: '/research', icon: Search },
    { label: 'Graph', path: '/graph', icon: Network },
    { label: 'Scenes', path: '/scenes', icon: Brain }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-xl bg-[#1c1b1bcc]/80 backdrop-blur-2xl border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] flex justify-around items-center h-20 pb-safe px-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center transition-all duration-200 active:scale-95 px-3 py-2 rounded-xl cursor-pointer ${
                isActive 
                  ? 'bg-tertiary-container/30 text-tertiary border border-tertiary/20 shadow-[0_0_15px_rgba(214,186,255,0.1)]' 
                  : 'text-on-surface-variant hover:text-secondary'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="font-mono text-[10px] tracking-wide">{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
