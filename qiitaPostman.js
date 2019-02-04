/** スプレッドシート */
var ss = SpreadsheetApp.openById(getPropertyFromPropertyService('spreadsheetId'));
/** 投稿一覧シート */
var postSS = ss.getSheetByName('投稿一覧');
var START_ROW = 2;
var START_COLUMN = 1;
var NUMBER_OF_COLUMN = 4;

function executeQiitaPostman() {
  var posts = getPosts();
  
  if(posts === "error") {
    return;  
  }
  
  pasteToSS(posts);
  sortByLike();
  postSlack(createSlackMessage());
}

/**
* qiita記事を取得する
* @return APIリクエストのデータ
*/
function getPosts() {
  var REQUEST_URL = 'https://qiita.com/api/v2/items?page=1&per_page=100&query=stocks%3A%3E6+created%3A%3E';
  // 3日前を指定する
  var term = Moment.moment().add(-3,'d').format('YYYY-MM-DD');
  
  try {
    var response = UrlFetchApp.fetch(REQUEST_URL + term);
    return JSON.parse(response.getContentText());
  } catch(e) {
    postSlack("エラーが発生しました。確認してください。" + e.message);
    return "error"
  }
}

/**
* スプレッドシートに記事を貼り付ける
* @param [] posts 貼り付ける投稿
*/
function pasteToSS(posts) {
  //書き込むにシート情報を消す
  postSS.getRange("A2:D" + ss.getLastRow()).clear();
  
  var insertPosts = [];
  for(var i = 1; i < posts.length; i++) {
    insertPosts.push([posts[i]["id"], posts[i]["title"], posts[i]["url"], posts[i]["likes_count"]]);
  }
  postSS.getRange(START_ROW, START_COLUMN, insertPosts.length, NUMBER_OF_COLUMN).setValues(insertPosts);
}

/**
* いいね数で降順でソートする
*/
function sortByLike() {
  /** いいね数カラム */
  var NUMBER_OF_COLUMN = 4;
  
  postSS.sort(NUMBER_OF_COLUMN, false);
}

/**
* slackに送信するメッセージを作成する
* @return [String] message slackに送信するメッセージ
*/
function createSlackMessage() {
  var postData = postSS.getRange(START_ROW, START_COLUMN, 3, NUMBER_OF_COLUMN).getValues();
  var message = "最近３日間で最もいいねが集まった記事";
  
  for(var i = 0; i < postData.length; i++) {
    message = message + "\n\n\n◯タイトル:　" + postData[i][1] +　"\nURL:　" + postData[i][2] + "\nいいね数:　" + postData[i][3] + "";
  }
  return message;
}

/**
* slackにpostする
* @param [String] message メッセージ
*/
function postSlack(message) {
  var CHANNEL_ID = "CFW6USM7E";
  var slackapp = SlackApp.create(getPropertyFromPropertyService('slackToken'));
  slackapp.postMessage(CHANNEL_ID, message, {"icon_emoji": ":qiita_icon:"});
}