// 不動産情報ライブラリAPI（XIT001）から、都道府県・四半期ごとに取引データを取得して data/raw に保存する
// 使い方: REINFOLIB_API_KEY=xxxx npm run fetch
import fs from 'node:fs';
import { PREFECTURES, YEARS_BACK, SAMPLE_FLAG, quartersBack, rawFile, writeJson } from './lib.mjs';

const API = 'https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001';
const KEY = process.env.REINFOLIB_API_KEY;
const WAIT_MS = 1500; // アクセス制限に配慮して間隔をあける
// 直近の四半期は後から件数が増えることがあるため、毎回取り直す
const REFRESH_RECENT = 2;

if (!KEY) {
  console.error('REINFOLIB_API_KEY が設定されていません');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchQuarter(prefCode, year, quarter) {
  const url = `${API}?year=${year}&quarter=${quarter}&area=${prefCode}&priceClassification=01&language=ja`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, { headers: { 'Ocp-Apim-Subscription-Key': KEY } });
    if (res.ok) {
      const body = await res.json();
      return body.data ?? [];
    }
    if (res.status === 404) return []; // 未公表の四半期
    console.warn(`  ${res.status} ${year}Q${quarter} (試行${attempt})`);
    await sleep(WAIT_MS * attempt * 2);
  }
  throw new Error(`取得失敗: ${prefCode} ${year}Q${quarter}`);
}

// サンプルデータが残っていたら消す（実データと混ざらないように）
if (fs.existsSync(SAMPLE_FLAG)) {
  fs.rmSync(new URL('../data/raw', import.meta.url), { recursive: true, force: true });
  console.log('サンプルデータを削除しました');
}

const quarters = quartersBack(YEARS_BACK);
for (const pref of PREFECTURES) {
  for (const [i, { year, quarter }] of quarters.entries()) {
    const file = rawFile(pref.code, year, quarter);
    const isRecent = i >= quarters.length - REFRESH_RECENT;
    if (fs.existsSync(file) && !isRecent) continue;
    const rows = await fetchQuarter(pref.code, year, quarter);
    writeJson(file, rows);
    console.log(`${pref.name} ${year}Q${quarter}: ${rows.length}件`);
    await sleep(WAIT_MS);
  }
}
