import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Network, Radio } from 'lucide-react';

export default function Navbar() {
  const navLinks = [
    { label: 'Upload', path: '/upload' },
    { label: 'Bible', path: '/story-bible' },
    { label: 'Continuity', path: '/continuity' },
    { label: 'Research', path: '/research' },
    { label: 'Graph', path: '/graph' },
    { label: 'Engine', path: '/engine' },
    { label: 'Lab', path: '/scenes' },
    { label: 'POC', path: '/evaluation' }
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-[#131313cc] backdrop-blur-xl border-b border-white/5 shadow-[0_0_30px_rgba(157,80,187,0.1)] flex justify-between items-center px-4 md:px-8 h-16">
      <Link to="/" className="flex items-center gap-2 cursor-pointer">
        <Network className="w-6 h-6 text-primary" />
        <span className="font-sora text-xl font-bold text-primary tracking-tight">
          TaleForge AI
        </span>
      </Link>
      
      <div className="hidden md:flex items-center gap-6">
        <nav className="flex items-center gap-5">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `font-mono text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer ${
                  isActive 
                    ? 'text-primary drop-shadow-[0_0_8px_rgba(237,177,255,0.6)]' 
                    : 'text-on-surface-variant hover:text-primary'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <Radio className="w-5 h-5 text-on-surface-variant hover:text-cyan-400 transition-colors cursor-pointer" />
      </div>
      
      <div className="md:hidden flex items-center">
        <Radio className="w-5 h-5 text-on-surface-variant hover:text-cyan-400 transition-colors cursor-pointer" />
      </div>
    </header>
  );
}
