import { Router, Request, Response } from 'express';
import { generateEmbedding, generateMatchReasons, MatchedJobInput } from '../services/gemini';
import { querySimilarJobs } from '../services/pinecone';

const router = Router();

/**
 * POST /match
 * Accepts { resumeText }
 * 1. Embeds resumeText with Gemini (768-dim)
 * 2. Queries Pinecone for top 5 matches
 * 3. Calls Gemini Flash once for a one-sentence reason per job
 * 4. Returns [{ id, title, company, location, score, reason }]
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { resumeText } = req.body;

    // Input validation
    if (!resumeText || typeof resumeText !== 'string') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Field "resumeText" is required and must be a string.',
      });
    }

    const trimmedResume = resumeText.trim();
    if (trimmedResume.length < 10) {
      return res.status(400).json({
        error: 'Resume too short',
        message: 'Please provide more details in the resume for accurate matching.',
      });
    }

    console.log(`[POST /match] Processing resume of length ${trimmedResume.length} characters...`);

    // 1. Generate embedding for resume using exact same model and dimension
    const resumeEmbedding = await generateEmbedding(trimmedResume);

    // 2. Query Pinecone for the top 5 most similar jobs
    const matches = await querySimilarJobs(resumeEmbedding, 5);

    if (!matches || matches.length === 0) {
      return res.json([]);
    }

    // Prepare job details for explanation generation
    const jobsForReasoning: MatchedJobInput[] = matches.map((match) => ({
      id: match.id,
      title: (match.metadata?.title as string) || 'Unknown Title',
      company: (match.metadata?.company as string) || 'Unknown Company',
      description: (match.metadata?.description as string) || '',
    }));

    // 3. ONE Gemini Flash call to generate a tailored reason for all top 5 jobs
    const reasonsMap = await generateMatchReasons(trimmedResume, jobsForReasoning);

    // 4. Construct standardized response
    const results = matches.map((match) => {
      const metadata = match.metadata || {};
      // Pinecone cosine similarity score (typically 0.0 - 1.0) converted to integer percentage
      const rawScore = typeof match.score === 'number' ? match.score : 0;
      const scorePercentage = Math.round(Math.max(0, Math.min(1, rawScore)) * 100);

      return {
        id: match.id,
        title: metadata.title || 'Unknown Title',
        company: metadata.company || 'Unknown Company',
        location: metadata.location || 'Unknown Location',
        score: scorePercentage,
        reason:
          reasonsMap[match.id] ||
          `Relevant background in modern software engineering principles suited for ${metadata.title}.`,
      };
    });

    console.log(`[POST /match] Successfully matched ${results.length} jobs.`);
    return res.json(results);
  } catch (err: any) {
    console.error('[POST /match] Error during matching:', err);
    return res.status(500).json({
      error: 'Match processing failed',
      message: err.message || 'An unexpected error occurred while matching the resume.',
    });
  }
});

export default router;
