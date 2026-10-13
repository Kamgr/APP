import React from 'react';
import { ShieldCheck, AlertTriangle, ExternalLink, Terminal, Sliders, Sparkles } from 'lucide-react';
import { CompanyPreset } from '../data/presets';

interface NavbarProps {
  currentPreset: CompanyPreset;
  presets: CompanyPreset[];
  onSelectPreset: (preset: CompanyPreset) => void;
  showTerminal: boolean;
  onToggleTerminal: () => void;
  showEditor: boolean;
  onToggleEditor: () => void;
  onRefreshNews: () => void;
  isLoadingNews: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPreset,
  presets,
  onSelectPreset,
  showTerminal,
  onToggleTerminal,
  showEditor,
  onToggleEditor,
  onRefreshNews,
  isLoadingNews,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Brand & Active Ticker */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold tracking-tight text-white sm:text-lg">
                Financial Risk & Ratio Engine
              </h1>
              <span className="hidden rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20 sm:inline-block">
                SEC EDGAR 10-K
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Audited Ratios • Solvency Modeling • Live WSJ Grounding
            </p>
          </div>
        </div>

        {/* Presets & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Selector */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900/80 p-1">
            <span className="px-2 text-xs font-medium text-slate-400">Preset:</span>
            <div className="flex space-x-1">
              {presets.map((p) => {
                const isActive = p.id === currentPreset.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectPreset(p)}
                    className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {p.ticker}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stress Test / Edit Numbers */}
          <button
            onClick={onToggleEditor}
            className={`flex items-center space-x-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
              showEditor
                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
            title="Edit balance sheet & income statement inputs"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Inputs</span>
          </button>

          {/* Python CLI Mode Toggle */}
          <button
            onClick={onToggleTerminal}
            className={`flex items-center space-x-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
              showTerminal
                ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
            title="View Python Script terminal output"
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Python CLI</span>
          </button>

          {/* Live News Grounding Trigger */}
          <button
            onClick={onRefreshNews}
            disabled={isLoadingNews}
            className="flex items-center space-x-1.5 rounded-lg border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs font-medium text-teal-300 transition-all hover:bg-teal-500/20 disabled:opacity-50"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isLoadingNews ? 'animate-spin' : ''}`} />
            <span>{isLoadingNews ? 'Fetching News...' : 'Live News (WSJ/NYT)'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
