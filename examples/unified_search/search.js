var radius = 5;
var units = "mi";
var page_limit = 100;
var searches = new Array();
var page = 1;

function addSearch(search){
    searches.push(search);
    //JSLOG.log("Adding search: " + search.name);
}

function runsearch(keyword){
    for(var i = 0, length = searches.length; i < length; i++) {
        myLoc = ARGON.geolocation.lla;
        searches[i].search(keyword, page, myLoc.latitude, myLoc.longitude, radius);
    }
}

function format(bundle){
    for(var i = 0, length = bundle.length; i < length; i++){
        item = bundle[i];
        JSLOG.log("Formatting to AR mode.");
        //JSLOG.log(item.body);
        var div = document.createElement("div");
        div.style.width = "300px";
        div.style.height = "110px";
        div.innerHTML = item.body;
        var cssObj = new THREE.CSSObject(div);
        cssObj.width = 300;
        cssObj.height = 110;
        cssObj.position.z = -1000;
        
        //var geoObj = new ARGON.createGeoObject(item.lat, item.long, 0);
        //geoObj.add(cssObj);
        
        ARGON.World.add(cssObj);
    }
}