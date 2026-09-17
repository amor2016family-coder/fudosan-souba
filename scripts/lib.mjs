// 取得・生成・集計スクリプトで共通に使う設定と小道具
import fs from 'node:fs';
import path from 'node:path';

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
export const RAW_DIR = path.join(ROOT, 'data', 'raw');
export const SITE_DATA = path.join(ROOT, 'data', 'site.json');
export const SAMPLE_FLAG = path.join(RAW_DIR, 'SAMPLE');

// 対象の都道府県（まずは東京都のみ。広げるときはここに追加）
export const PREFECTURES = [{ code: '13', name: '東京都', slug: 'tokyo' }];

// 何年分さかのぼって取得・集計するか
export const YEARS_BACK = 5;

// 対象とする取引の種類
export const TARGET_TYPE = '中古マンション等';

export function quartersBack(years, now = new Date()) {
  // 公表は取引から約3ヶ月遅れのため、2四半期前を最新として扱う
  let y = now.getFullYear();
  let q = Math.floor(now.getMonth() / 3) + 1 - 2;
  while (q < 1) { q += 4; y -= 1; }
  const out = [];
  for (let i = 0; i < years * 4; i++) {
    out.unshift({ year: y, quarter: q });
    q -= 1;
    if (q < 1) { q = 4; y -= 1; }
  }
  return out;
}

export function rawFile(prefCode, year, quarter) {
  return path.join(RAW_DIR, prefCode, `${year}Q${quarter}.json`);
}

export function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data));
}

export function readJson(file, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}
