import { ZoomIn, ZoomOut, Maximize, Layers } from 'lucide-react';



export default function GraphToolbar({ onZoomIn, onZoomOut, onResetView }) {
  return (
    <div className="absolute right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3">
      <div className="flex flex-col gap-1 p-1.5 rounded-2xl bg-zinc-950/60 backdrop-blur-md border border-purple-500/20 shadow-lg shadow-purple-900/20">
        <button 
          onClick={onZoomIn}
          className="p-3 rounded-xl hover:bg-cyan-500/20 text-cyan-400/70 hover:text-cyan-300 transition-all group"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
        <button 
          onClick={onZoomOut}
          className="p-3 rounded-xl hover:bg-cyan-500/20 text-cyan-400/70 hover:text-cyan-300 transition-all group"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
        <div className="w-8 h-px bg-purple-500/20 mx-auto my-1" />
        <button 
          onClick={onResetView}
          className="p-3 rounded-xl hover:bg-purple-500/20 text-purple-400/70 hover:text-purple-300 transition-all group"
          title="Reset View"
        >
          <Maximize className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
        <button 
          className="p-3 rounded-xl hover:bg-purple-500/20 text-purple-400/70 hover:text-purple-300 transition-all group relative"
          title="Toggle Layers"
        >
          <Layers className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_5px_currentColor]"></span>
        </button>
      </div>
    </div>
  );
}
