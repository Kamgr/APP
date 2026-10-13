import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { fetchCompanyNews, CREDIBLE_SOURCES, FeedArticle } from './newsFeed';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '5mb' }));

// Initialize Google GenAI client server-side only
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ------------------- API: COMPANY NEWS (real feed, credible sources only) ------------------- //
// Every link comes from the news feed itself. Gemini (if configured) only classifies
// the sentiment of headlines; it never supplies or alters a URL, and there is no fallback link.
type HeadlineAnalysis = {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  relevanceToSafety: string;
};
const analysisCache = new Map<string, HeadlineAnalysis>();

async function addHeadlineAnalysis(articles: FeedArticle[], company: string) {
  const ai = getGeminiClient();
  const todo = articles.filter((a) => !analysisCache.has(a.id));

  if (ai && todo.length > 0) {
    try {
      const prompt = `You are classifying news headlines for an investor analyzing ${company}.
For each headline, use ONLY the headline text. Do not add facts, numbers or context that are not in it.
- "sentiment": "bullish", "bearish" or "neutral" for the company's financial position
- "implication": one short sentence on what this could mean for liquidity, solvency, profitability or risk.
  If the headline gives no basis, write exactly: "Headline alone does not indicate a financial impact."

Return a JSON array: [{"i": number, "sentiment": string, "implication": string}]

Headlines:
${todo.map((a, i) => `${i}. [${a.source}] ${a.title}`).join('\n')}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      const parsed = JSON.parse(response.text || '[]');
      if (Array.isArray(parsed)) {
        for (const row of parsed) {
          const article = todo[row?.i];
          if (!article) continue;
          analysisCache.set(article.id, {
            sentiment: ['bullish', 'bearish', 'neutral'].includes(row.sentiment) ? row.sentiment : 'neutral',
            relevanceToSafety: String(row.implication || '').slice(0, 300),
          });
        }
      }
    } catch (err) {
      // Analysis is optional. Articles and links are still returned without it.
      console.warn('Headline analysis skipped:', (err as Error).message);
    }
  }

  return articles.map((a) => ({ ...a, ...(analysisCache.get(a.id) ?? {}) }));
}

app.post('/api/news', async (req: Request, res: Response) => {
  const { companyName, ticker } = req.body ?? {};
  if (!companyName && !ticker) {
    return res.status(400).json({ success: false, error: 'companyName or ticker is required.' });
  }

  try {
    const { articles, cached } = await fetchCompanyNews(companyName || '', ticker || '');
    const enriched = await addHeadlineAnalysis(articles, companyName || ticker);
    return res.json({
      success: true,
      articles: enriched,
      cached,
      approvedSources: Object.values(CREDIBLE_SOURCES),
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching company news:', error);
    return res.status(502).json({
      success: false,
      error: 'Could not reach the news feed. Showing nothing is better than showing unverified links.',
    });
  }
});

// ------------------- API: PARSE SEC FILING OR TICKER ------------------- //
app.post('/api/analyze-filing', async (req: Request, res: Response) => {
  try {
    const { secUrl, ticker } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(400).json({
        success: false,
        error: 'Gemini API Key is not configured on the server. Please check the Secrets panel.',
      });
    }

    const filingTarget = secUrl || ticker || 'https://www.sec.gov/ix?doc=/Archives/edgar/data/0000320193/000032019325000079/aapl-20250927.htm';

    const prompt = `You are an elite SEC EDGAR financial analyst.
Analyze the following company filing:
Target Filing or Ticker: "${filingTarget}"

Look up and extract the audited numbers for the latest fiscal year (and preceding year where required for balance sheet averages and YoY growth):
1. Company Name and Ticker
2. Year (e.g. 2025) and PrevYear (e.g. 2024)
3. LIQUIDITY items (in standard US Dollars, not thousands or millions, full integer numbers):
   - Current Assets (Total Current Assets)
   - Current Liabilities (Total Current Liabilities)
   - Inventory
   - Cash & Cash Equivalents (plus short-term marketable securities)
   - Operating Cash Inflows (Net cash provided by / used in operating activities)
   - Operating Cash Outflows (Default to 0 if net cash is already reported)
4. EFFICIENCY items:
   - Revenue / Total Net Sales (current year)
   - Cost of Goods Sold (COGS / Cost of sales)
   - Average Accounts Receivable (or current year A/R if average not directly listed)
   - Average Inventory
   - Average Property, Plant and Equipment (PPE, net)
5. PROFITABILITY items:
   - Revenue previous year
   - Revenue current year
   - Net Income
   - Gross Profit
   - Total Operating Expenses (R&D + SG&A)
   - Operating Income (EBIT)
   - Shareholders' Equity previous year
   - Shareholders' Equity current year
   - Total Assets previous year
   - Total Assets current year
   - Net Operating Assets (NOA) previous year (Operating Assets - Operating Liabilities)
   - Net Operating Assets (NOA) current year
6. SOLVENCY items:
   - Total Liabilities current year
   - Total Assets current year
   - EBIT
   - Interest Expense (or financing costs)

Return a single valid JSON object with the following schema:
{
  "companyName": string,
  "ticker": string,
  "year": number,
  "prevYear": number,
  "secFilingUrl": string,
  "filingTitle": string,
  "currentAssets": number,
  "currentLiabilities": number,
  "inventory": number,
  "cash": number,
  "operatingCashInflows": number,
  "operatingCashOutflows": number,
  "revenue": number,
  "cogs": number,
  "avgAr": number,
  "avgInventory": number,
  "avgPpe": number,
  "revenuePrev": number,
  "revenueCurr": number,
  "netIncome": number,
  "grossProfit": number,
  "operatingExpense": number,
  "operatingIncome": number,
  "equityPrev": number,
  "equityCurr": number,
  "assetsPrev": number,
  "assetsCurr": number,
  "noaPrev": number,
  "noaCurr": number,
  "totalLiabilities": number,
  "totalAssets": number,
  "ebit": number,
  "interestExpense": number
}

Important: All monetary fields MUST be raw numbers (e.g. 416161000000, NOT "$416B" or 416.1).
Return strictly the JSON object.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const raw = response.text || '';
    const cleanJson = raw.replace(/```json/gi, '').replace(/```/g, '').trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleanJson);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error('Could not parse JSON response from filing extractor.');
      }
    }

    return res.json({
      success: true,
      inputs: parsed,
    });
  } catch (error: any) {
    console.error('Error analyzing filing:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to extract financial data from filing.',
    });
  }
});

// ------------------- API: DEEP SAFETY REPORT SYNTHESIS ------------------- //
app.post('/api/safety-synthesis', async (req: Request, res: Response) => {
  try {
    const { companyName, ticker, ratios, verdictSummary } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: false,
        commentary: 'Institutional synthesis ready with local scoring engine.',
      });
    }

    const prompt = `Act as an institutional Chief Investment Officer (CIO) and Credit Analyst.
Evaluate whether it is fundamentally safe to invest in ${companyName} (${ticker}).
Here are the calculated ratios from their latest audited 10-K filing:
${JSON.stringify(ratios, null, 2)}

Existing Model Verdict: "${verdictSummary}"

Provide a crisp 3-paragraph executive investment memo:
1. Balance Sheet Durability & Liquidity Risk (addressing working capital and cash buffer).
2. Profitability Moat & Solvency (addressing interest coverage, operating leverage, and any accounting distortions like share buybacks shrinking book equity).
3. Final Verdict: Explicitly state whether the company is Safe, Moderately Safe, or Unsafe to invest in, with specific capital allocation guidance.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      success: true,
      commentary: response.text || '',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ------------------- VITE / STATIC SERVING ------------------- //
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Financial Risk Analysis server running on port ${PORT}`);
  });
}

startServer();
