/**
 * Financial Risk & Ratio Analysis Type Definitions
 * Covers Liquidity, Efficiency, Profitability, Solvency, and Investment Safety
 */

export interface FinancialInputs {
  // Metadata
  companyName: string;
  ticker: string;
  year: number;
  prevYear: number;
  secFilingUrl: string;
  filingTitle?: string;
  accessionNumber?: string;

  // 1. Liquidity inputs
  currentAssets: number;
  currentLiabilities: number;
  inventory: number;
  cash: number;
  operatingCashInflows: number;
  operatingCashOutflows: number;

  // 2. Efficiency inputs
  revenue: number;
  cogs: number;
  avgAr: number;
  avgInventory: number;
  avgPpe: number;

  // 3. Profitability inputs
  revenuePrev: number;
  revenueCurr: number;
  netIncome: number;
  grossProfit: number;
  operatingExpense: number;
  operatingIncome: number; // EBIT
  equityPrev: number;
  equityCurr: number;
  assetsPrev: number;
  assetsCurr: number;
  noaPrev: number;
  noaCurr: number;

  // 4. Solvency inputs
  totalLiabilities: number;
  totalAssets: number;
  ebit: number;
  interestExpense: number;
}

export type HealthStatus = 'strong' | 'adequate' | 'warning' | 'danger' | 'info';

export interface RatioItem {
  id: string;
  name: string;
  shortName: string;
  value: number | null;
  displayValue: string;
  formula: string;
  benchmark: string;
  interpretation: string;
  status: HealthStatus;
  isDistorted?: boolean;
  distortionMessage?: string;
}

export interface LiquidityResults {
  workingCapital: number;
  ocf: number;
  currentRatio: number | null;
  quickRatio: number | null;
  cashRatio: number | null;
  ocfRatio: number | null;
  items: RatioItem[];
  interpretations: {
    cr: string;
    qr: string;
    cashRatio: string;
    ocfRatio: string;
  };
  score: number; // 0-25
  summaryStatus: HealthStatus;
}

export interface EfficiencyResults {
  art: number | null;
  dso: number | null;
  invt: number | null;
  dio: number | null;
  ppet: number | null;
  items: RatioItem[];
  interpretations: {
    ar: string;
    inv: string;
    ppe: string;
  };
  score: number; // 0-25
  summaryStatus: HealthStatus;
}

export interface ProfitabilityResults {
  avgEquity: number;
  avgAssets: number;
  avgNoa: number;
  changeInRevenue: number | null;
  roe: number | null;
  roa: number | null;
  pm: number | null;
  gpm: number | null;
  operatingMargin: number | null;
  ets: number | null;
  rnoa: number | null;
  items: RatioItem[];
  interpretations: {
    revenueGrowth: string;
    roe: string;
    roa: string;
    pm: string;
    gpm: string;
    operatingMargin: string;
    ets: string;
    rnoa: string;
  };
  distortionWarnings: string[];
  score: number; // 0-25
  summaryStatus: HealthStatus;
}

export interface SolvencyResults {
  avgEquity: number;
  de: number | null;
  debtRatio: number | null;
  equityRatio: number | null;
  tie: number | null;
  items: RatioItem[];
  interpretations: {
    de: string;
    debtRatio: string;
    equityRatio: string;
    tie: string;
  };
  distortionWarnings: string[];
  score: number; // 0-25
  summaryStatus: HealthStatus;
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string; // e.g., 'The Wall Street Journal', 'The New York Times', 'Bloomberg', 'Reuters'
  url: string;
  publishedDate: string; // within ~6 months
  snippet: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  relevanceToSafety: string;
}

export interface InvestmentSafetyVerdict {
  totalSafetyScore: number; // 0 to 100
  rating: 'Very Safe / High Quality' | 'Adequately Safe' | 'Moderate Risk / Caution' | 'High Risk / Unsafe';
  isSafeToInvest: boolean;
  verdictSummary: string;
  liquidityScore: number;
  efficiencyScore: number;
  profitabilityScore: number;
  solvencyScore: number;
  keyStrengths: string[];
  keyRiskFactors: string[];
  distortionsIdentified: string[];
  analystAction: string;
}

export interface AnalysisState {
  inputs: FinancialInputs;
  liquidity: LiquidityResults;
  efficiency: EfficiencyResults;
  profitability: ProfitabilityResults;
  solvency: SolvencyResults;
  verdict: InvestmentSafetyVerdict;
  cliOutput: string;
  news: NewsArticle[];
  isLoadingNews: boolean;
  isLoadingFiling: boolean;
  lastUpdated: string;
}
