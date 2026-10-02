// ページの要約とよくある質問を、統計データだけから組み立てる。
// 検索エンジンとAI（ChatGPTやGeminiなど）に、ページの中身を正確に伝えるために使う。
import type { Stats } from './data';
import { man, unitMan, pct } from './format';

export function summaryPoints(place: string, s: Stats, year: number): string[] {
  const points: string[] = [];
  points.push(`${place}の中古マンションの取引価格は、${year}年の中央値で${man(s.price)}（㎡単価${unitMan(s.unitPrice)}）です。`);
  if (s.yoy != null) {
    const dir = s.yoy >= 0 ? '上昇' : '下落';
    points.push(`前年の㎡単価と比べて${pct(s.yoy)}の${dir}で、${year}年の取引件数は${s.latestYearCount.toLocaleString('ja-JP')}件でした。`);
  }
  const top = [...s.byPlan].sort((a, b) => b.count - a.count)[0];
  if (top) points.push(`取引が最も多い間取りは${top.plan}で、価格の中央値は${man(top.price)}（専有面積の中央値${top.area}㎡）です。`);
  const newest = s.byAge[0];
  const oldest = s.byAge.at(-1);
  if (newest && oldest && newest.label !== oldest.label) {
    points.push(`築年数別では${newest.label}が${unitMan(newest.unitPrice)}、${oldest.label}が${unitMan(oldest.unitPrice)}です。`);
  }
  return points;
}

export function faqItems(place: string, s: Stats, year: number): { q: string; a: string }[] {
  const items: { q: string; a: string }[] = [];
  items.push({
    q: `${place}の中古マンションの相場はいくらですか？`,
    a: `国土交通省が公表する${year}年の取引価格情報では、${place}の中古マンションの取引価格は中央値で${man(s.price)}、㎡単価は${unitMan(s.unitPrice)}です（${s.latestYearCount.toLocaleString('ja-JP')}件の取引を集計）。`,
  });
  if (s.yoy != null) {
    items.push({
      q: `${place}のマンション価格は上がっていますか、下がっていますか？`,
      a: `${year}年の㎡単価の中央値は前年比${pct(s.yoy)}でした。5年間の推移は、このページの価格推移グラフで確認できます。`,
    });
  }
  const plans = s.byPlan.filter((p) => ['1K', '1LDK', '2LDK', '3LDK'].includes(p.plan));
  if (plans.length) {
    items.push({
      q: `${place}では間取りごとにいくらで取引されていますか？`,
      a: plans.map((p) => `${p.plan}は中央値${man(p.price)}（${p.area}㎡）`).join('、') + 'です。過去5年間の取引から集計しています。',
    });
  }
  const newest = s.byAge[0];
  const oldest = s.byAge.at(-1);
  if (newest && oldest && newest.label !== oldest.label && newest.unitPrice > 0) {
    const diff = Math.round((1 - oldest.unitPrice / newest.unitPrice) * 100);
    items.push({
      q: `${place}では築年数で価格はどのくらい変わりますか？`,
      a: `㎡単価の中央値は、${newest.label}が${unitMan(newest.unitPrice)}、${oldest.label}が${unitMan(oldest.unitPrice)}で、約${diff}%の差があります。`,
    });
  }
  return items;
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };
}

// 掲載しているデータそのものの説明（AIや検索エンジンが出典をたどれるようにする）
export function datasetLd(place: string, s: Stats, url: string, generatedAt: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${place}の中古マンション取引価格の集計`,
    description: `${place}で実際に行われた中古マンションの取引${s.count.toLocaleString('ja-JP')}件（過去5年分）をもとに、価格・㎡単価・間取り別・築年数別の中央値を集計したデータです。`,
    url,
    inLanguage: 'ja',
    license: 'https://www.reinfolib.mlit.go.jp/help/termsOfUse/',
    isAccessibleForFree: true,
    dateModified: generatedAt.slice(0, 10),
    creator: { '@type': 'Organization', name: '住まい相場' },
    isBasedOn: {
      '@type': 'Dataset',
      name: '不動産情報ライブラリ（不動産取引価格情報）',
      creator: { '@type': 'GovernmentOrganization', name: '国土交通省' },
      url: 'https://www.reinfolib.mlit.go.jp/',
    },
  };
}
