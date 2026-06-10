import { Copy, Share2, CircleCheck } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';



export function ResearchSummaryCard({ summary }) {
  return (
    <GlassCard borderAccent="secondary" className="md:p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-secondary-fixed ai-pulse"></div>
            <span className="font-label-sm text-xs text-secondary-fixed tracking-widest uppercase">Research Summary</span>
          </div>
          <h2 className="font-headline-lg text-3xl font-semibold leading-tight">{summary.title}</h2>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-lg bg-surface-variant/30 hover:bg-surface-variant text-on-surface-variant transition-colors">
            <Copy className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg bg-surface-variant/30 hover:bg-surface-variant text-on-surface-variant transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="prose prose-invert max-w-none">
        <p className="font-body-lg text-on-surface-variant mb-6 leading-relaxed text-[17px]">
          {summary.paragraph}
        </p>
        <ul className="space-y-4 font-body-md text-on-surface-variant mt-6">
          {summary.keyFindings.map((finding, idx) => (
            <li key={idx} className="flex gap-3 items-start">
              <CircleCheck className="text-primary w-5 h-5 mt-0.5 shrink-0" />
              <span className="leading-relaxed">{finding}</span>
            </li>
          ))}
        </ul>
      </div>
    </GlassCard>
  );
}
