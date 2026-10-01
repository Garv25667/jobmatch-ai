'use client';

import { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  MapPin,
  Building,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface MatchedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  score: number;
  reason: string;
}

const SAMPLE_RESUMES = [
  {
    label: 'Frontend Developer',
    role: 'Senior React / TypeScript',
    text: `Senior Frontend Engineer with 5+ years of experience specializing in React, Next.js, TypeScript, and modern CSS/Tailwind. Extensive background in architecting large-scale component systems, state management, client performance profiling, WebSockets, and building accessible enterprise design systems with Radix UI and Storybook.`,
  },
  {
    label: 'ML / GenAI Engineer',
    role: 'PyTorch / RAG / Vector DB',
    text: `Machine Learning Engineer with 4 years of experience building generative AI applications and production ML pipelines. Proficient in PyTorch, Python, Hugging Face transformers, RAG architectures, and vector search with Pinecone and Weaviate. Experienced in fine-tuning embeddings and deploying low-latency model APIs using FastAPI and Triton.`,
  },
  {
    label: 'DevOps / Cloud Engineer',
    role: 'Kubernetes / AWS / Terraform',
    text: `DevOps & Site Reliability Engineer with 5+ years supporting high-availability cloud infrastructure. Deep expertise in Kubernetes (EKS/GKE), Terraform, AWS, multi-stage CI/CD pipelines with GitHub Actions, Prometheus/Grafana monitoring, and automated disaster recovery.`,
  },
  {
    label: 'Backend Systems Engineer',
    role: 'Go / Microservices / Kafka',
    text: `Distributed Systems Backend Engineer with 6 years experience writing high-throughput services in Go (Golang) and Node.js. Experienced in gRPC, Apache Kafka event streams, Redis caching, PostgreSQL query optimization, and maintaining 99.99% system availability under peak loads.`,
  },
];

export default function Home() {
  const [resumeText, setResumeText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchedJob[] | null>(null);
  const [activeSampleIndex, setActiveSampleIndex] = useState<number | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const handleUseSample = (sample: typeof SAMPLE_RESUMES[0], index: number) => {
    setResumeText(sample.text);
    setActiveSampleIndex(index);
    setError(null);
  };

  const handleFindMatches = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resumeText.trim()) {
      setError('Please enter or paste your resume text before searching.');
      return;
    }

    if (resumeText.trim().length < 20) {
      setError('Please provide a more detailed resume or skill summary (at least 20 characters).');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMatches(null);

    try {
      const response = await fetch(`${API_URL}/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeText: resumeText.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error (${response.status})`);
      }

      const data: MatchedJob[] = await response.json();
      setMatches(data);
    } catch (err: any) {
      console.error('Failed to match jobs:', err);
      setError(
        err.message || 'Could not connect to the matching service. Ensure the backend is running.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return { bar: 'bg-emerald-500', text: 'text-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/30' };
    if (score >= 65) return { bar: 'bg-cyan-500', text: 'text-cyan-400', badge: 'bg-cyan-500/10 border-cyan-500/30' };
    if (score >= 50) return { bar: 'bg-indigo-500', text: 'text-indigo-400', badge: 'bg-indigo-500/10 border-indigo-500/30' };
    return { bar: 'bg-amber-500', text: 'text-amber-400', badge: 'bg-amber-500/10 border-amber-500/30' };
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Hero section */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 text-xs font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Pinecone 768-Dim Vector Similarity + Gemini Reasoning</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Find Your Best Job Matches in{' '}
          <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            Seconds
          </span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-400">
          Paste your resume, skills, or project experience below. Our semantic vector engine identifies
          the top 5 matching jobs and explains the exact reason why you fit each role.
        </p>
      </div>

      {/* Main input card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <form onSubmit={handleFindMatches} className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label htmlFor="resume-input" className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Resume & Skills Experience</span>
            </label>

            {/* Quick sample buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Try sample:</span>
              {SAMPLE_RESUMES.map((sample, idx) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => handleUseSample(sample, idx)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                    activeSampleIndex === idx
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-slate-800 text-slate-300 border border-slate-700/80 hover:bg-slate-700 hover:text-white'
                  }`}
                  title={sample.role}
                >
                  {sample.label}
                </button>
              ))}
              {resumeText && (
                <button
                  type="button"
                  onClick={() => {
                    setResumeText('');
                    setActiveSampleIndex(null);
                  }}
                  className="text-xs p-1 text-slate-500 hover:text-slate-300 rounded"
                  title="Clear text"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <textarea
              id="resume-input"
              rows={8}
              value={resumeText}
              onChange={(e) => {
                setResumeText(e.target.value);
                setActiveSampleIndex(null);
                if (error) setError(null);
              }}
              placeholder="Paste your resume summary, job history, skills (e.g. React, Next.js, Python, AWS), or click 'Try sample' above..."
              className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl p-4 text-slate-100 placeholder-slate-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/60 transition-all font-mono"
            />
            <div className="flex justify-between items-center mt-2 px-1 text-xs text-slate-500">
              <span>Supports full resumes, bullet points, or skills list</span>
              <span>{resumeText.length} characters</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => handleUseSample(SAMPLE_RESUMES[0], 0)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Use sample resume</span>
            </button>

            <button
              type="submit"
              disabled={isLoading || !resumeText.trim()}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Matching with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200 group-hover:scale-110 transition-transform" />
                  <span>Find matches</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error state alert */}
      {error && (
        <div className="mt-8 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 flex items-start gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-red-300">Matching Error</p>
            <p className="mt-0.5 text-red-400/90">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state skeleton */}
      {isLoading && (
        <div className="mt-12 space-y-4 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 w-48 bg-slate-800 rounded-md" />
            <div className="h-4 w-32 bg-slate-800 rounded-md" />
          </div>
          {[1, 2, 3, 4, 5].map((idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 w-56 bg-slate-800 rounded" />
                <div className="h-5 w-20 bg-slate-800 rounded-full" />
              </div>
              <div className="h-4 w-36 bg-slate-800/60 rounded" />
              <div className="h-2 w-full bg-slate-800 rounded-full" />
              <div className="h-14 w-full bg-slate-950/40 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Results section */}
      {matches && !isLoading && (
        <div className="mt-12 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>Top 5 Job Matches</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Pinecone + Gemini
                </span>
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Ranked by 768-dimensional vector cosine similarity with AI generated explanations
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Found {matches.length} matching positions
            </span>
          </div>

          <div className="grid gap-4">
            {matches.map((job, index) => {
              const scoreStyle = getScoreColor(job.score);

              return (
                <div
                  key={job.id}
                  className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-6 transition-all duration-200 shadow-lg hover:shadow-xl relative overflow-hidden group"
                >
                  {/* Rank number badge */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-slate-300 shrink-0">
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                          <span className="flex items-center gap-1.5 font-medium text-slate-300">
                            <Building className="w-3.5 h-3.5 text-slate-500" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            {job.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className="text-right shrink-0">
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${scoreStyle.badge} ${scoreStyle.text}`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{job.score}% Match</span>
                      </div>
                    </div>
                  </div>

                  {/* Match percentage progress bar */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="text-slate-400 font-medium">Similarity Fit</span>
                      <span className={`font-semibold font-mono ${scoreStyle.text}`}>
                        {job.score}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                      <div
                        className={`h-full ${scoreStyle.bar} transition-all duration-700 ease-out`}
                        style={{ width: `${job.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Gemini AI Reason Callout */}
                  <div className="mt-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-cyan-400">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Why this is a strong match:</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {job.reason}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
