import { TrendingUp, Swords, Fingerprint, Eye, Save, Plus } from 'lucide-react';



export default function NarrativePathCard({ path, isSelected, onSelect }) {
  const Icon = path.icon === 'growth' ? TrendingUp : path.icon === 'conflict' ? Swords : Fingerprint;
  
  const iconColor = path.icon === 'growth' ? 'text-tf-primary bg-tf-primary/10' : 
                    path.icon === 'conflict' ? 'text-tf-error bg-tf-error/10' : 
                    'text-tf-cyan bg-tf-cyan/10';

  const textColor = path.icon === 'growth' ? 'text-tf-primary' : 
                    path.icon === 'conflict' ? 'text-tf-error' : 
                    'text-tf-cyan';

  return (
    <div 
      onClick={onSelect}
      className={`group glass-panel rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col h-full border-t flex-1
        ${isSelected ? 'neon-glow' : 'glass-card-hover border-t-white/10'}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="font-mono text-xs px-3 py-1 rounded-full bg-zinc-900 border border-white/10 text-zinc-400">
          {path.tag}
        </span>
      </div>
      
      <h3 className="font-sora text-xl font-semibold text-white mb-4">
        {path.title}
      </h3>
      
      <div className="space-y-4 flex-grow">
        <section>
          <h4 className={`font-mono text-[11px] mb-1.5 uppercase tracking-wide ${textColor}`}>
            Summary
          </h4>
          <p className="text-zinc-400 font-inter text-sm leading-relaxed">
            {path.summary}
          </p>
        </section>
        
        <section>
          <h4 className={`font-mono text-[11px] mb-1.5 uppercase tracking-wide ${textColor}`}>
            Impact
          </h4>
          <p className="text-zinc-400 font-inter text-sm italic">
            {path.impact}
          </p>
        </section>
        
        <section>
          <h4 className={`font-mono text-[11px] mb-1.5 uppercase tracking-wide ${textColor}`}>
            Characters
          </h4>
          <div className="flex flex-wrap gap-2">
            {path.characters.map((char, i) => (
              <span key={i} className="px-2 py-1 bg-zinc-900/50 border border-white/5 rounded font-mono text-[11px] text-zinc-300">
                {char}
              </span>
            ))}
          </div>
        </section>

        {/* Advanced Feature Metadata */}
        <section className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 mt-2">
          <div className="flex flex-col">
            <span className="font-mono text-[9px] text-zinc-500 uppercase">Score</span>
            <span className="font-mono text-xs text-tf-primary">{path.narrativeScore}%</span>
          </div>
          <div className="flex flex-col">
             <span className="font-mono text-[9px] text-zinc-500 uppercase">Timeline</span>
             <span className="font-mono text-[11px] text-zinc-300 truncate" title={path.timelineImpact}>{path.timelineImpact}</span>
          </div>
          <div className="flex flex-col">
             <span className="font-mono text-[9px] text-zinc-500 uppercase">Risk</span>
             <span className={`font-mono text-xs ${path.riskLevel === 'High' ? 'text-tf-error' : path.riskLevel === 'Medium' ? 'text-tf-cyan' : 'text-zinc-300'}`}>
                {path.riskLevel}
             </span>
          </div>
        </section>
      </div>

      <div className={`mt-6 pt-4 border-t border-white/5 gap-2 transition-all duration-300 h-0 overflow-hidden group-hover:h-24 opacity-0 group-hover:opacity-100 flex flex-col`}>
         <div className="flex gap-2">
            <button className="flex-1 bg-tf-primary text-black py-2 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" /> Insert Into Story
            </button>
         </div>
         <div className="flex gap-2">
            <button className="flex-1 border border-zinc-700 bg-zinc-900 overflow-hidden py-2 rounded-lg font-mono text-xs uppercase text-zinc-300 hover:bg-zinc-800 active:scale-95 transition-all flex items-center justify-center gap-1">
              <Eye className="w-3 h-3" /> Preview
            </button>
             <button className="flex-1 border border-zinc-700 bg-zinc-900 py-2 rounded-lg font-mono text-xs uppercase text-zinc-300 hover:bg-zinc-800 active:scale-95 transition-all flex items-center justify-center gap-1">
              <Save className="w-3 h-3" /> Save Path
            </button>
        </div>
      </div>
    </div>
  );
}
