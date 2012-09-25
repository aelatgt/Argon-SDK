var radius = 5; //how far away we're willing to go
var units = "mi"; //units for radius
var page_limit = 20; //only show 100 geolocs(? geospots?) for all searches
var twiticon = "http://argonapps.gatech.edu/search/images/icon_twitter.png";
var searches = new Array();
var pagenumber = 1;

var myLat = 33.777221, myLong = -84.396211;

function BaseSearch(name){
    this.activated = true;
    this.name = name;
    this.search;
    this.handler;
}

twitter_search = new BaseSearch("TwitterSearch");
twitter_search.search = function(internalpage, keyword){
    if(internalpage === undefined || internalpage < 1) internalpage = 1;
    var url = "http://search.twitter.com/search.json?callback=handler&rpp=" + 
        page_limit/searches.length + "&page=" + internalpage + "&geocode=" + myLat + "," + myLong + 
        "," + radius + units + "&q=" + keyword;
    scriptElement = document.createElement("SCRIPT");
    scriptElement.type = "text/javascript";
    scriptElement.src = url;
    document.getElementsByTagName('head')[0].appendChild(scriptElement);
}
function handler(data){
    var length = data.results.length;
    var innerhtml = ""
    for(var i = 0; i < length; i++){
        innerhtml += "<div class=twitsearch><img style=\"float=left\" src=" + twiticon + "/>\n" + 
            "<span class=twitusername>" + data.results[i].from_username + "</span><br/>\n" +
            "<span class=twittext>" + data.results[i].text + "</span></div>\n";
    }
    document.getElementById("view").innerHTML = innerhtml;
}
searches[0] = twitter_search;

function runsearch(keyword){
    length = searches.length;
    for(var i = 0; i < length; i++){
        searches[i].search(pagenumber, keyword);
    }
}

function next_page(){
    pagenumber++;
}

function prev_page(){
    pagenumber--;
}
