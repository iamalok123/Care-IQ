import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  BookOpen,
  Quote,
  ShieldCheck,
  AlertCircle,
  Loader2,
  FileText
} from 'lucide-react';
import { api } from '../services/api';

interface PolicyRagAssistantProps {
  selectedPolicyId?: string;
  policyName?: string;
}

export const PolicyRagAssistant: React.FC<PolicyRagAssistantProps> = ({
  selectedPolicyId,
  policyName
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleQueries = [
    'What is the room rent limit and does proportionate deduction apply?',
    'Is robotic knee surgery covered under this policy?',
    'What is the pre-existing disease waiting period for diabetes?',
    'Are gloves and admission consumables covered?'
  ];

  const handleSearch = async (queryString: string) => {
    if (!queryString.trim()) return;
    setLoading(true);
    setError(null);
    setQuery(queryString);

    try {
      const data = await api.queryPolicyRag(queryString, selectedPolicyId);
      setResponse(data);
    } catch (err: any) {
      setError(err.message || 'Failed to search policy clauses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                Policy Document RAG Assistant
                <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full font-mono font-medium border border-indigo-400/30">
                  Phase 24 Semantic Search
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Ask questions in plain English; answers are cited directly from policy schedule clauses.
              </p>
            </div>
          </div>
          {policyName && (
            <span className="hidden sm:inline-flex text-xs bg-white/10 text-white px-3 py-1 rounded-full border border-white/10 font-medium">
              Context: {policyName}
            </span>
          )}
        </div>

        {/* Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="mt-4 flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Is robotic surgery covered? What is my room tariff limit?"
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/15 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-4 py-2.5 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ask AI'}
          </button>
        </form>

        {/* Suggested Quick Questions */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400">Try asking:</span>
          {sampleQueries.map((sq, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSearch(sq)}
              className="text-[11px] bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-white/10 transition-colors text-left"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Results Content Area */}
      <div className="p-5 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <p className="text-xs">Searching indexed policy clauses and generating citations...</p>
          </div>
        )}

        {!loading && response && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Grounded AI Answer */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" /> Grounded Policy Response
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    response.confidence === 'HIGH'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}
                >
                  Confidence: {response.confidence}
                </span>
              </div>
              <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-normal">
                {response.answer}
              </div>
            </div>

            {/* Citations Panel */}
            {response.citations && response.citations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Quote className="w-3.5 h-3.5 text-slate-500" /> Verified Policy Citations ({response.citations.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {response.citations.map((c: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5 hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-900 text-[11px] flex items-center gap-1">
                          <FileText className="w-3 h-3 text-indigo-600" /> {c.sectionTitle}
                        </span>
                        <span className="bg-indigo-100 text-indigo-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                          Page {c.pageNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 italic border-l-2 border-indigo-400 pl-2">
                        "{c.quoteExcerpt}"
                      </p>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                        <span>{c.policyName}</span>
                        <span className="text-emerald-700 font-semibold">Match Score: {(c.relevanceScore * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer & Uncertainty */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <strong>Non-Clinical & Decision-Support Notice:</strong> {response.disclaimer}
              </div>
            </div>
          </div>
        )}

        {!loading && !response && (
          <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
            <BookOpen className="w-8 h-8 text-slate-300" />
            <p>Ask any question above to search indexed policy terms with page-level citations.</p>
          </div>
        )}
      </div>
    </div>
  );
};
