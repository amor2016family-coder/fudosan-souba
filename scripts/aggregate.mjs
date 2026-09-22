// data/raw の取引データを、サイトで使う統計（data/site.json）にまとめる
import fs from 'node:fs';
import {
  PREFECTURES, YEARS_BACK, TARGET_TYPE, SAMPLE_FLAG, SITE_DATA,
  quartersBack, rawFile, readJson, writeJson,
} from './lib.mjs';

// これより件数が少ない集計値は、ぶれが大きいので表示しない
const MIN_COUNT = 5;
// 町名ページを作る条件（薄いページを量産しないため）：5年で30件以上、かつ最新年の価格が出せること
const MIN_DISTRICT_COUNT = 30;

const toNum = (s) => {
  const n = parseFloat(String(s ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : null;
};

function parsePeriod(s) {
  const m = /(\d{4})年第(\d)四半期/.exec(s ?? '');
  return m ? { year: +m[1], quarter: +m[2] } : null;
}

function normalize(row) {
  const period = parsePeriod(row.Period);
  const price = toNum(row.TradePrice);
  const area = toNum(row.Area);
  if (!period || !price || !area) return null;
  const buildYear = /^\d{4}年$/.test(row.BuildingYear ?? '') ? parseInt(row.BuildingYear, 10) : null;
  return {
    cityCode: row.MunicipalityCode,
    cityName: row.Municipality,
    district: (row.DistrictName ?? '').trim(),
    plan: (row.FloorPlan ?? '').normalize('NFKC'),
    area,
    price,
    unitPrice: price / area,
    buildYear,
    age: buildYear ? period.year - buildYear : null,
    year: period.year,
    quarter: period.quarter,
  };
}

function median(values) {
  if (values.length < MIN_COUNT) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

const AGE_BANDS = [
  { label: '築10年以内', min: 0, max: 10 },
  { label: '築11〜20年', min: 11, max: 20 },
  { label: '築21〜30年', min: 21, max: 30 },
  { label: '築31年以上', min: 31, max: Infinity },
];
const PLAN_ORDER = ['1R', '1K', '1DK', '1LDK', '2K', '2DK', '2LDK', '3LDK', '4LDK'];

function stats(rows, latestYear) {
  const unit = (rs) => median(rs.map((r) => r.unitPrice));
  const lastYear = rows.filter((r) => r.year === latestYear);
  const prevYear = rows.filter((r) => r.year === latestYear - 1);
  const cur = unit(lastYear);
  const prev = unit(prevYear);

  // 四半期がそろった年だけを推移に使う（途中の年は件数が少なく見え、誤解を招くため）
  const trend = FULL_YEARS.map((y) => {
    const rs = rows.filter((r) => r.year === y);
    return { year: y, count: rs.length, unitPrice: unit(rs) };
  });

  const byPlan = PLAN_ORDER.map((plan) => {
    const rs = rows.filter((r) => r.plan === plan);
    return { plan, count: rs.length, price: median(rs.map((r) => r.price)), area: median(rs.map((r) => r.area)) };
  }).filter((p) => p.price !== null);

  const byAge = AGE_BANDS.map(({ label, min, max }) => {
    const rs = rows.filter((r) => r.age !== null && r.age >= min && r.age <= max);
    return { label, count: rs.length, unitPrice: unit(rs), price: median(rs.map((r) => r.price)) };
  }).filter((a) => a.unitPrice !== null);

  const recent = [...rows]
    .sort((a, b) => b.year - a.year || b.quarter - a.quarter)
    .slice(0, 15)
    .map(({ district, plan, area, price, buildYear, year, quarter }) => ({ district, plan, area, price, buildYear, year, quarter }));

  return {
    count: rows.length,
    latestYearCount: lastYear.length,
    unitPrice: cur,
    price: median(lastYear.map((r) => r.price)),
    area: median(lastYear.map((r) => r.area)),
    yoy: cur && prev ? (cur - prev) / prev : null,
    trend,
    byPlan,
    byAge,
    recent,
  };
}

const quarters = quartersBack(YEARS_BACK);
const latest = quarters.at(-1);
const FULL_YEARS = [...new Set(quarters.map((q) => q.year))]
  .filter((y) => quarters.filter((q) => q.year === y).length === 4);
const site = {
  generatedAt: new Date().toISOString(),
  isSample: fs.existsSync(SAMPLE_FLAG),
  latest,
  prefectures: [],
  cities: [],
  districts: [],
};

for (const pref of PREFECTURES) {
  const rows = quarters
    .flatMap(({ year, quarter }) => readJson(rawFile(pref.code, year, quarter), []))
    .filter((r) => r.Type === TARGET_TYPE)
    .map(normalize)
    .filter(Boolean);
  if (!rows.length) continue;

  // 最新年は「直近4四半期」ではなく暦年で比較する（四半期の偏りを避けるため、最新の完全な年を使う）
  const latestFullYear = latest.quarter === 4 ? latest.year : latest.year - 1;

  const cityCodes = [...new Set(rows.map((r) => r.cityCode))].sort();
  const cities = cityCodes.map((code) => {
    const rs = rows.filter((r) => r.cityCode === code);
    const districts = [...new Set(rs.map((r) => r.district))]
      .filter((d) => d && rs.filter((r) => r.district === d).length >= MIN_DISTRICT_COUNT)
      .map((name) => ({
        prefSlug: pref.slug,
        cityCode: code,
        cityName: rs[0].cityName,
        name,
        stats: stats(rs.filter((r) => r.district === name), latestFullYear),
      }))
      .filter((d) => d.stats.price !== null)
      // 漢字の並び順は読みと一致しないため、取引の多い町を上に並べる
      .sort((a, b) => b.stats.count - a.stats.count);
    const districtNames = districts.map((d) => d.name);
    site.districts.push(...districts);
    return {
      prefSlug: pref.slug,
      code,
      name: rs[0].cityName,
      districts: districtNames,
      stats: stats(rs, latestFullYear),
    };
  });
  // 最新年の価格が出せない（取引が少なすぎる）市区町村はページを作らない
  const shown = cities.filter((c) => c.stats.price !== null);
  site.cities.push(...shown);
  site.prefectures.push({
    ...pref,
    cities: shown.map((c) => c.code),
    stats: stats(rows, latestFullYear),
  });
}

writeJson(SITE_DATA, site);
console.log(
  `集計完了: ${site.prefectures.length}都道府県 / ${site.cities.length}市区町村 / ${site.districts.length}町名` +
  (site.isSample ? '（サンプルデータ）' : ''),
);
