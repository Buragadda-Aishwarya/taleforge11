import { Maximize2 } from "lucide-react";



export function RelationshipGraph({ data }) {
  return (
    <div className="glass-panel rounded-xl p-6 min-h-[300px] flex flex-col relative overflow-hidden border border-white/5 bg-[#0a0f18]/60">
      {/* Background Graph SVG */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <svg height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 400" width="100%" className="absolute inset-0 w-full h-full">
          <circle cx="400" cy="200" fill="none" r="100" stroke="#edb1ff" strokeWidth="0.5" className="opacity-50" />
          <circle cx="200" cy="100" fill="none" r="40" stroke="#00f1fd" strokeWidth="0.5" className="opacity-50" />
          <circle cx="600" cy="300" fill="none" r="60" stroke="#d6baff" strokeWidth="0.5" className="opacity-50" />
          <line className="stroke-secondary stroke-[1] animate-[dash_20s_linear_infinite]" strokeLinecap="round" strokeDasharray="4 8" x1="240" x2="320" y1="120" y2="160" />
          <line className="stroke-primary stroke-[1] animate-[dash_15s_linear_infinite]" strokeLinecap="round" strokeDasharray="4 8" x1="480" x2="550" y1="240" y2="280" />
          <path d="M 280 200 Q 400 100 520 200" fill="none" stroke="#4e4350" strokeWidth="0.5" className="opacity-30" />
        </svg>
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-start mb-4">
        <div>
          <h2 className="font-sora text-2xl font-medium text-on-surface mb-1">Relationship Graph</h2>
          <p className="font-inter text-[15px] text-on-surface-variant">Active focus: {data.focus}</p>
        </div>
        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <Maximize2 className="w-5 h-5 text-on-surface-variant hover:text-primary transition-colors" />
        </button>
      </div>

      {/* Main Graph Visualization */}
      <div className="flex-grow flex items-center justify-center relative z-10 mt-4 md:mt-0">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 w-full max-w-2xl justify-center">
          
          {/* Node 1 */}
          <div className="flex flex-col items-center gap-3">
             <div className="relative w-20 h-20 group">
                <div className="absolute inset-0 border-2 border-secondary rounded-xl scale-110 opacity-30 group-hover:opacity-60 group-hover:scale-105 transition-all duration-300" />
                <div className="absolute inset-0 rounded-xl overflow-hidden border border-secondary/50 shadow-[0_0_20px_rgba(0,241,253,0.2)]">
                  <img src={data.node1.image} alt={data.node1.name} className="w-full h-full object-cover" />
                </div>
             </div>
             <span className="font-mono text-[13px] text-on-surface font-medium tracking-wide">{data.node1.name}</span>
          </div>

          {/* Connection */}
          <div className="flex flex-col items-center w-32 md:w-48 relative shrink-0">
             {/* Connection Line */}
             <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-secondary via-primary/50 to-primary -translate-y-1/2 opacity-70" />
             {/* Animated pulse on line */}
             <div className="absolute top-1/2 left-0 w-16 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent -translate-y-1/2 opacity-80 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_8px_#fff]" />
             
             {/* Label Badge */}
             <div className="bg-surface/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 z-10 shadow-lg relative cursor-pointer hover:border-secondary/40 transition-colors">
               <span className="font-mono text-[11px] tracking-widest text-on-surface-variant font-medium">
                 {data.relationship}
               </span>
             </div>
             
             {/* Core center dot */}
             <div className="w-2 h-2 rounded-full bg-white absolute top-1/2 -translate-y-1/2 shadow-[0_0_10px_#fff] z-10" />
          </div>

          {/* Node 2 */}
          <div className="flex flex-col items-center gap-3">
             <div className="relative w-20 h-20 group">
                <div className="absolute inset-0 border-2 border-primary rounded-xl scale-110 opacity-30 group-hover:opacity-60 group-hover:scale-105 transition-all duration-300" />
                <div className="absolute inset-0 rounded-xl overflow-hidden border border-primary/50 shadow-[0_0_20px_rgba(237,177,255,0.2)]">
                  <img src={data.node2.image} alt={data.node2.name} className="w-full h-full object-cover" />
                </div>
             </div>
             <span className="font-mono text-[13px] text-on-surface font-medium tracking-wide">{data.node2.name}</span>
          </div>
          
        </div>
      </div>
    </div>
  );
}
