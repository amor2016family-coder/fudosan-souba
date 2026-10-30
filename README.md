# マンション相場ナビ（fudosan-souba）

国土交通省「不動産情報ライブラリ」の取引データから、市区町村・町名ごとの中古マンション相場ページを自動生成する静的サイト。

## しくみ

| 処理 | 担当 | 頻度 |
|---|---|---|
| データ取得（`npm run fetch`） | GitHub Actions | 毎週 |
| 集計（`npm run aggregate`）→ `data/site.json` | GitHub Actions | 毎週 |
| ページ生成・公開（Astro → Cloudflare Pages） | GitHub Actions | 毎週・解説文の更新時 |
| 解説文（`commentary/*.md`） | Claude Code 定期実行（`docs/commentary-routine.md`） | 毎日 |

## 手元で動かす

```bash
npm install
npm run sample      # 架空データを作る（APIキーが無いとき）
npm run aggregate
npm run build && npx astro preview
```

実データ：`REINFOLIB_API_KEY=xxxx npm run fetch` のあと `npm run aggregate`。

## 公開前に設定するもの

- `src/config.ts`：`SITE.url`（ドメイン）、`AFFILIATE.url`（一括査定の紹介リンク）
- GitHub の Secrets：`REINFOLIB_API_KEY`、`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`
- 対象地域を広げる：`scripts/lib.mjs` の `PREFECTURES`

## 対象地域を広げるときの注意

**1県ずつ足す。** 解説文は定期実行で1日30件しか書けないため、一度に何県も足すと解説文のないページが長く残る。
1県足したら、解説文が一巡するまで（神奈川県なら約13日）次を足さない。

足す手順：`PREFECTURES` に追加 → `npm run fetch` → `npm run aggregate` → `npm run build` で確認 → push。

町名ページの見込み枚数（直近1年の取引から推定。東京都は実測703枚）：
神奈川県 377（実測）／大阪府 約318／埼玉県 約148／千葉県 約142／福岡県 約107／愛知県 約67
