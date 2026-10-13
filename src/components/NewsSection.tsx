import React from 'react';
import { NewsArticle } from '../types/financial';
import { ExternalLink, RefreshCw, Newspaper, Calendar, Shield, ArrowUpRight, AlertCircle } from 'lucide-react';

interface NewsSectionProps {
  news: NewsArticle[];
  isLoading: boolean;
  onRefreshNews: () => void;
  companyName: string;
  ticker: string;
  error?: string | null;
  fetchedAt?: string | null;
}

const PUBLICATION_STYLES: Array<[string, string]> = [
  ['Wall Street Journal', 'bg-blue-950 text-blue-200 border border-blue-800'],
  ['New York Times', 'bg-neutral-900 text-neutral-100 border border-neutral-700'],
  ['Bloomberg', 'bg-purple-950 text-purple-200 border border-purple-800'],
  ['Reuters', 'bg-amber-950 text-amber-200 border border-amber-800'],
  ['Financial Times', 'bg-rose-950 text-rose-200 border border-rose-800'],
];

function publicationBadge(source: string): string {
  const match = PUBLICATION_STYLES.find(([name]) => source.includes(name));
  return match ? match[1] : 'bg-slate-800 text-slate-200 border border-slate-700';
}

export const NewsSection: React.FC<NewsSectionProps> = ({
  news,
  isLoading,
  onRefreshNews,
  companyName,
  ticker,
  error,
  fetchedAt,
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
              <h2 className="text-lg font-bold text-white">
                News: {companyName} ({ticker})
              </h2>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                Last 30 days
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Only real articles from approved outlets are shown. Stories touching earnings, debt, legal or
              regulatory issues, capital allocation, leadership, or supply and demand are listed first.
              {fetchedAt && ` Updated ${new Date(fetchedAt).toLocaleTimeString()}.`}
            </p>
          </div>
        </div>

        <button
          onClick={onRefreshNews}
          disabled={isLoading}
          className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-900/20 transition-all hover:bg-indigo-500 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Loading...' : 'Refresh news'}</span>
        </button>
      </div>

      {/* States */}
      {error && (
        <div className="flex items-start space-x-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {!error && !isLoading && news.length === 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-center text-xs text-slate-400">
          No recent stories about {companyName} from approved outlets in the last 30 days.
        </div>
      )}

      {!error && isLoading && news.length === 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-center text-xs text-slate-400">
          Loading news for {ticker}...
        </div>
      )}

      {/* News Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {news.map((item) => {
          let sentimentBadge = 'bg-slate-800 text-slate-300 border-slate-700';
          if (item.sentiment === 'bullish') {
            sentimentBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
          } else if (item.sentiment === 'bearish') {
            sentimentBadge = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
          }

          return (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition-all hover:border-slate-700 hover:shadow-xl"
            >
              <div>
                {/* Source & Date Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${publicationBadge(item.source)}`}>
                    {item.source}
                  </span>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    <Calendar className="h-3 w-3" />
                    <span>{item.publishedDate}</span>
                    {item.sentiment && (
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] uppercase font-semibold ${sentimentBadge}`}
                        title="AI read of the headline only"
                      >
                        {item.sentiment}
                      </span>
                    )}
                  </div>
                </div>

                {/* Headline (real link) */}
                <h3 className="mt-3 text-sm font-bold text-white leading-snug">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-start gap-1 hover:text-emerald-400 transition-colors"
                  >
                    <span>{item.title}</span>
                    <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors shrink-0" />
                  </a>
                </h3>

                {/* Topics that make this decision-relevant */}
                {item.topics.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.topics.map((topic) => (
                      <span
                        key={topic}
                        className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-300"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 border-t border-slate-800/80 pt-3">
                {item.relevanceToSafety && (
                  <div className="flex items-start space-x-1.5 text-xs text-slate-400">
                    <Shield className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-200">Possible implication </span>
                      <span className="text-slate-500">(AI-assisted, headline only): </span>
                      <span className="text-slate-300">{item.relevanceToSafety}</span>
                    </div>
                  </div>
                )}

                <div className="mt-2 flex justify-end">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <span>Read on {item.source}</span>
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
