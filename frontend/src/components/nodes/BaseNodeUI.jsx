import React from 'react';
import { Handle, Position } from 'reactflow';
import {
  AlertTriangle,
  Book,
  Calendar,
  Castle,
  Diamond,
  Flag,
  HelpCircle,
  Network,
  Route,
  Scale,
  Search,
  User,
} from 'lucide-react';

const IconMap = {
  User,
  Castle,
  Diamond,
  Book,
  AlertTriangle,
  Calendar,
  Flag,
  Network,
  Route,
  Scale,
  Search,
};



export default function BaseNodeUI({ id, data, selected, ringColor, typeLabel, xPos, yPos }) {
  const IconComponent = data.icon && IconMap[data.icon] ? IconMap[data.icon] : HelpCircle;
  const isCentral = data.central;

  return (
    <div className={`flex flex-col items-center transition-transform duration-300 ${selected ? 'scale-110' : 'hover:scale-105'} group`}>
      {/* Invisible Handles for connections - we use Center to make paths route directly to the node center */}
      <Handle type="target" position={Position.Top} style={{ background: 'transparent', border: 'none', width: 1, height: 1 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: 'transparent', border: 'none', width: 1, height: 1 }} />

      {/* Node Avatar/Icon Container */}
      <div
        className={`relative ${isCentral ? 'w-20 h-20' : 'w-14 h-14'} rounded-2xl overflow-hidden bg-zinc-900 border-2 ${ringColor} backdrop-blur-md flex items-center justify-center z-10 transition-all`}
        style={data.color ? { boxShadow: `0 0 18px ${data.color}55` } : undefined}
      >
        {data.imageUrl ? (
          <img 
            src={data.imageUrl} 
            alt={data.label} 
            className={`w-full h-full object-cover transition-opacity duration-300 ${selected ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}
          />
        ) : (
          <IconComponent className={`${isCentral ? 'w-8 h-8' : 'w-6 h-6'} text-zinc-300`} style={data.color ? { color: data.color } : undefined} />
        )}
        
        {/* Scanline overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30 pointer-events-none mix-blend-overlay"></div>
      </div>

      {/* Node Labels */}
      <div className={`absolute top-full mt-3 flex flex-col items-center whitespace-nowrap z-20 transition-all duration-300 ${selected ? 'opacity-100 translate-y-0' : 'opacity-80 group-hover:opacity-100 translate-y-1'}`}>
        <div className="px-3 py-1 rounded-lg bg-zinc-950/80 border border-white/10 backdrop-blur-md shadow-lg pointer-events-none">
          <h3 className={`font-mono text-xs font-bold uppercase tracking-wider ${isCentral ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300' : 'text-purple-100'}`}>
            {data.label}
          </h3>
          {data.subtitle && (
            <p className="text-[10px] text-cyan-400/80 text-center mt-0.5 tracking-wide">
              {data.subtitle}
            </p>
          )}
        </div>
        
        {/* Detailed context menu on Hover (simulates AI DB lookup) */}
        <div className="absolute top-full mt-2 w-max px-3 py-2 bg-zinc-950 border border-purple-500/30 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
           <div className="flex flex-col gap-1 text-[10px] text-zinc-400 font-mono text-left">
             <div className="flex justify-between gap-4"><span className="text-purple-400">CLASS:</span><span className="uppercase">{typeLabel}</span></div>
             {data.dbId && <div className="flex justify-between gap-4"><span className="text-cyan-400">DB_ID:</span><span className="uppercase">{data.dbId}</span></div>}
           </div>
        </div>
      </div>
    </div>
  );
}
