/**
* keyとして与えられた値をスクリプトプロパティから取り出して返す
* @param [String] key キー
* @return [String] キーにひもづく値
*/
function getPropertyFromPropertyService(key) {
  var prop = PropertiesService.getScriptProperties();
  return prop.getProperty(key);
}
