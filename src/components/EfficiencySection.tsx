import React from 'react';
import { EfficiencyResults, FinancialInputs } from '../types/financial';
import { RatioCard } from './RatioCard';
import { formatCurrency, formatNumber } from '../services/financialEngine';
import { Zap, Clock, Repeat, Warehouse } from 'lucide-react';

interface EfficiencySectionProps {
  efficiency: EfficiencyResults;
  inputs: FinancialInputs;
}

export const EfficiencySection: React.FC<EfficiencySectionProps> = ({ efficiency, inputs }) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 md:flex-row md:items-center">
        <div className="flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Module 3: Operating Efficiency & Velocity</h2>
            <p className="text-xs text-slate-400">
              Evaluates cash conversion velocity, receivables collection, inventory churn, and fixed asset productivity.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Efficiency Score</span>
            <span className="text-lg font-bold text-cyan-400">{efficiency.score} / 25</span>
          </div>
        </div>
      </div>

      {/* Cycle Summary Pill Card */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center space-x-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
          <Clock className="h-8 w-8 text-cyan-400 shrink-0" />
          <div>
            <span className="text-[10px] uppercase text-slate-400 block">Receivables Collection</span>
            <span className="text-base font-bold text-white">
              {efficiency.dso ? `${formatNumber(efficiency.dso, 1)} Days` : 'N/A'}
            </span>
            <span className="text-[10px] text-cyan-300 block">{efficiency.interpretations.ar}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
          <Warehouse className="h-8 w-8 text-indigo-400 shrink-0" />
          <div>
            <span className="text-[10px] uppercase text-slate-400 block">Inventory Holding Period</span>
            <span className="text-base font-bold text-white">
              {efficiency.dio ? `${formatNumber(efficiency.dio, 1)} Days` : 'N/A'}
            </span>
            <span className="text-[10px] text-indigo-300 block">{efficiency.interpretations.inv}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
          <Repeat className="h-8 w-8 text-emerald-400 shrink-0" />
          <div>
            <span className="text-[10px] uppercase text-slate-400 block">PPE Capital Multiplier</span>
            <span className="text-base font-bold text-white">
              {efficiency.ppet ? `${formatNumber(efficiency.ppet, 2)}x Turnover` : 'N/A'}
            </span>
            <span className="text-[10px] text-emerald-300 block">{efficiency.interpretations.ppe}</span>
          </div>
        </div>
      </div>

      {/* Ratio Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {efficiency.items.map((item) => (
          <RatioCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};
