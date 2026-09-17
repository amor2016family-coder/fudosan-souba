// 金額などの表示用フォーマット
export function man(yen: number | null | undefined): string {
  if (yen == null) return '—';
  const m = Math.round(yen / 10000);
  if (m >= 10000) {
    const oku = Math.floor(m / 10000);
    const rest = m % 10000;
    return rest ? `${oku}億${rest.toLocaleString('ja-JP')}万円` : `${oku}億円`;
  }
  return `${m.toLocaleString('ja-JP')}万円`;
}

export const unitMan = (yen: number | null | undefined) =>
  yen == null ? '—' : `${(yen / 10000).toFixed(1)}万円/㎡`;

export const tsuboMan = (yen: number | null | undefined) =>
  yen == null ? '—' : `${Math.round((yen * 3.30579) / 10000).toLocaleString('ja-JP')}万円/坪`;

export function pct(r: number | null | undefined): string {
  if (r == null) return '—';
  const v = (r * 100).toFixed(1);
  return r > 0 ? `+${v}%` : `${v}%`;
}

export const period = (year: number, quarter: number) => `${year}年${(quarter - 1) * 3 + 1}〜${quarter * 3}月`;
