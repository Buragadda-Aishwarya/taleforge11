import { useState } from 'react';
import { queryResearch } from '@/services/storyApi';

export function useResearchAgent(initialQuery) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activity, setActivity] = useState([]);

  const pushActivity = (label, status = 'completed') => {
    setActivity((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${prev.length}`,
        label,
        status,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const analyzeQuery = async (newQuery) => {
    if (!newQuery.trim()) return;
    setIsLoading(true);
    setError(null);
    setActivity([]);

    try {
      pushActivity('Research Started', 'active');
      pushActivity('Searching Sources', 'active');
      const research = await queryResearch(newQuery);
      pushActivity('Generating Assets');
      pushActivity('Creating Context Nodes');
      setData({
        id: `research-${Date.now()}`,
        query: research.query || newQuery,
        rawResearch: research,
        summary: {
          title: research.query || newQuery,
          paragraph: research.executiveSummary || research.summary,
          keyFindings: research.keyFindings || [],
        },
        technologies: research.technologies || [],
        challenges: research.challenges || [],
        opportunities: research.opportunities || [],
        timeline: (research.historicalEvolution || []).map((item, index) => ({
          year: item.period || `Phase ${index + 1}`,
          label: item.label || item.period || `Stage ${index + 1}`,
          subLabel: item.description || '',
          isCore: index < 2,
        })),
        impact: {
          character: {
            title: 'Character Concept',
            description: research.storyAssets?.character?.description || '',
          },
          worldRule: {
            title: 'World Rules',
            description: research.storyAssets?.worldRule?.rule || '',
          },
          storyOpportunities: research.storyOpportunities || research.storyIdeas || [],
          storyAssets: research.storyAssets || {},
          aiIdeationDrafts: research.aiIdeationDrafts || {},
        },
        sources: research.sources || [],
        contextModes: research.contextualNodes || [],
      });
      pushActivity('Completed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Research failed');
      pushActivity('Research Failed', 'failed');
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, activity, analyzeQuery, pushActivity };
}
