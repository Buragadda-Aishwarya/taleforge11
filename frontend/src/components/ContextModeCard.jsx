import { GlassCard } from './ui/GlassCard';



export function ContextModeCard({ modes }) {
  return (
    <GlassCard>
      <h3 className="font-label-sm text-xs text-on-surface-variant uppercase mb-5 tracking-widest">Contextual Nodes</h3>
      <div className="flex flex-wrap gap-2.5">
        {modes.map((mode, idx) => {
          let styles = "bg-white/5 text-on-surface-variant border-white/10";
          if (idx === 0) styles = "bg-primary/10 text-primary border-primary/20";
          if (idx === 1) styles = "bg-secondary-fixed/10 text-secondary-fixed border-secondary-fixed/20";
          
          return (
            <span key={idx} className={`${styles} border px-3 py-1.5 rounded font-label-sm text-xs tracking-wider cursor-pointer hover:brightness-125 transition-all`}>
              {mode}
            </span>
          );
        })}
      </div>
    </GlassCard>
  );
}
