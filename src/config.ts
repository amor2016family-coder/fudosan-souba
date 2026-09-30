// サイト全体の設定。ドメインや紹介リンクが決まったらここを書き換える
export const SITE = {
  name: '住まい相場',
  url: 'https://sumaisouba.com',
  description: '国土交通省の実際の取引データから、市区町村・町名ごとの中古マンション相場を毎四半期更新でお届けします。',
};

// 売却査定の紹介リンク（A8.net）。url が空のあいだはボタンを表示しない
export const AFFILIATE = {
  url: 'https://px.a8.net/svt/ejp?a8mat=4BCMO3+90H9GY+53AC+1BN3TU',
  // A8.netの成果計測用画像（1x1）。ページに1回だけ読み込む
  impression: 'https://www13.a8.net/0.gif?a8mat=4BCMO3+90H9GY+53AC+1BN3TU',
  label: '無料で一括査定を依頼する',
  lead: 'いくらで売れる？ 複数の不動産会社の査定額を無料で比較できます。',
};

// 補助の紹介リンク（空き家・借地権など、通常の査定が難しい物件向け）。控えめな文字リンクで1か所だけ置く
export const AFFILIATE_SUB = {
  url: 'https://px.a8.net/svt/ejp?a8mat=4BCMO3+9CDXKI+5TF6+5YJRM',
  impression: 'https://www14.a8.net/0.gif?a8mat=4BCMO3+9CDXKI+5TF6+5YJRM',
  lead: '空き家・借地権・再建築不可など、通常の査定が難しい物件をお持ちの方は',
  label: '買取の相談もできます',
};

// 不動産情報ライブラリAPI利用規約で求められるクレジット表示
export const CREDIT =
  'このサービスは、国土交通省の不動産情報ライブラリのAPI機能を使用していますが、提供情報の最新性、正確性、完全性等が保証されたものではありません。';
