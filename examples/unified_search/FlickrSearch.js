var flickr_search = {
    name: "Flickr Search",
    activated: true,
    search: function(keyword, page, lat, long, radius) {
                //JSLOG.log("Entered Flickr search");
                if(page < 1)
                    page = 1;
                if(keyword.charAt(0) == '#')
                    keyword = keyword.substring(1);
                var url = "http://api.flickr.com/services/rest/?method=" + 
                "flickr.photos.search" + 
                "&api_key=7e893653fffba0face9ae992aa2fdf12" + 
                "&tags=" + keyword + 
                "&per_page=20&page=0&format=json" + 
                "&jsoncallback=flickr_search.handler" + 
                "&has_geo=1&lat=" + lat + "&lon=" + long + "&radius=" + radius + 
                "&extras=owner_name,geo,url_sq,url_m";
                //JSLOG.log(typeof(url));
                scriptEl = document.createElement("script");
                //JSLOG.log(flickr_search.handler);
                scriptEl.type = "text/javascript";
                scriptEl.src = url;
                scriptEl.id = 'injected';
                document.head.appendChild(scriptEl);
                //JSLOG.log("Exiting Flickr search");
            },
    handler: function(data) {
                //JSLOG.log("Entered Flickr Handler");
                var scriptEl = document.getElementById('injected');
                //scriptEl.parentNode.removeChild(scriptEl);
                var bundle = [];
                JSLOG.log(data.photos.photo.length);
                for(var i = 0, length = data.photos.photo.length; i < length; i++) {
                    var innerhtml = Handlebars.templates['Flickr'](data.photos.photo[i]);
                    
                    //var div = document.createElement("div");
                    //div.style.width = "300px";
                    //div.style.height = "110px";
                    //div.innerHTML = innerhtml;

                    //var cssObj = THREE.CSSObject(div);
                    //cssObj.width = 300;
                    //cssObj.height = 110;
                    //cssObj.position.x = 0.0;
                    //cssObj.position.y = 0.0;
                    //cssObj.position.z = 0.0;

                    var lat = data.photos.photo[i].latitude;
                    var long = data.photos.photo[i].longitude;
                    //JSLOG.log("(" + lat + ", " + long + ")");
                     
                    bundle.push({"body":innerhtml, "lat":lat, "long":long});

                    //var geoObj = ARGON.createGeoObject(lat, long, 0);
                    //geoObj.add(cssObj);
                    //AR.World.add(geoObj);
                    localStorage.setItem("unified_search_Flickr_" + i, 
                            JSON.stringify(data.photos.photo[i]));
                }
            format(bundle);
            }
};
