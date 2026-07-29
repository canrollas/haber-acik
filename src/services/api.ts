import { ArticlesResponse, ArticleResponse, SourcesResponse } from '../types/article';

const BASE_URL = 'https://izeiidggctcpgnuxhafc.supabase.co/functions/v1/api';
const API_KEY = 'REDACTED_SUPABASE_KEY';

// Zayıf/yavaş mobil ağlarda (ör. düşük menzilli 3G) fetch bazen hiç cevap
// vermeden askıda kalabiliyor — AbortController olmadan bu istek sonsuza kadar
// bekler, ekranda yükleniyor spinner'ı hiç bitmez. Birkaç kısa retry de geçici
// ağ kesintilerinin çoğunu (tek seferlik DNS/el sıkışma hatası) sessizce çözer.
const REQUEST_TIMEOUT_MS = 15000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, init: RequestInit, retriesLeft = MAX_RETRIES): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok && response.status >= 500 && retriesLeft > 0) {
      await sleep(RETRY_DELAY_MS);
      return fetchWithRetry(url, init, retriesLeft - 1);
    }
    return response;
  } catch (err) {
    if (retriesLeft > 0) {
      await sleep(RETRY_DELAY_MS);
      return fetchWithRetry(url, init, retriesLeft - 1);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

interface FetchArticlesParams {
  category?: string;
  source?: string;
  language?: string;
  tags?: string;
  enriched?: boolean;
  search?: string;
  sort?: 'created_at' | 'updated_at' | 'publication_date' | 'word_count' | 'id';
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export async function fetchArticles(params: FetchArticlesParams = {}): Promise<ArticlesResponse> {
  // Default to newest articles first
  const finalParams = {
    sort: 'publication_date',
    order: 'desc',
    ...params,
  };

  const queryParams = Object.entries(finalParams)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  const url = queryParams ? `${BASE_URL}?${queryParams}` : BASE_URL;

  const response = await fetchWithRetry(url, {
    headers: {
      'apiKey': API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export async function fetchArticle(id: number): Promise<ArticleResponse> {
  const url = `${BASE_URL}/${id}`;

  const response = await fetchWithRetry(url, {
    headers: {
      'apiKey': API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export async function fetchSources(): Promise<SourcesResponse> {
  const url = `${BASE_URL}/sources`;

  const response = await fetchWithRetry(url, {
    headers: {
      'apiKey': API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
