/* JavaScript functions by Qianheng Zhang, 2024 */
var map

function createMap(){
    //create the map
    map = L.map('map', {
        center: [20, 0],
        zoom: 2
    });

    //add OSM base tilelayer
    L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.{ext}', {
      minZoom: 1,
      maxZoom: 16,
      attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      ext: 'jpg'
    }).addTo(map);

    //call getData function
    getData();
};

function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};

function getData() {
    fetch("data/WorldFoodExportShort.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
          //create marker options
        //     var geojsonMarkerOptions = {
        //         radius: 8,
        //         fillColor: "#ff7800",
        //         color: "#000",
        //         weight: 1,
        //         opacity: 1,
        //         fillOpacity: 0.8
        //     };
        //   //create a Leaflet GeoJSON layer and add it to the map
        //     L.geoJson(json, {
        //         pointToLayer: function (feature, latlng){
        //             return L.circleMarker(latlng, geojsonMarkerOptions);
        //         }
        //     }).addTo(map);
        L.geoJson(json, {
            onEachFeature: onEachFeature
        }).addTo(map);
    });
}


document.addEventListener('DOMContentLoaded',createMap)