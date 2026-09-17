import { SITE } from '../config';
import { data } from '../lib/data';

export function GET() {
  // サンプルデータのあいだは検索エンジンに載せない
  const body = data.isSample
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', SITE.url).href}\n`;
  return new Response(body);
}
