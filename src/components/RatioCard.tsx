import React from 'react';
import { RatioItem } from '../types/financial';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface RatioCardProps {
  item: RatioItem;
}

export const RatioCard: React.FC<RatioCardProps> = ({ item }) => {
  let badgeClasses = 'bg-slate-800 text-slate-300 border-slate-700';
  let valueColor = 'text-white';

  if (item.status === 'strong') {
    badgeClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    valueColor = 'text-emerald-400';
  } else if (item.status === 'adequate') {
    badgeClasses = 'bg-teal-500/10 text-teal-300 border-teal-500/30';
    valueColor = 'text-teal-300';
  } else if (item.status === 'warning') {
    badgeClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    valueColor = 'text-amber-400';
  } else if (item.status === 'danger') {
    badgeClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    valueColor = 'text-rose-400';
  }

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:border-slate-700 hover:shadow-lg">
      <div>
        {/* Top Header: Name and Badge */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              {item.shortName}
            </h4>
            <div className="text-sm font-semibold text-slate-200">{item.name}</div>
          </div>
          <span
            className={`inline-flex items-center space-x-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase ${badgeClasses}`}
          >
            {item.status === 'strong' && <CheckCircle2 className="h-3 w-3" />}
            {item.status === 'warning' && <AlertTriangle className="h-3 w-3" />}
            {item.status === 'danger' && <AlertCircle className="h-3 w-3" />}
            <span>{item.status}</span>
          </span>
        </div>

        {/* Value Display */}
        <div className="mt-3 flex items-baseline space-x-2">
          <span className={`text-2xl font-black tracking-tight ${valueColor}`}>
            {item.displayValue}
          </span>
        </div>

        {/* Formula */}
        <div className="mt-2 text-[11px] font-mono text-slate-400 bg-slate-950/80 rounded px-2 py-1 border border-slate-800/80">
          {item.formula}
        </div>
      </div>

      {/* Bottom: Script Interpretation & Benchmark */}
      <div className="mt-4 border-t border-slate-800/80 pt-3">
        <div className="text-xs font-medium text-slate-200">
          <span className="text-slate-400 font-normal">Script Output: </span>
          {item.interpretation}
        </div>

        {item.isDistorted && item.distortionMessage && (
          <div className="mt-2 flex items-start space-x-1 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded p-1.5">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>{item.distortionMessage}</span>
          </div>
        )}

        <div className="mt-1 text-[10px] text-slate-400">
          Benchmark: {item.benchmark}
        </div>
      </div>
    </div>
  );
};
