import { Pinecone } from '@pinecone-database/pinecone';
import { PINECONE_API_KEY, PINECONE_INDEX } from '../config/env';

if (!PINECONE_API_KEY) {
  throw new Error('PINECONE_API_KEY is required in environment variables');
}

// Initialize Pinecone client
const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
const index = pinecone.index(PINECONE_INDEX);

export interface JobMetadata {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  [key: string]: any;
}

export interface VectorRecord {
  id: string;
  values: number[];
  metadata: JobMetadata;
}

/**
 * Upsert records in batches to Pinecone.
 * Safe to re-run since upsert overwrites existing records by ID.
 */
export async function upsertJobVectors(records: VectorRecord[]): Promise<void> {
  const batchSize = 25;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await index.upsert(batch);
  }
}

/**
 * Query Pinecone for topK matching jobs by vector similarity.
 */
export async function querySimilarJobs(vector: number[], topK: number = 5) {
  const queryResponse = await index.query({
    vector,
    topK,
    includeMetadata: true,
  });

  return queryResponse.matches || [];
}

export { pinecone, index, PINECONE_INDEX };
