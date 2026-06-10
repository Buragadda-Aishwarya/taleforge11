import { Cpu } from "lucide-react";
import { cn } from '@/lib/utils';

export default function EngineStatusBadge({ className }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-2 rounded-lg bg-zinc-950/60 backdrop-blur border border-purple-500/20 shadow-lg shadow-purple-500/10",
        className
      )}
    >
      <div className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400"></span>
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-purple-300 font-semibold leading-tight">
          Engine Active
        </span>
        <span className="text-xs text-zinc-300 font-mono tracking-tight leading-tight">
          NARRATIVE_CONSISTENCY_CHECKER
        </span>
      </div>
    </div>
  );
}
