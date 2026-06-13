import { GlassCard } from './ui/GlassCard';



export function HistoricalTimelineCard({ timeline }) {
  return (
    <GlassCard className="overflow-x-auto">
      <div className="flex justify-between items-center mb-10 min-w-[400px]">
        <h3 className="font-headline-md text-2xl font-medium">Historical Evolution</h3>
        <div className="flex items-center gap-4">
          <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest">Scale: Centuries</span>
          <div className="h-[1px] w-12 bg-white/10"></div>
        </div>
      </div>
      <div className="relative pb-4 min-w-[500px]">
        <div className="absolute left-0 right-0 top-6 h-[1px] bg-white/10"></div>
        <div className="flex justify-between relative px-2 md:px-8">
          {timeline.map((item, idx) => (
            <div key={idx} className={`flex flex-col items-center gap-4 ${!item.isCore && idx > 1 ? 'opacity-40' : ''}`}>
              <div className={`w-12 h-12 rounded-xl glass-panel flex items-center justify-center font-label-md text-sm ${item.isCore ? 'border-secondary-fixed/50 text-secondary-fixed ring-4 ring-secondary-fixed/10' : idx === 0 ? 'border-primary/50 text-primary' : 'border-white/20'}`}>
                <span className="text-center leading-tight">{String(item.year).split(' ')[0]}<br/>{String(item.year).split(' ')[1] || ''}</span>
              </div>
              <div className="text-center mt-2">
                <p className={`font-label-sm text-xs uppercase tracking-wider ${item.isCore ? 'text-on-surface font-bold' : 'text-on-surface'}`}>{item.label}</p>
                <p className="text-[10px] text-on-surface-variant mt-1">{item.subLabel}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
