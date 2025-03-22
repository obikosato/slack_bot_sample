// メイン関数
const main = () => {
  // お題取得
  const topics = fetchTopicsFromSpreadsheet();
  const seed = seedForToday();
  const index = generateIndex(topics.length, seed);
  const selectedTopic = topics[index];
  if (!selectedTopic) {
    Logger.log("お題が取得できませんでした");
    return;
  }

  // Slackに投稿
  const blocks = topicToPayloadBlocks(selectedTopic);
  const res = postToSlack(blocks);
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

// 今日の日付を元に乱数のシードを生成する関数
const seedForToday = () =>
  parseInt(Utilities.formatDate(new Date(), "JST", "yyyyMMdd"), 10);

// 乱数を生成する関数
const generateIndex = (size, seed) => {
  let state = seed;
  state ^= (state << 13) & 0xffffffff;
  state ^= state >>> 17;
  state ^= (state << 5) & 0xffffffff;

  return Math.abs(state) % size;
};

// お題をSlackのメッセージブロック形式に変換する関数
const topicToPayloadBlocks = (topic) => [
  {
    type: "section",
    text: {
      type: "plain_text",
      text: `今日のお題: ${topic}`,
    },
  },
];

// Slackにメッセージを投稿する関数
const postToSlack = (blocks) => {
  const slackUrl = "https://slack.com/api/chat.postMessage";
  const options = {
    method: "post",
    contentType: "application/json; charset=utf-8",
    headers: { Authorization: "Bearer " + getProps("SLACK_BOT_TOKEN") },
    payload: JSON.stringify({ channel: getProps("SLACK_CHANNEL_ID"), blocks }),
  };

  return UrlFetchApp.fetch(slackUrl, options);
};

// レスポンスをログに出力する関数
const logResponse = (res) => {
  console.log(res.getContentText());
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
