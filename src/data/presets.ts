import { FinancialInputs, NewsArticle } from '../types/financial';

export interface CompanyPreset {
  id: string;
  name: string;
  ticker: string;
  badge: string;
  description: string;
  inputs: FinancialInputs;
  curatedNews: NewsArticle[];
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
    curatedNews: [
      {
        id: 'news-wsj-1',
        title: 'Apple’s AI Strategy Focuses on Privacy and Hardware Moat Rather Than Massive Cloud Capex',
        source: 'The Wall Street Journal',
        url: 'https://www.wsj.com/tech/apple-ai-strategy-capital-expenditure-cash-flow',
        publishedDate: '2026-08-14',
        snippet:
          'While hyperscaler rivals spend tens of billions on generative AI data centers, Apple’s capital-light on-device approach protects its extraordinary 27% free cash flow margins and preserves balance sheet liquidity.',
        sentiment: 'bullish',
        relevanceToSafety:
          'Confirms cash generation remains insulated from crushing hyper-capex cycles, sustaining high TIE interest coverage.',
      },
      {
        id: 'news-nyt-1',
        title: 'Antitrust Scrutiny Mounts Over App Store Fees and Google Search Distribution Agreements',
        source: 'The New York Times',
        url: 'https://www.nytimes.com/technology/apple-google-antitrust-app-store-revenue',
        publishedDate: '2026-09-02',
        snippet:
          'Regulatory scrutiny across Europe and the US Justice Department poses long-term risks to high-margin Services revenue, though Apple’s massive $112B annual net income cushion prevents solvency distress.',
        sentiment: 'bearish',
        relevanceToSafety:
          'A regulatory headwind to service margins, but zero existential risk to debt servicing or liquidity.',
      },
      {
        id: 'news-bloomberg-1',
        title: 'Apple Hits 22% Global Smartphone Market Share as Services Revenue Accelerates 12%',
        source: 'Bloomberg',
        url: 'https://www.bloomberg.com/news/articles/apple-smartphone-market-share-services-growth',
        publishedDate: '2026-10-05',
        snippet:
          'Apple expanded its active installed base past 2.5 billion devices, generating recurring high-margin services income that offsets cyclical hardware replacement patterns.',
        sentiment: 'bullish',
        relevanceToSafety:
          'Highlights resilient top-line recurring revenue and steady cash inflows covering short-term vendor liabilities.',
      },
      {
        id: 'news-reuters-1',
        title: 'Apple Extends $100 Billion Share Buyback Program Amid Record Operating Cash Flow',
        source: 'Reuters',
        url: 'https://www.reuters.com/technology/apple-share-repurchase-operating-cash-flow',
        publishedDate: '2026-07-28',
        snippet:
          'Apple returned another $100 billion to shareholders via repurchases and dividends. Financial analysts note that while this artificially shrinks accounting book equity, the business holds a fortress solvency position.',
        sentiment: 'neutral',
        relevanceToSafety:
          'Directly explains why Debt-to-Equity is technically distorted in standard ratio screenings while actual default risk is near zero.',
      },
    ],
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
    curatedNews: [
      {
        id: 'news-wsj-msft',
        title: 'Microsoft Azure Cloud Demand Accelerates on Enterprise AI Adoption',
        source: 'The Wall Street Journal',
        url: 'https://www.wsj.com/business/technology/microsoft-azure-earnings-cloud-growth',
        publishedDate: '2026-08-19',
        snippet: 'Cloud commercial bookings rose 29%, providing unmatched recurring revenue predictability.',
        sentiment: 'bullish',
        relevanceToSafety: 'Solidifies multi-year operational cash flow guarantees.',
      },
    ],
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
    curatedNews: [
      {
        id: 'news-ft-nvda',
        title: 'Nvidia Blackwell Architecture Ramp Underpins 74% Gross Margin Guidance',
        source: 'Financial Times',
        url: 'https://www.ft.com/content/nvidia-blackwell-data-center-chips-margins',
        publishedDate: '2026-09-15',
        snippet: 'Sovereign and hyperscale demand guarantees sold-out production pipeline.',
        sentiment: 'bullish',
        relevanceToSafety: 'Virtually unassailable balance sheet with over 200x interest coverage.',
      },
    ],
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
    curatedNews: [
      {
        id: 'news-wsj-distress',
        title: 'Retailer Hires Restructuring Advisors Amid Refinancing Wall and Cash Burn',
        source: 'The Wall Street Journal',
        url: 'https://www.wsj.com/business/retail/distressed-retailer-debt-restructuring-warning',
        publishedDate: '2026-08-30',
        snippet: 'Bondholders prepare for debt-for-equity swap as negative operating cash flow drains reserves.',
        sentiment: 'bearish',
        relevanceToSafety: 'Extreme solvency hazard: negative EBIT cannot support $480M interest tab.',
      },
    ],
  },
];
