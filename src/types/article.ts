export interface Article {
  id: number;
  url: string;
  title: string;
  description: string;
  body: string;
  author: string;
  category: string;
  tags: string[];
  word_count: number;
  publication_date: string;
  last_modified: string;
  image_url: string | null;
  source: string;
  language: string;
  created_at: string;
  updated_at: string;
  enriched: boolean;
}

export interface Pagination {
  limit: number;
  offset: number;
  total: number;
}

export interface Source {
  slug: string;
  name: string;
  logo_url: string;
}

export interface SourcesResponse {
  data: Source[];
}

export interface ArticlesResponse {
  data: Article[];
  pagination: Pagination;
}

export interface ArticleResponse {
  data: Article;
}
