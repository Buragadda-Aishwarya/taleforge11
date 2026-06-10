import { Search, MapPin, Plus } from 'lucide-react';

export default function GraphSearchBar() {
  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4">
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-950/60 backdrop-blur-md border border-purple-500/20 shadow-lg shadow-purple-900/20">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/50" />
          <input 
            type="text" 
            placeholder="Query Graph..." 
            className="w-full bg-transparent border-none py-2 pl-9 pr-4 text-sm text-purple-100 placeholder-purple-400/50 focus:outline-none focus:ring-0"
          />
        </div>
        
        <div className="h-6 w-px bg-purple-500/20 mx-1" />
        
        <button className="p-2 mr-1 rounded-xl hover:bg-purple-500/20 text-purple-400 transition-colors group" title="Focus Node">
          <MapPin className="w-4 h-4 group-hover:text-cyan-400 transition-colors" />
        </button>
        <button className="p-2 mr-1 rounded-xl bg-purple-600/20 hover:bg-purple-500/40 border border-purple-500/30 text-purple-300 transition-colors shadow-[0_0_10px_rgba(168,85,247,0.2)]" title="Create Node">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
