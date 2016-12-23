/*********************************************************************************
TSPFileParser.js
	-Code that extracts data from tsp file and use it within the web app

Author: ejecenteno
**********************************************************************************/

/* CONSTANTS */
//Based on analysis, the data in the TSP file is approximately equal to actual longitude/latitude
const SCALEFACTOR = 0.001;

/* STRUCTURES */
var positions = [];

/*********************************************************************************
[Description]
parseTSPFile()
-parses the TSP file and stores data as longitude/latitude
-populates the dropdown boxes and list boxes based on the parsed data

[Parameters]
data - contents of ja9847.tsp
**********************************************************************************/
function parseTSPFile(data) {
	var lines = data.split('\n');
	var isCoordinatesSection = false;
	
	for(var i = 0; !(lines[i].includes("EOF")); i++) {	
		//Get <id> <x> <y> data from TSP File
		//Based on analysis, <x> is latitude data and <y> is the longitude
		if ((i > 0) && (lines[i - 1].includes("NODE_COORD_SECTION"))) {
			isCoordinatesSection = true;
		}
		
		if (isCoordinatesSection) {
			var dataId, dataX, dataY;
			
			dataY = lines[i].substr(lines[i].lastIndexOf(" ") + 1);
			lines[i] = lines[i].substring(0, lines[i].lastIndexOf(" "));
			dataX = lines[i].substr(lines[i].lastIndexOf(" ") + 1);
			lines[i] = lines[i].substring(0, lines[i].lastIndexOf(" "));			
			dataId = lines[i];
			
			//Store positions as latitude and longitude
			var coordinateData = {
				index: 		dataId - 1,
				latitude:	(dataX * SCALEFACTOR),
				longitude:	(dataY * SCALEFACTOR)
			};
			
			positions.push(coordinateData);
		}
	}
	
	//Populate Dropdown box and list box
	populateOptions(document.getElementById("start-set-of-points"));
	populateOptions(document.getElementById("set-of-points"));
	populateOptions(document.getElementById("start-time-interval"));
}

/*********************************************************************************
[Description]
populateOptions()
-Populates Dropdown box and list box with the data extracted from tsp file

[Parameters]
parentElement - HTML element ID of control to be populated
**********************************************************************************/
function populateOptions(parentElement) {
	for (var i = 0; i < positions.length; i++) {
		var opt = document.createElement("option");
		
		opt.setAttribute("value", positions[i].index);
		opt.appendChild(document.createTextNode(
			"Position#" + (positions[i].index + 1) + " - [lat: " + 
			positions[i].latitude + ", long: " + positions[i].longitude + "]"
		));
		parentElement.appendChild(opt);		
	}
}