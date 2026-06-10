import { HeroSection } from '@/components/HeroSection';
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
  loadLatestStoryBible,
  loadLatestStoryUpload,
  saveLatestStoryBible,
} from '@/services/storyApi';

export default function NexusResearch() {
  const { data, isLoading, error, analyzeQuery } = useResearchAgent();

  const addResearchToBible = async () => {
    if (!data?.rawResearch) return;

    const latestUpload = loadLatestStoryUpload();
    const storyId = latestUpload?.uploadResult?.story?.id;

    await addResearchToStoryBible({
      storyId,
      research: data.rawResearch,
    });

    const current = loadLatestStoryBible();
    const currentBible = current?.storyBible || {
      characters: [],
      locations: [],
      worldRules: [],
    };
    const research = data.rawResearch;
    const nextStoryBible = {
      characters: [
        ...(currentBible.characters || []),
        ...(research.characterIdeas || []).map((idea, index) => ({
          name: `Research Character ${index + 1}`,
          description: idea,
          role: 'Research Concept',
          relationships: [],
        })),
      ],
      locations: currentBible.locations || [],
      worldRules: [
        ...(currentBible.worldRules || []),
        ...(research.worldBuildingIdeas || []).map((idea) => ({
          rule: idea,
          category: 'Research World Building',
          evidence: `Generated from research query: ${research.query}`,
        })),
      ],
    };

    saveLatestStoryBible({
      storyContent: current?.storyContent || `Research: ${research.query}`,
      storyBible: nextStoryBible,
    });
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
              <HistoricalTimelineCard timeline={data.timeline} />
            </div>
            
            <div className="md:col-span-12 lg:col-span-5 xl:col-span-4 space-y-8">
              <ForgeImpactCard impact={data.impact} onAddToStoryBible={addResearchToBible} />
              <SourceListCard sources={data.sources} />
              <ContextModeCard modes={data.contextModes} />
            </div>
          </>
        ) : (
          <div className="col-span-12 flex justify-center py-20">
             {isLoading ? (
               <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
             ) : (
               <p className="text-on-surface-variant font-body-md text-center max-w-md">No research data available yet. Please submit a query above to start analyzing.</p>
             )}
          </div>
        )}
      </div>
    </main>
  );
}
