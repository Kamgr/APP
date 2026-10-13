import React, { useState } from 'react';
import { FinancialInputs } from '../types/financial';
import { Sliders, RefreshCw, Check, X, DollarSign } from 'lucide-react';

interface RawInputsEditorProps {
  inputs: FinancialInputs;
  onUpdateInputs: (updated: FinancialInputs) => void;
  onClose: () => void;
  onReset: () => void;
}

export const RawInputsEditor: React.FC<RawInputsEditorProps> = ({
  inputs,
  onUpdateInputs,
  onClose,
  onReset,
}) => {
  const [formData, setFormData] = useState<FinancialInputs>({ ...inputs });

  const handleChange = (field: keyof FinancialInputs, val: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: typeof val === 'number' ? val : Number(val) || 0,
    }));
  };

  const handleTextChange = (field: keyof FinancialInputs, val: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateInputs(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center space-x-2">
            <Sliders className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">
              Financial Statement Inputs & Stress-Testing Modeler
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Metadata */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Company & Filing Metadata
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div>
                <label className="text-[11px] text-slate-400">Company Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleTextChange('companyName', e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Ticker Symbol</label>
                <input
                  type="text"
                  value={formData.ticker}
                  onChange={(e) => handleTextChange('ticker', e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Current Year</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleChange('year', e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Previous Year</label>
                <input
                  type="number"
                  value={formData.prevYear}
                  onChange={(e) => handleChange('prevYear', e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* 1. Liquidity Inputs */}
          <div>
            <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2">
              1. Liquidity Inputs (USD)
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-[11px] text-slate-400">Current Assets</label>
                <input
                  type="number"
                  value={formData.currentAssets}
                  onChange={(e) => handleChange('currentAssets', e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Current Liabilities</label>
                <input
                  type="number"
                  value={formData.currentLiabilities}
                  onChange={(e) => handleChange('currentLiabilities', e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Inventory</label>
                <input
                  type="number"
                  value={formData.inventory}
                  onChange={(e) => handleChange('inventory', e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Cash & Equivalents</label>
                <input
                  type="number"
                  value={formData.cash}
                  onChange={(e) => handleChange('cash', e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Operating Cash Inflows (OCF In)</label>
                <input
                  type="number"
                  value={formData.operatingCashInflows}
                  onChange={(e) => handleChange('operatingCashInflows', e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Operating Cash Outflows</label>
                <input
                  type="number"
                  value={formData.operatingCashOutflows}
                  onChange={(e) => handleChange('operatingCashOutflows', e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                />
              </div>
            </div>
          </div>

          {/* 2. Efficiency Inputs */}
          <div>
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
              2. Efficiency Inputs (USD)
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-[11px] text-slate-400">Revenue (Total Net Sales)</label>
                <input
                  type="number"
                  value={formData.revenue}
                  onChange={(e) => handleChange('revenue', e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Cost of Goods Sold (COGS)</label>
                <input
                  type="number"
                  value={formData.cogs}
                  onChange={(e) => handleChange('cogs', e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Average Accounts Receivable (A/R)</label>
                <input
                  type="number"
                  value={formData.avgAr}
                  onChange={(e) => handleChange('avgAr', e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Average Inventory</label>
                <input
                  type="number"
                  value={formData.avgInventory}
                  onChange={(e) => handleChange('avgInventory', e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Average Net PPE</label>
                <input
                  type="number"
                  value={formData.avgPpe}
                  onChange={(e) => handleChange('avgPpe', e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                />
              </div>
            </div>
          </div>

          {/* 3. Profitability Inputs */}
          <div>
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
              3. Profitability Inputs (USD)
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-[11px] text-slate-400">Revenue Prev Year ({formData.prevYear})</label>
                <input
                  type="number"
                  value={formData.revenuePrev}
                  onChange={(e) => handleChange('revenuePrev', e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Revenue Curr Year ({formData.year})</label>
                <input
                  type="number"
                  value={formData.revenueCurr}
                  onChange={(e) => handleChange('revenueCurr', e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Net Income</label>
                <input
                  type="number"
                  value={formData.netIncome}
                  onChange={(e) => handleChange('netIncome', e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Gross Profit</label>
                <input
                  type="number"
                  value={formData.grossProfit}
                  onChange={(e) => handleChange('grossProfit', e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Total Operating Expenses (SG&A + R&D)</label>
                <input
                  type="number"
                  value={formData.operatingExpense}
                  onChange={(e) => handleChange('operatingExpense', e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Operating Income (EBIT)</label>
                <input
                  type="number"
                  value={formData.operatingIncome}
                  onChange={(e) => handleChange('operatingIncome', e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Shareholders Equity Prev Year</label>
                <input
                  type="number"
                  value={formData.equityPrev}
                  onChange={(e) => handleChange('equityPrev', e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Shareholders Equity Curr Year</label>
                <input
                  type="number"
                  value={formData.equityCurr}
                  onChange={(e) => handleChange('equityCurr', e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Total Assets Prev Year</label>
                <input
                  type="number"
                  value={formData.assetsPrev}
                  onChange={(e) => handleChange('assetsPrev', e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Total Assets Curr Year</label>
                <input
                  type="number"
                  value={formData.assetsCurr}
                  onChange={(e) => handleChange('assetsCurr', e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Net Operating Assets (NOA) Prev</label>
                <input
                  type="number"
                  value={formData.noaPrev}
                  onChange={(e) => handleChange('noaPrev', e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Net Operating Assets (NOA) Curr</label>
                <input
                  type="number"
                  value={formData.noaCurr}
                  onChange={(e) => handleChange('noaCurr', e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                />
              </div>
            </div>
          </div>

          {/* 4. Solvency Inputs */}
          <div>
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
              4. Solvency Inputs (USD)
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-[11px] text-slate-400">Total Liabilities</label>
                <input
                  type="number"
                  value={formData.totalLiabilities}
                  onChange={(e) => handleChange('totalLiabilities', e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Interest Expense</label>
                <input
                  type="number"
                  value={formData.interestExpense}
                  onChange={(e) => handleChange('interestExpense', e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                />
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={onReset}
              className="flex items-center space-x-1.5 rounded border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset to Original Preset</span>
            </button>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded border border-slate-700 px-4 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 rounded bg-emerald-600 px-5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md shadow-emerald-900/30"
              >
                <Check className="h-4 w-4" />
                <span>Apply & Recalculate</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
