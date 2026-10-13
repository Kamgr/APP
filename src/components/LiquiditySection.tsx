import React from 'react';
import { LiquidityResults, FinancialInputs } from '../types/financial';
import { RatioCard } from './RatioCard';
import { formatCurrency } from '../services/financialEngine';
import { Droplets, Info, CheckCircle2 } from 'lucide-react';

interface LiquiditySectionProps {
  liquidity: LiquidityResults;
  inputs: FinancialInputs;
}

export const LiquiditySection: React.FC<LiquiditySectionProps> = ({ liquidity, inputs }) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 md:flex-row md:items-center">
        <div className="flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Droplets className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Module 1: Liquidity Analysis</h2>
            <p className="text-xs text-slate-400">
              Measures the firm's immediate ability to meet short-term liabilities without external financing.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Liquidity Score</span>
            <span className="text-lg font-bold text-teal-400">{liquidity.score} / 25</span>
          </div>
        </div>
      </div>

      {/* Raw Inputs Strip */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Source Balance Sheet & Cash Flow Inputs
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 text-xs font-mono">
          <div className="rounded bg-slate-900 p-2 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Current Assets:</span>
            <span className="text-slate-100 font-semibold">{formatCurrency(inputs.currentAssets)}</span>
          </div>
          <div className="rounded bg-slate-900 p-2 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Current Liabilities:</span>
            <span className="text-slate-100 font-semibold">{formatCurrency(inputs.currentLiabilities)}</span>
          </div>
          <div className="rounded bg-slate-900 p-2 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Inventory:</span>
            <span className="text-slate-100 font-semibold">{formatCurrency(inputs.inventory)}</span>
          </div>
          <div className="rounded bg-slate-900 p-2 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Cash & Equivalents:</span>
            <span className="text-slate-100 font-semibold">{formatCurrency(inputs.cash)}</span>
          </div>
          <div className="rounded bg-slate-900 p-2 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Operating Cash Inflows:</span>
            <span className="text-slate-100 font-semibold">{formatCurrency(inputs.operatingCashInflows)}</span>
          </div>
          <div className="rounded bg-slate-900 p-2 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Operating Cash Outflows:</span>
            <span className="text-slate-100 font-semibold">{formatCurrency(inputs.operatingCashOutflows)}</span>
          </div>
        </div>
      </div>

      {/* Ratio Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {liquidity.items.map((item) => (
          <RatioCard key={item.id} item={item} />
        ))}
      </div>

      {/* Deep Liquidity Insights & Nuance */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-300 space-y-2">
        <div className="flex items-center space-x-2 font-semibold text-slate-200">
          <Info className="h-4 w-4 text-teal-400" />
          <span>Institutional Liquidity Nuance (The Negative Working Capital Model):</span>
        </div>
        <p className="leading-relaxed">
          While traditional textbook credit analysis treats a Current Ratio below 1.0x or negative working capital as an indicator of stress, elite consumer hardware and retail monopolies like Apple Inc. operate with negative working capital deliberately. Customers pay immediately in cash, while suppliers are paid on extended 60-90 day trade credit terms. Because annual Operating Cash Flow ({formatCurrency(liquidity.ocf)}) is so colossal, short-term liquidity risk is virtually nonexistent despite a CR near 0.95x–1.05x.
        </p>
      </div>
    </div>
  );
};
