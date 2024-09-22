const SPREADSHEET_ID = ""; // Google SpreadsheetのID
const SLACK_BOT_TOKEN = ""; // Slack Botトークン
const SLACK_VERIFICATION_TOKEN = ""; // Slackから取得したVerification Token
const SLACK_CHANNEL_ID = ""; // SlackのチャンネルID

// 一度手動で実行する必要がある
const setup = () => {
  const props = PropertiesService.getScriptProperties();
  props.setProperty("SPREADSHEET_ID", SPREADSHEET_ID);
  props.setProperty("SLACK_BOT_TOKEN", SLACK_BOT_TOKEN);
  props.setProperty("SLACK_VERIFICATION_TOKEN", SLACK_VERIFICATION_TOKEN);
  props.setProperty("SLACK_CHANNEL_ID", SLACK_CHANNEL_ID);
};
