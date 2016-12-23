/*********************************************************************************
EventHandlers.js
	-Code that handles which functions should be triggerred on an event

Author: ejecenteno
**********************************************************************************/

$(document).ready(function() {
	//Parses and loads data from TSP file
    $.get("data/ja9847.tsp", function(data) {
		parseTSPFile(data);
    });
	
	//Initializes google maps
	initializeMap("googleMap1");
	initializeMap("googleMap2");
	
	//Handler for [Find Path Buttons]
	$("#btn-path-by-set-of-points").click(function(){
        findPathGivenSetOfPoints();
    });
	
	$("#btn-path-by-time-interval").click(function(){
        findPathGivenTimeInterval();
    });

	//Handler for [Show Destination Position Markers] check box
	document.getElementById("chk-show-markers-by-set-of-points").checked = true;
	$("#chk-show-markers-by-set-of-points").change(function() {
		if (this.checked) {
			showMarkersWithInfo("googleMap1", "chk-show-markers-by-set-of-points");
		} else {
			hideMarkersWithInfo("googleMap1");
		}
	});
	
	document.getElementById("chk-show-markers-by-time-interval").checked = true;
	$("#chk-show-markers-by-time-interval").change(function() {
		if (this.checked) {
			showMarkersWithInfo("googleMap2", "chk-show-markers-by-time-interval");
		} else {
			hideMarkersWithInfo("googleMap2");
		}
	});
	
	//Handler for [Reset] Button
	$("#reset-path-by-set-of-points").click(function(){
		initializeMap("googleMap1");
    });

	$("#reset-path-by-time-interval").click(function(){
		initializeMap("googleMap2");
    });
});