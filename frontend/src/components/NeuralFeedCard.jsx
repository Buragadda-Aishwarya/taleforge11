



export function NeuralFeedCard({ feed }) {
  return (
    <div className="glass-panel rounded-xl p-5 relative overflow-hidden group">
      {/* Subtle background glow effect over the card */}
       <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-colors duration-700 pointer-events-none" />
       
      <div className="flex items-center justify-between mb-5 relative">
        <h3 className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest">
          Neural Feed
        </h3>
        <div className="w-2 h-2 rounded-full bg-secondary animate-pulse-slow shadow-[0_0_10px_#00f1fd]" />
      </div>
      
      <div className="space-y-5 relative">
        {feed.map((item) => (
          <div 
            key={item.id} 
            className={`border-l-2 pl-3 py-1 relative ${
              item.status === 'secondary' ? 'border-secondary/40' : 'border-primary/40'
            }`}
          >
             {/* Small node dot on the line */}
             <div className={`absolute -left-[5px] top-2 w-2 h-2 rounded-full border border-surface ${
               item.status === 'secondary' ? 'bg-secondary' : 'bg-primary'
             }`} />
             
            <p className={`font-mono text-[13px] mb-1 font-medium ${
              item.status === 'secondary' ? 'text-secondary text-glow-secondary' : 'text-primary'
            }`}>
              {item.title}
            </p>
            <p className="font-body text-[13px] text-on-surface-variant leading-relaxed">
              {item.description}
            </p>
            <span className="font-mono text-[10px] text-outline mt-1 block">
              {item.timestamp}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
