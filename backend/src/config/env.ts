import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// Ensure keys with newlines or edge cases are properly captured without modifying .env
if (!process.env.PINECONE_API_KEY && fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('PINECONE_API_KEY=') && line.length === 'PINECONE_API_KEY='.length) {
      for (let j = i + 1; j < lines.length; j++) {
        const next = lines[j].trim();
        if (next && !next.startsWith('#') && !next.includes('=')) {
          process.env.PINECONE_API_KEY = next;
          break;
        }
      }
    }
  }
}

export const PINECONE_API_KEY = process.env.PINECONE_API_KEY || '';
export const PINECONE_INDEX = process.env.PINECONE_INDEX || 'jobmatch';
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
export const PORT = process.env.PORT || 5000;
