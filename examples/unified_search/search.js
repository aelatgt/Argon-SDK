var radius = 5;
var units = "mi";
var page_limit = 100;
var searches = new Array();
var page = 1;

var geoObjs = new Array();

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
        //cssObj.lookAt(new THREE.Vector3());
        
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
                             
        //Rotation to billboard to user
        //Rotation only needed in y (vertical) direction
        //cssObj.rotation.y = Math.atan((long2 - long1)/(lat2 - lat1));
        //cssObj.lookAt(new THREE.Vector3());
        
        
        // Can't get GeoObjects to work nicely right now
        // Handling pure CSSObjects will be easier for now
        var geoObj = ARGON.createGeoObject(item.lat, item.long, 0);
        geoObj.add(cssObj);
        
        //Scaling factor. GeoObjects get really small as they get far 
        //away.
        var scale_factor = dist/5;
        
        geoObj.scale.x = scale_factor;
        geoObj.scale.y = scale_factor;
        geoObj.scale.z = scale_factor;
        
        var div1 = document.createElement("div");
        div1.innerText = "cssOBJ" + (JSON.stringify(cssObj.position));
        div1.style.backgroundColor="#FF0000";
        
        var cobj = new THREE.CSSObject(div1);
        cobj.width = 200;
        cobj.height = 200;
        cobj.position.z = -1000;
        
        ARGON.World.add(cobj);
        
        ARGON.World.add(geoObj);
        geoObjs.push(geoObj);
    }
    window.webkitRequestAnimationFrame(billboard);
}

var blob = new Blob([
    "onmessage = function(e) { window.webkitRequestAnimationFrame(billboard) }; " +
    "function billboard(){" + 
        "for(var i = 0, length = geoObjs.length; i < length; i++){" + 
            "var obj = geoObjs[i];" + 
            "obj.lookAt(ARGON.threeCamera.position);" +
        "}" +
        "window.webkitRequestAnimationFrame(billboard);" +
    "};"]);
    
var blobURL = window.URL.createObjectURL(blob);

var worker = new Worker(blobURL);
worker.onmessage = function(e){};

worker.postMessage();