import { Zap } from 'lucide-react';

export default function OptimizeButton() {
  return (
    <button className="w-full relative group overflow-hidden rounded-xl p-[1px] focus:outline-none focus:ring-2 focus:ring-purple-500/50">
      <span className="absolute inset-0 bg-gradient-to-r from-purple-500 via-purple-400 to-purple-600 opacity-70 group-hover:opacity-100 transition-opacity duration-300"></span>
      <div className="relative bg-zinc-950/80 backdrop-blur-md px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 group-hover:bg-zinc-950/50">
        <Zap className="w-5 h-5 text-purple-300 animate-pulse" />
        <span className="font-mono tracking-widest text-sm text-purple-100 uppercase">Optimize Neural Paths</span>
      </div>
    </button>
  );
}
