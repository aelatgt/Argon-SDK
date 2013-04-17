var twitter_search = {
    name: "Twitter Search",
    activated: true,
    search: function(keyword, page, lat, long, radius) {
                if(page < 1)
                    page = 1;
                var url = "http://search.twitter.com/search.json?" + 
                    "callback=twitter_search.handler&rpp=50" + 
                    "&page=" + page + 
                    "&geocode=" + lat + "%2C" + long + "%2C" + radius;
                if(keyword.charAt(0) == '#')
                    url += "&tag=" + keyword.substring(1,keyword.length);
                else if(keyword != '')
                    url += "&q=" + keyword;
                var scriptEl = document.createElement("script");
                scriptEl.type = "text/javascript";
                scriptEl.src = url;
                scriptEl.id = "injectedT";
                document.head.appendChild(scriptEl);
            }
    handler: function(data) {
                var scriptEl = document.getElementById('injectedT');
                scriptEl.parentNode.removeChild(scriptEl);
                
                var bundle = [];
                
                for(var i = 0, length = data.results.length; i < length; i++){
                    if(data.results[i].geo != null) {
                        var innerhtml = Handlebars.templates['Tweet'](data.results[i]);
                        localStorage.setItem("unified_search_Twitter" + i, 
                                    JSON.stringify(data.results[i]));
                        bundle.push({"body":innerhtml, 
                                     "lat": data.results[i].geo.latitude,
                                     "long": data.results[i].geo.longitude}
                                     );
                    }
                }
                format(bundle);
            }
};

addSearch(twitter_search);