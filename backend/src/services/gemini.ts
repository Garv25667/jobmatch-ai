import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../config/env';

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is required in environment variables');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Model for 768-dimensional text embeddings
const EMBEDDING_MODEL = 'gemini-embedding-001';
const EMBEDDING_DIMENSION = 768;

// Models for Flash LLM reasoning
const PRIMARY_FLASH_MODEL = 'gemini-flash-latest';
const FALLBACK_FLASH_MODELS = ['gemini-3.5-flash', 'gemini-3.8-flash'];

/**
 * Generate 768-dimensional vector embedding for text using Gemini.
 * Consistent model and dimension used for both jobs and resumes.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });

  // Explicitly configure 768 dimensions to match the Pinecone index dimension
  const result = await model.embedContent({
    content: {
      role: 'user',
      parts: [{ text: text.trim() }],
    },
    outputDimensionality: EMBEDDING_DIMENSION,
  });

  const embedding = result.embedding?.values;
  if (!embedding || embedding.length !== EMBEDDING_DIMENSION) {
    throw new Error(
      `Expected ${EMBEDDING_DIMENSION} dimensions, received ${embedding?.length || 0}`
    );
  }

  return embedding;
}

export interface MatchedJobInput {
  id: string;
  title: string;
  company: string;
  description: string;
}

/**
 * Generate a concise one-sentence reason for each matched job in a single Gemini call.
 * Uses strict JSON output for reliability.
 */
export async function generateMatchReasons(
  resumeText: string,
  jobs: MatchedJobInput[]
): Promise<Record<string, string>> {
  if (jobs.length === 0) {
    return {};
  }

  const prompt = `You are an expert technical recruiter analyzing job matches for a candidate.

CANDIDATE RESUME:
"""
${resumeText.slice(0, 3000)}
"""

MATCHED JOBS:
${jobs
  .map(
    (job, index) =>
      `[${index + 1}] ID: "${job.id}", Title: "${job.title}", Company: "${job.company}"\nDescription: ${job.description}`
  )
  .join('\n\n')}

INSTRUCTIONS:
For each job listed above, provide exactly ONE clear, compelling sentence explaining specifically why the candidate's skills and experience match this position.
Return strict JSON as an array of objects with "id" and "reason" fields:
[
  { "id": "job-id", "reason": "One sentence explaining the match." }
]`;

  const modelsToTry = [PRIMARY_FLASH_MODEL, ...FALLBACK_FLASH_MODELS];
  let lastError: Error | null = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const response = await model.generateContent(prompt);
      const rawText = response.response.text().trim();
      const parsed = JSON.parse(rawText) as Array<{ id: string; reason: string }>;

      const reasonMap: Record<string, string> = {};
      for (const item of parsed) {
        if (item.id && item.reason) {
          reasonMap[item.id] = item.reason;
        }
      }

      return reasonMap;
    } catch (err: any) {
      console.warn(`Model ${modelName} reasoning attempt failed: ${err.message}`);
      lastError = err;
    }
  }

  console.error('All Flash models failed for reason generation:', lastError);
  // Fallback default reason if LLM is unavailable
  const fallbackMap: Record<string, string> = {};
  for (const job of jobs) {
    fallbackMap[job.id] = `Strong alignment with the core requirements and tech stack for ${job.title} at ${job.company}.`;
  }
  return fallbackMap;
}
