import {
  FinancialInputs,
  LiquidityResults,
  EfficiencyResults,
  ProfitabilityResults,
  SolvencyResults,
  InvestmentSafetyVerdict,
  HealthStatus,
  RatioItem,
} from '../types/financial';

export function formatCurrency(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatNumber(num: number | null | undefined, decimals = 2): string {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(num: number | null | undefined, decimals = 2): string {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';
  return `${(num * 100).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}

// ------------------- LIQUIDITY ------------------- //
export function computeLiquidity(inputs: FinancialInputs): LiquidityResults {
  const {
    currentAssets,
    currentLiabilities,
    inventory,
    cash,
    operatingCashInflows,
    operatingCashOutflows,
  } = inputs;

  const workingCapital = currentAssets - currentLiabilities;
  const ocf = operatingCashInflows - operatingCashOutflows;

  let currentRatio: number | null = null;
  let quickRatio: number | null = null;
  let cashRatio: number | null = null;
  let ocfRatio: number | null = null;

  let crInterp = 'Cannot calculate (current liabilities = 0)';
  let qrInterp = 'Cannot calculate (current liabilities = 0)';
  let cashInterp = 'Cannot calculate (current liabilities = 0)';
  let ocfInterp = 'Cannot calculate (current liabilities = 0)';

  let crStatus: HealthStatus = 'info';
  let qrStatus: HealthStatus = 'info';
  let cashStatus: HealthStatus = 'info';
  let ocfStatus: HealthStatus = 'info';

  let score = 0;

  if (currentLiabilities > 0) {
    currentRatio = currentAssets / currentLiabilities;
    quickRatio = (currentAssets - inventory) / currentLiabilities;
    cashRatio = cash / currentLiabilities;
    ocfRatio = ocf / currentLiabilities;

    // Current Ratio
    if (currentRatio > 2) {
      crInterp = 'Strong liquidity cushion';
      crStatus = 'strong';
      score += 7;
    } else if (currentRatio >= 1) {
      crInterp = 'Adequate short-term liquidity';
      crStatus = 'adequate';
      score += 5;
    } else {
      crInterp = 'Potential liquidity pressure (CR < 1)';
      crStatus = 'danger';
      score += 2;
    }

    // Quick Ratio
    if (quickRatio > 1) {
      qrInterp = 'Strong quick liquidity (not dependent on inventory)';
      qrStatus = 'strong';
      score += 6;
    } else if (quickRatio >= 0.7) {
      qrInterp = 'Moderate quick liquidity';
      qrStatus = 'adequate';
      score += 4;
    } else {
      qrInterp = 'Weak quick liquidity (inventory-dependent)';
      qrStatus = 'warning';
      score += 1;
    }

    // Cash Ratio
    if (cashRatio > 0.5) {
      cashInterp = 'Strong cash buffer';
      cashStatus = 'strong';
      score += 6;
    } else if (cashRatio >= 0.2) {
      cashInterp = 'Moderate cash buffer';
      cashStatus = 'adequate';
      score += 4;
    } else {
      cashInterp = 'Low cash buffer (cash ratio < 0.2)';
      cashStatus = 'warning';
      score += 1;
    }

    // OCF Ratio
    if (ocfRatio > 1) {
      ocfInterp = 'Operations generate enough cash to cover short-term liabilities';
      ocfStatus = 'strong';
      score += 6;
    } else if (ocfRatio >= 0) {
      ocfInterp = 'Positive OCF but insufficient to cover liabilities';
      ocfStatus = 'adequate';
      score += 3;
    } else {
      ocfInterp = 'Negative OCF — operations consuming cash';
      ocfStatus = 'danger';
      score += 0;
    }
  }

  const items: RatioItem[] = [
    {
      id: 'cr',
      name: 'Current Ratio',
      shortName: 'CR',
      value: currentRatio,
      displayValue: currentRatio !== null ? `${formatNumber(currentRatio)}x` : 'N/A',
      formula: 'Current Assets / Current Liabilities',
      benchmark: '> 1.0x (Adequate), > 2.0x (Strong)',
      interpretation: crInterp,
      status: crStatus,
    },
    {
      id: 'qr',
      name: 'Quick Ratio (Acid-Test)',
      shortName: 'QR',
      value: quickRatio,
      displayValue: quickRatio !== null ? `${formatNumber(quickRatio)}x` : 'N/A',
      formula: '(Current Assets - Inventory) / Current Liabilities',
      benchmark: '> 0.7x (Moderate), > 1.0x (Strong)',
      interpretation: qrInterp,
      status: qrStatus,
    },
    {
      id: 'cash_ratio',
      name: 'Cash Ratio',
      shortName: 'Cash Ratio',
      value: cashRatio,
      displayValue: cashRatio !== null ? `${formatNumber(cashRatio)}x` : 'N/A',
      formula: 'Cash & Equivalents / Current Liabilities',
      benchmark: '> 0.20x (Moderate), > 0.50x (Strong)',
      interpretation: cashInterp,
      status: cashStatus,
    },
    {
      id: 'working_capital',
      name: 'Working Capital',
      shortName: 'NWC',
      value: workingCapital,
      displayValue: formatCurrency(workingCapital),
      formula: 'Current Assets - Current Liabilities',
      benchmark: '> $0.00 (Positive Cushion)',
      interpretation:
        workingCapital >= 0
          ? 'Positive working capital cushion'
          : 'Negative working capital — reliant on vendor credit or immediate cash turn',
      status: workingCapital >= 0 ? 'adequate' : 'warning',
    },
    {
      id: 'ocf',
      name: 'Operating Cash Flow (OCF)',
      shortName: 'OCF',
      value: ocf,
      displayValue: formatCurrency(ocf),
      formula: 'Cash Inflows - Cash Outflows',
      benchmark: '> $0.00 (Self-funding)',
      interpretation:
        ocf > 0
          ? 'Healthy self-funding operational cash generator'
          : 'Cash drain from core business activities',
      status: ocf > 0 ? 'strong' : 'danger',
    },
    {
      id: 'ocf_ratio',
      name: 'Operating Cash Flow Ratio',
      shortName: 'OCF Ratio',
      value: ocfRatio,
      displayValue: ocfRatio !== null ? `${formatNumber(ocfRatio)}x` : 'N/A',
      formula: 'Operating Cash Flow / Current Liabilities',
      benchmark: '> 0.0x (Positive), > 1.0x (High Cushion)',
      interpretation: ocfInterp,
      status: ocfStatus,
    },
  ];

  let summaryStatus: HealthStatus = 'adequate';
  if (score >= 20) summaryStatus = 'strong';
  else if (score < 12) summaryStatus = 'danger';
  else if (score < 16) summaryStatus = 'warning';

  return {
    workingCapital,
    ocf,
    currentRatio,
    quickRatio,
    cashRatio,
    ocfRatio,
    items,
    interpretations: {
      cr: crInterp,
      qr: qrInterp,
      cashRatio: cashInterp,
      ocfRatio: ocfInterp,
    },
    score: Math.min(25, score),
    summaryStatus,
  };
}

// ------------------- EFFICIENCY ------------------- //
export function computeEfficiency(inputs: FinancialInputs): EfficiencyResults {
  const { revenue, cogs, avgAr, avgInventory, avgPpe } = inputs;

  let art: number | null = null;
  let dso: number | null = null;
  let invt: number | null = null;
  let dio: number | null = null;
  let ppet: number | null = null;

  let arInterp = 'Average A/R must be greater than zero.';
  let invInterp = 'Average Inventory must be greater than zero.';
  let ppeInterp = 'Average PPE must be greater than zero.';

  let arStatus: HealthStatus = 'info';
  let invStatus: HealthStatus = 'info';
  let ppeStatus: HealthStatus = 'info';

  let score = 0;

  // Accounts Receivable Turnover & DSO
  if (avgAr > 0) {
    art = revenue / avgAr;
    dso = 365 / art;

    if (dso > 60) {
      arInterp = 'High DSO — collections may be slow.';
      arStatus = 'warning';
      score += 3;
    } else if (dso < 30) {
      arInterp = 'Strong collections — customers pay quickly.';
      arStatus = 'strong';
      score += 8;
    } else {
      arInterp = 'Normal collection cycle.';
      arStatus = 'adequate';
      score += 6;
    }
  }

  // Inventory Turnover & DIO
  if (avgInventory > 0) {
    invt = cogs / avgInventory;
    dio = 365 / invt;

    if (dio > 90) {
      invInterp = 'Slow inventory movement — potential overstocking.';
      invStatus = 'warning';
      score += 3;
    } else if (dio < 40) {
      invInterp = 'Strong inventory efficiency — fast turnover.';
      invStatus = 'strong';
      score += 8;
    } else {
      invInterp = 'Normal inventory cycle.';
      invStatus = 'adequate';
      score += 6;
    }
  }

  // PPE Turnover
  if (avgPpe > 0) {
    ppet = revenue / avgPpe;

    if (ppet < 2) {
      ppeInterp = 'Low PPE utilization — assets may be underused.';
      ppeStatus = 'warning';
      score += 3;
    } else if (ppet > 5) {
      ppeInterp = 'Strong PPE efficiency — assets generate high revenue.';
      ppeStatus = 'strong';
      score += 9;
    } else {
      ppeInterp = 'Normal PPE utilization.';
      ppeStatus = 'adequate';
      score += 6;
    }
  }

  const items: RatioItem[] = [
    {
      id: 'art',
      name: 'Accounts Receivable Turnover',
      shortName: 'ART',
      value: art,
      displayValue: art !== null ? `${formatNumber(art)}x` : 'N/A',
      formula: 'Revenue / Average A/R',
      benchmark: '> 6.0x (Good turnover)',
      interpretation: arInterp,
      status: arStatus,
    },
    {
      id: 'dso',
      name: 'Days Sales Outstanding',
      shortName: 'DSO',
      value: dso,
      displayValue: dso !== null ? `${formatNumber(dso, 1)} days` : 'N/A',
      formula: '365 / ART',
      benchmark: '< 30 days (Fast cash), > 60 days (Slow)',
      interpretation: arInterp,
      status: arStatus,
    },
    {
      id: 'invt',
      name: 'Inventory Turnover',
      shortName: 'INVT',
      value: invt,
      displayValue: invt !== null ? `${formatNumber(invt)}x` : 'N/A',
      formula: 'COGS / Average Inventory',
      benchmark: '> 9.0x (Lean supply chain)',
      interpretation: invInterp,
      status: invStatus,
    },
    {
      id: 'dio',
      name: 'Days Inventory Outstanding',
      shortName: 'DIO',
      value: dio,
      displayValue: dio !== null ? `${formatNumber(dio, 1)} days` : 'N/A',
      formula: '365 / INVT',
      benchmark: '< 40 days (High velocity), > 90 days (Overstocking)',
      interpretation: invInterp,
      status: invStatus,
    },
    {
      id: 'ppet',
      name: 'PPE Turnover',
      shortName: 'PPET',
      value: ppet,
      displayValue: ppet !== null ? `${formatNumber(ppet)}x` : 'N/A',
      formula: 'Revenue / Average PPE',
      benchmark: '2x - 5x (Normal), > 5x (Capital-light efficiency)',
      interpretation: ppeInterp,
      status: ppeStatus,
    },
  ];

  let summaryStatus: HealthStatus = 'adequate';
  if (score >= 20) summaryStatus = 'strong';
  else if (score < 11) summaryStatus = 'warning';

  return {
    art,
    dso,
    invt,
    dio,
    ppet,
    items,
    interpretations: {
      ar: arInterp,
      inv: invInterp,
      ppe: ppeInterp,
    },
    score: Math.min(25, score),
    summaryStatus,
  };
}

// ------------------- PROFITABILITY ------------------- //
export function computeProfitability(inputs: FinancialInputs): ProfitabilityResults {
  const {
    revenuePrev,
    revenueCurr,
    netIncome,
    grossProfit,
    operatingExpense,
    operatingIncome,
    equityPrev,
    equityCurr,
    assetsPrev,
    assetsCurr,
    noaPrev,
    noaCurr,
  } = inputs;

  const avgEquity = (equityPrev + equityCurr) / 2;
  const avgAssets = (assetsPrev + assetsCurr) / 2;
  const avgNoa = (noaPrev + noaCurr) / 2;

  const distortionWarnings: string[] = [];
  let score = 0;

  // Change in Revenue
  let changeInRevenue: number | null = null;
  let revInterp = 'Cannot calculate (previous year revenue = 0)';
  let revStatus: HealthStatus = 'info';
  if (revenuePrev !== 0) {
    changeInRevenue = ((revenueCurr - revenuePrev) / revenuePrev) * 100;
    if (changeInRevenue > 10) {
      revInterp = 'Strong growth';
      revStatus = 'strong';
      score += 4;
    } else if (changeInRevenue > 3) {
      revInterp = 'Moderate growth';
      revStatus = 'adequate';
      score += 3;
    } else if (changeInRevenue > 0) {
      revInterp = 'Low growth';
      revStatus = 'warning';
      score += 2;
    } else {
      revInterp = 'Decline';
      revStatus = 'danger';
      score += 0;
    }
  }

  // ROE
  let roe: number | null = null;
  let roeInterp = 'Cannot calculate (average equity = 0)';
  let roeStatus: HealthStatus = 'info';
  let roeDistorted = false;
  if (avgEquity !== 0) {
    roe = netIncome / avgEquity;
    if (avgEquity < 0.2 * revenueCurr) {
      roeInterp = 'Distorted: very low equity inflates ROE';
      roeStatus = 'warning';
      roeDistorted = true;
      distortionWarnings.push('ROE is distorted by aggressive share repurchases / thin equity base.');
      score += 3;
    } else if (roe > 0.15) {
      roeInterp = 'Strong';
      roeStatus = 'strong';
      score += 4;
    } else if (roe > 0.1) {
      roeInterp = 'Acceptable';
      roeStatus = 'adequate';
      score += 3;
    } else {
      roeInterp = 'Weak';
      roeStatus = 'danger';
      score += 1;
    }
  }

  // ROA
  let roa: number | null = null;
  let roaInterp = 'Cannot calculate (average assets = 0)';
  let roaStatus: HealthStatus = 'info';
  if (avgAssets !== 0) {
    roa = netIncome / avgAssets;
    if (roa > 0.05) {
      roaInterp = 'Healthy';
      roaStatus = 'strong';
      score += 4;
    } else {
      roaInterp = 'Low';
      roaStatus = 'warning';
      score += 1;
    }
  }

  // Profit Margin (PM)
  let pm: number | null = null;
  let pmInterp = 'Cannot calculate (revenue = 0)';
  let pmStatus: HealthStatus = 'info';
  if (revenueCurr !== 0) {
    pm = netIncome / revenueCurr;
    if (pm > 0.1) {
      pmInterp = 'Strong';
      pmStatus = 'strong';
      score += 4;
    } else if (pm > 0.05) {
      pmInterp = 'Moderate';
      pmStatus = 'adequate';
      score += 2;
    } else {
      pmInterp = 'Thin';
      pmStatus = 'warning';
      score += 1;
    }
  }

  // Gross Profit Margin (GPM)
  let gpm: number | null = null;
  let gpmInterp = 'Cannot calculate (revenue = 0)';
  let gpmStatus: HealthStatus = 'info';
  if (revenueCurr !== 0) {
    gpm = grossProfit / revenueCurr;
    if (gpm > 0.3) {
      gpmInterp = 'Strong';
      gpmStatus = 'strong';
      score += 3;
    } else if (gpm > 0.2) {
      gpmInterp = 'Acceptable';
      gpmStatus = 'adequate';
      score += 2;
    } else {
      gpmInterp = 'Low';
      gpmStatus = 'warning';
      score += 1;
    }
  }

  // Operating Margin
  let operatingMargin: number | null = null;
  let opmInterp = 'Cannot calculate (revenue = 0)';
  let opmStatus: HealthStatus = 'info';
  if (revenueCurr !== 0) {
    operatingMargin = operatingIncome / revenueCurr;
    if (operatingMargin > 0.15) {
      opmInterp = 'Strong';
      opmStatus = 'strong';
      score += 3;
    } else if (operatingMargin > 0.08) {
      opmInterp = 'Moderate';
      opmStatus = 'adequate';
      score += 2;
    } else {
      opmInterp = 'Weak';
      opmStatus = 'warning';
      score += 1;
    }
  }

  // Expense-to-Sales (ETS)
  let ets: number | null = null;
  let etsInterp = 'Cannot calculate (revenue = 0)';
  let etsStatus: HealthStatus = 'info';
  if (revenueCurr !== 0) {
    ets = (operatingExpense / revenueCurr) * 100;
    if (ets < 20) {
      etsInterp = 'Strong';
      etsStatus = 'strong';
      score += 2;
    } else if (ets < 30) {
      etsInterp = 'Moderate';
      etsStatus = 'adequate';
      score += 1;
    } else {
      etsInterp = 'High';
      etsStatus = 'warning';
      score += 0;
    }
  }

  // RNOA
  let rnoa: number | null = null;
  let rnoaInterp = 'Cannot calculate (average NOA = 0)';
  let rnoaStatus: HealthStatus = 'info';
  let rnoaDistorted = false;
  if (avgNoa !== 0) {
    rnoa = operatingIncome / avgNoa;
    if (avgNoa < 0.05 * revenueCurr) {
      rnoaInterp = 'Distorted: NOA too small to interpret';
      rnoaStatus = 'warning';
      rnoaDistorted = true;
      distortionWarnings.push('RNOA is distorted because Net Operating Assets (NOA) is under 5% of revenue.');
      score += 1;
    } else if (rnoa > 0.15) {
      rnoaInterp = 'Strong';
      rnoaStatus = 'strong';
      score += 2;
    } else {
      rnoaInterp = 'Weak';
      rnoaStatus = 'warning';
      score += 1;
    }
  }

  const items: RatioItem[] = [
    {
      id: 'rev_growth',
      name: 'Revenue Growth YoY',
      shortName: 'Rev Growth',
      value: changeInRevenue,
      displayValue: changeInRevenue !== null ? `${formatNumber(changeInRevenue)}%` : 'N/A',
      formula: '((Revenue_curr - Revenue_prev) / Revenue_prev) * 100',
      benchmark: '> 3% (Moderate), > 10% (Strong)',
      interpretation: revInterp,
      status: revStatus,
    },
    {
      id: 'roe',
      name: 'Return on Equity (ROE)',
      shortName: 'ROE',
      value: roe,
      displayValue: roe !== null ? formatPercent(roe) : 'N/A',
      formula: 'Net Income / Average Equity',
      benchmark: '> 10% (Acceptable), > 15% (Strong)',
      interpretation: roeInterp,
      status: roeStatus,
      isDistorted: roeDistorted,
      distortionMessage: roeDistorted ? 'Very low equity inflates ROE due to treasury stock repurchases' : undefined,
    },
    {
      id: 'roa',
      name: 'Return on Assets (ROA)',
      shortName: 'ROA',
      value: roa,
      displayValue: roa !== null ? formatPercent(roa) : 'N/A',
      formula: 'Net Income / Average Total Assets',
      benchmark: '> 5% (Healthy capital return)',
      interpretation: roaInterp,
      status: roaStatus,
    },
    {
      id: 'pm',
      name: 'Net Profit Margin',
      shortName: 'Net Margin',
      value: pm,
      displayValue: pm !== null ? formatPercent(pm) : 'N/A',
      formula: 'Net Income / Revenue',
      benchmark: '> 5% (Moderate), > 10% (Strong pricing power)',
      interpretation: pmInterp,
      status: pmStatus,
    },
    {
      id: 'gpm',
      name: 'Gross Profit Margin',
      shortName: 'GPM',
      value: gpm,
      displayValue: gpm !== null ? formatPercent(gpm) : 'N/A',
      formula: 'Gross Profit / Revenue',
      benchmark: '> 20% (Acceptable), > 30% (High gross margin)',
      interpretation: gpmInterp,
      status: gpmStatus,
    },
    {
      id: 'opm',
      name: 'Operating Margin (EBIT Margin)',
      shortName: 'Operating Margin',
      value: operatingMargin,
      displayValue: operatingMargin !== null ? formatPercent(operatingMargin) : 'N/A',
      formula: 'Operating Income / Revenue',
      benchmark: '> 8% (Moderate), > 15% (Strong franchise)',
      interpretation: opmInterp,
      status: opmStatus,
    },
    {
      id: 'ets',
      name: 'Expense-to-Sales (ETS)',
      shortName: 'ETS',
      value: ets,
      displayValue: ets !== null ? `${formatNumber(ets)}%` : 'N/A',
      formula: '(Operating Expenses / Revenue) * 100',
      benchmark: '< 30% (Moderate overhead), < 20% (Lean operating leverage)',
      interpretation: etsInterp,
      status: etsStatus,
    },
    {
      id: 'rnoa',
      name: 'Return on Net Operating Assets',
      shortName: 'RNOA',
      value: rnoa,
      displayValue: rnoa !== null ? formatPercent(rnoa) : 'N/A',
      formula: 'Operating Income / Average NOA',
      benchmark: '> 15% (Strong operational return)',
      interpretation: rnoaInterp,
      status: rnoaStatus,
      isDistorted: rnoaDistorted,
      distortionMessage: rnoaDistorted ? 'NOA too small relative to revenue to interpret directly' : undefined,
    },
  ];

  let summaryStatus: HealthStatus = 'adequate';
  if (score >= 19) summaryStatus = 'strong';
  else if (score < 11) summaryStatus = 'warning';

  return {
    avgEquity,
    avgAssets,
    avgNoa,
    changeInRevenue,
    roe,
    roa,
    pm,
    gpm,
    operatingMargin,
    ets,
    rnoa,
    items,
    interpretations: {
      revenueGrowth: revInterp,
      roe: roeInterp,
      roa: roaInterp,
      pm: pmInterp,
      gpm: gpmInterp,
      operatingMargin: opmInterp,
      ets: etsInterp,
      rnoa: rnoaInterp,
    },
    distortionWarnings,
    score: Math.min(25, score),
    summaryStatus,
  };
}

// ------------------- SOLVENCY ------------------- //
export function computeSolvency(inputs: FinancialInputs): SolvencyResults {
  const { totalLiabilities, totalAssets, equityPrev, equityCurr, ebit, interestExpense } = inputs;

  const avgEquity = (equityPrev + equityCurr) / 2;
  const distortionWarnings: string[] = [];
  let score = 0;

  // Debt-to-Equity (D/E)
  let de: number | null = null;
  let deInterp = 'Cannot interpret (average equity = 0)';
  let deStatus: HealthStatus = 'info';
  let deDistorted = false;
  if (avgEquity !== 0) {
    de = totalLiabilities / avgEquity;
    if (avgEquity < 0.2 * totalAssets) {
      deInterp = 'Distorted: very low equity inflates D/E';
      deStatus = 'warning';
      deDistorted = true;
      distortionWarnings.push('D/E is distorted: average equity is under 20% of total assets due to buybacks.');
      score += 4; // Apple style buyback company with massive cash generation
    } else if (de < 1) {
      deInterp = 'Low leverage — financially stable';
      deStatus = 'strong';
      score += 7;
    } else if (de < 2) {
      deInterp = 'Moderate leverage — acceptable for many industries';
      deStatus = 'adequate';
      score += 5;
    } else {
      deInterp = 'High leverage — potential long-term risk';
      deStatus = 'danger';
      score += 1;
    }
  }

  // Debt Ratio
  let debtRatio: number | null = null;
  let drInterp = 'Cannot calculate (total assets = 0)';
  let drStatus: HealthStatus = 'info';
  if (totalAssets > 0) {
    debtRatio = totalLiabilities / totalAssets;
    if (debtRatio < 0.4) {
      drInterp = 'Low reliance on debt — strong solvency';
      drStatus = 'strong';
      score += 6;
    } else if (debtRatio < 0.6) {
      drInterp = 'Moderate debt usage';
      drStatus = 'adequate';
      score += 4;
    } else {
      drInterp = 'High debt load — solvency risk';
      drStatus = 'warning';
      score += 2;
    }
  }

  // Equity Ratio
  let equityRatio: number | null = null;
  let erInterp = 'Cannot calculate (total assets = 0)';
  let erStatus: HealthStatus = 'info';
  if (totalAssets > 0) {
    equityRatio = equityCurr / totalAssets;
    if (equityRatio > 0.5) {
      erInterp = 'Strong equity base';
      erStatus = 'strong';
      score += 6;
    } else if (equityRatio > 0.3) {
      erInterp = 'Moderate equity cushion';
      erStatus = 'adequate';
      score += 4;
    } else {
      erInterp = 'Thin equity cushion — higher financial risk';
      erStatus = 'warning';
      score += 2;
    }
  }

  // Times Interest Earned (TIE)
  let tie: number | null = null;
  let tieInterp = 'Cannot interpret (interest expense = 0)';
  let tieStatus: HealthStatus = 'info';
  if (interestExpense > 0) {
    tie = ebit / interestExpense;
    if (tie > 5) {
      tieInterp = 'Very strong ability to cover interest';
      tieStatus = 'strong';
      score += 6;
    } else if (tie > 3) {
      tieInterp = 'Adequate interest coverage';
      tieStatus = 'adequate';
      score += 4;
    } else if (tie > 1) {
      tieInterp = 'Weak coverage — potential solvency pressure';
      tieStatus = 'warning';
      score += 2;
    } else {
      tieInterp = 'Critical risk — earnings insufficient to cover interest';
      tieStatus = 'danger';
      score += 0;
    }
  } else if (interestExpense === 0 && ebit > 0) {
    tieInterp = 'Zero interest expense — virtually no debt burden';
    tieStatus = 'strong';
    score += 6;
  }

  const items: RatioItem[] = [
    {
      id: 'de',
      name: 'Debt-to-Equity (D/E)',
      shortName: 'D/E',
      value: de,
      displayValue: de !== null ? `${formatNumber(de)}x` : 'N/A',
      formula: 'Total Liabilities / Average Equity',
      benchmark: '< 1.0x (Low risk), < 2.0x (Moderate)',
      interpretation: deInterp,
      status: deStatus,
      isDistorted: deDistorted,
      distortionMessage: deDistorted ? 'Distorted by low equity base (<20% of assets)' : undefined,
    },
    {
      id: 'debt_ratio',
      name: 'Debt Ratio',
      shortName: 'Debt Ratio',
      value: debtRatio,
      displayValue: debtRatio !== null ? formatPercent(debtRatio) : 'N/A',
      formula: 'Total Liabilities / Total Assets',
      benchmark: '< 40% (Low reliance), < 60% (Moderate)',
      interpretation: drInterp,
      status: drStatus,
    },
    {
      id: 'equity_ratio',
      name: 'Equity Ratio',
      shortName: 'Equity Ratio',
      value: equityRatio,
      displayValue: equityRatio !== null ? formatPercent(equityRatio) : 'N/A',
      formula: 'Shareholders Equity / Total Assets',
      benchmark: '> 50% (Strong base), > 30% (Moderate cushion)',
      interpretation: erInterp,
      status: erStatus,
    },
    {
      id: 'tie',
      name: 'Times Interest Earned (TIE)',
      shortName: 'TIE',
      value: tie,
      displayValue: tie !== null ? `${formatNumber(tie)}x` : 'N/A',
      formula: 'EBIT / Interest Expense',
      benchmark: '> 3.0x (Adequate), > 5.0x (Very strong)',
      interpretation: tieInterp,
      status: tieStatus,
    },
  ];

  let summaryStatus: HealthStatus = 'adequate';
  if (score >= 20) summaryStatus = 'strong';
  else if (score < 11) summaryStatus = 'warning';

  return {
    avgEquity,
    de,
    debtRatio,
    equityRatio,
    tie,
    items,
    interpretations: {
      de: deInterp,
      debtRatio: drInterp,
      equityRatio: erInterp,
      tie: tieInterp,
    },
    distortionWarnings,
    score: Math.min(25, score),
    summaryStatus,
  };
}

// ------------------- COMPREHENSIVE INVESTMENT SAFETY VERDICT ------------------- //
export function computeInvestmentSafetyVerdict(
  inputs: FinancialInputs,
  liquidity: LiquidityResults,
  efficiency: EfficiencyResults,
  profitability: ProfitabilityResults,
  solvency: SolvencyResults
): InvestmentSafetyVerdict {
  const totalSafetyScore =
    liquidity.score + efficiency.score + profitability.score + solvency.score;

  let rating: InvestmentSafetyVerdict['rating'] = 'Adequately Safe';
  let isSafeToInvest = true;

  if (totalSafetyScore >= 75) {
    rating = 'Very Safe / High Quality';
    isSafeToInvest = true;
  } else if (totalSafetyScore >= 55) {
    rating = 'Adequately Safe';
    isSafeToInvest = true;
  } else if (totalSafetyScore >= 35) {
    rating = 'Moderate Risk / Caution';
    isSafeToInvest = false;
  } else {
    rating = 'High Risk / Unsafe';
    isSafeToInvest = false;
  }

  const keyStrengths: string[] = [];
  const keyRiskFactors: string[] = [];
  const distortionsIdentified: string[] = [
    ...profitability.distortionWarnings,
    ...solvency.distortionWarnings,
  ];

  // Evaluate strengths
  if (solvency.tie !== null && solvency.tie > 15) {
    keyStrengths.push(
      `Immense Interest Coverage: EBIT covers annual interest expense ${formatNumber(solvency.tie)}x over.`
    );
  } else if (solvency.tie !== null && solvency.tie > 5) {
    keyStrengths.push(`Solid Interest Coverage: TIE is healthy at ${formatNumber(solvency.tie)}x.`);
  }

  if (profitability.pm !== null && profitability.pm > 0.15) {
    keyStrengths.push(
      `Superior Profitability: Net margin of ${formatPercent(profitability.pm)} signals exceptional pricing power and moat.`
    );
  }

  if (profitability.operatingMargin !== null && profitability.operatingMargin > 0.2) {
    keyStrengths.push(
      `World-class Operating Leverage: EBIT margin of ${formatPercent(profitability.operatingMargin)} demonstrates low fixed-cost sensitivity.`
    );
  }

  if (liquidity.ocf > 0) {
    keyStrengths.push(
      `Massive Operating Cash Flow: Generates ${formatCurrency(liquidity.ocf)} annually, fully self-financing capital expenditures and dividends.`
    );
  }

  if (efficiency.dio !== null && efficiency.dio < 45) {
    keyStrengths.push(
      `Ultra-Lean Working Capital: DSO of ${formatNumber(efficiency.dso, 0)} days and DIO of ${formatNumber(efficiency.dio, 0)} days showcase rapid cash conversion.`
    );
  }

  // Evaluate risks
  if (liquidity.currentRatio !== null && liquidity.currentRatio < 1.0) {
    keyRiskFactors.push(
      `Current Ratio is below 1.0 (${formatNumber(liquidity.currentRatio)}x). Working capital is negative (${formatCurrency(liquidity.workingCapital)}), requiring sustained cash inflows.`
    );
  }

  if (solvency.debtRatio !== null && solvency.debtRatio > 0.7) {
    keyRiskFactors.push(
      `Debt Ratio is elevated at ${formatPercent(solvency.debtRatio)}. Total obligations represent a large fraction of assets.`
    );
  }

  if (solvency.tie !== null && solvency.tie < 2.0) {
    keyRiskFactors.push(
      `Interest coverage is compressed (${formatNumber(solvency.tie)}x). High vulnerability if earnings contract or refinancing rates climb.`
    );
  }

  if (profitability.changeInRevenue !== null && profitability.changeInRevenue < 0) {
    keyRiskFactors.push(
      `Top-line revenue contracted ${formatNumber(Math.abs(profitability.changeInRevenue))}% YoY, pointing to cyclical softness or saturation.`
    );
  }

  let analystAction = '';
  let verdictSummary = '';

  if (isSafeToInvest) {
    if (distortionsIdentified.length > 0) {
      verdictSummary = `SAFE TO INVEST (High Quality Balance Sheet). The company exhibits exceptional cash flow generation (${formatCurrency(liquidity.ocf)}) and elite profitability margins (${formatPercent(profitability.pm)}). While traditional leverage ratios like D/E appear inflated (${solvency.de ? formatNumber(solvency.de) + 'x' : 'N/A'}), this is an artifact of aggressive share buybacks reducing accounting book equity rather than structural financial distress. Interest coverage (${solvency.tie ? formatNumber(solvency.tie) + 'x' : 'N/A'}) confirms zero debt stress.`;
      analystAction = `Green Light for Capital Preservation & Quality Compounders. Monitor supply chain cycles and regulatory antitrust scrutiny.`;
    } else {
      verdictSummary = `SAFE TO INVEST. Strong solvency cushion, healthy positive working capital, and robust operating margins indicate sound fundamentals and minimal financial default hazard.`;
      analystAction = `Favorable fundamental risk profile. Suitable for core portfolio allocation.`;
    }
  } else {
    verdictSummary = `EXERCISE CAUTION / ELEVATED FINANCIAL RISK. Key financial metrics reflect either negative cash generation, constrained liquidity buffers, or high debt encumbrance relative to operating income.`;
    analystAction = `Unfavorable risk-to-reward ratio based on balance sheet fundamentals. Defer investment until debt is reduced or cash flow turns positive.`;
  }

  return {
    totalSafetyScore,
    rating,
    isSafeToInvest,
    verdictSummary,
    liquidityScore: liquidity.score,
    efficiencyScore: efficiency.score,
    profitabilityScore: profitability.score,
    solvencyScore: solvency.score,
    keyStrengths,
    keyRiskFactors,
    distortionsIdentified,
    analystAction,
  };
}

// ------------------- PYTHON CLI SCRIPT OUTPUT REPRODUCTION ------------------- //
export function generatePythonScriptCliOutput(
  inputs: FinancialInputs,
  liquidity: LiquidityResults,
  efficiency: EfficiencyResults,
  profitability: ProfitabilityResults,
  solvency: SolvencyResults
): string {
  const lines: string[] = [];

  lines.push('================================================================');
  lines.push(`FINANCIAL RISK ANALYSIS TOOL (PYTHON SCRIPT REPRODUCTION)`);
  lines.push(`Company: ${inputs.companyName} (${inputs.ticker}) | Year: ${inputs.year}`);
  lines.push('================================================================\n');

  // 1. LIQUIDITY
  lines.push('--- Liquidity Analysis ---');
  lines.push(`Enter Current Assets (Balance Sheet: Total Current Assets, $): ${inputs.currentAssets}`);
  lines.push(`Enter Current Liabilities (Balance Sheet: Total Current Liabilities, $): ${inputs.currentLiabilities}`);
  lines.push(`Enter Inventory (Balance Sheet: Inventory, $): ${inputs.inventory}`);
  lines.push(`Enter Cash & Cash Equivalents (Balance Sheet: Cash, $): ${inputs.cash}`);
  lines.push(`Enter Operating Cash Inflows (Cash Flow Statement: Net Cash from Operating Activities, $): ${inputs.operatingCashInflows}`);
  lines.push(`Enter Operating Cash Outflows (Cash Flow Statement: Cash Paid for Operations, $): ${inputs.operatingCashOutflows}`);
  lines.push('\nLiquidity Summary:');
  if (inputs.currentLiabilities === 0) {
    lines.push('Cannot calculate liquidity ratios (current liabilities = 0)');
  } else {
    lines.push(`Current Ratio (CR): ${liquidity.currentRatio?.toFixed(2)}`);
    lines.push(`Quick Ratio (QR): ${liquidity.quickRatio?.toFixed(2)}`);
    lines.push(`Cash Ratio: ${liquidity.cashRatio?.toFixed(2)}`);
    lines.push(`Working Capital: $${liquidity.workingCapital.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    lines.push(`Operating Cash Flow (OCF): $${liquidity.ocf.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    lines.push(`OCF Ratio: ${liquidity.ocfRatio?.toFixed(2)}`);
    lines.push(`CR Interpretation: ${liquidity.interpretations.cr}`);
    lines.push(`QR Interpretation: ${liquidity.interpretations.qr}`);
    lines.push(`Cash Ratio Interpretation: ${liquidity.interpretations.cashRatio}`);
    lines.push(`OCF Ratio Interpretation: ${liquidity.interpretations.ocfRatio}`);
  }

  // 2. PROFITABILITY
  lines.push('\n--- Profitability Analysis ---');
  lines.push(`Enter the year you want to calculate profitability for: ${inputs.year}`);
  lines.push(`--- Enter Data for ${inputs.prevYear} and ${inputs.year} ---`);
  lines.push(`Enter Revenue for ${inputs.prevYear}: ${inputs.revenuePrev}`);
  lines.push(`Enter Revenue for ${inputs.year}: ${inputs.revenueCurr}`);
  lines.push(`Enter Net Income for ${inputs.year}: ${inputs.netIncome}`);
  lines.push(`Enter Gross Profit for ${inputs.year}: ${inputs.grossProfit}`);
  lines.push(`Enter Total Operating Expense for ${inputs.year}: ${inputs.operatingExpense}`);
  lines.push(`Enter Operating Income (EBIT) for ${inputs.year}: ${inputs.operatingIncome}`);
  lines.push(`Enter Shareholders' Equity for ${inputs.prevYear}: ${inputs.equityPrev}`);
  lines.push(`Enter Shareholders' Equity for ${inputs.year}: ${inputs.equityCurr}`);
  lines.push(`Enter Total Assets for ${inputs.prevYear}: ${inputs.assetsPrev}`);
  lines.push(`Enter Total Assets for ${inputs.year}: ${inputs.assetsCurr}`);
  lines.push(`Enter Net Operating Assets (NOA) for ${inputs.prevYear}: ${inputs.noaPrev}`);
  lines.push(`Enter Net Operating Assets (NOA) for ${inputs.year}: ${inputs.noaCurr}`);

  lines.push('\nProfitability Summary:');
  lines.push(`Year: ${inputs.year}`);
  lines.push(`Average Equity (${inputs.prevYear}-${inputs.year}): $${profitability.avgEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  lines.push(`Average Total Assets (${inputs.prevYear}-${inputs.year}): $${profitability.avgAssets.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  lines.push(`Average NOA (${inputs.prevYear}-${inputs.year}): $${profitability.avgNoa.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

  if (profitability.changeInRevenue !== null) {
    lines.push(`Change in Revenue: ${profitability.changeInRevenue.toFixed(2)}% (${profitability.interpretations.revenueGrowth})`);
  }
  if (profitability.roe !== null) {
    lines.push(`ROE: ${(profitability.roe * 100).toFixed(2)}% (${profitability.interpretations.roe})`);
  }
  if (profitability.roa !== null) {
    lines.push(`ROA: ${(profitability.roa * 100).toFixed(2)}% (${profitability.interpretations.roa})`);
  }
  if (profitability.pm !== null) {
    lines.push(`Profit Margin: ${(profitability.pm * 100).toFixed(2)}% (${profitability.interpretations.pm})`);
  }
  if (profitability.gpm !== null) {
    lines.push(`Gross Profit Margin: ${(profitability.gpm * 100).toFixed(2)}% (${profitability.interpretations.gpm})`);
  }
  if (profitability.operatingMargin !== null) {
    lines.push(`Operating Margin: ${(profitability.operatingMargin * 100).toFixed(2)}% (${profitability.interpretations.operatingMargin})`);
  }
  if (profitability.ets !== null) {
    lines.push(`Expense-to-Sales (ETS): ${profitability.ets.toFixed(2)}% (${profitability.interpretations.ets})`);
  }
  if (profitability.rnoa !== null) {
    lines.push(`RNOA: ${(profitability.rnoa * 100).toFixed(2)}% (${profitability.interpretations.rnoa})`);
  }

  // 3. EFFICIENCY
  lines.push('\n--- Efficiency Analysis ---');
  lines.push(`Enter Revenue: ${inputs.revenue}`);
  lines.push(`Enter Cost of Goods Sold (COGS): ${inputs.cogs}`);
  lines.push(`Enter Average Accounts Receivable: ${inputs.avgAr}`);
  lines.push(`Enter Average Inventory: ${inputs.avgInventory}`);
  lines.push(`Enter Average PPE: ${inputs.avgPpe}`);

  lines.push('\nEfficiency Summary:');
  if (efficiency.art !== null && efficiency.dso !== null) {
    lines.push(`Accounts Receivable Turnover (ART): ${efficiency.art.toFixed(2)}x`);
    lines.push(`Days Sales Outstanding (DSO): ${efficiency.dso.toFixed(2)} days`);
    lines.push(`  • Interpretation: ${efficiency.interpretations.ar}`);
  }
  if (efficiency.invt !== null && efficiency.dio !== null) {
    lines.push(`Inventory Turnover (INVT): ${efficiency.invt.toFixed(2)}x`);
    lines.push(`Days Inventory Outstanding (DIO): ${efficiency.dio.toFixed(2)} days`);
    lines.push(`  • Interpretation: ${efficiency.interpretations.inv}`);
  }
  if (efficiency.ppet !== null) {
    lines.push(`PPE Turnover (PPET): ${efficiency.ppet.toFixed(2)}x`);
    lines.push(`  • Interpretation: ${efficiency.interpretations.ppe}`);
  }

  // 4. SOLVENCY
  lines.push('\n--- Solvency Analysis ---');
  lines.push(`Enter Total Liabilities for ${inputs.year}: ${inputs.totalLiabilities}`);
  lines.push(`Enter Total Assets for ${inputs.year}: ${inputs.totalAssets}`);
  lines.push(`Enter Shareholders' Equity for ${inputs.prevYear}: ${inputs.equityPrev}`);
  lines.push(`Enter Shareholders' Equity for ${inputs.year}: ${inputs.equityCurr}`);
  lines.push(`Enter EBIT for ${inputs.year}: ${inputs.ebit}`);
  lines.push(`Enter Interest Expense for ${inputs.year}: ${inputs.interestExpense}`);

  lines.push('\nSolvency Summary:');
  lines.push(`Year: ${inputs.year}`);
  lines.push(`Average Equity (${inputs.prevYear}-${inputs.year}): $${solvency.avgEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  lines.push(`Debt-to-Equity (D/E): ${solvency.de !== null ? solvency.de.toFixed(2) : 'Cannot calculate'} (${solvency.interpretations.de})`);
  lines.push(`Debt Ratio: ${solvency.debtRatio !== null ? (solvency.debtRatio * 100).toFixed(2) + '%' : 'N/A'} (${solvency.interpretations.debtRatio})`);
  lines.push(`Equity Ratio: ${solvency.equityRatio !== null ? (solvency.equityRatio * 100).toFixed(2) + '%' : 'N/A'} (${solvency.interpretations.equityRatio})`);
  lines.push(`Times Interest Earned (TIE): ${solvency.tie !== null ? solvency.tie.toFixed(2) : 'Cannot calculate'} (${solvency.interpretations.tie})`);

  lines.push('\nAll analyses completed.');
  return lines.join('\n');
}
