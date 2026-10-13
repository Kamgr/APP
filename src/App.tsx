/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PRESETS, CompanyPreset } from './data/presets';
import { FinancialInputs, NewsArticle } from './types/financial';
import {
  computeLiquidity,
  computeEfficiency,
  computeProfitability,
  computeSolvency,
  computeInvestmentSafetyVerdict,
  generatePythonScriptCliOutput,
  formatCurrency,
} from './services/financialEngine';

import { Navbar } from './components/Navbar';
import { SecFilingBar } from './components/SecFilingBar';
import { InvestmentSafetyHero } from './components/InvestmentSafetyHero';
import { LiquiditySection } from './components/LiquiditySection';
import { ProfitabilitySection } from './components/ProfitabilitySection';
import { EfficiencySection } from './components/EfficiencySection';
import { SolvencySection } from './components/SolvencySection';
import { NewsSection } from './components/NewsSection';
import { RawInputsEditor } from './components/RawInputsEditor';
import { PythonCliTerminal } from './components/PythonCliTerminal';

import {
  LayoutDashboard,
  Droplets,
  TrendingUp,
  Zap,
  Scale,
  Newspaper,
  Layers,
  Terminal,
  Download,
  CheckCircle,
  FileText,
  AlertCircle,
} from 'lucide-react';

export default function App() {
  const [selectedPreset, setSelectedPreset] = useState<CompanyPreset>(PRESETS[0]);
  const [inputs, setInputs] = useState<FinancialInputs>(PRESETS[0].inputs);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showTerminal, setShowTerminal] = useState<boolean>(false);
  const [showEditor, setShowEditor] = useState<boolean>(false);

  // News State
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState<boolean>(false);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [newsFetchedAt, setNewsFetchedAt] = useState<string | null>(null);
  const newsRequestId = useRef(0);
  const [isLoadingFiling, setIsLoadingFiling] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Compute all ratios dynamically whenever inputs change
  const liquidity = useMemo(() => computeLiquidity(inputs), [inputs]);
  const efficiency = useMemo(() => computeEfficiency(inputs), [inputs]);
  const profitability = useMemo(() => computeProfitability(inputs), [inputs]);
  const solvency = useMemo(() => computeSolvency(inputs), [inputs]);

  const verdict = useMemo(
    () =>
      computeInvestmentSafetyVerdict(
        inputs,
        liquidity,
        efficiency,
        profitability,
        solvency
      ),
    [inputs, liquidity, efficiency, profitability, solvency]
  );

  const cliOutput = useMemo(
    () =>
      generatePythonScriptCliOutput(
        inputs,
        liquidity,
        efficiency,
        profitability,
        solvency
      ),
    [inputs, liquidity, efficiency, profitability, solvency]
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle Preset Selection
  const handleSelectPreset = (preset: CompanyPreset) => {
    setSelectedPreset(preset);
    setInputs(preset.inputs);
    showToast(`Loaded ${preset.name} (${preset.ticker}) 10-K profile`);
  };

  // Handle Reset to requested Apple 2025 10-K Link
  const handleResetApple = () => {
    handleSelectPreset(PRESETS[0]);
  };

  // Load real news (approved outlets only) for the active company.
  // Ignores late responses if the company changed while a request was in flight.
  const loadNews = async (companyName: string, ticker: string, announce: boolean) => {
    const requestId = ++newsRequestId.current;
    setIsLoadingNews(true);
    setNewsError(null);
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, ticker }),
      });
      const data = await res.json();
      if (requestId !== newsRequestId.current) return;
      if (data.success) {
        setNews(data.articles ?? []);
        setNewsFetchedAt(data.fetchedAt ?? null);
        if (announce) {
          showToast(
            data.articles?.length
              ? `Found ${data.articles.length} stories from approved outlets`
              : 'No recent stories from approved outlets'
          );
        }
      } else {
        setNews([]);
        setNewsError(data.error || 'Could not load news.');
      }
    } catch (err) {
      if (requestId !== newsRequestId.current) return;
      console.error(err);
      setNews([]);
      setNewsError('Could not reach the server to load news.');
    } finally {
      if (requestId === newsRequestId.current) setIsLoadingNews(false);
    }
  };

  const handleRefreshNews = () => loadNews(inputs.companyName, inputs.ticker, true);

  // Fetch news automatically whenever the active company changes
  useEffect(() => {
    if (!inputs.companyName && !inputs.ticker) return;
    setNews([]);
    loadNews(inputs.companyName, inputs.ticker, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs.companyName, inputs.ticker]);

  // Trigger SEC Filing Extraction via server API
  const handleAnalyzeUrlOrTicker = async (target: string) => {
    setIsLoadingFiling(true);
    showToast(`Parsing SEC EDGAR filing for "${target}"...`);
    try {
      const res = await fetch('/api/analyze-filing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secUrl: target }),
      });
      const data = await res.json();
      if (data.success && data.inputs) {
        setInputs(data.inputs);
        showToast(`Successfully extracted financial statements for ${data.inputs.companyName || target}`);
      } else {
        showToast(data.error || 'Could not parse filing directly; using existing dataset.');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Error connecting to SEC analyzer backend.');
    } finally {
      setIsLoadingFiling(false);
    }
  };

  // Export report
  const handleExportReport = () => {
    const report = `# FINANCIAL RISK & RATIO ANALYSIS REPORT
Company: ${inputs.companyName} (${inputs.ticker})
Filing: ${inputs.secFilingUrl}
Year: ${inputs.year}
Generated: ${new Date().toLocaleDateString()}

## 1. INVESTMENT SAFETY VERDICT
Verdict: ${verdict.isSafeToInvest ? 'SAFE TO INVEST' : 'ELEVATED RISK'}
Composite Safety Score: ${verdict.totalSafetyScore} / 100 (${verdict.rating})
${verdict.verdictSummary}

## 2. LIQUIDITY ANALYSIS (Score: ${liquidity.score}/25)
- Current Ratio: ${liquidity.currentRatio?.toFixed(2)}x (${liquidity.interpretations.cr})
- Quick Ratio: ${liquidity.quickRatio?.toFixed(2)}x (${liquidity.interpretations.qr})
- Cash Ratio: ${liquidity.cashRatio?.toFixed(2)}x (${liquidity.interpretations.cashRatio})
- Working Capital: ${formatCurrency(liquidity.workingCapital)}
- Operating Cash Flow: ${formatCurrency(liquidity.ocf)}
- OCF Ratio: ${liquidity.ocfRatio?.toFixed(2)}x (${liquidity.interpretations.ocfRatio})

## 3. PROFITABILITY ANALYSIS (Score: ${profitability.score}/25)
- Revenue Growth: ${profitability.changeInRevenue?.toFixed(2)}% (${profitability.interpretations.revenueGrowth})
- ROE: ${profitability.roe ? (profitability.roe * 100).toFixed(2) + '%' : 'N/A'} (${profitability.interpretations.roe})
- ROA: ${profitability.roa ? (profitability.roa * 100).toFixed(2) + '%' : 'N/A'} (${profitability.interpretations.roa})
- Profit Margin: ${profitability.pm ? (profitability.pm * 100).toFixed(2) + '%' : 'N/A'} (${profitability.interpretations.pm})
- Gross Margin: ${profitability.gpm ? (profitability.gpm * 100).toFixed(2) + '%' : 'N/A'} (${profitability.interpretations.gpm})
- Operating Margin: ${profitability.operatingMargin ? (profitability.operatingMargin * 100).toFixed(2) + '%' : 'N/A'} (${profitability.interpretations.operatingMargin})
- Expense-to-Sales (ETS): ${profitability.ets?.toFixed(2)}% (${profitability.interpretations.ets})
- RNOA: ${profitability.rnoa ? (profitability.rnoa * 100).toFixed(2) + '%' : 'N/A'} (${profitability.interpretations.rnoa})

## 4. EFFICIENCY ANALYSIS (Score: ${efficiency.score}/25)
- ART: ${efficiency.art?.toFixed(2)}x
- DSO: ${efficiency.dso?.toFixed(2)} days (${efficiency.interpretations.ar})
- INVT: ${efficiency.invt?.toFixed(2)}x
- DIO: ${efficiency.dio?.toFixed(2)} days (${efficiency.interpretations.inv})
- PPET: ${efficiency.ppet?.toFixed(2)}x (${efficiency.interpretations.ppe})

## 5. SOLVENCY ANALYSIS (Score: ${solvency.score}/25)
- Debt-to-Equity (D/E): ${solvency.de?.toFixed(2)}x (${solvency.interpretations.de})
- Debt Ratio: ${solvency.debtRatio ? (solvency.debtRatio * 100).toFixed(2) + '%' : 'N/A'} (${solvency.interpretations.debtRatio})
- Equity Ratio: ${solvency.equityRatio ? (solvency.equityRatio * 100).toFixed(2) + '%' : 'N/A'} (${solvency.interpretations.equityRatio})
- Times Interest Earned (TIE): ${solvency.tie?.toFixed(2)}x (${solvency.interpretations.tie})
`;

    navigator.clipboard.writeText(report);
    showToast('Full Institutional Memo copied to clipboard!');
  };

  const tabs = [
    { id: 'overview', label: 'Safety Verdict', icon: LayoutDashboard },
    { id: 'liquidity', label: '1. Liquidity', icon: Droplets, score: liquidity.score },
    { id: 'profitability', label: '2. Profitability', icon: TrendingUp, score: profitability.score },
    { id: 'efficiency', label: '3. Efficiency', icon: Zap, score: efficiency.score },
    { id: 'solvency', label: '4. Solvency', icon: Scale, score: solvency.score },
    { id: 'news', label: 'News', icon: Newspaper, count: news.length },
    { id: 'all', label: 'All Modules (Script Option 5)', icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 rounded-xl border border-emerald-500/30 bg-slate-900 px-4 py-3 text-xs font-medium text-emerald-300 shadow-2xl backdrop-blur-md">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        currentPreset={selectedPreset}
        presets={PRESETS}
        onSelectPreset={handleSelectPreset}
        showTerminal={showTerminal}
        onToggleTerminal={() => setShowTerminal(!showTerminal)}
        showEditor={showEditor}
        onToggleEditor={() => setShowEditor(!showEditor)}
        onRefreshNews={handleRefreshNews}
        isLoadingNews={isLoadingNews}
      />

      {/* SEC Filing URL Input Bar */}
      <SecFilingBar
        inputs={inputs}
        onAnalyzeUrlOrTicker={handleAnalyzeUrlOrTicker}
        isLoading={isLoadingFiling}
        onResetApple={handleResetApple}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* Python CLI Drawer (Collapsible) */}
        {showTerminal && (
          <PythonCliTerminal
            cliText={cliOutput}
            isOpen={showTerminal}
            onClose={() => setShowTerminal(false)}
          />
        )}

        {/* Investment Safety Hero Scorecard */}
        <InvestmentSafetyHero
          verdict={verdict}
          inputs={inputs}
          liquidity={liquidity}
          efficiency={efficiency}
          profitability={profitability}
          solvency={solvency}
          onSelectTab={setActiveTab}
        />

        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.score !== undefined && (
                    <span
                      className={`ml-1 rounded px-1.5 py-0.2 text-[10px] font-bold ${
                        isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {tab.score}
                    </span>
                  )}
                  {tab.count !== undefined && (
                    <span className="ml-1 rounded bg-indigo-500/20 px-1.5 py-0.2 text-[10px] text-indigo-300">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Action: Export Memo */}
          <button
            onClick={handleExportReport}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            title="Copy full institutional report to clipboard"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Copy Full Memo</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="pt-2">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Highlight Cards Grid */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Liquidity & Solvency Summary */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <Scale className="h-4 w-4 text-indigo-400" />
                      <span>Balance Sheet Durability & Capital Structure</span>
                    </h3>
                    <span className="text-xs font-mono text-indigo-400">
                      {solvency.score + liquidity.score} / 50 pts
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    With an interest coverage of <strong>{solvency.items.find(i => i.id === 'tie')?.displayValue}</strong> and 
                    annual Operating Cash Flow of <strong>{formatCurrency(liquidity.ocf)}</strong>, the business displays supreme 
                    debt insulation. Even if short-term obligations exceed current assets in negative working capital regimes, 
                    cash flow velocity guarantees obligations are satisfied without refinancing friction.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2">
                    <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80">
                      <span className="text-slate-400 block text-[10px]">Current Ratio:</span>
                      <span className="font-bold text-slate-200">{liquidity.items.find(i => i.id === 'cr')?.displayValue}</span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80">
                      <span className="text-slate-400 block text-[10px]">TIE Interest Coverage:</span>
                      <span className="font-bold text-emerald-400">{solvency.items.find(i => i.id === 'tie')?.displayValue}</span>
                    </div>
                  </div>
                </div>

                {/* Profitability & Operational Moat */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                      <span>Pricing Power & Operational Moat</span>
                    </h3>
                    <span className="text-xs font-mono text-emerald-400">
                      {profitability.score + efficiency.score} / 50 pts
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Net profit margin of <strong>{profitability.items.find(i => i.id === 'pm')?.displayValue}</strong> and Gross 
                    Margin of <strong>{profitability.items.find(i => i.id === 'gpm')?.displayValue}</strong> indicate unmatched pricing elasticity. 
                    Receivables turnover of <strong>{efficiency.items.find(i => i.id === 'art')?.displayValue}</strong> (DSO: {efficiency.items.find(i => i.id === 'dso')?.displayValue}) 
                    validates rapid cash conversion from commercial contracts and consumers.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2">
                    <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80">
                      <span className="text-slate-400 block text-[10px]">Gross Margin:</span>
                      <span className="font-bold text-slate-200">{profitability.items.find(i => i.id === 'gpm')?.displayValue}</span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80">
                      <span className="text-slate-400 block text-[10px]">Operating Margin:</span>
                      <span className="font-bold text-emerald-400">{profitability.items.find(i => i.id === 'opm')?.displayValue}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Corroborating News Preview on Overview */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Newspaper className="h-4 w-4 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">
                      Latest Coverage From Approved Outlets (Last 30 Days)
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('news')}
                    className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    View All {news.length} Stories →
                  </button>
                </div>
                {isLoadingNews && news.length === 0 ? (
                  <p className="text-xs text-slate-400">Loading news for {inputs.ticker}...</p>
                ) : newsError ? (
                  <p className="text-xs text-rose-300">{newsError}</p>
                ) : news.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    No recent stories about {inputs.companyName} from approved outlets.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {news.slice(0, 2).map((item) => (
                      <div key={item.id} className="rounded-lg bg-slate-950 p-3.5 border border-slate-800">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-semibold text-slate-300">{item.source}</span>
                          <span>{item.publishedDate}</span>
                        </div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 block text-xs font-bold text-white hover:text-emerald-400 transition-colors line-clamp-2"
                        >
                          {item.title}
                        </a>
                        {item.topics.length > 0 && (
                          <p className="mt-1 text-[11px] text-slate-400">{item.topics.join(' • ')}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'liquidity' && (
            <LiquiditySection liquidity={liquidity} inputs={inputs} />
          )}

          {activeTab === 'profitability' && (
            <ProfitabilitySection profitability={profitability} inputs={inputs} />
          )}

          {activeTab === 'efficiency' && (
            <EfficiencySection efficiency={efficiency} inputs={inputs} />
          )}

          {activeTab === 'solvency' && (
            <SolvencySection solvency={solvency} inputs={inputs} />
          )}

          {activeTab === 'news' && (
            <NewsSection
              news={news}
              isLoading={isLoadingNews}
              onRefreshNews={handleRefreshNews}
              companyName={inputs.companyName}
              ticker={inputs.ticker}
              error={newsError}
              fetchedAt={newsFetchedAt}
            />
          )}

          {/* Option 5 from Python Script: Run ALL Analyses */}
          {activeTab === 'all' && (
            <div className="space-y-10">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300">
                <span className="font-bold">Script Option 5 Mode:</span> Executed all 4 analysis routines (Liquidity, Profitability, Efficiency, Solvency) sequentially.
              </div>
              <LiquiditySection liquidity={liquidity} inputs={inputs} />
              <ProfitabilitySection profitability={profitability} inputs={inputs} />
              <EfficiencySection efficiency={efficiency} inputs={inputs} />
              <SolvencySection solvency={solvency} inputs={inputs} />
              <NewsSection
                news={news}
                isLoading={isLoadingNews}
                onRefreshNews={handleRefreshNews}
                companyName={inputs.companyName}
                ticker={inputs.ticker}
                error={newsError}
                fetchedAt={newsFetchedAt}
              />
            </div>
          )}
        </div>
      </main>

      {/* Raw Inputs / Stress Test Modal */}
      {showEditor && (
        <RawInputsEditor
          inputs={inputs}
          onUpdateInputs={(updated) => {
            setInputs(updated);
            showToast('Recalculated financial model with updated inputs!');
          }}
          onClose={() => setShowEditor(false)}
          onReset={() => {
            setInputs(selectedPreset.inputs);
            showToast(`Reset to ${selectedPreset.name} standard inputs.`);
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-4 text-center text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            SEC 10-K Financial Risk & Ratio Engine • Evaluated against audited SEC EDGAR disclosures
          </span>
          <span className="text-slate-400">
            Formula validation derived from Python Risk Analysis framework
          </span>
        </div>
      </footer>
    </div>
  );
}
