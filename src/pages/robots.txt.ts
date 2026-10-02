import { SITE } from '../config';
import { data } from '../lib/data';

export function GET() {
  // サンプルデータのあいだは検索エンジンに載せない
  const body = data.isSample
    ? 'User-agent: *\nDisallow: /\n'
    // AIの検索・回答に引用されることを狙うため、主要なAIクローラーも明示的に許可する
    : [
        'User-agent: *',
        'Allow: /',
        '',
        ...['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User',
            'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Bingbot', 'CCBot']
          .flatMap((ua) => [`User-agent: ${ua}`, 'Allow: /', '']),
        `Sitemap: ${new URL('/sitemap.xml', SITE.url).href}`,
        '',
      ].join('\n');
  return new Response(body);
}
