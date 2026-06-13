import { useMemo, useState } from "react";
import { Calendar, MapPin, Plus, Scale, Sparkles, Trash2, Users, Wand2 } from "lucide-react";
import { DomainTabs } from '@/components/DomainTabs';
import { NeuralFeedCard } from '@/components/NeuralFeedCard';
import { RelationshipGraph } from '@/components/RelationshipGraph';
import { CharacterProfileCard } from '@/components/CharacterProfileCard';
import { NewCharacterCard } from '@/components/NewCharacterCard';
import { storyBibleData } from '@/data/storyBibleData';
import { clearLatestStoryBible, loadLatestStoryBible } from '@/services/storyApi';

const fallbackImages = storyBibleData.characterPreview.images;

const toGeneratedGraph = (characters) => {
  const first = characters[0];
  const second = characters[1] || characters[0];

  if (!first) {
    return storyBibleData.graphData;
  }

  return {
    focus: characters.length > 1 ? `${first.name} & ${second.name}` : first.name,
    node1: {
      name: first.name,
      image: storyBibleData.graphData.node1.image,
    },
    node2: {
      name: second.name,
      image: storyBibleData.graphData.node2.image,
    },
    relationship: first.relationships?.[0] || 'ENTITY',
  };
};

const toGeneratedCharacterCard = (character) => ({
  name: character?.name || 'Unnamed Character',
  title: character?.role || 'Detected Character',
  traits: [
    {
      id: 'description',
      label: character?.description || 'No description extracted',
      type: 'neutral',
      icon: 'Zap',
    },
    {
      id: 'relationship',
      label: character?.relationships?.[0] || 'Relationship pending',
      type: 'neutral',
      icon: 'Ban',
    },
  ],
  goal: character?.role || character?.description || 'Narrative function pending review.',
  images: fallbackImages,
  collaborators: storyBibleData.characterPreview.collaborators,
  collaboratorCount: Math.max(0, (character?.relationships || []).length),
});

function EntityList({ title, icon: Icon, items, emptyLabel, renderItem }) {
  return (
    <section className="glass-panel rounded-xl border border-white/5 bg-[#0a0f18]/60 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-secondary" />
          <h2 className="font-sora text-lg font-semibold text-on-surface">{title}</h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] text-on-surface-variant">
          {items.length}
        </span>
      </div>

      {items.length ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <article key={`${title}-${item.name || item.rule || index}`} className="rounded-lg border border-white/5 bg-surface-container-lowest/50 p-4">
              {renderItem(item)}
            </article>
          ))}
        </div>
      ) : (
        <p className="font-inter text-sm text-on-surface-variant">{emptyLabel}</p>
      )}
    </section>
  );
}

export default function StoryBible() {
  const [latestRecord, setLatestRecord] = useState(() => loadLatestStoryBible());

  const storyBible = latestRecord?.storyBible;
  const characters = storyBible?.characters || [];
  const locations = storyBible?.locations || [];
  const worldRules = storyBible?.worldRules || [];
  const timelines = storyBible?.timelines || [];
  const hasGeneratedBible = Boolean(storyBible);

  const feed = useMemo(() => {
    if (!hasGeneratedBible) {
      return storyBibleData.feed;
    }

    return [
      {
        id: 'generated',
        type: 'link',
        title: 'Story Bible Generated',
        description: `Gemini extracted ${characters.length} characters, ${locations.length} locations, ${timelines.length} timeline events, and ${worldRules.length} world rules.`,
        timestamp: latestRecord.generatedAt ? new Date(latestRecord.generatedAt).toLocaleString() : 'Just now',
        status: 'secondary',
      },
      {
        id: 'review',
        type: 'alert',
        title: 'Review Recommended',
        description: 'AI output is ready for human validation before persistence.',
        timestamp: 'Pending',
        status: 'primary',
      },
    ];
  }, [characters.length, hasGeneratedBible, latestRecord?.generatedAt, locations.length, timelines.length, worldRules.length]);

  const graphData = useMemo(() => toGeneratedGraph(characters), [characters]);
  const characterPreview = useMemo(
    () => (characters[0] ? toGeneratedCharacterCard(characters[0]) : storyBibleData.characterPreview),
    [characters]
  );

  const clearGeneratedBible = () => {
    clearLatestStoryBible();
    setLatestRecord(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505]">
      
      {/* Main Content Area */}
      <main className="flex-1 pt-24 pb-32 md:pb-12 px-4 md:px-8 max-w-[1400px] mx-auto w-full">
        
        {/* Header Section */}
        <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="font-sora text-3xl md:text-4xl font-semibold text-on-surface mb-3 tracking-tight">
              Story Bible
            </h1>
            <p className="font-inter text-base text-on-surface-variant leading-relaxed">
              {hasGeneratedBible
                ? 'Generated from your latest upload. Review the extracted characters, locations, and world rules before saving them.'
                : 'Deep cognitive mapping of story entities, relationships, lore, and narrative consistency. Your AI co-pilot has identified critical updates.'}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {hasGeneratedBible && (
              <button
                onClick={clearGeneratedBible}
                className="px-5 py-2.5 rounded-lg bg-surface-container-high/80 border border-white/10 font-mono text-[12px] font-medium text-on-surface hover:bg-surface-bright transition-all flex items-center gap-2 backdrop-blur-md"
              >
                <Trash2 className="w-4 h-4 text-outline" />
                CLEAR RESULT
              </button>
            )}
            <button className="px-5 py-2.5 rounded-lg bg-surface-container-high/80 border border-white/10 font-mono text-[12px] font-medium text-on-surface hover:bg-surface-bright transition-all flex items-center gap-2 backdrop-blur-md">
              <Wand2 className="w-4 h-4 text-outline" />
              SYNC UNIVERSE
            </button>
            <button className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary-container to-primary/80 border border-primary/20 text-white font-mono text-[12px] font-medium hover:opacity-90 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(157,80,187,0.3)]">
              <Plus className="w-4 h-4" />
              NEW NODE
            </button>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left Sidebar (Domains & Feed) */}
          <div className="lg:col-span-3 lg:col-start-1 space-y-6 flex flex-col">
            <DomainTabs activeDomain="characters" />
            <NeuralFeedCard feed={feed} />
          </div>

          {/* Main Visuals & Cards */}
          <div className="lg:col-span-9 space-y-6 lg:space-y-8 flex flex-col">
             {/* Graph View */}
            <RelationshipGraph data={graphData} />
            
            {/* Entity Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              <CharacterProfileCard data={characterPreview} />
              <NewCharacterCard />
            </div>

            {hasGeneratedBible && (
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
                <EntityList
                  title="Characters"
                  icon={Users}
                  items={characters}
                  emptyLabel="No characters were extracted."
                  renderItem={(character) => (
                    <>
                      <h3 className="font-sora text-base font-semibold text-on-surface">{character.name || 'Unnamed Character'}</h3>
                      <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-primary">{character.role || 'Role pending'}</p>
                      <p className="mt-3 font-inter text-sm leading-relaxed text-on-surface-variant">{character.description || 'No description provided.'}</p>
                    </>
                  )}
                />

                <EntityList
                  title="Locations"
                  icon={MapPin}
                  items={locations}
                  emptyLabel="No locations were extracted."
                  renderItem={(location) => (
                    <>
                      <h3 className="font-sora text-base font-semibold text-on-surface">{location.name || 'Unnamed Location'}</h3>
                      <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-secondary">{location.significance || 'Significance pending'}</p>
                      <p className="mt-3 font-inter text-sm leading-relaxed text-on-surface-variant">{location.description || 'No description provided.'}</p>
                    </>
                  )}
                />

                <EntityList
                  title="Timeline"
                  icon={Calendar}
                  items={timelines}
                  emptyLabel="No timeline events were extracted."
                  renderItem={(timeline) => (
                    <>
                      <h3 className="font-sora text-base font-semibold text-on-surface">{timeline.event || 'Unnamed Event'}</h3>
                      <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-secondary">Event {timeline.order || 'Pending'}</p>
                      <p className="mt-3 font-inter text-sm leading-relaxed text-on-surface-variant">{timeline.evidence || 'No evidence provided.'}</p>
                    </>
                  )}
                />

                <EntityList
                  title="World Rules"
                  icon={Scale}
                  items={worldRules}
                  emptyLabel="No world rules were extracted."
                  renderItem={(worldRule) => (
                    <>
                      <h3 className="font-sora text-base font-semibold text-on-surface">{worldRule.rule || 'Unnamed Rule'}</h3>
                      <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-tertiary">{worldRule.category || 'General'}</p>
                      <p className="mt-3 font-inter text-sm leading-relaxed text-on-surface-variant">{worldRule.evidence || 'No evidence provided.'}</p>
                    </>
                  )}
                />
              </div>
            )}

            {hasGeneratedBible && (
              <div className="glass-panel rounded-xl border border-secondary/20 bg-secondary/5 p-5">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-1 h-5 w-5 text-secondary" />
                  <div>
                    <h2 className="font-sora text-lg font-semibold text-on-surface">Latest Upload Connected</h2>
                    <p className="mt-2 max-w-3xl font-inter text-sm leading-relaxed text-on-surface-variant">
                      This dashboard is rendering the Gemini response from your latest upload. The data is held locally in the browser for review and is not stored in PostgreSQL yet.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
        </div>
      </main>

          </div>
  );
}
