import { Ban, Zap, ArrowRight } from "lucide-react";





const traitIcons = {
  Ban,
  Zap
};

export function CharacterProfileCard({ data }) {
  return (
    <div className="glass-panel rounded-xl overflow-hidden relative group transition-transform hover:scale-[1.01] duration-300 border border-white/5 bg-[#0a0f18]/60 flex flex-col">
       {/* Animated border glow effect */}
      <div className="absolute inset-0 pointer-events-none p-[1px] rounded-xl overflow-hidden shadow-[inset_0_0_20px_rgba(157,80,187,0.05)]">
         <div className="absolute -inset-[100%] animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,rgba(0,0,0,0)_0%,rgba(157,80,187,0.3)_50%,rgba(0,0,0,0)_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </div>

      {/* Banner & Avatar section */}
      <div className="h-32 bg-surface-container relative shrink-0">
        <div className="absolute inset-0 z-0">
           <img 
              src={data.images.banner} 
              alt="Banner" 
              className="w-full h-full object-cover opacity-30 grayscale mix-blend-screen"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f18] to-transparent" />
        </div>
        
        <div className="absolute -bottom-6 left-6 flex items-end gap-4 z-10 w-full pr-6">
          <div className="w-[84px] h-[84px] rounded-xl border border-primary/50 bg-surface overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.8),0_0_15px_rgba(157,80,187,0.3)] shrink-0">
            <img src={data.images.avatar} alt={data.name} className="w-full h-full object-cover" />
          </div>
          <div className="pb-1 overflow-hidden">
            <h4 className="font-sora text-2xl font-semibold text-on-surface truncate">{data.name}</h4>
            <p className="font-mono text-[10px] text-primary tracking-widest uppercase mt-0.5">{data.title}</p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 pt-10 flex-grow flex flex-col space-y-5 relative z-10">
        <div className="grid grid-cols-2 gap-4 flex-grow">
          {/* Traits */}
          <div className="p-3.5 bg-surface-container-lowest/50 rounded-lg border border-white/5 flex flex-col">
            <span className="font-mono text-[10px] text-outline uppercase tracking-widest mb-3 block">Traits</span>
            <ul className="font-inter text-[13px] space-y-2.5">
              {data.traits.map(trait => {
                const Icon = traitIcons[trait.icon];
                return (
                  <li key={trait.id} className={`flex items-center gap-2 ${trait.type === 'negative' ? 'text-error' : 'text-on-surface-variant'}`}>
                    {Icon && <Icon className="w-3.5 h-3.5 opacity-80" />}
                    <span className="truncate">{trait.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Goal */}
          <div className="p-3.5 bg-surface-container-lowest/50 rounded-lg border border-white/5 flex flex-col">
            <span className="font-mono text-[10px] text-outline uppercase tracking-widest mb-2 block shrink-0">Goal</span>
            <p className="font-inter text-[13px] text-secondary leading-relaxed">
              {data.goal}
            </p>
          </div>
        </div>

        {/* Footer info - Collaborators / Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
          <div className="flex -space-x-2">
            {data.collaborators.map(coll => (
              <div key={coll.id} className="w-8 h-8 rounded-full border-2 border-[#0a0f18] bg-surface-container overflow-hidden z-20">
                <img src={coll.avatar} alt="Collaborator" className="w-full h-full object-cover" />
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-[#0a0f18] bg-primary/20 backdrop-blur-sm flex items-center justify-center text-[10px] font-bold text-primary z-10">
              +{data.collaboratorCount}
            </div>
          </div>
          
          <button className="group/btn text-primary font-mono text-[12px] font-medium flex items-center gap-1.5 hover:text-primary-container transition-colors">
            Edit Files 
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
