import { Ionicons } from '@expo/vector-icons';

export type IoniconName = keyof typeof Ionicons.glyphMap;

export interface Category {
  label: string;
  slug: string; // stable identity used for storage/selection (not sent to the API directly)
  icon: IoniconName;
  // Backend category slugs this card should query for (joined with ',' -> OR match).
  // The LLM tags articles with ~110 granular slugs; each card covers a group of them.
  backendSlugs: string[];
}

export const CATEGORIES: Category[] = [
  {
    label: 'Teknoloji',
    slug: 'teknoloji',
    icon: 'laptop-outline',
    backendSlugs: ['teknoloji', 'donanim', 'yazilim', 'bilisim', 'mobil', 'internet', 'siber', 'yapayzeka', 'cihaz', 'oyun', 'espor', 'girisim', 'yatirim', 'startup', 'eticaret', 'uygulama', 'sosyal', 'sunucu', 'ag', 'telekom'],
  },
  {
    label: 'Siyaset',
    slug: 'siyaset',
    icon: 'business-outline',
    backendSlugs: ['gundem', 'siyaset', 'politika', 'secim', 'meclis', 'diplomasi', 'hukumet', 'yerel', 'kuresel', 'hukuk', 'yargi', 'adalet', 'asayis', 'kriminal', 'kaza', 'afet', 'deprem', 'teror', 'guvenlik'],
  },
  {
    label: 'Spor',
    slug: 'spor',
    icon: 'football-outline',
    backendSlugs: ['spor', 'futbol', 'basketbol', 'voleybol', 'tenis', 'motor', 'atletizm', 'transfer', 'olimpiyat', 'hakem'],
  },
  {
    label: 'Ekonomi',
    slug: 'ekonomi',
    icon: 'trending-up-outline',
    backendSlugs: ['ekonomi', 'finans', 'borsa', 'piyasa', 'doviz', 'altin', 'kripto', 'enflasyon', 'faiz', 'vergi', 'istihdam', 'ihracat', 'sirket', 'emlak', 'tarim', 'enerji', 'ticaret', 'sanayi', 'kredi', 'fon'],
  },
  {
    label: 'Kültür-Sanat',
    slug: 'kultur-sanat',
    icon: 'color-palette-outline',
    backendSlugs: ['kultur', 'sanat', 'sinema', 'muzik', 'tiyatro', 'edebiyat', 'magazin', 'unluler', 'medya', 'televizyon', 'yasam', 'moda', 'guzellik', 'seyahat', 'turizm', 'yemek', 'astroloji', 'toplum', 'etkinlik', 'konser'],
  },
  {
    label: 'Sağlık',
    slug: 'saglik',
    icon: 'medkit-outline',
    backendSlugs: ['saglik', 'tip', 'hastalik', 'beslenme', 'psikoloji', 'egitim', 'akademi', 'universite', 'okul', 'sinav'],
  },
  {
    label: 'Dünya',
    slug: 'dunya',
    icon: 'earth-outline',
    backendSlugs: ['dunya'],
  },
  {
    label: 'Bilim',
    slug: 'bilim',
    icon: 'flask-outline',
    backendSlugs: ['bilim', 'uzay', 'doga', 'cevre', 'iklim', 'tarih', 'arkeoloji', 'biyoloji', 'fizik', 'havacilik'],
  },
];

const backendSlugsBySlug: Record<string, string[]> = Object.fromEntries(
  CATEGORIES.map(cat => [cat.slug, cat.backendSlugs])
);

// Turns a stored category identity (e.g. 'kultur-sanat') into the comma-joined
// backend `category` query value covering its whole group (e.g. 'kultur,sanat,...').
export function toBackendCategoryParam(slug: string): string {
  return (backendSlugsBySlug[slug] ?? [slug]).join(',');
}
