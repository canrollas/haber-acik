export const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80&fm=jpg';

export function getValidImageUrl(url: string | null | undefined): string {
  if (!url || url.trim() === '' || url === 'null' || url === 'undefined') {
    return FALLBACK_IMAGE;
  }
  
  if (url.startsWith('//')) {
    return `https:${url}`;
  }

  return url;
}

export function getValidLogoUrl(url: string | null | undefined): string | null {
  if (!url || url.trim() === '' || url === 'null' || url === 'undefined') {
    return null;
  }
  
  if (url.startsWith('//')) {
    return `https:${url}`;
  }

  return url;
}

