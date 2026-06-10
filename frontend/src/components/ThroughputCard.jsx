import { Sparkles } from "lucide-react";
import { cn } from '@/lib/utils';



export default function ThroughputCard({ value, className }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-zinc-950/80 backdrop-blur border border-purple-500/30 shadow-[0_0_40px_rgba(157,80,187,0.15)] rounded-2xl p-8 flex flex-col justify-center min-h-[220px] group",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent pointer-events-none" />
      <div className="absolute -right-32 -top-32 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-600/20 transition-all duration-700" />
      
      <div className="relative z-10 flex flex-col gap-2">
        <span className="text-sm font-semibold text-purple-400 tracking-widest uppercase">
          Network Throughput
        </span>
        <h3 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400 tracking-tight">
          {value}
        </h3>
        <p className="text-sm text-zinc-400 max-w-md mt-2 leading-relaxed">
          Narrative nodes processed with zero coherence drift in primary world-building threads.
        </p>
      </div>

      <div className="absolute top-6 right-6 bg-purple-500/10 border border-purple-500/40 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
        <Sparkles className="w-4 h-4 text-purple-300" />
        <span className="text-[10px] font-bold text-purple-300 tracking-widest uppercase">
          Innovation Peak
        </span>
      </div>
    </div>
  );
}
