/* JavaScript functions by Qianheng Zhang, 2024 */
var map;
var dataStats = {};

function createMap(){
    //create the map
    map = L.map('map', {
        center: [20, 0],
        zoom: 2
    });
    //add OSM base tilelayer
    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 3,
	maxZoom: 16,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
    }).addTo(map);
    //call getData function
    getData();
};

function calcStats(data){
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for(var country of data.features){
        //loop through each year
        for(var year = 2010; year <= 2021; year+=1){
              //get population for current year
              var value = country.properties[String(year)];
              //add value to array
              allValues.push(value);
        }
    }
    //get minimum value of our array
    console.log(Math.min(...allValues))
    dataStats.min = Math.min(...allValues);
    dataStats.max = Math.max(...allValues);
    var sum = allValues.reduce(function (a, b) {
        return a + b;
      });
    dataStats.mean = sum / allValues.length;
}

function calcPropRadius(attValue) {
     //15 for my data
    var minRadius = 15;
    //Flannery Appearance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/dataStats.min,0.5715) * minRadius

    return radius;
};

// Add proportional symbols to the map
function createPropSymbols(data, attributes){
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes)
        }
    }).addTo(map);
};

function pointToLayer(feature, latlng, attributes) {
    var attribute = attributes[0];
    //Define the proportional symbol
    var geojsonMarkerOptions = {
        fillColor: "#9BB0C1",
        color: "#fff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
        radius: 8
    };
    var attValue = Number(feature.properties[attribute]);
    // Calculate the radius
    geojsonMarkerOptions.radius = calcPropRadius(attValue);
    var layer = L.circleMarker(latlng, geojsonMarkerOptions);
    var year = attribute;
    // Add information to popup window
    var popupContent = "<p><b>Country:</b> " + feature.properties['Country Name'] + "</p>"
    popupContent += "<p><b>Birth Rate in " + year + ":</b> " + feature.properties[attribute] + " of 1000 people</p>";
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-geojsonMarkerOptions.radius)
    });
    return layer
}

function createSequenceControls(attributes){
    // panel
    document.querySelector('#panel').insertAdjacentHTML('beforeend',"<img src='img/left-arrow.png' id='reverse' class='step'>")
    // slider
    var slider = "<input class='range-slider' type='range'></input>";
    document.querySelector("#panel").insertAdjacentHTML('beforeend',slider);
    document.querySelector(".range-slider").max = 10;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;
    document.querySelector('#panel').insertAdjacentHTML('beforeend',"<img src='img/right-arrow.png' id='forward' class='step'>")
    document.querySelector('#panel').insertAdjacentHTML('beforeend',"<span id='year'>2010</span>")

    // add functions for slider
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
            document.querySelector('#year').textContent = index + 2010;
            updatePropSymbols(attributes[index]);
        })
    })
    document.querySelector('.range-slider').addEventListener('input', function(){
        var index = this.value;
        document.querySelector('#year').textContent = parseInt(index) + 2010;
        updatePropSymbols(attributes[index]);
    });
};

// Update the proportional symbols as the year changes
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
            popupContent += "<p><b>Birth Rate in " + year + ":</b> " + props[attribute] + " of 1000 people</p>";
            popup = layer.getPopup();
            popup.setContent(popupContent).update();
        };
    });
    updateLegend(attribute); // update legend
};

// Process Data
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

// Get max, mean, min of the birth rates
function getCircleValues(attribute) {
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
      max = -Infinity;
  
    map.eachLayer(function (layer) {
      //get the attribute value
      if (layer.feature) {
        var attributeValue = Number(layer.feature.properties[attribute]);
  
        //test for min
        if (attributeValue < min) {
          min = attributeValue;
        }
  
        //test for max
        if (attributeValue > max) {
          max = attributeValue;
        }
      }
    });
  
    //set mean
    var mean = (max + min) / 2;
  
    //return values as an object
    return {
      max: max,
      mean: mean,
      min: min,
    };
}

// Create the initial legend in 2010
function createLegend(attributes) {
    var LegendControl = L.Control.extend({
      options: {
        position: "bottomleft",
      },
  
      onAdd: function () {
        // create the control container with a particular class name
        var container = L.DomUtil.create("div", "legend-control-container");
  
        container.innerHTML = '<p class="temporalLegend">Birth Rate in <span class="year">2010</span></p>';
  
        //Step 1: start attribute legend svg string
        var svg = '<svg id="attribute-legend" width="300px" height="140px">';
  
        //array of circle names to base loop on
        var circles = ["max", "mean", "min"];
  
        //Step 2: loop to add each circle and text to svg string
        for (var i = 0; i < circles.length; i++) {
          //calculate r and cy
          var radius = calcPropRadius(dataStats[circles[i]]);
          console.log(radius);
          var cy = 120 - radius;
          console.log(cy);
  
          //circle string
          svg +=
            '<circle class="legend-circle" id="' +
            circles[i] +
            '" r="' +
            radius +
            '"cy="' +
            cy +
            '" fill="#9BB0C1" fill-opacity="0.8" stroke="#000000" cx="60"/>';
  
          //evenly space out labels
          var textY = i * 30 + 55;
  
          //text string
          svg +=
            '<text id="' +
            circles[i] +
            '-text" x="120" y="' +
            textY +
            '">' +
            Math.round(dataStats[circles[i]] * 100) / 100 +
            " out of 1000" +
            "</text>";
        }
  
        //close svg string
        svg += "</svg>";
  
        //add attribute legend svg to container
        container.insertAdjacentHTML('beforeend',svg);
  
        return container;
      },
    });
  
    map.addControl(new LegendControl());
  }

  // Update the legend over the time
function updateLegend(attribute) {
    //create content for legend
    var year = attribute;
    //replace legend content
    document.querySelector("span.year").innerHTML = year;
  
    //get the max, mean, and min values as an object
    var circleValues = getCircleValues(attribute);
  
    for (var key in circleValues) {
      //get the radius
      var radius = calcPropRadius(circleValues[key]);
  
      document.querySelector("#" + key).setAttribute("cy", 120 - radius);
      document.querySelector("#" + key).setAttribute("r", radius)
  
      document.querySelector("#" + key + "-text").textContent = Math.round(circleValues[key] * 100) / 100 + " out of 1000";

    }
}
  
// Load birth rate data
function getData(){
    fetch("data/topBirthRate.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            var attributes = processData(json); // load data
            calcStats(json); // calculate max, mean, min of the data
            // initialize the symbols, sliders, and legend
            createPropSymbols(json, attributes);
            createSequenceControls(attributes);
            createLegend(attributes);
        })
};

document.addEventListener('DOMContentLoaded',createMap)