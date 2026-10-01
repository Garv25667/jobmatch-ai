import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

// Cache jobs in memory
let cachedJobs: any[] | null = null;

function getJobs(): any[] {
  if (!cachedJobs) {
    const jobsPath = path.resolve(__dirname, '../data/jobs.json');
    const raw = fs.readFileSync(jobsPath, 'utf-8');
    cachedJobs = JSON.parse(raw);
  }
  return cachedJobs || [];
}

/**
 * GET /jobs
 * Returns all jobs from jobs.json, with optional query filter
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const jobs = getJobs();
    const query = typeof req.query.q === 'string' ? req.query.q.toLowerCase().trim() : '';

    if (!query) {
      return res.json(jobs);
    }

    const filtered = jobs.filter(
      (job: any) =>
        job.title?.toLowerCase().includes(query) ||
        job.company?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query)
    );

    return res.json(filtered);
  } catch (err: any) {
    console.error('Error fetching jobs:', err);
    return res.status(500).json({ error: 'Failed to retrieve jobs', message: err.message });
  }
});

export default router;
