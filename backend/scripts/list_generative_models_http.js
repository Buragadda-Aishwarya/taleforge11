import dotenv from 'dotenv';

dotenv.config();

const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error('GEMINI_API_KEY not set in .env');
  process.exit(1);
}

const endpoints = [
  'https://generativelanguage.googleapis.com/v1/models',
  'https://generativelanguage.googleapis.com/v1beta/models',
];

async function listFrom(endpoint) {
  try {
    const url = `${endpoint}?key=${encodeURIComponent(key)}`;
    const res = await fetch(url);
    const text = await res.text();

    if (!res.ok) {
      console.error(`Endpoint ${endpoint} returned ${res.status}: ${res.statusText}`);
      console.error(text);
      return;
    }

    const data = JSON.parse(text);
    const models = data.models || data;

    if (!models || models.length === 0) {
      console.log(`No models listed at ${endpoint}`);
      return;
    }

    console.log(`Models from ${endpoint}:`);
    for (const m of models) {
      // Print id and any supportedMethods or metadata if present
      const id = m.name || m.model || m.id || m.modelId || m;
      const methods = m.supportedMethods || m.supported_methods || m.supportedFeatures || m.methods || m.apiMethods || [];
      console.log('-'.repeat(60));
      console.log(`id: ${typeof id === 'string' ? id : JSON.stringify(id)}`);
      if (methods && methods.length) console.log(`supportedMethods: ${JSON.stringify(methods)}`);
      if (m.description) console.log(`description: ${m.description}`);
      if (m.type) console.log(`type: ${m.type}`);
      if (m.model) console.log(`model: ${m.model}`);
    }
  } catch (err) {
    console.error(`Error fetching from ${endpoint}:`, err?.message || err);
  }
}

(async () => {
  for (const ep of endpoints) {
    await listFrom(ep);
  }
})();
