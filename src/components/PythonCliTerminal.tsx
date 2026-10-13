import React, { useState } from 'react';
import { Terminal, Copy, Check, Play, RefreshCw } from 'lucide-react';

interface PythonCliTerminalProps {
  cliText: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PythonCliTerminal: React.FC<PythonCliTerminalProps> = ({
  cliText,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(cliText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl font-mono text-xs">
      {/* Window Title Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block cursor-pointer" onClick={onClose} />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-slate-400 pl-2 font-semibold">
            bash - python3 financial_risk_analysis.py
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 rounded bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? 'Copied' : 'Copy Output'}</span>
          </button>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white px-1 text-sm"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <pre className="max-h-[500px] overflow-y-auto whitespace-pre-wrap text-emerald-400/90 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
        {cliText}
      </pre>

      <div className="mt-4 border-t border-slate-800 pt-3 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Emulated from original Python functions: liquidity(), efficiency(), profitability(), solvency()</span>
        <span className="text-emerald-400 font-bold">Process finished with exit code 0</span>
      </div>
    </div>
  );
};
