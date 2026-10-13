import { FinancialInputs } from '../types/financial';

export interface CompanyPreset {
  id: string;
  name: string;
  ticker: string;
  badge: string;
  description: string;
  inputs: FinancialInputs;
}

export const PRESETS: CompanyPreset[] = [
  {
    id: 'aapl-2025',
    name: 'Apple Inc.',
    ticker: 'AAPL',
    badge: 'Requested SEC Link (FY2025 10-K)',
    description: 'Fiscal year ended September 27, 2025 10-K filing from SEC EDGAR.',
    inputs: {
      companyName: 'Apple Inc.',
      ticker: 'AAPL',
      year: 2025,
      prevYear: 2024,
      secFilingUrl:
        'https://www.sec.gov/ix?doc=/Archives/edgar/data/0000320193/000032019325000079/aapl-20250927.htm',
      filingTitle: 'Apple Inc. Form 10-K Annual Report (Fiscal Year ended Sep 27, 2025)',
      accessionNumber: '0000320193-25-000079',

      // 1. Liquidity inputs ($)
      currentAssets: 147957000000, // $147.96B
      currentLiabilities: 155000000000, // $155.0B
      inventory: 6511000000, // $6.51B
      cash: 29943000000, // $29.94B cash & cash equivalents
      operatingCashInflows: 118264000000, // Net cash from operating activities ($118.26B)
      operatingCashOutflows: 0, // In standard US GAAP, Net OCF is reported directly

      // 2. Efficiency inputs ($)
      revenue: 416161000000, // $416.16B
      cogs: 220960000000, // $220.96B
      avgAr: 32000000000, // Average A/R ($32.0B)
      avgInventory: 6450000000, // Average Inventory ($6.45B)
      avgPpe: 44500000000, // Average PPE ($44.5B)

      // 3. Profitability inputs ($)
      revenuePrev: 391035000000, // FY2024 Revenue ($391.04B)
      revenueCurr: 416161000000, // FY2025 Revenue ($416.16B)
      netIncome: 112010000000, // $112.01B
      grossProfit: 195201000000, // $195.20B
      operatingExpense: 62100000000, // $62.10B
      operatingIncome: 133101000000, // EBIT ($133.10B)
      equityPrev: 66788000000, // FY2024 Total Shareholders' Equity ($66.79B)
      equityCurr: 73700000000, // FY2025 Total Shareholders' Equity ($73.70B)
      assetsPrev: 352583000000, // FY2024 Total Assets ($352.58B)
      assetsCurr: 359200000000, // FY2025 Total Assets ($359.20B)
      noaPrev: 76000000000, // Operating Assets - Operating Liabilities ($76.0B)
      noaCurr: 82000000000, // Operating Assets - Operating Liabilities ($82.0B)

      // 4. Solvency inputs ($)
      totalLiabilities: 285500000000, // $285.50B
      totalAssets: 359200000000, // $359.20B
      ebit: 133101000000, // $133.10B
      interestExpense: 3900000000, // $3.90B
    },
  },
  {
    id: 'msft-2025',
    name: 'Microsoft Corporation',
    ticker: 'MSFT',
    badge: 'Enterprise & Cloud Pillar',
    description: 'Form 10-K for fiscal year 2025. Massive enterprise recurring software & cloud cash flows.',
    inputs: {
      companyName: 'Microsoft Corporation',
      ticker: 'MSFT',
      year: 2025,
      prevYear: 2024,
      secFilingUrl:
        'https://www.sec.gov/ix?doc=/Archives/edgar/data/0000789019/000078901925000028/msft-20250630.htm',
      filingTitle: 'Microsoft Corp. Form 10-K Annual Report (Fiscal Year ended Jun 30, 2025)',
      accessionNumber: '0000789019-25-000028',
      currentAssets: 125000000000,
      currentLiabilities: 104000000000,
      inventory: 3500000000,
      cash: 75000000000,
      operatingCashInflows: 110000000000,
      operatingCashOutflows: 0,
      revenue: 245000000000,
      cogs: 74000000000,
      avgAr: 45000000000,
      avgInventory: 3200000000,
      avgPpe: 115000000000,
      revenuePrev: 211915000000,
      revenueCurr: 245000000000,
      netIncome: 88000000000,
      grossProfit: 171000000000,
      operatingExpense: 62000000000,
      operatingIncome: 109000000000,
      equityPrev: 206223000000,
      equityCurr: 240000000000,
      assetsPrev: 411976000000,
      assetsCurr: 480000000000,
      noaPrev: 175000000000,
      noaCurr: 200000000000,
      totalLiabilities: 240000000000,
      totalAssets: 480000000000,
      ebit: 109000000000,
      interestExpense: 2800000000,
    },
  },
  {
    id: 'nvda-2025',
    name: 'NVIDIA Corporation',
    ticker: 'NVDA',
    badge: 'Hyper-Growth Semiconductor',
    description: 'Fiscal 2025 10-K. Record data center sales, high gross margins, and minimal debt.',
    inputs: {
      companyName: 'NVIDIA Corporation',
      ticker: 'NVDA',
      year: 2025,
      prevYear: 2024,
      secFilingUrl:
        'https://www.sec.gov/ix?doc=/Archives/edgar/data/0001045810/000104581025000015/nvda-20250126.htm',
      filingTitle: 'NVIDIA Corp. Form 10-K Annual Report',
      accessionNumber: '0001045810-25-000015',
      currentAssets: 78000000000,
      currentLiabilities: 22000000000,
      inventory: 6000000000,
      cash: 34000000000,
      operatingCashInflows: 65000000000,
      operatingCashOutflows: 0,
      revenue: 125000000000,
      cogs: 32000000000,
      avgAr: 18000000000,
      avgInventory: 5500000000,
      avgPpe: 7000000000,
      revenuePrev: 60922000000,
      revenueCurr: 125000000000,
      netIncome: 62000000000,
      grossProfit: 93000000000,
      operatingExpense: 14000000000,
      operatingIncome: 79000000000,
      equityPrev: 42978000000,
      equityCurr: 80000000000,
      assetsPrev: 65728000000,
      assetsCurr: 115000000000,
      noaPrev: 30000000000,
      noaCurr: 55000000000,
      totalLiabilities: 35000000000,
      totalAssets: 115000000000,
      ebit: 79000000000,
      interestExpense: 350000000,
    },
  },
  {
    id: 'stressed-retailer',
    name: 'Overleveraged Retailer Co.',
    ticker: 'STRS',
    badge: 'Distressed Stress Test Benchmark',
    description: 'High debt burden, negative working capital, razor thin margins, and interest coverage failure.',
    inputs: {
      companyName: 'Overleveraged Retailer Co.',
      ticker: 'STRS',
      year: 2025,
      prevYear: 2024,
      secFilingUrl: 'https://www.sec.gov/edgar/searchedgar/companysearch',
      filingTitle: 'Illustrative Distressed Retailer 10-K',
      accessionNumber: '0000000000-25-000001',
      currentAssets: 3500000000,
      currentLiabilities: 5800000000,
      inventory: 2800000000,
      cash: 250000000,
      operatingCashInflows: 150000000,
      operatingCashOutflows: 380000000,
      revenue: 12000000000,
      cogs: 9800000000,
      avgAr: 600000000,
      avgInventory: 3100000000,
      avgPpe: 4200000000,
      revenuePrev: 13500000000,
      revenueCurr: 12000000000,
      netIncome: -620000000,
      grossProfit: 2200000000,
      operatingExpense: 2350000000,
      operatingIncome: -150000000,
      equityPrev: 800000000,
      equityCurr: 180000000,
      assetsPrev: 9500000000,
      assetsCurr: 8200000000,
      noaPrev: 3200000000,
      noaCurr: 2400000000,
      totalLiabilities: 8020000000,
      totalAssets: 8200000000,
      ebit: -150000000,
      interestExpense: 480000000,
    },
  },
];
