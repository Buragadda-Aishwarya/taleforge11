import { HeroSection } from '@/components/HeroSection';
import { useState } from 'react';
import { ResearchSearchCard } from '@/components/ResearchSearchCard';
import { SuggestionTags } from '@/components/SuggestionTags';
import { ResearchSummaryCard } from '@/components/ResearchSummaryCard';
import { HistoricalTimelineCard } from '@/components/HistoricalTimelineCard';
import { ForgeImpactCard } from '@/components/ForgeImpactCard';
import { SourceListCard } from '@/components/SourceListCard';
import { ContextModeCard } from '@/components/ContextModeCard';
import { useResearchAgent } from '@/hooks/useResearchAgent';
import {
  addResearchToStoryBible,
  createCharacter,
  createLocation,
  createWorldRule,
  loadLatestStoryBible,
  loadLatestStoryUpload,
  saveLatestStoryBible,
} from '@/services/storyApi';
import { CheckCircle2, Circle, Network, Sparkles } from 'lucide-react';

function DetailPanel({ title, items }) {
  if (!items?.length) return null;
  return (
    <div className="glass-panel rounded-xl border border-white/5 bg-surface-container-lowest/60 p-5">
      <h3 className="mb-4 font-label-sm text-xs uppercase tracking-widest text-on-surface-variant">{title}</h3>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="text-sm leading-relaxed text-on-surface-variant">{item}</li>
        ))}
      </ul>
    </div>
  );
}

function AgentActivityPanel({ activity }) {
  const defaultSteps = [
    'Research Started',
    'Searching Sources',
    'Generating Assets',
    'Creating Context Nodes',
    'Updating Story Bible',
    'Updating Memory',
    'Completed',
  ];
  const completedLabels = new Set(activity.map((item) => item.label));

  return (
    <div className="glass-panel rounded-xl border border-white/5 bg-surface-container-lowest/60 p-5">
      <h3 className="mb-4 flex items-center gap-2 font-label-sm text-xs uppercase tracking-widest text-on-surface-variant">
        <Network className="h-4 w-4 text-secondary-fixed" />
        Agent Activity
      </h3>
      <div className="space-y-3">
        {defaultSteps.map((step) => {
          const done = completedLabels.has(step);
          return (
            <div key={step} className="flex items-center gap-3 text-sm">
              {done ? <CheckCircle2 className="h-4 w-4 text-secondary-fixed" /> : <Circle className="h-4 w-4 text-on-surface-variant/40" />}
              <span className={done ? 'text-on-surface' : 'text-on-surface-variant'}>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function NexusResearch() {
  const { data, isLoading, error, activity, analyzeQuery, pushActivity } = useResearchAgent();
  const [saveMessage, setSaveMessage] = useState('');
  const [savingAction, setSavingAction] = useState('');

  const getStoryId = () => loadLatestStoryUpload()?.uploadResult?.story?.id;

  const mergeResearchIntoLocalBible = (research) => {
    const current = loadLatestStoryBible();
    const currentBible = current?.storyBible || { characters: [], locations: [], worldRules: [] };
    const assets = research.storyAssets || {};
    const nextStoryBible = {
      characters: [
        ...(currentBible.characters || []),
        ...(assets.character ? [{
          name: assets.character.name,
          description: assets.character.description,
          role: assets.character.role || 'Research Concept',
          relationships: [],
        }] : []),
      ],
      locations: [
        ...(currentBible.locations || []),
        ...(assets.location ? [{
          name: assets.location.name,
          description: assets.location.description,
          significance: assets.location.significance,
        }] : []),
      ],
      worldRules: [
        ...(currentBible.worldRules || []),
        ...(assets.worldRule ? [{
          rule: assets.worldRule.rule,
          category: assets.worldRule.category || 'Research Rule',
          evidence: assets.worldRule.narrativeUse || `Generated from research query: ${research.query}`,
        }] : []),
      ],
    };

    saveLatestStoryBible({
      storyContent: current?.storyContent || `Research: ${research.query}`,
      storyBible: nextStoryBible,
    });
  };

  const addResearchToBible = async () => {
    if (!data?.rawResearch) return;
    setSavingAction('story-bible');
    setSaveMessage('');
    try {
      pushActivity('Updating Story Bible', 'active');
      await addResearchToStoryBible({ storyId: getStoryId(), research: data.rawResearch });
      pushActivity('Updating Memory');
      mergeResearchIntoLocalBible(data.rawResearch);
      setSaveMessage('Research saved to Story Bible, memory, and graph.');
    } catch (error) {
      setSaveMessage(error.message || 'Unable to save research.');
    } finally {
      setSavingAction('');
    }
  };

  const saveAsset = async (type, asset) => {
    const storyId = getStoryId();
    setSavingAction(type);
    setSaveMessage('');
    try {
      if (type === 'character') await createCharacter({ storyId, character: asset });
      if (type === 'worldRule') await createWorldRule({ storyId, worldRule: asset });
      if (type === 'location') await createLocation({ storyId, location: asset });
      setSaveMessage(`${type} saved.`);
    } catch (error) {
      setSaveMessage(error.message || `Unable to save ${type}.`);
    } finally {
      setSavingAction('');
    }
  };

  return (
    <main className="relative z-10 pt-28 pb-32 px-4 md:px-8 max-w-[1400px] mx-auto min-h-screen">
      <HeroSection />
      
      <section className="mb-14">
        <ResearchSearchCard onAnalyze={analyzeQuery} isLoading={isLoading} />
        <SuggestionTags onSelect={analyzeQuery} isLoading={isLoading} />
        {error && (
          <div className="mx-auto mt-6 max-w-3xl rounded-lg border border-error/30 bg-error/10 px-4 py-3 font-mono text-xs text-error">
            {error}
          </div>
        )}
      </section>

      {/* Adding a subtle fade when loading for visual feedback */}
      <div className={`grid grid-cols-1 md:grid-cols-12 gap-8 items-start transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {data ? (
          <>
            <div className="md:col-span-12 lg:col-span-7 xl:col-span-8 space-y-8">
              <ResearchSummaryCard summary={data.summary} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DetailPanel title="Technologies" items={data.technologies} />
                <DetailPanel title="Challenges" items={data.challenges} />
                <DetailPanel title="Opportunities" items={data.opportunities} />
              </div>
              <HistoricalTimelineCard timeline={data.timeline} />
            </div>
            
            <div className="md:col-span-12 lg:col-span-5 xl:col-span-4 space-y-8">
              <AgentActivityPanel activity={activity} />
              <ForgeImpactCard
                impact={data.impact}
                onAddToStoryBible={addResearchToBible}
                onCreateCharacter={() => saveAsset('character', data.rawResearch.storyAssets?.character)}
                onCreateWorldRule={() => saveAsset('worldRule', data.rawResearch.storyAssets?.worldRule)}
                onCreateLocation={() => saveAsset('location', data.rawResearch.storyAssets?.location)}
                onSaveAsset={saveAsset}
                savingAction={savingAction}
              />
              {saveMessage && (
                <div className="rounded-lg border border-secondary/30 bg-secondary/10 px-4 py-3 font-mono text-xs text-secondary">
                  {saveMessage}
                </div>
              )}
              <SourceListCard sources={data.sources} />
              <ContextModeCard modes={data.contextModes} />
            </div>
          </>
        ) : (
          <div className="col-span-12 flex justify-center py-20">
             {isLoading ? (
               <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
             ) : (
               <div className="text-center">
                 <Sparkles className="mx-auto mb-4 h-8 w-8 text-primary" />
                 <p className="text-on-surface-variant font-body-md max-w-md">No research data available yet. Enter a topic to start Groq Research Nexus.</p>
               </div>
             )}
          </div>
        )}
      </div>
    </main>
  );
}
