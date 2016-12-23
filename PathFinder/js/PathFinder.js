/*********************************************************************************
PathFinder.js
	-Code that computes for the path and displays it in google maps

Author: ejecenteno
**********************************************************************************/

/* CONSTANTS */
const FIRSTELEMENTINDEX = 0;
const LASTELEMENTINDEX = positions.length - 1;

/* STRUCTURES */
var shortestPath;

/*********************************************************************************
[Description]
Extend Array prototype to use Math.min function on an Array
**********************************************************************************/
Array.min = function(array) {
	return Math.min.apply(Math, array);
};

/*********************************************************************************
[Description]
computeDistance()
-Computes the distance between 2 points using 2D Euclidean as indicated in TSP File

[Parameters]
pointA - structure containing latitude and longitude values
pointB - structure containing latitude and longitude values

[Output]
Euclidean distance between pointA and pointB
**********************************************************************************/
function computeDistance(pointA, pointB) {	
	var xDifference, yDifference;

	xDifference = pointA.longitude - pointB.longitude;
	yDifference = pointA.latitude - pointB.latitude;
	return Math.sqrt(Math.pow(xDifference, 2) + Math.pow(yDifference, 2));
}

/*********************************************************************************
[Description]
getPositionWithShortestDistance
-Gets the position with the shortest distance from the current position considering
 the distance back to the original start position.

[Parameters]
startPosition - original start position of the path
currentPosition - starting position to compute the distances from
remainingPositions - array of positions that needs to be visited

[Output]
index to the position remainingPositions array which has the shortest 
distance from currentPosition
**********************************************************************************/
function getPositionWithShortestDistance(currentPosition, remainingPositions, startPosition) {
	var distances = [];
	var distance, distanceToStart;
	
	for (var i = 0; i < remainingPositions.length; i++) {
		distance = computeDistance(currentPosition, remainingPositions[i]);
		distanceToStart = computeDistance(remainingPositions[i], startPosition);
		distances.push(distance + distanceToStart);
	}
	
	var minDistance = Array.min(distances);
	for (var i = 0; i < remainingPositions.length; i++) {		
		if (distances[i] === minDistance) {
			return i;
		}
	}
}

/*********************************************************************************
[Description]
generatePathGivenSetOfPositions
-Populates shortestPath array with the shortest path to visit all positions in setOfPoints
-Modified Nearest Neighbor algorithm is used

[Parameters]
startPosition - starting position of the path
setOfPoints - array of positions that needs to be visited
**********************************************************************************/
function generatePathGivenSetOfPositions(startPosition, setOfPositions) {	
	var positionsToVisit = setOfPositions.length;
	var currentPosition = startPosition;
	
	shortestPath.push(currentPosition);	
	for (var i = 0; i < positionsToVisit; i++) {
		//Get the position with shortest distance from currentPosition
		var indexToShortestDistance = getPositionWithShortestDistance(
										currentPosition, setOfPositions, startPosition);
		shortestPath.push(setOfPositions[indexToShortestDistance]);
		
		//Update position of currentPosition
		currentPosition = setOfPositions[indexToShortestDistance];
		
		//Remove the position with the shortest distance as it is already visited
		setOfPositions.splice(indexToShortestDistance, 1);
	}
	shortestPath.push(startPosition);
}

/*********************************************************************************
[Description]
generatePathGivenTimeInterval
-Populates shortestPath array with the shortest path to visit positions within
 given time interval and speed
-Modified Nearest Neighbor algorithm is used

[Parameters]
startPosition - starting position of the path
timeInterval - available time to travel-speed
travelSpeed - stravel speed when visiting positions
**********************************************************************************/
function generatePathGivenTimeInterval(startPosition, timeInterval, travelSpeed) {
	var distanceTravelled = 0;
	var distanceToStart = 0;
	var isEnoughTime = false;
	var isLowestReached = false;
	var isHighestReached = false;
	var currentPosition = startPosition;
	var traverseDown = startPosition;
	var traverseUp = startPosition;
	var setOfSelectedPositions = [];
	
	var maxDistance = travelSpeed * timeInterval;
	document.getElementById("max-distance").innerHTML = maxDistance;

	//Gather positions that can be visited in a given time
	for (var count = 0; count < positions.length; count++) {
		//Select which way to traverse
		var selectedPosition;		
		//If starting position is the first element, always traverse up
		if (startPosition.index === FIRSTELEMENTINDEX) {
			selectedPosition = positions[currentPosition.index + 1];		
		//If starting position is the last element, always traverse down
		} else if (startPosition.index === LASTELEMENTINDEX) {
			selectedPosition = positions[currentPosition.index - 1];		
		//If starting position is in the middle, traverse up or down
		} else {
			//In case highest position is reached, there is no way but down
			if (isHighestReached) {
				selectedPosition = positions[traverseDown.index];
				if(traverseDown.index != FIRSTELEMENTINDEX) {
					traverseDown = positions[traverseDown.index - 1];
				}
			//In case lowest position is reached, there is no way but up
			} else if (isLowestReached) {
				selectedPosition = positions[traverseUp.index];
				if(traverseUp.index != LASTELEMENTINDEX) {
					traverseUp = positions[traverseUp.index + 1];
				}
			//The path can traverse up or down depending on distance
			} else {			
				var possiblePositions = [
					positions[traverseUp.index + 1],
					positions[traverseDown.index - 1]
				];
				
				var indexShortest = getPositionWithShortestDistance(
										currentPosition, possiblePositions, startPosition);
				selectedPosition = possiblePositions[indexShortest];
				
				if (indexShortest) {
					if (traverseDown.index === FIRSTELEMENTINDEX) {
						isLowestReached = true;
					} else {
						traverseDown = positions[traverseDown.index - 1];
					}
				} else {
					if (traverseUp.index === LASTELEMENTINDEX) {
						isHighestReached = true;
					} else {
						traverseUp = positions[traverseUp.index + 1];
					}
				}
			}
		}
		
		//Terminates if distance travelled exceeds the max distance
		distanceTravelled += computeDistance(currentPosition, selectedPosition);
		distanceToStart = computeDistance(selectedPosition, startPosition);
		if ((distanceTravelled + distanceToStart) < maxDistance) {
			setOfSelectedPositions.push(selectedPosition);
			currentPosition = selectedPosition;
			isEnoughTime = true;
		} else {
			if (!(isEnoughTime)) {
				alert("Time Interval=" + timeInterval + " at Travel Speed=" + travelSpeed + 
				" is not enough to visit a position from the given starting point");
			}
			break;
		}
	}
	//Compute for the shortest path given the Gathered positions
	generatePathGivenSetOfPositions(startPosition, setOfSelectedPositions);
	
	//Display Travelled Distance and Positions visited
	distanceTravelled = 0;
	for (var i = 0; i < (shortestPath.length - 1); i++) {
		distanceTravelled += computeDistance(shortestPath[i], shortestPath[i+1]);
	}
	document.getElementById("travelled-distance").innerHTML = distanceTravelled;	
	document.getElementById("positions-visited").innerHTML = shortestPath.length - 2;
}

/*********************************************************************************
[Description]
generateMap
-maps the generated shortest path using google maps

[Parameters]
targetMap - string that contains HTML ID of the target map
**********************************************************************************/
function generateMap(targetMap) {
	var isStart = true;
	
	initializeMap(targetMap);		
	//add markers in map but not on the last position as it is also the start position
	for (var i = 0; i < (shortestPath.length - 1); i++) {
		if (isStart && (i > 0)) {
			isStart = false;
		}
		var options = {
			latitude: shortestPath[i].latitude,
			longitude: shortestPath[i].longitude,
			isStart: isStart,
			label: (i + 1).toString(),
			info: "Position#" + (shortestPath[i].index + 1)
		}
		storeMarkerWithInfo(targetMap, options);
	}
	
	if (targetMap === "googleMap1") {
		showMarkersWithInfo(targetMap, "chk-show-markers-by-set-of-points");
	} else {
		showMarkersWithInfo(targetMap, "chk-show-markers-by-time-interval");
	}
 	showPath(targetMap);
	zoomAndCenter(targetMap);
}

/*********************************************************************************
[Description]
findPathGivenSetOfPoints()
-finds the shortest path to visit a set of points from start point and back and
   displays it in google maps
-triggerred by the "Find Path" (id: "btn-path-by-set-of-points")
**********************************************************************************/
function findPathGivenSetOfPoints() {	
	var startPosition = positions[document.getElementById("start-set-of-points").value];
	var setOfPositions = [];
	var listBox = document.getElementById("set-of-points");
	
	for (var i = 0; i < listBox.options.length; i++) {
		if (listBox.options[i].selected === true) {
			setOfPositions.push(positions[listBox.options[i].value]);
		}
	}
	
	//Verify if given data is correct
	var isDataCorrect = true;
	if (0 === startPosition.length) {
		alert("Please select a start position.");
		isDataCorrect = false;
	}
	
	if (0 === setOfPositions.length) {
		alert("Please select a set of positions.");
		isDataCorrect = false;
	}
	
	for (var i = 0; i < setOfPositions.length; i++) {
		if (startPosition.index === setOfPositions[i].index) {
			alert("Start Position#" + (startPosition.index + 1) + 
				" should not be included among the set of positions");
			isDataCorrect = false;			
		}
	}
	
	if (isDataCorrect) {
		shortestPath = [];
		generatePathGivenSetOfPositions(startPosition, setOfPositions);
		generateMap("googleMap1");		
	}
}

/*********************************************************************************
[Description]
findPathGivenTimeInterval()
-finds path that visits a set of points that can be visited given a time interval
-triggerred by the "Find Path" (id: "btn-path-by-time-interval")
**********************************************************************************/
function findPathGivenTimeInterval() {
	var startPosition = positions[document.getElementById("start-time-interval").value];
	var timeInterval = document.getElementById("time-interval").value;
	var travelSpeed = document.getElementById("travel-speed").value;
	
	//Verify if given data is correct
	var isDataCorrect = true;
	if (0 === startPosition.length) {
		alert("Please select a start position.");
		isDataCorrect = false;
	}
	
	if ((isNaN(timeInterval)) || (isNaN(travelSpeed)) 
		|| (timeInterval <= 0) || (travelSpeed <= 0)) {
		alert("Time Interval and Travel Speed should be a positive number.");
		isDataCorrect = false;
	}
	
	if (isDataCorrect) {
		shortestPath = [];
		generatePathGivenTimeInterval(startPosition, timeInterval, travelSpeed);
		generateMap("googleMap2");	
	}
}