///
/// entry function
///
/// - Archive cards in specified list have elapsed 1 month.
///
function cleanTrello(){
  
  // Get script properties
  var par = GetTokens();
  
  // Make target date
  var TargetDate = new Date();
  TargetDate.setMonth(TargetDate.getMonth() - 1);  // 1 month ago
  //TargetDate.setSeconds(TargetDate.getSeconds() - 1);  // 1 second ago for test
  
  // Archives cards
  var CompletedCards = removeOldCards(par['TrelloKey'], par['TrelloToken'], par['TrelloCompletedListId'], TargetDate);
  reportToStackdriver(CompletedCards);

}

///
/// Archives cards in specified list
///
function removeOldCards(Key, Trello_Token, ListId, TargetDate){

  // Get cards
  var cardListURL = 'https://api.trello.com/1/lists/' + ListId + '/cards'
  + '?key=' + Key
  + '&token=' + Trello_Token
  + '&fields=id,name,dateLastActivity,shortUrl';
  var response = UrlFetchApp.fetch(cardListURL);
  var json = JSON.parse(response.getContentText("UTF-8"));
  
  // Convert date in cards
  for (var i in json){
    json[i]["dateLastActivity"] = new Date(json[i]["dateLastActivity"]);
    //Logger.log(json[i]["dateLastActivity"]);
  }
  
  // Select target cards
  var TargetCards = [];
  for (var i in json){
    if (json[i]["dateLastActivity"].getTime() <= TargetDate.getTime()){
      TargetCards.push(json[i]);
    }
  }
  //Logger.log(json);
  
  if (TargetCards.length < 1){
    // No cards to archive
    Logger.log("No cards to archive");
    return TargetCards;
  }
  //Logger.log(TargetCards);
  
  Logger.log("ARCHIVE CARDS:");
  Logger.log(TargetCards);
  for (var i in TargetCards) {
    var cardURL = 'https://api.trello.com/1/cards/' + TargetCards[i]["id"]
    + '?key=' + Key
    + '&token=' + Trello_Token
    + '&closed=true';
    UrlFetchApp.fetch(cardURL, {'method' : 'put'});
  }
  
  Logger.log("Done.");
  
  return TargetCards;
  
}

///
/// Report result to Stackdriver 
///
function reportToStackdriver(cardList){
  
  if (cardList.length < 1) {
    console.info("[Trello Inspector] no cards has archived.");
  }
  else {
    //console.info("%s Delete objects:", prefix);
    //for (var i in removedObjects) {
    //  rep = rep + "\n  " + removedObjects[i];
    //}
    console.info("[Trello Inspector] ARCHIVED CARDS: ", cardList);
  }
}

///
/// Get script properties
///
function GetTokens() {
  
  // Get script properties
  var scriptProperty = PropertiesService.getScriptProperties().getProperties();

  var Key = scriptProperty.Trello_KEY;
  var Trello_Token = scriptProperty.Trello_TOKEN;
  var CompletedListId = scriptProperty.Trello_COMPLETED_LIST_ID;
  
  var ret = {
    TrelloKey: Key,
    TrelloToken: Trello_Token,
    TrelloCompletedListId: CompletedListId,
  };
  
  return ret;
}