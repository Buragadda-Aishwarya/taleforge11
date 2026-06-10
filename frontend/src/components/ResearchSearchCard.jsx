import { Brain, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from './ui/Button';



export function ResearchSearchCard({ onAnalyze, isLoading }) {
  const [localQuery, setLocalQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      onAnalyze?.(localQuery);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative group px-4 md:px-0">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary-container to-secondary-container rounded-full blur opacity-20 group-focus-within:opacity-50 transition duration-500"></div>
      <div className="relative flex flex-col md:flex-row items-center bg-surface-container-lowest/80 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-full px-6 py-4 gap-4 md:gap-0">
        <div className="flex items-center w-full">
          <Brain className={`text-secondary-fixed w-6 h-6 mr-4 shrink-0 ${(isLoading) ? 'animate-pulse' : ''}`} />
          <input 
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            disabled={isLoading}
            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-lg font-body-lg text-on-surface placeholder:text-on-surface-variant/50" 
            placeholder="Explore 'Logistics of a Martian Colony'..." 
            type="text"
          />
        </div>
        <Button 
          type="submit"
          disabled={isLoading || !localQuery.trim()}
          className="w-full md:w-auto md:ml-4 rounded-xl md:rounded-full px-6 py-3 md:py-2"
          icon={<Zap className="w-4 h-4 text-currentColor" />}
        >
          {isLoading ? 'ANALYZING...' : 'ANALYZE'}
        </Button>
      </div>
    </form>
  );
}
