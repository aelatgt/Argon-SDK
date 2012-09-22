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
}

twitter_search = new BaseSearch("TwitterSearch");
twitter_search.search = function(internalpage, keyword){
    if(internalpage === undefined || internalpage < 0) internalpage = 0;
    var url = "http://search.twitter.com/search.json?callback=?&rpp=" + page_limit/searches.length + 
        "&page=" + internalpage + "&geocode=" + myLat + "," + myLong + "," + radius + units + "&q=" + keyword;
    httpRequest = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Msxm12.XMLHTTP");
    httpRequest.open("GET", url, true);
    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState == 4 && httpRequest.status == 200){
            var json = eval('(' + httpRequest.responseText + ')');
            var length = json.results.length;
            for(var i=0; i < length; i++){
                document.write("<div class=twitter><img src=" + twiticon + "style=\"float=left\""+
                        "<span class=twitusername" + json.results[i].from_username + "</span>" + 
                        "<br/><span class=twittext" + json.results[i].text + "</span>");
            }
        }
    }
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
