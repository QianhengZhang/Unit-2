/* JavaScript functions by Qianheng Zhang, 2024 */
var map
var minValue

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

function calcMinValue(data){
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for(var country of data.features){
        //loop through each year
        for(var year = 2011; year <= 2022; year+=1){
              //get population for current year
              var value = country.properties[String(year)];
              //add value to array
              allValues.push(value);
        }
    }
    //get minimum value of our array
    var minValue = Math.min(...allValues)

    return minValue;
}

function calcPropRadius(attValue) {
     //0.15 for my data
    var minRadius = 0.15;
    //Flannery Appearance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius

    return radius;
};

function createPropSymbols(data, attributes){
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes)
        }
    }).addTo(map);
};

function pointToLayer(feature, latlng, attributes) {
    var attribute = attributes[0];
    console.log(attribute)
    var geojsonMarkerOptions = {
        fillColor: "#ff7800",
        color: "#fff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
        radius: 8
    };
    var attValue = Number(feature.properties[attribute]);

    geojsonMarkerOptions.radius = calcPropRadius(attValue);
    var layer = L.circleMarker(latlng, geojsonMarkerOptions);
    var year = attribute;
    var popupContent = "<p><b>Country:</b> " + feature.properties['Country Name'] + "</p>"
    popupContent += "<p><b>Food Export in " + year + ":</b> " + feature.properties[attribute] + " % of Merchandise Exports</p>";
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-geojsonMarkerOptions.radius)
    });
    return layer
}

function createSequenceControls(attributes){
    // slider
    var slider = "<input class='range-slider' type='range'></input>";
    document.querySelector("#panel").insertAdjacentHTML('beforeend',slider);
    document.querySelector(".range-slider").max = 10;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;
    // panel
    document.querySelector('#panel').insertAdjacentHTML('beforeend',"<img src='img/left.png' id='reverse' class='step'>")
    document.querySelector('#panel').insertAdjacentHTML('beforeend',"<img src='img/right.png' id='forward' class='step'>")
    // add function
    document.querySelectorAll('.step').forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;
            if (step.id == 'forward'){
                index++;
                index = index > 10 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                index = index < 0 ? 10 : index;
            };
            document.querySelector('.range-slider').value = index;
            console.log(index);
            updatePropSymbols(attributes[index]);
        })

    })
    document.querySelector('.range-slider').addEventListener('input', function(){
        var index = this.value;
        console.log(index)
        updatePropSymbols(attributes[index]);
    });
};

function updatePropSymbols(attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            var props = layer.feature.properties;
            console.log(attribute)
            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);
            var popupContent = "<p><b>Country:</b> " + props['Country Name'] + "</p>";
            var year = attribute;
            popupContent += "<p><b>Food Export in " + year + ":</b> " + props[attribute] + " % of Merchandise Exports</p>";
            popup = layer.getPopup();
            popup.setContent(popupContent).update();
        };
    });
};

function getData(){
    fetch("data/FoodExport.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            var attributes = processData(json);
            minValue = calcMinValue(json);
            createPropSymbols(json, attributes);
            createSequenceControls(attributes);
        })
};

function processData(data){
    var attributes = [];
    var properties = data.features[0].properties;
    for (var attribute in properties){
        if (!(attribute in ['Country Name', 'Country Code'])){ // Filter out the useful columns
            attributes.push(attribute);
        };
    };
    return attributes;
};

document.addEventListener('DOMContentLoaded',createMap)