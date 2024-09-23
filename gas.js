// スクリプトプロパティから指定されたプロパティを取得する関数
const getProps = (props) =>
  PropertiesService.getScriptProperties().getProperty(props);

// POSTリクエストを処理する関数
const doPost = (e) => {
  // POSTデータを取得し、デコードしてJSONにパース
  const data = e.postData.contents;
  const payload = JSON.parse(decodeURIComponent(data.split("payload=")[1]));

  // Slackトークンを取得し、検証用トークンと比較
  const slackToken = payload.token;
  const expectedToken = getProps("SLACK_VERIFICATION_TOKEN");

  // トークンが一致しない場合はUnauthorizedを返す
  if (slackToken !== expectedToken) {
    return ContentService.createTextOutput("Unauthorized").setMimeType(
      ContentService.MimeType.TEXT
    );
  }

  // アクションIDを取得し、存在しない場合はエラーメッセージを返す
  const actionId = payload.actions[0].action_id;
  if (!actionId) {
    return ContentService.createTextOutput("No action_id").setMimeType(
      ContentService.MimeType.TEXT
    );
  }

  // アクションIDに基づいて処理を分岐
  switch (actionId) {
    case "change_topic":
      postTopicToSlack();
      break;
    case "choose_topic":
      recordTopicUsage(payload.actions[0].value);
      break;
  }

  // 処理が成功した場合はOKを返す
  return ContentService.createTextOutput("OK").setMimeType(
    ContentService.MimeType.TEXT
  );
};

// Slackにお題を投稿する関数
const postTopicToSlack = () => {
  const selectedTopic = getCandidateTopic();
  postToSlack(topicToPayloadBlocks(selectedTopic));
};

// お題の使用履歴を記録する関数
const recordTopicUsage = (topic) => {
  const data = getSpreadsheetData();
  const today = new Date();
  data.some((item, i) => item[0] === topic && (record(i + 1, today), true));
};

// お題の使用履歴をクリアする関数
const clearTopicUsage = () => {
  const data = getSpreadsheetData();
  data.forEach((_, i) => record(i + 1, ""));
};

// 指定された行に日付を記録する関数
const record = (rowIndex, date) => {
  getTopicSpreadSheet().getRange(rowIndex, 2).setValue(date);
};

// 候補のお題を取得する関数
const getCandidateTopic = () => {
  const data = getSpreadsheetData();
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const candidates = data.slice(1).reduce((acc, item) => {
    const lastUsedDate = new Date(item[1]);
    return lastUsedDate < twoWeeksAgo || !item[1] ? [...acc, item[0]] : acc;
  }, []);

  if (candidates.length === 0) {
    clearTopicUsage();
    return getCandidateTopic();
  }

  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
};

// スプレッドシートを取得する関数
const getTopicSpreadSheet = () => {
  return SpreadsheetApp.openById(getProps("SPREADSHEET_ID")).getSheetByName(
    "お題管理シート"
  );
};

// スプレッドシートのデータを取得する関数
const getSpreadsheetData = () => {
  return getTopicSpreadSheet().getDataRange().getValues();
};

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
  {
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "別のお題！",
        },
        action_id: "change_topic",
      },
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "これにする！",
        },
        value: topic,
        action_id: "choose_topic",
      },
    ],
  },
];
