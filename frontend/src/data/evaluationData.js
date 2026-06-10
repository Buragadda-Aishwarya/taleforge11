export const accuracyMetrics = {
  detectionAccuracy: 99.8,
  falsePositives: 0.02,
};

export const performanceMetrics = {
  responseTime: 140, // ms
  retrievalSpeed: 0.8, // GB/s
  networkThroughput: "1,240,882",
  integrityScore: "Gold Standard",
};

export const testCases = [
  {
    id: "tc-001",
    knownFact: "Aria cannot swim",
    sceneInput: "Aria dives into the deep lake to retrieve the ring.",
    expectedResult: "Contradiction",
    detectedResult: "Contradiction",
    confidence: 99.8,
    retrievalTime: 42,
    violationType: "Physical Logic",
  },
  {
    id: "tc-002",
    knownFact: "City founded in 302 AE",
    sceneInput: "Character visits city in 105 AE",
    expectedResult: "Anachronism",
    detectedResult: "Anachronism",
    confidence: 99.9,
    retrievalTime: 38,
    violationType: "Timeline",
  },
  {
    id: "tc-003",
    knownFact: "Kael possesses Sunblade",
    sceneInput: "Kael draws rusted iron dagger to parry",
    expectedResult: "Inconsistency",
    detectedResult: "Inconsistency",
    confidence: 98.4,
    retrievalTime: 51,
    violationType: "Inventory",
  },
  {
    id: "tc-004",
    knownFact: "Only royal blood opens vault",
    sceneInput: "Peasant enters vault",
    expectedResult: "Lore Violation",
    detectedResult: "Lore Violation",
    confidence: 99.5,
    retrievalTime: 45,
    violationType: "World Lore",
  },
];

export const accuracyTrendData = [
  { time: "00:00", accuracy: 98.1 },
  { time: "04:00", accuracy: 98.5 },
  { time: "08:00", accuracy: 99.0 },
  { time: "12:00", accuracy: 99.2 },
  { time: "16:00", accuracy: 99.6 },
  { time: "20:00", accuracy: 99.7 },
  { time: "24:00", accuracy: 99.8 },
];

export const violationCategoriesData = [
  { name: "Timeline", value: 35 },
  { name: "World Lore", value: 40 },
  { name: "Inventory", value: 15 },
  { name: "Physical Logic", value: 10 },
];

export const performanceOverTimeData = [
  { time: "00:00", responseTime: 160, throughput: 800 },
  { time: "04:00", responseTime: 155, throughput: 850 },
  { time: "08:00", responseTime: 148, throughput: 920 },
  { time: "12:00", responseTime: 145, throughput: 1050 },
  { time: "16:00", responseTime: 142, throughput: 1100 },
  { time: "20:00", responseTime: 141, throughput: 1180 },
  { time: "24:00", responseTime: 140, throughput: 1240 },
];

export const futureIntegrationsMetrics = {
  chromaDb: {
    retrievalLatency: 24, // ms
    vectorDimension: 1536,
  },
  langChain: {
    agentStepTime: 0.12, // s
    toolsInvoked: 3,
  },
  gemini: {
    extractionAccuracy: 99.9, // %
    tokensPerSecond: 120, // T/s
  },
  groq: {
    continuityDetectionTime: 12, // ms
    throughput: 800, // T/s
  },
  openAi: {
    sceneGenerationTime: 1.2, // s
    model: "gpt-4o",
  }
};
