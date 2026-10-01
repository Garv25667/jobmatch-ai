'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Search,
  MapPin,
  Building,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
}

const CATEGORIES = [
  { label: 'All Jobs', keyword: '' },
  { label: 'Frontend', keyword: 'frontend' },
  { label: 'Backend', keyword: 'backend' },
  { label: 'Data', keyword: 'data' },
  { label: 'ML & AI', keyword: 'machine learning' },
  { label: 'DevOps / Cloud', keyword: 'devops' },
  { label: 'Product', keyword: 'product' },
];

export default function BrowseJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/jobs`);
      if (!res.ok) {
        throw new Error(`Failed to load jobs (status ${res.status})`);
      }
      const data = await res.json();
      setJobs(data);
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setError(err.message || 'Unable to connect to the backend server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query);

    const matchesCategory =
      !selectedCategory ||
      job.title.toLowerCase().includes(selectedCategory) ||
      job.description.toLowerCase().includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium mb-3">
            <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
            <span>Job Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Browse Indexed Tech Roles
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-1.5">
            Explore all {jobs.length || 50} roles currently indexed in Pinecone for semantic matching.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium text-sm shadow-md shadow-cyan-500/20 transition-all shrink-0 self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4 text-cyan-200" />
          <span>Match Your Resume</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 mb-8 space-y-4 shadow-xl">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, company, skills (e.g. React, Kubernetes, PyTorch, Go)..."
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/60 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200 p-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-500 shrink-0 mr-1" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setSelectedCategory(cat.keyword)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.keyword
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex justify-between items-center text-xs text-slate-400 mb-4 px-1">
        <span>Showing {filteredJobs.length} of {jobs.length} jobs</span>
        {(searchQuery || selectedCategory) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('');
            }}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="h-5 w-48 bg-slate-800 rounded" />
              <div className="h-4 w-32 bg-slate-800/60 rounded" />
              <div className="h-16 w-full bg-slate-950/40 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="p-6 rounded-2xl bg-red-950/40 border border-red-800/60 text-center space-y-3">
          <p className="text-red-300 font-medium">{error}</p>
          <button
            onClick={fetchJobs}
            className="px-4 py-2 rounded-lg bg-red-900/60 hover:bg-red-800 text-white text-xs font-semibold"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Job Grid */}
      {!isLoading && !error && (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 transition-all duration-200 shadow-md hover:shadow-xl flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {job.title}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0 border border-slate-700">
                    {job.id}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-medium text-slate-300">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    {job.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {job.location}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300/90 mt-4 leading-relaxed line-clamp-3">
                  {job.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-end">
                <Link
                  href="/"
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
                >
                  <span>Match resume</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !error && filteredJobs.length === 0 && (
        <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl p-8">
          <p className="text-slate-400 text-sm">No jobs match your search criteria.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('');
            }}
            className="mt-3 text-xs text-cyan-400 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
