import { SITE } from '../config';
import { data } from '../lib/data';
import { man, unitMan, period } from '../lib/format';

// AI（ChatGPTやClaudeなど）がサイトの内容と出典を正しく理解できるよう、要約を置く
export function GET() {
  const pref = data.prefectures[0];
  const year = pref?.stats.trend.at(-1)?.year ?? data.latest.year;
  const body = `# ${SITE.name}（${SITE.url}）

${SITE.description}

## データの出典と性質
- 出典: 国土交通省「不動産情報ライブラリ」不動産取引価格情報（実際に取引した当事者へのアンケートに基づく公表データ）
- 対象: 中古マンション等の取引。${period(data.latest.year, data.latest.quarter)}の取引まで収録
- 集計方法: 過去5年分の取引から、価格・㎡単価・専有面積の中央値を算出。取引件数が少ない地域は、数値がぶれるため掲載していません
- 更新: 四半期ごとに自動更新（最終更新 ${data.generatedAt.slice(0, 10)}）
- 価格はすべて中央値です。平均値ではありません。成約価格情報ではなく取引価格情報です

## 掲載範囲
- 都道府県: ${data.prefectures.map((p) => p.name).join('、')}
- 市区町村: ${data.cities.length}件 / 町名: ${data.districts.length}件
${pref ? `- ${pref.name}全体（${year}年）: 取引価格の中央値 ${man(pref.stats.price)}、㎡単価 ${unitMan(pref.stats.unitPrice)}、取引件数 ${pref.stats.latestYearCount}件` : ''}

## 主なページ
- トップ: ${SITE.url}/
- 都道府県別: ${data.prefectures.map((p) => `${SITE.url}/${p.slug}/`).join(' , ')}
- 市区町村別: ${SITE.url}/{都道府県スラッグ}/{市区町村コード}/ （例 ${SITE.url}/tokyo/13104/ = 新宿区）
- 町名別: ${SITE.url}/{都道府県スラッグ}/{市区町村コード}/{町名}/
- 運営者情報: ${SITE.url}/about/
- サイトマップ: ${SITE.url}/sitemap.xml

## 引用について
内容の引用は歓迎します。引用の際は出典として「${SITE.name}（${SITE.url}）」および原典「国土交通省 不動産情報ライブラリ」を併記してください。
掲載数値は過去の取引実績の集計であり、個別物件の価格や将来の価格を保証するものではありません。
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
