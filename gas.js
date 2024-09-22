const GOOGLE_SPREADSHEET_ID = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // Google SpreadsheetのID
const SLACK_BOT_TOKEN =
  "xoxb-xxxxxxxxxxxx-xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // SlackのBot User OAuth Access Token
const SLACK_CHANNEL_ID = "XXXXXXXXXXX"; // SlackのチャンネルID

function doPost(e) {
  postTopicToSlack(); // お題を再投稿
  const payload = JSON.parse(e.postData.contents);
  const action = payload.actions[0];
  const actionId = action.action_id;

  actionId === "change_topic" && postTopicToSlack(); // お題を再投稿
  actionId === "choose_topic" && recordTopicUsage(action.value); // 使用履歴を記録
  return ContentService.createTextOutput();
}

// お題を取得してSlackに送信する関数
function postTopicToSlack() {
  const ss = SpreadsheetApp.openById(GOOGLE_SPREADSHEET_ID);
  const sheet = ss.getSheetByName("お題管理シート");
  const data = sheet.getDataRange().getValues();

  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const candidates = data.slice(1).reduce((acc, item) => {
    const lastUsedDate = new Date(item[1]);
    return lastUsedDate < twoWeeksAgo || !item[1] ? [...acc, item[0]] : acc;
  }, []);

  if (candidates.length === 0) return;

  const randomIndex = Math.floor(Math.random() * candidates.length);
  const selectedTopic = candidates[randomIndex];

  Logger.log(selectedTopic);
  recordTopicUsage(selectedTopic);

  const slackMessage = [
    {
      type: "section",
      text: {
        type: "plain_text",
        text: "今日のお題: " + selectedTopic,
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "チェンジ",
          },
          action_id: "change_topic",
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "これにする！",
          },
          value: selectedTopic,
          action_id: "choose_topic",
        },
      ],
    },
  ];

  const slackUrl = "https://slack.com/api/chat.postMessage";
  const token = SLACK_BOT_TOKEN;

  const options = {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + token },
    payload: JSON.stringify({
      channel: SLACK_CHANNEL_ID,
      blocks: slackMessage,
    }),
  };

  const response = UrlFetchApp.fetch(slackUrl, options);
  Logger.log(response.getContentText());
}

function recordTopicUsage(topic) {
  const ss = SpreadsheetApp.openById(GOOGLE_SPREADSHEET_ID);
  const sheet = ss.getSheetByName("お題管理シート");
  const data = sheet.getDataRange().getValues();
  const today = new Date();

  data.some(
    (item, i) => item[0] === topic && sheet.getRange(i + 1, 2).setValue(today)
  );
}
