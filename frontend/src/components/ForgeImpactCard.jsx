import { Sparkles, BookPlus, UserPlus, Scale } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';



export function ForgeImpactCard({ impact, onAddToStoryBible }) {
  return (
    <GlassCard className="border-t-2 border-primary overflow-hidden relative">
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/20 blur-[50px] rounded-full pointer-events-none"></div>
      <h3 className="font-headline-md text-2xl font-medium mb-6 flex items-center gap-2">
        <Sparkles className="text-primary w-5 h-5" />
        Forge Impact
      </h3>
      <div className="space-y-3 relative z-10">
        <Button
          variant="primary"
          className="w-full"
          icon={<BookPlus className="w-4 h-4" />}
          onClick={onAddToStoryBible}
        >
          ADD TO STORY BIBLE
        </Button>
        <Button variant="secondary" className="w-full" icon={<UserPlus className="w-4 h-4" />}>
          CREATE CHARACTER
        </Button>
        <Button variant="ghost" className="w-full" icon={<Scale className="w-4 h-4" />}>
          CREATE WORLD RULE
        </Button>
      </div>
      <div className="mt-8 pt-6 border-t border-white/5 z-10 relative">
        <p className="font-label-sm text-xs text-on-surface-variant uppercase mb-4 tracking-widest">AI Ideation Drafts</p>
        <div className="space-y-4">
          {impact.storyIdeas?.length > 0 && (
            <div className="bg-surface-container-low p-4 rounded-lg border border-white/5">
              <p className="text-xs font-label-md text-tertiary mb-2 uppercase tracking-wider">Story Ideas</p>
              <ul className="space-y-2 text-sm font-body-md text-on-surface-variant leading-relaxed">
                {impact.storyIdeas.map((idea, index) => (
                  <li key={index}>{idea}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="bg-surface-container-low p-4 rounded-lg border border-white/5">
            <p className="text-xs font-label-md text-primary mb-2 uppercase tracking-wider">{impact.character.title}</p>
            <p className="text-sm font-body-md text-on-surface-variant leading-relaxed">{impact.character.description}</p>
          </div>
          <div className="bg-surface-container-low p-4 rounded-lg border border-white/5">
            <p className="text-xs font-label-md text-secondary-fixed mb-2 uppercase tracking-wider">{impact.worldRule.title}</p>
            <p className="text-sm font-body-md text-on-surface-variant leading-relaxed">{impact.worldRule.description}</p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
