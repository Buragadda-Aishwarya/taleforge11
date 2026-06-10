import { Award } from "lucide-react";
import { cn } from '@/lib/utils';

export default function IntegrityBadgeCard({ className }) {
  return (
    <div
      className={cn(
        "bg-zinc-950/60 backdrop-blur border border-cyan-500/20 shadow-lg shadow-cyan-500/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center",
        className
      )}
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl animate-pulse" />
        <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-cyan-500/50 flex items-center justify-center relative bg-zinc-950/80 rotate-3 transition-transform hover:rotate-0 duration-300 cursor-default">
          <Award className="w-8 h-8 text-cyan-400" />
        </div>
      </div>
      <h4 className="font-bold text-cyan-300 uppercase tracking-widest text-sm leading-tight">
        Narrative Integrity
        <br />
        <span className="text-zinc-100">Gold Standard</span>
      </h4>
    </div>
  );
}
