import fs from 'node:fs';
import path from 'node:path';

export type Stats = {
  count: number;
  latestYearCount: number;
  unitPrice: number | null;
  price: number | null;
  area: number | null;
  yoy: number | null;
  trend: { year: number; count: number; unitPrice: number | null }[];
  byPlan: { plan: string; count: number; price: number; area: number }[];
  byAge: { label: string; count: number; unitPrice: number; price: number }[];
  recent: { district: string; plan: string; area: number; price: number; buildYear: number | null; year: number; quarter: number }[];
};
export type Prefecture = { code: string; name: string; slug: string; cities: string[]; stats: Stats };
export type City = { prefSlug: string; code: string; name: string; districts: string[]; stats: Stats };
export type District = { prefSlug: string; cityCode: string; cityName: string; name: string; stats: Stats };
export type SiteData = {
  generatedAt: string;
  isSample: boolean;
  latest: { year: number; quarter: number };
  prefectures: Prefecture[];
  cities: City[];
  districts: District[];
};

export const data: SiteData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'site.json'), 'utf8'));

export const prefBySlug = (slug: string) => data.prefectures.find((p) => p.slug === slug)!;
export const cityByCode = (code: string) => data.cities.find((c) => c.code === code)!;

// AIが書いた解説文（commentary/{市区町村コード}.md または {コード}-{町名}.md）があれば読む
export function commentary(key: string): string | null {
  const file = path.join(process.cwd(), 'commentary', `${key}.md`);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, 'utf8').replace(/^---[\s\S]*?---\s*/, '').trim() || null;
}
