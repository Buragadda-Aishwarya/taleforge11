import { useState } from 'react';
import { queryResearch } from '@/services/storyApi';

export function useResearchAgent(initialQuery) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeQuery = async (newQuery) => {
    if (!newQuery.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const research = await queryResearch(newQuery);
      setData({
        id: `research-${Date.now()}`,
        query: research.query || newQuery,
        rawResearch: research,
        summary: {
          title: research.query || newQuery,
          paragraph: research.summary,
          keyFindings: research.keyFindings || [],
        },
        timeline: [],
        impact: {
          character: {
            title: 'Character Concepts',
            description: (research.characterIdeas || []).join(' '),
          },
          worldRule: {
            title: 'World Rules',
            description: (research.worldBuildingIdeas || []).join(' '),
          },
          storyIdeas: research.storyIdeas || [],
          characterIdeas: research.characterIdeas || [],
          worldBuildingIdeas: research.worldBuildingIdeas || [],
        },
        sources: [
          { name: 'Gemini Research Agent', institution: 'TaleForge AI', isWeb: false },
        ],
        contextModes: [
          ...(research.keyFindings || []),
          ...(research.storyIdeas || []),
        ].slice(0, 8),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Research failed');
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, analyzeQuery };
}
