import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY not set in .env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    // The library may expose a listModels or similar method. Try a couple of possibilities.
    if (typeof genAI.listModels === 'function') {
      const res = await genAI.listModels();
      console.log(JSON.stringify(res, null, 2));
      return;
    }

    if (genAI.modelService && typeof genAI.modelService.listModels === 'function') {
      const res = await genAI.modelService.listModels();
      console.log(JSON.stringify(res, null, 2));
      return;
    }

    console.error('No listModels API found on GoogleGenerativeAI client. Check the library docs for how to list models.');
  } catch (err) {
    console.error('Error listing models:', err?.message || err);
  }
}

listModels();
