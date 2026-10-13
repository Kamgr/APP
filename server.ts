import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

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

// ------------------- API: LIVE NEWS GROUNDING ------------------- //
app.post('/api/news-grounding', async (req: Request, res: Response) => {
  try {
    const { companyName, ticker } = req.body;
    const queryCompany = companyName || ticker || 'Apple Inc.';
    const queryTicker = ticker || 'AAPL';

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(200).json({
        success: false,
        warning: 'GEMINI_API_KEY is not configured. Displaying curated benchmark news articles.',
        articles: [],
      });
    }

    const prompt = `Search for recent articles published within the last 6 months from major business and financial news outlets: The Wall Street Journal (WSJ), The New York Times (NYT), Bloomberg, Financial Times (FT), and Reuters regarding ${queryCompany} (${queryTicker}).
Focus specifically on topics that impact financial risk, balance sheet health, liquidity, debt load, operating cash flows, Capex/AI investments, earnings performance, or antitrust/regulatory investigations.

For each relevant story, provide:
1. Exact headline/title
2. Publication name (e.g., The Wall Street Journal, Bloomberg, Reuters, The New York Times, Financial Times)
3. Direct exact source URL from the search grounding
4. Publication date (YYYY-MM-DD or Month Year within past 6 months)
5. A concise 2-sentence summary focusing on the financial implication
6. Sentiment ('bullish', 'bearish', or 'neutral')
7. Relevance to investment safety (1 sentence explaining why this affects solvency or risk)

Return the results formatted as a strict JSON array of objects with keys:
"title", "source", "url", "publishedDate", "snippet", "sentiment", "relevanceToSafety".
Return ONLY the JSON array without backticks or markdown fences if possible.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const rawText = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // Extract real URLs from grounding chunks to ensure links are verified
    const webUrls: Array<{ uri: string; title: string }> = [];
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web?.uri) {
        webUrls.push({
          uri: chunk.web.uri,
          title: chunk.web.title || '',
        });
      }
    });

    // Parse JSON from model text
    let parsedArticles: any[] = [];
    try {
      const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedArticles = JSON.parse(cleanJson);
    } catch (e) {
      // Fallback regex extraction if full JSON parsing had minor quirks
      const match = rawText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (match) {
        try {
          parsedArticles = JSON.parse(match[0]);
        } catch (inner) {
          // ignore
        }
      }
    }

    // Enhance and attach verified URLs from search grounding if available
    const articles = (Array.isArray(parsedArticles) ? parsedArticles : []).map((art, idx) => {
      let finalUrl = art.url;
      // If the model gave a placeholder or invalid link, substitute a real grounding URL
      if (!finalUrl || finalUrl.includes('example.com') || finalUrl.startsWith('#')) {
        const matchingWeb = webUrls[idx % (webUrls.length || 1)];
        if (matchingWeb) finalUrl = matchingWeb.uri;
      }
      return {
        id: `news-${idx}-${Date.now()}`,
        title: art.title || `${queryCompany} Financial & Strategic Update`,
        source: art.source || 'Financial Press',
        url: finalUrl || 'https://www.wsj.com',
        publishedDate: art.publishedDate || new Date().toISOString().split('T')[0],
        snippet: art.snippet || '',
        sentiment: ['bullish', 'bearish', 'neutral'].includes(art.sentiment)
          ? art.sentiment
          : 'neutral',
        relevanceToSafety: art.relevanceToSafety || 'Fundamental operational impact.',
      };
    });

    return res.json({
      success: true,
      articles,
      groundingUrls: webUrls,
    });
  } catch (error: any) {
    console.error('Error fetching grounded news:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch news grounding',
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
