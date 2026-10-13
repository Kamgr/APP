import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp,
  Activity,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  InvestmentSafetyVerdict,
  LiquidityResults,
  EfficiencyResults,
  ProfitabilityResults,
  SolvencyResults,
  FinancialInputs,
} from '../types/financial';

interface InvestmentSafetyHeroProps {
  verdict: InvestmentSafetyVerdict;
  inputs: FinancialInputs;
  liquidity: LiquidityResults;
  efficiency: EfficiencyResults;
  profitability: ProfitabilityResults;
  solvency: SolvencyResults;
  onSelectTab: (tabId: string) => void;
}

export const InvestmentSafetyHero: React.FC<InvestmentSafetyHeroProps> = ({
  verdict,
  inputs,
  liquidity,
  efficiency,
  profitability,
  solvency,
  onSelectTab,
}) => {
  const isSafe = verdict.isSafeToInvest;
  const score = verdict.totalSafetyScore;

  // Gauge color logic
  let scoreColorClass = 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
  let badgeBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  if (score < 40) {
    scoreColorClass = 'text-rose-400 border-rose-500/40 bg-rose-500/10';
    badgeBg = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
  } else if (score < 65) {
    scoreColorClass = 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-900/50 to-slate-950 p-6 shadow-xl">
      {/* Decorative gradient glow */}
      <div
        className={`pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-20 ${
          isSafe ? 'bg-emerald-500' : 'bg-rose-500'
        }`}
      />

      <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Overall Score & Investment Recommendation */}
        <div className="flex flex-col justify-between space-y-4 lg:col-span-4 lg:border-r lg:border-slate-800 lg:pr-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Overall Investment Safety
              </span>
              <span
                className={`inline-flex items-center space-x-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeBg}`}
              >
                {isSafe ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                )}
                <span>{isSafe ? 'SAFE TO INVEST' : 'ELEVATED RISK'}</span>
              </span>
            </div>

            <div className="mt-4 flex items-baseline space-x-3">
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-2xl border-2 text-3xl font-black ${scoreColorClass}`}
              >
                {score}
              </div>
              <div>
                <div className="text-xl font-bold text-white">{verdict.rating}</div>
                <div className="text-xs text-slate-400">Composite Quantitative Score (out of 100)</div>
              </div>
            </div>
          </div>

          {/* Pillar Mini Scores */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => onSelectTab('liquidity')}
              className="flex flex-col rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 text-left transition hover:border-slate-700"
            >
              <span className="text-[10px] text-slate-400">1. Liquidity</span>
              <span className="text-sm font-bold text-white">{liquidity.score}/25</span>
              <span className="text-[10px] capitalize text-emerald-400">{liquidity.summaryStatus}</span>
            </button>
            <button
              onClick={() => onSelectTab('profitability')}
              className="flex flex-col rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 text-left transition hover:border-slate-700"
            >
              <span className="text-[10px] text-slate-400">2. Profitability</span>
              <span className="text-sm font-bold text-white">{profitability.score}/25</span>
              <span className="text-[10px] capitalize text-emerald-400">{profitability.summaryStatus}</span>
            </button>
            <button
              onClick={() => onSelectTab('efficiency')}
              className="flex flex-col rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 text-left transition hover:border-slate-700"
            >
              <span className="text-[10px] text-slate-400">3. Efficiency</span>
              <span className="text-sm font-bold text-white">{efficiency.score}/25</span>
              <span className="text-[10px] capitalize text-emerald-400">{efficiency.summaryStatus}</span>
            </button>
            <button
              onClick={() => onSelectTab('solvency')}
              className="flex flex-col rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 text-left transition hover:border-slate-700"
            >
              <span className="text-[10px] text-slate-400">4. Solvency</span>
              <span className="text-sm font-bold text-white">{solvency.score}/25</span>
              <span className="text-[10px] capitalize text-emerald-400">{solvency.summaryStatus}</span>
            </button>
          </div>
        </div>

        {/* Right: Detailed Investment Thesis & Fundamental Analysis */}
        <div className="flex flex-col justify-between space-y-4 lg:col-span-8">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-slate-300 uppercase">
              Financial Risk & Solvency Verdict • {inputs.companyName} ({inputs.ticker})
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">
              {verdict.verdictSummary}
            </p>

            {/* Accounting Distortion Callout (Crucial for Apple) */}
            {verdict.distortionsIdentified.length > 0 && (
              <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                <div className="flex items-center space-x-1.5 font-semibold text-amber-300">
                  <Info className="h-4 w-4 shrink-0" />
                  <span>Important Accounting Distortion Detected in Script Logic</span>
                </div>
                <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-amber-200/90">
                  {verdict.distortionsIdentified.map((dist, idx) => (
                    <li key={idx}>{dist}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Key Strengths & Risks Quick Pills */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <span className="text-xs font-semibold text-emerald-400">Core Balance Sheet Strengths</span>
              <ul className="mt-2 space-y-1 text-xs text-slate-300">
                {verdict.keyStrengths.slice(0, 3).map((s, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-emerald-400">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <span className="text-xs font-semibold text-amber-400">Key Scrutiny & Risk Factors</span>
              <ul className="mt-2 space-y-1 text-xs text-slate-300">
                {verdict.keyRiskFactors.length > 0 ? (
                  verdict.keyRiskFactors.slice(0, 3).map((r, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-amber-400">•</span>
                      <span>{r}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-slate-400">
                    No critical liquidity or debt coverage red flags detected in 10-K data.
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-3 text-xs">
            <div className="text-slate-400">
              <span className="font-semibold text-slate-300">Analyst Stance:</span> {verdict.analystAction}
            </div>
            <button
              onClick={() => onSelectTab('news')}
              className="flex items-center space-x-1 font-medium text-emerald-400 transition hover:text-emerald-300"
            >
              <span>Inspect Latest Company News</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
