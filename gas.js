const getProps = (props) => {
  const scriptProps = PropertiesService.getScriptProperties();
  return scriptProps.getProperty(props);
};

// POSTリクエストを受ける
const doPost = (e) => {
  const slackToken = JSON.stringify(e)
    .split(",")
    .find((e) => e.match(/^\\"token/))
    .split('"')[3]
    .split("\\")[0];

  const expectedToken = getProps("SLACK_VERIFICATION_TOKEN");

  if (slackToken !== expectedToken) {
    return ContentService.createTextOutput("Unauthorized").setMimeType(
      ContentService.MimeType.TEXT
    );
  }
  postTopicToSlack();
};

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
  SpreadsheetApp.openById(getProps("SPREADSHEET_ID")).getSheetByName(
    "お題管理シート"
  );

const getSpreadsheetData = () =>
  getTopicSpreadSheet().getDataRange().getValues();

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
