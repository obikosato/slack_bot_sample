// スクリプトプロパティから指定されたプロパティを取得する関数
const getProps = (props) =>
  PropertiesService.getScriptProperties().getProperty(props);

// Slackにお題を投稿する関数
const postTopicToSlack = () => {
  const selectedTopic = getCandidateTopic();
  postToSlack(topicToPayloadBlocks(selectedTopic));
};

// 候補のお題を取得する関数
const getCandidateTopic = () => {
  const data = getSpreadsheetData();
  const candidates = data.map((row) => row[0]).filter((topic) => topic);

  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
};

// スプレッドシートを取得する関数
const getTopicSpreadSheet = () =>
  SpreadsheetApp.openById(getProps("SPREADSHEET_ID")).getSheetByName(
    "お題管理シート"
  );

// スプレッドシートのデータを取得する関数
const getSpreadsheetData = () =>
  getTopicSpreadSheet().getDataRange().getValues();

// Slackにメッセージを投稿する関数
const postToSlack = (blocks) => {
  const slackUrl = "https://slack.com/api/chat.postMessage";
  const options = {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + getProps("SLACK_BOT_TOKEN") },
    payload: JSON.stringify({ channel: getProps("SLACK_CHANNEL_ID"), blocks }),
  };

  const res = UrlFetchApp.fetch(slackUrl, options);
  Logger.log(res);
};

// お題をSlackのメッセージブロック形式に変換する関数
const topicToPayloadBlocks = (topic) => [
  {
    type: "section",
    text: {
      type: "plain_text",
      text: `今日のお題: ${topic || "お題がありません!!"}`,
    },
  },
];
