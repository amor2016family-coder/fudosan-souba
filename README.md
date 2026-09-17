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
