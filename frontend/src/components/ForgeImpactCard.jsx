import { Castle, Flag, Flame, Lightbulb, MapPin, Sparkles, BookPlus, UserPlus, Scale } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';



const ideationSections = [
  ['characterConcepts', 'Character Concepts'],
  ['worldRules', 'World Rules'],
  ['factions', 'Factions'],
  ['plotHooks', 'Plot Hooks'],
  ['conflictIdeas', 'Conflict Ideas'],
];

export function ForgeImpactCard({
  impact,
  onAddToStoryBible,
  onCreateCharacter,
  onCreateWorldRule,
  onCreateLocation,
  onSaveAsset,
  savingAction,
}) {
  const assets = impact.storyAssets || {};

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
          disabled={Boolean(savingAction)}
        >
          {savingAction === 'story-bible' ? 'SAVING...' : 'ADD TO STORY BIBLE'}
        </Button>
        <Button variant="secondary" className="w-full" icon={<UserPlus className="w-4 h-4" />} onClick={onCreateCharacter} disabled={Boolean(savingAction)}>
          {savingAction === 'character' ? 'CREATING...' : 'CREATE CHARACTER'}
        </Button>
        <Button variant="ghost" className="w-full" icon={<Scale className="w-4 h-4" />} onClick={onCreateWorldRule} disabled={Boolean(savingAction)}>
          {savingAction === 'world-rule' ? 'CREATING...' : 'CREATE WORLD RULE'}
        </Button>
        <Button variant="ghost" className="w-full" icon={<MapPin className="w-4 h-4" />} onClick={onCreateLocation} disabled={Boolean(savingAction)}>
          {savingAction === 'location' ? 'CREATING...' : 'CREATE LOCATION'}
        </Button>
      </div>
      <div className="mt-8 pt-6 border-t border-white/5 z-10 relative">
        <p className="font-label-sm text-xs text-on-surface-variant uppercase mb-4 tracking-widest">AI Ideation Drafts</p>
        <div className="space-y-4">
          {ideationSections.map(([key, title]) => (
            (impact.aiIdeationDrafts?.[key] || []).length > 0 && (
              <div key={key} className="bg-surface-container-low p-4 rounded-lg border border-white/5">
                <p className="text-xs font-label-md text-tertiary mb-2 uppercase tracking-wider">{title}</p>
                <ul className="space-y-2 text-sm font-body-md text-on-surface-variant leading-relaxed">
                  {impact.aiIdeationDrafts[key].map((idea, index) => (
                    <li key={index}>{idea}</li>
                  ))}
                </ul>
              </div>
            )
          ))}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 z-10 relative">
        <p className="font-label-sm text-xs text-on-surface-variant uppercase mb-4 tracking-widest">Generated Story Assets</p>
        <div className="space-y-3">
          {[
            ['character', 'Character', UserPlus],
            ['location', 'Location', Castle],
            ['faction', 'Faction', Flag],
            ['worldRule', 'World Rule', Scale],
            ['conflict', 'Conflict', Flame],
            ['plotHook', 'Plot Hook', Lightbulb],
          ].map(([key, label, Icon]) => {
            const asset = assets[key];
            if (!asset) return null;
            return (
              <div key={key} className="rounded-lg border border-white/5 bg-surface-container-low p-4">
                <div className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-label-md uppercase tracking-wider text-on-surface">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-on-surface">{asset.name || asset.title || asset.rule}</p>
                    <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">{asset.description || asset.narrativeUse || asset.stakes || asset.payoff}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSaveAsset?.(key, asset)}
                    disabled={Boolean(savingAction)}
                    className="rounded-md border border-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-secondary-fixed hover:border-secondary-fixed/40 disabled:opacity-40"
                  >
                    Save
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}
