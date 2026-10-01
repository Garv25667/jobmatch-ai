import fs from 'fs';
import path from 'path';
import { generateEmbedding } from '../services/gemini';
import { upsertJobVectors, VectorRecord } from '../services/pinecone';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
}

// Utility to pause execution
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function embedWithRetry(text: string, retries = 3, delayMs = 1500): Promise<number[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await generateEmbedding(text);
    } catch (err: any) {
      if (attempt === retries) throw err;
      console.warn(`Embedding attempt ${attempt} failed: ${err.message}. Retrying in ${delayMs}ms...`);
      await sleep(delayMs);
      delayMs *= 2;
    }
  }
  throw new Error('Failed to generate embedding after retries');
}

async function runSeed() {
  console.log('🚀 Starting JobMatch AI seeding process...');

  const jobsPath = path.resolve(__dirname, '../data/jobs.json');
  if (!fs.existsSync(jobsPath)) {
    throw new Error(`jobs.json not found at ${jobsPath}`);
  }

  const rawData = fs.readFileSync(jobsPath, 'utf-8');
  const jobs: Job[] = JSON.parse(rawData);
  console.log(`📋 Found ${jobs.length} jobs to embed and upsert.`);

  const vectorRecords: VectorRecord[] = [];
  const BATCH_SIZE = 5;

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    console.log(`[${i + 1}/${jobs.length}] Embedding "${job.title}" at "${job.company}"...`);

    // Combine title, company, and description for high-fidelity semantic matching
    const textToEmbed = `${job.title} at ${job.company}. ${job.description}`;
    const embedding = await embedWithRetry(textToEmbed);

    vectorRecords.push({
      id: job.id,
      values: embedding,
      metadata: {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
      },
    });

    // Small delay between calls to respect rate limits
    await sleep(250);

    // Upsert periodically in batches of BATCH_SIZE
    if (vectorRecords.length >= BATCH_SIZE || i === jobs.length - 1) {
      console.log(`💾 Upserting batch of ${vectorRecords.length} vectors to Pinecone...`);
      await upsertJobVectors(vectorRecords);
      vectorRecords.length = 0; // Clear the batch
      await sleep(500); // Small pause after upsert
    }
  }

  console.log('🎉 Seeding successfully completed! All 50 jobs are indexed in Pinecone.');
}

runSeed().catch((err) => {
  console.error('❌ Seeding failed with error:', err);
  process.exit(1);
});
