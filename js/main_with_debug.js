/* JavaScript functions by Qianheng Zhang, 2024 */

// Population Dataset
var cityPop = [
	{
		city: 'Madison',
		population: 233209
	},
	{
		city: 'Milwaukee',
		population: 594833
	},
	{
		city: 'Green Bay',
		population: 104057
	},
	{
		city: 'Superior',
		population: 27244
	}
];

/* This function takes in the population dataset and classify the
	cities into small, medium, and large size depending on their
	population. After all, the function adds the sizes to the
	end of each row of the table.
*/
function addColumns(cityPop){

    document.querySelectorAll("tr").forEach(function(row, i){

    	if (i == 0){
			// Add title in the first row
    		row.insertAdjacentHTML('beforeend', '<th>City Size</th>');
    	} else {
    		var citySize;

			if (cityPop[i-1].population < 100000){
    			citySize = 'Small';

    		} else if (cityPop[i-1].population < 500000){
    			citySize = 'Medium';

    		} else {
    			citySize = 'Large';
    		};
			// Add size label
			row.insertAdjacentHTML('beforeend', '<td>' + citySize + '</td>');
    	};
    });
};

/* This function has several events. When mouse is over the table, it changes
	the color of the table. Otherwise, the color is black, which is the default
	color. It also has a click function that gives a pop up.
*/
function addEvents(){

	document.querySelector("table").addEventListener("mouseover", function(){

		var color = "rgb(";

		for (var i=0; i<3; i++){

			var random = Math.round(Math.random() * 255);
			// randomize the color
			color += random;

			if (i<2){
				color += ", ";

			} else {
				color += ")";
			};
		};
		document.querySelector("table").style.color = color;
		// set the css style of the table
	});

	document.querySelector("table").addEventListener("mouseleave", function(){
		var color = "rgb(0, 0, 0)";
		document.querySelector("table").style.color = color;
		// set color to default
	});

	function clickme(){
		alert('Hey, you clicked me!');
		// click event
	};

	document.querySelector("table").addEventListener("click", clickme)
};

/* This function initilizes the table with the data, which
	is the cities' names and their populations.
*/
function addTable() {
	var myDiv = document.getElementById("mydiv"); // find mydiv
	var table = document.createElement("table"); // create empty table
	var headerRow = document.createElement("tr"); // create empty row, which is the first row
	headerRow.insertAdjacentHTML("beforeend","<th>City</th><th>Population</th>") // add the headers to the first row
	table.append(headerRow); // append header
	for(var i = 0; i < cityPop.length; i++) {
		var rowHtml = "<tr><td>" + cityPop[i].city + "</td><td>" + cityPop[i].population + "</td></tr>"; // for each row, create content based on cityPop dict
        table.insertAdjacentHTML('beforeend',rowHtml); // append the data to each row
	}
	myDiv.append(table); // add the table to the body of html page
}

// Call all functions in the beginning
function initialize() {
	addTable();
	addColumns(cityPop);
	debugAjax()
	addEvents();
}

// Initialize all DOM content prepared
document.addEventListener('DOMContentLoaded',initialize)

function debugCallback(response){
	console.log(response) // Print the object to the console
};
function debugAjax(){
	var myData;
	fetch("data/MegaCities.geojson") // load geojson
		.then(function(response){
				myData = response.json(); // convert response to json object
				return myData; //return the json file for web use
			})
			.then(function(myData){
				document.querySelector("#mydiv").insertAdjacentHTML('beforeend', '<br>GeoJSON data:<br>' + JSON.stringify(myData)) // add to context on the map
				debugCallback(myData) // Callback
			})
};
