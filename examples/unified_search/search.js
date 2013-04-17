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
        //JSLOG.log("Formatting to AR mode.");
        //JSLOG.log(item.body);
        var div = document.createElement("div");
        div.style.width = "3000px";
        div.style.height = "1100px";
        div.innerHTML = item.body;
        var cssObj = new THREE.CSSObject(div);
        cssObj.width = 300;
        cssObj.height = 110;
        
        //Put everything at a radius of 3500 for now
        var objDist = 3500;
        //cssObj.position.z = objDist * vector.lat/vector.dist;
        //cssObj.position.x = objDist * vector.long/vector.dist;
        //cssObj.position.y = -400; //too high up?
        //JSLOG.log("(" + cssObj.position.z + "," + cssObj.position.y + ")");
        
        
        // Can't get GeoObjects to work nicely right now
        // Handling pure CSSObjects will be easier for now
        var geoObj = ARGON.createGeoObject(item.lat, item.long, 0);
        geoObj.add(cssObj);
        
        //Scaling factor. GeoObjects get really small as they get far 
        //away.
        var devloc = ARGON.geolocation.getLLA();
        var R = 6371; //km
        //convert degrees to radians
        var lat1 = devloc.latitude * Math.PI / 180;
        var long1 = devloc.longitude * Math.PI / 180;
        var lat2 = item.lat * Math.PI / 180;
        var long2 = item.lat * Math.PI / 180;
        //spherical law of cosines
        var dist = Math.acos(Math.sin(lat1) * Math.sin(lat2) +
                             Math.cos(lat1) * Math.cos(lat2) * 
                             Math.cos(long2-long1)) * R;
        
        
        var scale_factor = dist/5;
        
        geoObj.scale.x = scale_factor;
        geoObj.scale.y = scale_factor;
        geoObj.scale.z = scale_factor;
        
        
        var div1 = document.createElement("div");
        div1.innerText = (JSON.stringify(geoObj.rotation));
        div1.style.backgroundColor="#FF0000";
        
        var cobj = new THREE.CSSObject(div1);
        cobj.width = 200;
        cobj.height = 200;
        cobj.position.z = -1000;
        
        ARGON.World.add(cobj);
        
        ARGON.World.add(geoObj);
    }
}