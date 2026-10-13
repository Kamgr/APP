/**
 * Company news from a real feed, restricted to credible outlets.
 *
 * Design rule: every URL returned here comes from the feed itself. No model is
 * ever asked to write or "recall" a link, and there is no fallback URL. If the
 * feed has nothing, we return nothing.
 */

// ---------------------------------------------------------------------------
// Credible-source allowlist (domain -> display name). Edit freely.
// An article is shown only if the publisher domain reported by the feed
// matches one of these (exact host or any subdomain).
// ---------------------------------------------------------------------------
export const CREDIBLE_SOURCES: Record<string, string> = {
  'reuters.com': 'Reuters',
  'bloomberg.com': 'Bloomberg',
  'wsj.com': 'The Wall Street Journal',
  'ft.com': 'Financial Times',
  'nytimes.com': 'The New York Times',
  'apnews.com': 'Associated Press',
  'cnbc.com': 'CNBC',
  'barrons.com': "Barron's",
  'marketwatch.com': 'MarketWatch',
  'washingtonpost.com': 'The Washington Post',
  'economist.com': 'The Economist',
};

export type NewsTopic =
  | 'Earnings & guidance'
  | 'Debt & credit'
  | 'Regulatory & legal'
  | 'Capital allocation'
  | 'Leadership & workforce'
  | 'Supply & demand';

export interface FeedArticle {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedDate: string; // YYYY-MM-DD
  topics: NewsTopic[];
}

// Keywords that indicate a story is likely to matter for an investment decision.
const TOPIC_PATTERNS: Array<[NewsTopic, RegExp]> = [
  ['Earnings & guidance', /\b(earnings|revenue|profit|guidance|forecast|outlook|quarter(ly)?|results|margin|sales)\b/i],
  ['Debt & credit', /\b(debt|bonds?|credit|downgrade[sd]?|upgrade[sd]?|rating|refinanc\w*|loans?|default|bankrupt\w*|liquidity)\b/i],
  ['Regulatory & legal', /\b(antitrust|lawsuit|sues?|sued|probe|investigat\w*|fines?|fined|regulat\w*|sec|doj|ftc|settle\w*|ruling|court)\b/i],
  ['Capital allocation', /\b(buybacks?|repurchase\w*|dividends?|acqui\w*|merger|spin-?off|capex|capital expenditure)\b/i],
  ['Leadership & workforce', /\b(ceo|cfo|resign\w*|steps down|layoffs?|job cuts|restructur\w*)\b/i],
  ['Supply & demand', /\b(tariffs?|supply chain|shortage|recall|demand)\b/i],
];

// ---------------------------------------------------------------------------
// Small RSS helpers (no dependency; Google News RSS is simple and regular)
// ---------------------------------------------------------------------------
function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

function tagText(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? decodeEntities(m[1]) : '';
}

function sourceTag(block: string): { name: string; url: string } {
  const m = block.match(/<source(?:\s+url="([^"]*)")?[^>]*>([\s\S]*?)<\/source>/i);
  return m ? { url: decodeEntities(m[1] || ''), name: decodeEntities(m[2]) } : { url: '', name: '' };
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

/** Returns the allowlisted domain a host belongs to, or null. */
export function matchCredibleDomain(host: string): string | null {
  for (const domain of Object.keys(CREDIBLE_SOURCES)) {
    if (host === domain || host.endsWith(`.${domain}`)) return domain;
  }
  return null;
}

export interface RawFeedItem {
  title: string;
  link: string;
  pubDate: string;
  sourceName: string;
  sourceUrl: string;
}

export function parseRss(xml: string): RawFeedItem[] {
  const items: RawFeedItem[] = [];
  const re = /<item>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const block = m[1];
    const src = sourceTag(block);
    items.push({
      title: tagText(block, 'title'),
      link: tagText(block, 'link'),
      pubDate: tagText(block, 'pubDate'),
      sourceName: src.name,
      sourceUrl: src.url,
    });
  }
  return items;
}

// ---------------------------------------------------------------------------
// Company matching
// ---------------------------------------------------------------------------
const CORP_SUFFIX = /[,.]?\s+(inc|incorporated|corp|corporation|co|company|ltd|plc|holdings|group)\.?$/i;

export function shortCompanyName(companyName: string): string {
  let name = (companyName || '').trim();
  // strip repeatedly: "Foo Holdings Inc." -> "Foo"
  for (let i = 0; i < 3 && CORP_SUFFIX.test(name); i++) name = name.replace(CORP_SUFFIX, '').trim();
  return name;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** True if the headline plainly refers to the company (name, or a distinctive ticker). */
export function isAboutCompany(title: string, companyName: string, ticker: string): boolean {
  const name = shortCompanyName(companyName);
  if (name.length >= 2 && new RegExp(`\\b${escapeRegExp(name)}\\b`, 'i').test(title)) return true;
  // Short tickers (F, T, A ...) collide with ordinary words, so only trust 3+ letters, case-sensitive.
  if (ticker && ticker.length >= 3 && new RegExp(`\\b${escapeRegExp(ticker)}\\b`).test(title)) return true;
  return false;
}

export function buildQuery(companyName: string, ticker: string, days: number): string {
  const name = shortCompanyName(companyName);
  const who = [name && `"${name}"`, ticker].filter(Boolean).join(' OR ');
  const sites = Object.keys(CREDIBLE_SOURCES)
    .map((d) => `site:${d}`)
    .join(' OR ');
  return `(${who}) (${sites}) when:${days}d`;
}

function classify(title: string): NewsTopic[] {
  return TOPIC_PATTERNS.filter(([, re]) => re.test(title)).map(([topic]) => topic);
}

function daysAgo(dateStr: string, now: Date): number {
  return (now.getTime() - new Date(dateStr).getTime()) / 86_400_000;
}

function shortHash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

function normalizeTitle(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9 ]+/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Keep only real, allowlisted, company-relevant, de-duplicated, recent items,
 * then rank decision-relevant stories first.
 */
export function selectArticles(
  raw: RawFeedItem[],
  opts: { companyName: string; ticker: string; days: number; limit: number; now?: Date }
): FeedArticle[] {
  const now = opts.now ?? new Date();
  const seen = new Set<string>();
  const out: Array<FeedArticle & { score: number }> = [];

  for (const item of raw) {
    if (!item.title || !item.link) continue;

    // Publisher must be on the allowlist, judged by the domain the feed reports.
    const domain = matchCredibleDomain(hostOf(item.sourceUrl));
    if (!domain) continue;

    // Link must be a real http(s) URL.
    if (!/^https?:\/\//i.test(item.link)) continue;

    const time = new Date(item.pubDate);
    if (Number.isNaN(time.getTime())) continue;
    const publishedDate = time.toISOString().slice(0, 10);
    const age = daysAgo(publishedDate, now);
    if (age > opts.days || age < -1) continue;

    // Google appends " - Publisher" to titles; drop it since we show the source separately.
    const title = item.title
      .replace(new RegExp(`\\s+[-–—|]\\s+${escapeRegExp(item.sourceName)}$`, 'i'), '')
      .trim();

    if (!isAboutCompany(title, opts.companyName, opts.ticker)) continue;

    const key = normalizeTitle(title);
    if (seen.has(key)) continue;
    seen.add(key);

    const topics = classify(title);
    const recency = age <= 3 ? 1.5 : age <= 7 ? 1 : age <= 14 ? 0.5 : 0;
    out.push({
      id: `news-${domain}-${time.getTime()}-${shortHash(key)}`,
      title,
      source: CREDIBLE_SOURCES[domain],
      url: item.link,
      publishedDate,
      topics,
      score: topics.length + recency,
    });
  }

  out.sort((a, b) => b.score - a.score || b.publishedDate.localeCompare(a.publishedDate));
  return out.slice(0, opts.limit).map(({ score: _score, ...a }) => a);
}

// ---------------------------------------------------------------------------
// Fetch (with a small in-memory cache so we are polite to the feed)
// ---------------------------------------------------------------------------
const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, { at: number; articles: FeedArticle[] }>();

export async function fetchCompanyNews(
  companyName: string,
  ticker: string,
  opts: { days?: number; limit?: number } = {}
): Promise<{ articles: FeedArticle[]; cached: boolean }> {
  const days = opts.days ?? 30;
  const limit = opts.limit ?? 12;
  const cacheKey = `${ticker}|${companyName}|${days}`.toLowerCase();

  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return { articles: hit.articles, cached: true };

  const q = encodeURIComponent(buildQuery(companyName, ticker, days));
  const url = `https://news.google.com/rss/search?q=${q}&hl=en-US&gl=US&ceid=US:en`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10_000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FinancialRiskEngine/1.0)' },
    });
    if (!res.ok) throw new Error(`News feed returned HTTP ${res.status}`);
    const xml = await res.text();
    if (!/<rss[\s>]/i.test(xml)) throw new Error('News feed returned an unexpected response');

    const articles = selectArticles(parseRss(xml), { companyName, ticker, days, limit });
    cache.set(cacheKey, { at: Date.now(), articles });
    return { articles, cached: false };
  } finally {
    clearTimeout(timer);
  }
}
