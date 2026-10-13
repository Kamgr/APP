import React from 'react';
import { SolvencyResults, FinancialInputs } from '../types/financial';
import { RatioCard } from './RatioCard';
import { formatCurrency } from '../services/financialEngine';
import { ShieldAlert, Scale, Info, CheckCircle2 } from 'lucide-react';

interface SolvencySectionProps {
  solvency: SolvencyResults;
  inputs: FinancialInputs;
}

export const SolvencySection: React.FC<SolvencySectionProps> = ({ solvency, inputs }) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 md:flex-row md:items-center">
        <div className="flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Module 4: Solvency & Long-Term Capital Structure</h2>
            <p className="text-xs text-slate-400">
              Assesses long-term debt burden, default probability, interest coverage, and balance sheet endurance.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Solvency Score</span>
            <span className="text-lg font-bold text-indigo-400">{solvency.score} / 25</span>
          </div>
        </div>
      </div>

      {/* Inputs Strip */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Source Obligations & Earnings Inputs
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 text-xs font-mono">
          <div className="rounded bg-slate-900 p-2 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Total Liabilities:</span>
            <span className="text-slate-100 font-semibold">{formatCurrency(inputs.totalLiabilities)}</span>
          </div>
          <div className="rounded bg-slate-900 p-2 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Total Assets:</span>
            <span className="text-slate-100 font-semibold">{formatCurrency(inputs.totalAssets)}</span>
          </div>
          <div className="rounded bg-slate-900 p-2 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Average Equity:</span>
            <span className="text-slate-100 font-semibold">{formatCurrency(solvency.avgEquity)}</span>
          </div>
          <div className="rounded bg-slate-900 p-2 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">EBIT (Operating Income):</span>
            <span className="text-slate-100 font-semibold">{formatCurrency(inputs.ebit)}</span>
          </div>
          <div className="rounded bg-slate-900 p-2 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Interest Expense:</span>
            <span className="text-slate-100 font-semibold">{formatCurrency(inputs.interestExpense)}</span>
          </div>
        </div>
      </div>

      {/* Ratio Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {solvency.items.map((item) => (
          <RatioCard key={item.id} item={item} />
        ))}
      </div>

      {/* Deep Solvency Breakdown: Apple Buyback Paradox */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-300 space-y-2">
        <div className="flex items-center space-x-2 font-semibold text-slate-200">
          <Info className="h-4 w-4 text-indigo-400" />
          <span>The Debt-to-Equity Buyback Distortion Explained:</span>
        </div>
        <p className="leading-relaxed">
          {solvency.distortionWarnings.length > 0 ? (
            <span className="text-amber-200">
              The script correctly flags: <strong className="text-amber-300">"{solvency.interpretations.de}"</strong>.
              Apple's average equity (${formatCurrency(solvency.avgEquity)}) is only ~{((solvency.avgEquity / inputs.totalAssets) * 100).toFixed(1)}% of total assets because Apple has returned over $600 Billion to shareholders via stock buybacks over the past decade. This shrinks book equity in the denominator without increasing real bankruptcy risk. The ultimate proof of credit safety is the <strong className="text-emerald-300">Times Interest Earned (TIE: {solvency.items.find(i => i.id === 'tie')?.displayValue})</strong>, showing that earnings exceed interest payments by an overwhelming margin.
            </span>
          ) : (
            <span>
              The capital structure reflects healthy equity cushion and conservative debt utilization without accounting distortions.
            </span>
          )}
        </p>
      </div>
    </div>
  );
};
