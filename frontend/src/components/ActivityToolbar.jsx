import { Filter, Download } from 'lucide-react';

export default function ActivityToolbar() {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
      <div>
        <h2 className="font-display text-2xl text-zinc-100 font-medium tracking-tight">Activity Stream</h2>
        <p className="font-mono text-[10px] text-zinc-500 tracking-widest mt-1 uppercase">Real-Time Agentic Logs</p>
      </div>
      <div className="flex gap-2">
        <button className="w-10 h-10 glass-panel !rounded-full flex items-center justify-center text-zinc-400 hover:text-purple-300 hover:border-purple-500/40 transition-colors">
          <Filter className="w-4 h-4" />
        </button>
        <button className="w-10 h-10 glass-panel !rounded-full flex items-center justify-center text-zinc-400 hover:text-purple-300 hover:border-purple-500/40 transition-colors">
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
