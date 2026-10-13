import React, { useState } from 'react';
import { ExternalLink, Search, RefreshCw, CheckCircle, FileText, Globe } from 'lucide-react';
import { FinancialInputs } from '../types/financial';

interface SecFilingBarProps {
  inputs: FinancialInputs;
  onAnalyzeUrlOrTicker: (target: string) => void;
  isLoading: boolean;
  onResetApple: () => void;
}

export const SecFilingBar: React.FC<SecFilingBarProps> = ({
  inputs,
  onAnalyzeUrlOrTicker,
  isLoading,
  onResetApple,
}) => {
  const [urlInput, setUrlInput] = useState(inputs.secFilingUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onAnalyzeUrlOrTicker(urlInput.trim());
    }
  };

  return (
    <div className="border-b border-slate-800 bg-slate-900/60 px-4 py-3 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Target URL or Ticker Input */}
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Globe className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste SEC EDGAR 10-K URL (e.g. https://www.sec.gov/ix?doc=...) or ticker"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pr-3 pl-9 text-xs text-slate-200 placeholder-slate-500 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-900/20 transition-all hover:bg-emerald-500 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Extracting...' : 'Fetch & Analyze'}</span>
            </button>
            <button
              type="button"
              onClick={onResetApple}
              className="hidden rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white md:inline-block"
              title="Reset to Apple FY2025 10-K requested link"
            >
              Reset to Apple 10-K
            </button>
          </div>

          {/* Active Filing Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center space-x-1 rounded bg-slate-800 px-2 py-1 font-mono text-slate-300">
              <FileText className="h-3 w-3 text-emerald-400" />
              <span>{inputs.companyName} ({inputs.ticker})</span>
            </span>
            <span className="rounded bg-slate-800/80 px-2 py-1 font-mono text-slate-400">
              FY{inputs.year} 10-K
            </span>
            {inputs.accessionNumber && (
              <span className="hidden rounded bg-slate-800/80 px-2 py-1 font-mono text-slate-400 xl:inline-block">
                Acc: {inputs.accessionNumber}
              </span>
            )}
            <a
              href={inputs.secFilingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 hover:text-emerald-300"
              title="Open Official SEC EDGAR 10-K Document in new window"
            >
              <span>View on SEC EDGAR</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};
