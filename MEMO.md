# やったことのメモ

## 2024/09/22

1. Slackにお題を投稿するためのチャンネルを作成（パブリック）
2. お題のリストをGoogleスプレッドシートに作成
   - お題のリストは、[今日のリモート雑談テーマを決める魔法のスプレッドシートを運用している話 - エムスリーテックブログ](https://www.m3tech.blog/entry/zatsudan-mahou-no-spreadsheet)を借用
3. [Slack api](https://api.slack.com/)で、お題を投稿するためのアプリを作成
   - `chat:write`の権限を付与
   - 「Install App to Workspace」で、Slackにアプリをインストール
   - Botのトークンを取得
4. [Google Apps Script](https://script.google.com/)で、お題をランダムに取得してSlackに投稿するスクリプトを作成
5. GASをウェブアプリとしてデプロイし、URLを取得
6. Slackアプリの「Interactivity & Shortcuts」に、GASのURLを設定
   - Slackアプリのボタンを押したときに、GASにPOSTリクエスト送るため
7. GASからSlackアプリでSlackにメッセージを投稿するために、Slack APIの`chat.postMessage`を使う
   - Botのトークンの値を指定して、`chat.postMessage`を実行する処理を追加

### 疑問

SlackのボタンからGASにアクセスするのに、アクセスできるユーザーを「全員」にしないと、401が返る。しかし、セキュリティ的には問題があるのではないか？
