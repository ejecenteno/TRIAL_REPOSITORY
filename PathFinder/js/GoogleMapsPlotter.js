/*********************************************************************************
GoogleMapsPlotter.js
	-Code for Google Maps API calls

Author: ejecenteno
**********************************************************************************/

/* GLOBAL VARIABLES */
var map1;
var map2;

/*********************************************************************************
[Description]
initializeMap()
-Displays initial google map and center it to Japan

[Parameters]
targetMap - string that contains HTML ID of the target map
**********************************************************************************/
function initializeMap(targetMap) {
	var markers = [];
	var mapCanvas = document.getElementById(targetMap);
	var mapOptions = {
		//Center the map in Japan's Latitude and Longitude coordinates
		center: new google.maps.LatLng(36.2048, 138.2529), 
		zoom: 5
	};
	
	//set map and clear marker array
	if (targetMap === "googleMap1") {
		map1 = {
			map: new google.maps.Map(mapCanvas, mapOptions),
			markers: markers
		};
	} else {
		map2 = {
			map: new google.maps.Map(mapCanvas, mapOptions),
			markers: markers
		};
	}
}

/*********************************************************************************
[Description]
storeMarkerWithInfo()
-stores marker and info window data

[Parameters]
options structure containing
	latitude:	position's longitude
	longitude:	position's latitude
	isStart:	flag to know if the point is the starting point
	label:		label that indicates the position's arrangement
	info:		Information to display
targetMap - string that contains HTML ID of the target map
**********************************************************************************/
function storeMarkerWithInfo(targetMap, options) {
	var markPosition = new google.maps.LatLng(options.latitude, options.longitude);
	var markerOptions, infoOptions;
	
	if (options.isStart) {
		infoOptions = {
			content: "START: " + options.info		
		};		
	} else {
		infoOptions = {
			content: options.info		
		};	
	}
	var infoWindow = new google.maps.InfoWindow(infoOptions);
	
	if (options.isStart) {
		markerOptions = {
			position: markPosition,
			animation: google.maps.Animation.DROP,
			label: options.label,
			infowindow: infoWindow		
		};
	} else {
		markerOptions = {
			position: markPosition,
			label: options.label,
			infowindow: infoWindow		
		};
	}	
	var marker = new google.maps.Marker(markerOptions);

	if (targetMap === "googleMap1") {
		map1.markers.push(marker);
	} else {
		map2.markers.push(marker);
	}
}

/*********************************************************************************
[Description]
showMarkersWithInfo()
-shows Markers and when "Show Destination Position Markers" is checked
-Information window is available upon click
-Marker and Information window is displayed by default for the starting position

[Parameters]
targetMap - string that contains HTML ID of the target map
showMarkerCheckBoxID - string that contains HTML ID of check box for showing markers 
**********************************************************************************/
function showMarkersWithInfo(targetMap, showMarkerCheckBoxID) {
	var currentMap;
	if (targetMap === "googleMap1") {
		currentMap = map1;
	} else {
		currentMap = map2;
	}
	
	//Always display the marker and information for the starting position
	currentMap.markers[0].setMap(currentMap.map);
	currentMap.markers[0].infowindow.open(currentMap.map, currentMap.markers[0]);
 	currentMap.markers[0].addListener('click', function() {
		this.infowindow.open(currentMap.map, this);
	});
	
	if (document.getElementById(showMarkerCheckBoxID).checked) {
		for (var i = 1; i < currentMap.markers.length; i++) {
			currentMap.markers[i].setMap(currentMap.map);
			currentMap.markers[i].addListener('click', function() {
				this.infowindow.open(currentMap.map, this);
			});
		}
	}
}

/*********************************************************************************
[Description]
hideMarkersWithInfo()
-hides Markers and when "Show Destination Position Markers" is unchecked
-Marker and Information window for start position will not be hidden

[Parameters]
targetMap - string that contains HTML ID of the target map
showMarkerCheckBoxID - string that contains HTML ID of check box for showing markers 
**********************************************************************************/
function hideMarkersWithInfo(targetMap) {
	var currentMap;
	if (targetMap === "googleMap1") {
		currentMap = map1;
	} else {
		currentMap = map2;
	}
	
	for (var i = 1; i < currentMap.markers.length; i++) {
			currentMap.markers[i].setMap(null);
	}
}

/*********************************************************************************
[Description]
showPath()
-adds a polyline to the generated shortestPath
-an icon is animated to show the route of the places to be visited

[Parameters]
targetMap - string that contains HTML ID of the target map
**********************************************************************************/
function showPath(targetMap) {
	var lineSymbol = {
		path: google.maps.SymbolPath.CIRCLE,
		scale: 8,
		strokeColor: "#FF0000"
	};
	
	var pathOptions = [];
	for (var i = 0; i < shortestPath.length; i++) {
		pathOptions.push({
			lat: shortestPath[i].latitude,
			lng: shortestPath[i].longitude
		});
	}
	
	var line = new google.maps.Polyline({
		path: pathOptions,
		icons: [{
			icon: lineSymbol,
			offset: "100%"
			}],
		strokeColor: "#0000FF",
		strokeOpacity: 0.4,
		strokeWeight: 4,
	});
	
	if (targetMap === "googleMap1") {
		line.setMap(map1.map);
	} else {
		line.setMap(map2.map);
	}
	
	var count = 0;
	window.setInterval( function() {
		count = (count + 1) % 400;

		var icons = line.get('icons');
		icons[0].offset = (count / 4) + '%';
		line.set('icons', icons);
	}, 40);
}

/*********************************************************************************
[Description]
zoomAndCenter()
-zooms and centers the map to fit the view to the generated shortestPath

[Parameters]
targetMap - string that contains HTML ID of the target map
**********************************************************************************/
function zoomAndCenter(targetMap) {
	var markerBounds = new google.maps.LatLngBounds();

	for (var i = 0; i < shortestPath.length; i++) {
		var position = new google.maps.LatLng(shortestPath[i].latitude, shortestPath[i].longitude);
		markerBounds.extend(position);
	}
   
   	if (targetMap === "googleMap1") {
		map1.map.fitBounds(markerBounds);
	} else {
		map2.map.fitBounds(markerBounds);
	}
}