const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const STORY_BIBLE_STORAGE_KEY = 'taleforge.storyBible.latest';
const STORY_UPLOAD_STORAGE_KEY = 'taleforge.storyUpload.latest';
const CONTINUITY_CHECKS_STORAGE_KEY = 'taleforge.continuity.checks';

const parseResponse = async (response) => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || 'Request failed.');
  }

  return payload;
};

export const generateStoryBible = async (storyContent) => {
  const response = await fetch(`${API_BASE_URL}/api/story/generate-bible`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ storyContent }),
  });

  const payload = await parseResponse(response);
  return payload.storyBible;
};

export const uploadStory = async ({ title, content }) => {
  const response = await fetch(`${API_BASE_URL}/api/story/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, content }),
  });

  return parseResponse(response);
};

export const checkContinuity = async (scene, knownFacts = []) => {
  const response = await fetch(`${API_BASE_URL}/api/continuity/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ scene, knownFacts }),
  });

  return parseResponse(response);
};

export const queryResearch = async (query) => {
  const response = await fetch(`${API_BASE_URL}/api/research/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  const payload = await parseResponse(response);
  return payload.research;
};

export const addResearchToStoryBible = async ({ storyId, research }) => {
  const response = await fetch(`${API_BASE_URL}/api/research/add-to-story-bible`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ storyId, research }),
  });

  return parseResponse(response);
};

export const generateScenePaths = async (storyId) => {
  const response = await fetch(`${API_BASE_URL}/api/scene/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ storyId }),
  });

  return parseResponse(response);
};

export const saveLatestStoryBible = ({ storyContent, storyBible }) => {
  const record = {
    storyContent,
    storyBible,
    generatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORY_BIBLE_STORAGE_KEY, JSON.stringify(record));
  return record;
};

export const saveLatestStoryUpload = ({ storyContent, uploadResult }) => {
  const record = {
    storyContent,
    uploadResult,
    generatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORY_UPLOAD_STORAGE_KEY, JSON.stringify(record));
  return record;
};

export const loadLatestStoryUpload = () => {
  const rawValue = localStorage.getItem(STORY_UPLOAD_STORAGE_KEY);
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue);
  } catch (_error) {
    localStorage.removeItem(STORY_UPLOAD_STORAGE_KEY);
    return null;
  }
};

export const loadContinuityChecks = () => {
  const rawValue = localStorage.getItem(CONTINUITY_CHECKS_STORAGE_KEY);
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    localStorage.removeItem(CONTINUITY_CHECKS_STORAGE_KEY);
    return [];
  }
};

export const saveContinuityCheck = (result) => {
  const checks = loadContinuityChecks();
  const record = {
    id: `check-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: result.contradiction ? 'unresolved' : 'resolved',
    ...result,
  };
  const nextChecks = [record, ...checks].slice(0, 50);

  localStorage.setItem(CONTINUITY_CHECKS_STORAGE_KEY, JSON.stringify(nextChecks));
  return record;
};

export const updateContinuityCheck = (id, updates) => {
  const nextChecks = loadContinuityChecks().map((check) =>
    check.id === id ? { ...check, ...updates } : check
  );

  localStorage.setItem(CONTINUITY_CHECKS_STORAGE_KEY, JSON.stringify(nextChecks));
  return nextChecks;
};

export const loadLatestStoryBible = () => {
  const rawValue = localStorage.getItem(STORY_BIBLE_STORAGE_KEY);
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue);
  } catch (_error) {
    localStorage.removeItem(STORY_BIBLE_STORAGE_KEY);
    return null;
  }
};

export const clearLatestStoryBible = () => {
  localStorage.removeItem(STORY_BIBLE_STORAGE_KEY);
};
