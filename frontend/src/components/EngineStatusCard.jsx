import { Brain, Network } from 'lucide-react';

const formatDuration = (duration) => {
  if (typeof duration !== 'number') return 'Waiting';
  return duration >= 1000 ? `${(duration / 1000).toFixed(1)}s` : `${Math.round(duration)}ms`;
};

export default function EngineStatusCard({ latestLog, summary, loading }) {
  const latestTitle = latestLog
    ? latestLog.action
    : loading
      ? 'Loading agent activity'
      : 'No agent activity yet';
  const latestDescription = latestLog
    ? `${latestLog.agentName} executed through ${latestLog.metadata?.provider || 'the router'} in ${formatDuration(latestLog.duration)}.`
    : 'Run research, continuity, scene generation, or the recruiter demo to populate this dashboard.';
  const completed = summary?.completedOperations || 0;
  const total = summary?.totalOperations || 0;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-purple-400 font-medium tracking-tight">Engine Status</h2>
        <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1 rounded-full border border-purple-500/20">
          <span className="w-2 h-2 rounded-full bg-cyan-400 ai-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
          <span className="font-mono text-xs text-cyan-400 tracking-widest">ACTIVE</span>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] -mr-16 -mt-16 rounded-full border-none"></div>
        <div className="flex flex-col gap-4 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs text-zinc-400 tracking-widest">CURRENT TASK</span>
            <span className="font-mono text-xs text-purple-300 tracking-widest">{progress}% COMPLETE</span>
          </div>
          <h3 className="font-display text-xl text-zinc-100 font-medium leading-tight">{latestTitle}</h3>
          <p className="text-zinc-400 font-sans text-sm">{latestDescription}</p>
          
          <div className="w-full bg-zinc-900/80 h-1.5 rounded-full overflow-hidden mt-2 border border-zinc-800">
            <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 relative" style={{ width: `${Math.max(progress, latestLog ? 12 : 0)}%` }}>
               <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-2 items-center">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border border-zinc-950 bg-purple-900/50 flex items-center justify-center backdrop-blur">
                <Brain className="w-4 h-4 text-purple-300" />
              </div>
              <div className="w-8 h-8 rounded-full border border-zinc-950 bg-cyan-900/50 flex items-center justify-center backdrop-blur">
                <Network className="w-4 h-4 text-cyan-300" />
              </div>
            </div>
            <span className="font-mono text-xs text-zinc-500 ml-2">{total} Agent Operations</span>
          </div>
        </div>
        
        {/* Shimmer line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-50"></div>
      </div>
    </div>
  );
}
