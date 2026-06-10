



export const activityData = [
  {
    id: "1",
    timestamp: "10:34 PM",
    status: "In Progress",
    agentType: "Scene Generator Agent",
    provider: "OpenAI",
    title: "Scene Generation Initiated",
    description: "Drafting the cyberpunk alleyway confrontation scene in Neo-Tokyo.",
    metrics: {
      model: "gpt-4o",
      tokens: "Processing..."
    }
  },
  {
    id: "2",
    timestamp: "10:33 PM",
    status: "Completed",
    agentType: "Librarian Agent",
    provider: "LangChain",
    title: "Agent Route Executed",
    description: "LangChain orchestrator routed the query to the cultural archive tool.",
    queryDetails: "Action: semantic_search",
    metrics: {
      latency: "240ms"
    }
  },
  {
    id: "3",
    timestamp: "10:32 PM",
    status: "Completed",
    agentType: "Memory Agent",
    provider: "ChromaDB",
    title: "Vector Retrieval Log",
    description: "Retrieved 5 relevant lore fragments regarding the 'Midnight Nexus' artifact.",
    queryDetails: "Distance threshold: 0.15",
    sourceDetails: "Collection: lore_fragments_v2",
    metrics: {
      latency: "45ms"
    }
  },
  {
    id: "4",
    timestamp: "10:30 PM",
    status: "Completed",
    agentType: "Story Bible Agent",
    provider: "Gemini",
    title: "Lore Synthesis",
    description: "Synthesized raw research into cohesive character profiles.",
    metrics: {
      model: "gemini-1.5-pro",
      latency: "1.2s",
      tokens: "4,092"
    }
  },
  {
    id: "5",
    timestamp: "10:28 PM",
    status: "Completed",
    agentType: "Continuity Agent",
    provider: "Groq",
    title: "Rapid Reasoning Pass",
    description: "Lightning-fast continuity check across all active sub-plots.",
    metrics: {
      model: "llama3-70b-8192",
      latency: "18ms",
      tokens: "840"
    }
  }
];
