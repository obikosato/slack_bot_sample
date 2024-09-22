const SPREADSHEET_ID = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // Google SpreadsheetのID
const SLACK_BOT_TOKEN =
  "xoxb-xxxxxxxxxxxx-xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // SlackのBot User OAuth Access Token
const SLACK_CHANNEL_ID = "XXXXXXXXXXX"; // SlackのチャンネルID

// POSTリクエストを受ける
const doPost = (_) => postTopicToSlack(); // お題を再投稿

// main
const postTopicToSlack = () => {
  const data = getSpreadsheetData();
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

  postToSlack(topicToPayloadBlocks(selectedTopic));
  recordTopicUsage(selectedTopic);
};

const recordTopicUsage = (topic) => {
  const data = getSpreadsheetData();
  const today = new Date();
  const record = (rowIndex, date) =>
    getTopicSpreadSheet().getRange(rowIndex, 2).setValue(date);
  data.some((item, i) => item[0] === topic && (record(i + 1, today), true));
};

const getTopicSpreadSheet = () =>
  SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("お題管理シート");

const getSpreadsheetData = () =>
  getTopicSpreadSheet().getDataRange().getValues();

const postToSlack = (blocks) => {
  Logger.log(blocks);
  const slackUrl = "https://slack.com/api/chat.postMessage";
  const options = {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + SLACK_BOT_TOKEN },
    payload: JSON.stringify({ channel: SLACK_CHANNEL_ID, blocks }),
  };

  const res = UrlFetchApp.fetch(slackUrl, options);
  Logger.log(res);
};

const topicToPayloadBlocks = (topic) => [
  {
    type: "section",
    text: {
      type: "plain_text",
      text: `今日のお題: ${topic}`,
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
    ],
  },
];
