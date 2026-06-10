import { Book, FileText, Globe } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';



export function SourceListCard({ sources }) {
  return (
    <GlassCard>
      <h3 className="font-headline-md text-2xl font-medium mb-5 flex items-center gap-2">
        <Book className="text-on-surface-variant w-5 h-5" />
        Sources
      </h3>
      <div className="space-y-3">
        {sources.map((source, idx) => (
          <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-surface-container-lowest border border-white/5 hover:border-primary/30 transition-colors cursor-pointer group">
            {source.isWeb ? 
              <Globe className="text-on-surface-variant group-hover:text-primary w-5 h-5 shrink-0" /> : 
              <FileText className="text-on-surface-variant group-hover:text-primary w-5 h-5 shrink-0" />
            }
            <div className="overflow-hidden">
              <p className="text-sm font-label-md text-on-surface truncate tracking-wider">{source.name}</p>
              <p className="text-xs font-label-sm text-on-surface-variant mt-1.5">{source.institution}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
