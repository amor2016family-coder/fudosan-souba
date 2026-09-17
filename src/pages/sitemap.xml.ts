import { SITE } from '../config';
import { data } from '../lib/data';

export function GET() {
  const paths = [
    '/',
    ...data.prefectures.map((p) => `/${p.slug}/`),
    ...data.cities.map((c) => `/${c.prefSlug}/${c.code}/`),
    ...data.districts.map((d) => `/${d.prefSlug}/${d.cityCode}/${encodeURIComponent(d.name)}/`),
  ];
  const lastmod = data.generatedAt.slice(0, 10);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${new URL(p, SITE.url).href}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n')}
</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
