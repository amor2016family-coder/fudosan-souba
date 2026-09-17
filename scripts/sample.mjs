// APIキーが届くまでの動作確認用に、APIと同じ形の「架空の」取引データを作る
// ※このデータは実在しません。公開してはいけません（ページに警告帯が出ます）
import fs from 'node:fs';
import { RAW_DIR, SAMPLE_FLAG, TARGET_TYPE, YEARS_BACK, quartersBack, rawFile, writeJson } from './lib.mjs';

const CITIES = [
  { code: '13104', name: '新宿区', base: 120, districts: ['高田馬場', '西新宿', '神楽坂', '大久保', '四谷'] },
  { code: '13113', name: '渋谷区', base: 150, districts: ['恵比寿', '代々木', '笹塚', '広尾'] },
  { code: '13112', name: '世田谷区', base: 95, districts: ['三軒茶屋', '経堂', '二子玉川', '用賀', '桜新町'] },
  { code: '13120', name: '練馬区', base: 65, districts: ['練馬', '石神井町', '大泉学園町', '光が丘'] },
  { code: '13111', name: '大田区', base: 75, districts: ['蒲田', '大森北', '田園調布', '池上'] },
];
const PLANS = [
  { plan: '１Ｋ', area: [18, 28] },
  { plan: '１ＬＤＫ', area: [35, 50] },
  { plan: '２ＬＤＫ', area: [50, 70] },
  { plan: '３ＬＤＫ', area: [65, 90] },
];

let seed = 42;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const between = (a, b) => a + (b - a) * rand();
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

fs.rmSync(RAW_DIR, { recursive: true, force: true });
const quarters = quartersBack(YEARS_BACK);
for (const [qi, { year, quarter }] of quarters.entries()) {
  const growth = 1 + qi * 0.012; // 四半期ごとに少しずつ上昇
  const rows = [];
  for (const city of CITIES) {
    const n = 25 + Math.floor(rand() * 20);
    for (let i = 0; i < n; i++) {
      const district = pick(city.districts);
      const { plan, area: [amin, amax] } = pick(PLANS);
      const area = Math.round(between(amin, amax) / 5) * 5;
      const buildYear = Math.round(between(1975, year));
      const ageFactor = 1 - Math.min(40, year - buildYear) * 0.012;
      const unit = city.base * 10000 * growth * ageFactor * between(0.85, 1.15);
      const price = Math.round((unit * area) / 100000) * 100000;
      rows.push({
        PriceCategory: '不動産取引価格情報',
        Type: TARGET_TYPE,
        Region: '',
        MunicipalityCode: city.code,
        Prefecture: '東京都',
        Municipality: city.name,
        DistrictName: district,
        TradePrice: String(price),
        PricePerUnit: '',
        FloorPlan: plan,
        Area: String(area),
        UnitPrice: '',
        BuildingYear: `${buildYear}年`,
        Structure: 'ＲＣ',
        Use: '住宅',
        Purpose: '住宅',
        CityPlanning: '商業地域',
        CoverageRatio: '80',
        FloorAreaRatio: '400',
        Period: `${year}年第${quarter}四半期`,
        Renovation: rand() > 0.7 ? '改装済み' : '',
        Remarks: '',
        DistrictCode: '',
      });
    }
  }
  writeJson(rawFile('13', year, quarter), rows);
}
fs.writeFileSync(SAMPLE_FLAG, 'このフォルダのデータは架空のサンプルです\n');
console.log(`サンプルデータを作成しました（${quarters.length}四半期分）`);
