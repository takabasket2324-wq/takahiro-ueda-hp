# TAKAHIRO UEDA | AI Consultant サイト

静的HTMLサイトです。ローカルでプレビューしながら編集できる環境を用意しています。

## 編集のはじめ方

### 1. 初回だけ（依存パッケージの準備）

```bash
npm install
```

### 2. プレビューを起動

```bash
npm run dev
```

ブラウザで `http://localhost:5500` が自動で開きます。
HTMLやCSSを保存すると、**自動でブラウザが更新**されます（ライブリロード）。

止めるときはターミナルで `Ctrl + C`。

## どこを編集する？

| 編集したい内容 | ファイル |
| --- | --- |
| トップページ（物語型・2026-10-24から：幕開け→第1幕（口コミの数字）→導入実績2社→3段→やらないこと→紹介動画→note→つくっている人→無料診断） | `index.html`（見た目 `css/style.css`＋`css/story.css`・動き `js/main.js`＋`js/story.js`） |
| プロフィール | `profile.html` |
| お問い合わせ（LINE・メール・X・フォーム） | `contact.html` |
| 旧ページ（トップへ自動で移る案内だけ。古いリンク対策で残している） | `services.html`・`flow.html` |
| 見本：映画型トップ（2026-10-24・方向の確認用・未公開。ほかのページからリンクしていない） | `story-sample.html`（見た目 `css/story-sample.css`・動き `js/story-sample.js`） |
| 見た目・色・レイアウト | `css/style.css` |
| 動き（メニュー・数字の数えあがり・3段の図・スクロールで出る動き） | `js/main.js`（数字の図の見た目は `css/style.css` の最後「2026-10-24」の段） |

文章を変えたいときは、各HTMLファイルの該当する文字を書き換えて保存するだけです。

## 数字を差し替えるとき（トップの第1幕・口コミの数字）

`index.html` の第1幕（`nums-val`・棒の `--w`・`+47`・`4.8`）と注記の文、`js/story.js` の `160 + 47`（数えあがりの始まりと増えた数）をそろえる。評価の星は `4.8` のとき塗る幅 `95.6%`（`css/story.css`）。

## 物語型への差し替え（2026-10-24 済み）

上田さんの決定で、物語型（元 `story.html`）を `index.html` にした。検索に出さない設定（noindex）は外し、GA4（G-TEECL2GE5N）は `<script>document.documentElement.classList.add('js');</script>` のすぐ下に移した。差し替える前のトップの控え＝`~/Desktop/ai-company-kit/logs/HP演出/差し替え前_トップ_20261024/index.html`（git の履歴にも残っている）。
