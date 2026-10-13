import React from 'react';
import { ProfitabilityResults, FinancialInputs } from '../types/financial';
import { RatioCard } from './RatioCard';
import { formatCurrency } from '../services/financialEngine';
import { TrendingUp, AlertTriangle, Info } from 'lucide-react';

interface ProfitabilitySectionProps {
  profitability: ProfitabilityResults;
  inputs: FinancialInputs;
}

export const ProfitabilitySection: React.FC<ProfitabilitySectionProps> = ({
  profitability,
  inputs,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 md:flex-row md:items-center">
        <div className="flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Module 2: Profitability & Returns</h2>
            <p className="text-xs text-slate-400">
              Evaluates pricing power, gross margins, operating leverage, and capital returns on equity and assets.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Profitability Score</span>
            <span className="text-lg font-bold text-emerald-400">{profitability.score} / 25</span>
          </div>
        </div>
      </div>

      {/* Multi-Year Average Stats Strip */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">
            Average Equity ({inputs.prevYear} - {inputs.year})
          </span>
          <div className="mt-1 text-lg font-bold text-white font-mono">
            {formatCurrency(profitability.avgEquity)}
          </div>
          <span className="text-[10px] text-slate-400">
            Base: {formatCurrency(inputs.equityPrev)} → {formatCurrency(inputs.equityCurr)}
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">
            Average Total Assets ({inputs.prevYear} - {inputs.year})
          </span>
          <div className="mt-1 text-lg font-bold text-white font-mono">
            {formatCurrency(profitability.avgAssets)}
          </div>
          <span className="text-[10px] text-slate-400">
            Base: {formatCurrency(inputs.assetsPrev)} → {formatCurrency(inputs.assetsCurr)}
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">
            Average Net Operating Assets (NOA)
          </span>
          <div className="mt-1 text-lg font-bold text-white font-mono">
            {formatCurrency(profitability.avgNoa)}
          </div>
          <span className="text-[10px] text-slate-400">
            Base: {formatCurrency(inputs.noaPrev)} → {formatCurrency(inputs.noaCurr)}
          </span>
        </div>
      </div>

      {/* Ratio Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {profitability.items.map((item) => (
          <RatioCard key={item.id} item={item} />
        ))}
      </div>

      {/* Distortion Warning Bar */}
      {profitability.distortionWarnings.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
          <div className="flex items-center space-x-2 font-semibold text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Python Script Identified Profitability Distortion</span>
          </div>
          <p className="mt-1.5 leading-relaxed text-amber-200/90">
            When average book equity is less than 20% of revenue, ROE reaches astronomical figures (e.g. &gt;100%). In financial analysis, this is not purely organic return on capital—it is an artifact of aggressive share buybacks reducing the denominator (treasury stock). Look to ROA ({profitability.items.find(i => i.id === 'roa')?.displayValue}) and Operating Margin for an unskewed view.
          </p>
        </div>
      )}
    </div>
  );
};
