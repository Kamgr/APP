import React from 'react';
import { NewsArticle } from '../types/financial';
import { ExternalLink, Sparkles, Newspaper, Calendar, Shield, ArrowUpRight } from 'lucide-react';

interface NewsSectionProps {
  news: NewsArticle[];
  isLoading: boolean;
  onRefreshNews: () => void;
  companyName: string;
  ticker: string;
}

export const NewsSection: React.FC<NewsSectionProps> = ({
  news,
  isLoading,
  onRefreshNews,
  companyName,
  ticker,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 md:flex-row md:items-center">
        <div className="flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Newspaper className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white">Live News & Macro Grounding</h2>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                Within 6 Months
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Corroborating fundamental safety claims with stories from The Wall Street Journal, The New York Times, Bloomberg, and Reuters.
            </p>
          </div>
        </div>

        <button
          onClick={onRefreshNews}
          disabled={isLoading}
          className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-900/20 transition-all hover:bg-indigo-500 disabled:opacity-50"
        >
          <Sparkles className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Querying Gemini Search...' : 'Fetch Fresh News via Gemini'}</span>
        </button>
      </div>

      {/* News Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {news.map((item) => {
          let sentimentBadge = 'bg-slate-800 text-slate-300 border-slate-700';
          if (item.sentiment === 'bullish') {
            sentimentBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
          } else if (item.sentiment === 'bearish') {
            sentimentBadge = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
          }

          let publicationBadge = 'bg-slate-800 text-slate-200';
          if (item.source.includes('Wall Street Journal') || item.source.includes('WSJ')) {
            publicationBadge = 'bg-blue-950 text-blue-200 border border-blue-800';
          } else if (item.source.includes('New York Times') || item.source.includes('NYT')) {
            publicationBadge = 'bg-neutral-900 text-neutral-100 border border-neutral-700';
          } else if (item.source.includes('Bloomberg')) {
            publicationBadge = 'bg-purple-950 text-purple-200 border border-purple-800';
          } else if (item.source.includes('Reuters')) {
            publicationBadge = 'bg-amber-950 text-amber-200 border border-amber-800';
          } else if (item.source.includes('Financial Times')) {
            publicationBadge = 'bg-rose-950 text-rose-200 border border-rose-800';
          }

          return (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition-all hover:border-slate-700 hover:shadow-xl"
            >
              <div>
                {/* Source & Date Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${publicationBadge}`}>
                    {item.source}
                  </span>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    <Calendar className="h-3 w-3" />
                    <span>{item.publishedDate}</span>
                    <span className={`rounded-full border px-2 py-0.2 text-[10px] uppercase font-semibold ${sentimentBadge}`}>
                      {item.sentiment}
                    </span>
                  </div>
                </div>

                {/* Article Title with direct link */}
                <h3 className="mt-3 text-sm font-bold text-white leading-snug">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1 hover:text-emerald-400 transition-colors"
                  >
                    <span>{item.title}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors shrink-0" />
                  </a>
                </h3>

                {/* Snippet */}
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  "{item.snippet}"
                </p>
              </div>

              {/* Bottom: Investment Safety Relevance & Direct URL */}
              <div className="mt-4 border-t border-slate-800/80 pt-3">
                <div className="flex items-start space-x-1.5 text-xs text-slate-400">
                  <Shield className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-200">Safety Implication: </span>
                    <span className="text-slate-300">{item.relevanceToSafety}</span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[280px]">
                    {item.url}
                  </span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <span>Read Article</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
