import { Book, ExternalLink, Globe } from 'lucide-react';
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
          <a
            key={idx}
            href={source.url || undefined}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 p-3 rounded-lg bg-surface-container-lowest border border-white/5 hover:border-primary/30 transition-colors group"
          >
            <Globe className="text-on-surface-variant group-hover:text-primary w-5 h-5 shrink-0" />
            <div className="overflow-hidden">
              <p className="text-sm font-label-md text-on-surface truncate tracking-wider">{source.title}</p>
              <p className="text-xs font-label-sm text-on-surface-variant mt-1.5">
                {source.category} · Trust {source.trustScore ?? 70}%
              </p>
            </div>
            {source.url && <ExternalLink className="ml-auto h-4 w-4 text-on-surface-variant" />}
          </a>
        ))}
      </div>
    </GlassCard>
  );
}
