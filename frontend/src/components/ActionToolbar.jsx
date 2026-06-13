import { Download, Play, LayoutGrid } from "lucide-react";
import { cn } from '@/lib/utils';



export default function ActionToolbar({ className, onRun, isRunning = false }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <button
        onClick={onRun}
        disabled={isRunning}
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)]"
      >
        <Play className="w-4 h-4 fill-current" />
        {isRunning ? 'Running Suite...' : 'Run Benchmark'}
      </button>
      <button className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
        <Download className="w-4 h-4" />
        Export Log
      </button>
      <button className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors sm:ml-auto">
        <LayoutGrid className="w-4 h-4" />
        View All Test Cases
      </button>
    </div>
  );
}
