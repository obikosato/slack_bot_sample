// メイン関数
const main = () => {
  const topics = fetchTopicsFromSpreadsheet();
  const selectedTopic = topics[getIndex(topics.length)];
  if (!selectedTopic) {
    Logger.log("お題が取得できませんでした");
    return;
  }

  const res = postToSlack(selectedTopic);
  logResponse(res);
};

// スプレッドシートからお題のリストを取得する関数
const fetchTopicsFromSpreadsheet = () =>
  SpreadsheetApp.openById(getProps("SPREADSHEET_ID"))
    .getSheetByName(getProps("SPREADSHEET_SHEET_NAME"))
    .getDataRange()
    .getValues()
    .map((row) => row[0])
    .filter((topic) => topic);

// 1日ごとにインクリメントされるインデックスを取得する関数
const getIndex = (size) => {
  const base = new Date(2025, 0, 1);
  const now = new Date();
  const elapsedDays = Math.floor((now - base) / (1000 * 60 * 60 * 24));
  return elapsedDays % size;
};

// Slackにメッセージを投稿する関数
const postToSlack = (topic) => {
  const slackUrl = "https://slack.com/api/chat.postMessage";
  const options = {
    method: "post",
    contentType: "application/json; charset=utf-8",
    headers: { Authorization: "Bearer " + getProps("SLACK_BOT_TOKEN") },
    payload: JSON.stringify({
      channel: getProps("SLACK_CHANNEL_ID"),
      blocks: [
        {
          type: "section",
          text: { type: "plain_text", text: `今日のお題: ${topic}` },
        },
      ],
    }),
  };
  return UrlFetchApp.fetch(slackUrl, options);
};

// レスポンスをログに出力する関数
const logResponse = (res) => {
  try {
    const jsonResponse = JSON.parse(res.getContentText());
    Logger.log(JSON.stringify(jsonResponse, null, 2));
  } catch (e) {
    Logger.log("レスポンスのパースに失敗しました: " + e.message);
    Logger.log(res.getContentText());
  }
};

// スクリプトプロパティから指定されたプロパティを取得する関数
const getProps = (props) =>
  PropertiesService.getScriptProperties().getProperty(props);
