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
| トップページ | `index.html` |
| サービス紹介 | `services.html` |
| 料金・流れ | `flow.html` |
| プロフィール | `profile.html` |
| お問い合わせ | `contact.html` |
| 見た目・色・レイアウト | `css/style.css` |
| 動き（メニュー等） | `js/main.js` |

文章を変えたいときは、各HTMLファイルの該当する文字を書き換えて保存するだけです。
