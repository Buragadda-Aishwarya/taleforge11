import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { runEvaluationBenchmarks } from './evaluation.service.js';
import { routeAgentTask } from './agents/agentRouter.service.js';
import { uploadStoryWithIngestion } from './story.service.js';
import { withAgentLog } from './agentLog.service.js';

const demoStoriesDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../demo_stories'
);

const readDemoStory = async (fileName) => {
  const fileContent = await readFile(path.join(demoStoriesDirectory, fileName), 'utf8');
  return JSON.parse(fileContent);
};

export const listDemoStories = async () => {
  const fileNames = await readdir(demoStoriesDirectory);
  const stories = await Promise.all(
    fileNames
      .filter((fileName) => fileName.endsWith('.json'))
      .map((fileName) => readDemoStory(fileName))
  );

  return stories.map((story) => ({
    id: story.id,
    genre: story.genre,
    title: story.title,
    knownCharacters: story.knownCharacters,
    knownRules: story.knownRules,
    knownContradictions: story.knownContradictions,
  }));
};

export const getDemoStory = async (demoId = 'fantasy') => {
  const safeId = String(demoId || 'fantasy').toLowerCase().replace(/[^a-z0-9-]/g, '');
  return readDemoStory(`${safeId}.json`);
};

export const runRecruiterDemo = async (demoId = 'fantasy') => {
  const demoStory = await getDemoStory(demoId);
  const uploadResult = await withAgentLog(
    {
      agentName: 'Story Bible Agent',
      action: `Demo Story Bible: ${demoStory.title}`,
      metadata: {
        provider: 'Gemini',
        route: 'demo_story_bible',
        demoId: demoStory.id,
      },
    },
    () => uploadStoryWithIngestion({
      title: demoStory.title,
      content: demoStory.content,
    })
  );
  const storyId = uploadResult.story?.id;
  const continuityCase = demoStory.knownContradictions[0];
  const continuity = await routeAgentTask({
    type: 'continuity',
    payload: {
      scene: continuityCase.scene,
      knownFacts: demoStory.knownRules,
    },
  });
  const scene = await routeAgentTask({
    type: 'scene',
    payload: { storyId },
  });
  const graph = await routeAgentTask({
    type: 'graph',
    payload: { storyId },
  });
  const evaluation = await withAgentLog(
    {
      agentName: 'Evaluation Agent',
      action: 'Run benchmark suite for recruiter demo',
      metadata: {
        provider: 'Internal',
        route: 'evaluation',
        demoId: demoStory.id,
      },
    },
    () => runEvaluationBenchmarks()
  );

  return {
    demoStory,
    uploadResult,
    continuity,
    scene,
    graph,
    evaluation,
  };
};
