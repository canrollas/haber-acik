import { fetchArticles } from './api';
import { Article } from '../types/article';
import { toBackendCategoryParam } from '../data/categories';

function dedupeSortedByDate(articles: Article[]): Article[] {
  const seen = new Set<number>();
  const unique = articles.filter(a => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
  return unique.sort((a, b) => {
    const dateA = new Date(a.publication_date || a.created_at).getTime();
    const dateB = new Date(b.publication_date || b.created_at).getTime();
    return dateB - dateA;
  });
}

// The API matches one source value per request (no OR / comma support for
// `source`), so a personalized feed needs one request per followed source.
// `category` does support comma-joined OR matching, so all selected category
// cards' backend slug groups are combined into a single request. With no
// preferences set, it just falls back to the general latest-articles feed.
export async function fetchPersonalizedArticles(
  followedSources: string[],
  selectedCategories: string[],
  perQueryLimit: number
): Promise<Article[]> {
  if (followedSources.length === 0 && selectedCategories.length === 0) {
    const response = await fetchArticles({ limit: perQueryLimit });
    return response.data;
  }

  const categoryParam = selectedCategories.map(toBackendCategoryParam).join(',');

  // Promise.all yerine allSettled: kötü/yavaş bir ağda birden fazla kaynak
  // sorgulanırken bunlardan biri zaman aşımına uğrarsa tüm feed'in çökmesi
  // yerine, başarılı olan diğer kaynaklardan gelen haberler yine gösterilir.
  const settled = await Promise.allSettled([
    ...followedSources.map(source => fetchArticles({ source, limit: perQueryLimit })),
    ...(categoryParam ? [fetchArticles({ category: categoryParam, limit: perQueryLimit })] : []),
  ]);

  const fulfilled = settled.filter(
    (r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof fetchArticles>>> => r.status === 'fulfilled'
  );
  if (fulfilled.length === 0 && settled.length > 0) {
    throw (settled[0] as PromiseRejectedResult).reason;
  }

  return dedupeSortedByDate(fulfilled.flatMap(r => r.value.data));
}
