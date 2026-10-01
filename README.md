# JobMatch AI 🎯

JobMatch AI is a full-stack career matching platform that pairs candidate resumes with job listings using vector embeddings and generative AI reasoning.

Users paste a resume, project overview, or skill summary, and the application instantly returns the **top 5 best-matching jobs** with an exact match percentage and a tailored, one-sentence justification explaining why the candidate fits each position.

---

## How It Works

The matching pipeline operates in three distinct phases:

```
[Candidate Resume]
        │
        ▼ (Phase 1: Embedding)
 [Gemini Embedding] ──▶ 768-dimensional vector
        │
        ▼ (Phase 2: Vector Search)
 [Pinecone Index]   ──▶ Cosine similarity query (Top 5 matches)
        │
        ▼ (Phase 3: LLM Explanation)
 [Gemini Flash LLM] ──▶ ONE prompt with resume & matched jobs (strict JSON)
        │
        ▼
[Top 5 Matched Jobs with % Score and Custom One-Sentence Reasons]
```

1. **Embedding (`Phase 1`)**:
   The candidate's resume text is converted into a 768-dimensional dense vector using Gemini's embedding model (`gemini-embedding-001`). The exact same model and dimension are used for indexing jobs.
2. **Vector Search (`Phase 2`)**:
   The embedding is queried against the Pinecone `jobmatch` index using cosine similarity metric to find the top 5 nearest neighbor job postings.
3. **LLM Explanation (`Phase 3`)**:
   A single call is made to Gemini Flash with the candidate's resume and the 5 matched job listings. Gemini responds with strict JSON containing a concise, 1-sentence explanation for each job explaining why the candidate's specific background aligns with the role.

---

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, tsx, dotenv, cors
- **Vector Database**: Pinecone (`jobmatch` index, 768 dimensions, cosine metric)
- **Embeddings & LLM**: Google Gemini API (`gemini-embedding-001` and Gemini Flash)
- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide React
- **Architecture**: No SQL database, no auth, no Redis — clean vector search and serverless LLM design.

---

## Project Structure

```
jobmatch/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── env.ts           # Centralized environment variable loader
│   │   ├── data/
│   │   │   └── jobs.json        # 50 realistic tech jobs across domains
│   │   ├── routes/
│   │   │   ├── jobs.ts          # GET /jobs route handler
│   │   │   └── match.ts         # POST /match route handler
│   │   ├── scripts/
│   │   │   └── seed.ts          # Pinecone index seeding script
│   │   ├── services/
│   │   │   ├── gemini.ts        # Gemini embedding (768 dims) & reasoning service
│   │   │   └── pinecone.ts      # Pinecone client & similarity search
│   │   └── index.ts             # Express server entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── jobs/
│   │   │   │   └── page.tsx     # "Browse all jobs" catalog page
│   │   │   ├── globals.css      # Dark mode styles & Tailwind setup
│   │   │   ├── layout.tsx       # Root layout with Navbar & Footer
│   │   │   └── page.tsx         # Main resume matcher page
│   │   └── components/
│   │       └── Navbar.tsx       # Navigation header
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
└── README.md
```

---

## Environment Variables

### Backend (`backend/.env`)
Create or verify `backend/.env` with the following keys:

```bash
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=jobmatch
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

> **Note**: `.env` is excluded from git tracking via `.gitignore`. An example template is provided in `backend/.env.example`.

### Frontend (`frontend/.env.local`)
Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Getting Started

### 1. Install Dependencies

In the backend directory:
```bash
cd backend
npm install
```

In the frontend directory:
```bash
cd frontend
npm install
```

### 2. Seed the Pinecone Vector Database

Embed all 50 job listings with 768-dimensional embeddings and upsert into the Pinecone `jobmatch` index:

```bash
cd backend
npm run seed
```

The script batches calls, includes rate-limit delays, and is completely safe to re-run.

### 3. Start the Development Servers

Start the backend API server (runs on `http://localhost:5000`):
```bash
cd backend
npm run dev
```

Start the frontend Next.js app (runs on `http://localhost:3000`):
```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to use the application.

---

## API Reference

### `POST /match`
Accepts a candidate resume, embeds it, queries Pinecone for the top 5 jobs, and asks Gemini Flash for a one-sentence reason per job.

**Request Body:**
```json
{
  "resumeText": "Senior Frontend Engineer with 5+ years of experience specializing in React, Next.js, TypeScript, and modern CSS/Tailwind..."
}
```

**Response (`200 OK`):**
```json
[
  {
    "id": "job-1",
    "title": "Senior Frontend Engineer",
    "company": "Voxel Cloud",
    "location": "San Francisco, CA (Hybrid)",
    "score": 76,
    "reason": "The candidate's 5+ years of expertise in React, Next.js, and TypeScript directly aligns with Voxel Cloud's requirement for architecting high-performance client applications and responsive design systems."
  },
  {
    "id": "job-7",
    "title": "Lead Frontend Architect",
    "company": "NovaScale",
    "location": "Seattle, WA",
    "score": 76,
    "reason": "The candidate's extensive background in architecting large-scale component systems and client performance profiling matches NovaScale's need for a technical lead focused on enterprise SaaS web applications."
  }
]
```

### `GET /jobs`
Returns the catalog of tech positions from `jobs.json`. Supports optional search filter via `?q=<term>`.

```bash
curl http://localhost:5000/jobs
```

### `GET /health`
Returns the status of the backend API service.

```bash
curl http://localhost:5000/health
# {"status":"ok","service":"jobmatch-backend"}
```

---

## Features

1. **Resume Matcher**:
   - Large monospace textarea with live character counter.
   - Quick preset sample buttons for **Frontend Developer**, **ML / GenAI Engineer**, **DevOps / Cloud Engineer**, and **Backend Systems Engineer**.
   - Color-coded match percentage progress bars (Emerald, Cyan, Indigo, Amber).
   - Tailored one-sentence reasoning generated in real-time by Gemini Flash.
   - Smooth skeleton loading and error states.

2. **Browse All Jobs**:
   - Instant search across job titles, company names, locations, and technical skill descriptions.
   - Category filter pills: All, Frontend, Backend, Data, ML & AI, DevOps / Cloud, Product.
   - Direct link to test any resume against indexed jobs.
