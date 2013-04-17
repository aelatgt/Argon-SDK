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
        div.style.width = "3000px";
        div.style.height = "1100px";
        div.innerHTML = item.body;
        var cssObj = new THREE.CSSObject(div);
        cssObj.width = 3000;
        cssObj.height = 1100;
        
        var devloc = ARGON.geolocation.getLLA();
        var vector = {lat:item.lat - devloc.latitude,
                      long:item.long - devloc.longitude, 
                      dist:0};
        vector.dist = Math.pow((Math.pow(vector.lat,2) + Math.pow(vector.long,2)), 0.5);
        
        //Put everything at a radius of 3500 for now
        var objDist = 3500;
        cssObj.position.z = objDist * vector.lat/vector.dist;
        cssObj.position.x = objDist * vector.long/vector.dist;
        cssObj.position.y = -400; //too high up?
        //JSLOG.log("(" + cssObj.position.z + "," + cssObj.position.y + ")");
        
        
        // Can't get GeoObjects to work nicely right now
        // Handling pure CSSObjects will be easier for now
        //var geoObj = ARGON.createGeoObject(item.lat, item.long, 0);
        //geoObj.add(cssObj);
        
        ARGON.World.add(cssObj);
    }
}