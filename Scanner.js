//
// Globals
//
var robot = require('robotjs');
var ColorManipulator = require('./ColorManipulator');
var Utils = require('./Utils');
var screenSize = robot.getScreenSize();

var X = 0;
var Y = 1;

var defaultScanOptions = {
	deltaX:		10,
	deltaY:		150,
	columns: 	2,
	iterLimit: 	400,
	averageMode: false
};

//
// Class
//
var Scanner = {};


// Check if the given position is outside the Screen
Scanner.isOutOfBound = function (pos) {
	if (pos[X] < 0 || pos[Y] < 0 ||
		pos[X] >= screenSize.width ||
		pos[Y] >= screenSize.height) {
		return true;
	}

	return false;
};


// Limits the x/y values of position to fit the screen
Scanner.makeInBounds = function (pos) {

	if (pos[X] < 0) {
		pos[X] = 0;
	}

	if (pos[X] >= screenSize.width) {
		pos[X] = screenSize.width - 1;
	}

	if (pos[Y] < 0) {
		pos[Y] = 0;
	}

	if (pos[Y] >= screenSize.height) {
		pos[Y] = screenSize.height - 1;
	}

	return pos;
};

Scanner.scanScreenUntil = function (start, delta, iterLimit, mouseMove) {
	var current, iterations = 0;
	var colors = [];

	// (CLONE instead of using the real one)
	current = Scanner.makeInBounds([start[X], start[Y]]);

	if (delta[X] == 0 && delta[Y] == 0) {
		return null;
	}

	while (!Scanner.isOutOfBound(current)) {
		// Check current pixel
		colors.push(robot.getPixelColor(current[X], current[Y]));

		if (mouseMove) {
			robot.moveMouse(current[X], current[Y]);
		}

		current[X] += delta[X];
		current[Y] += delta[Y];
		iterations++;

		if (iterations > iterLimit && iterLimit > 0) {
			return colors;
		}
	}


	//console.log('scanned',iterations,'pixels');
	return colors;
};


//
//	The scan is processed by column
//	@ param offsetX is the offset position on X axis
//	@ param deltaX is the 1st cursor, the scan will jump to delta pixels on X axis
//	@ param deltaY is the 2nd cursor, the scan will jump to delta pixels on Y axis until the end of the screen
//  @ param columns is the number of column the scan must process
//
Scanner.scanForDominantColor = function (offsetX, opts) {

	var deltaX = opts.deltaX,
		deltaY = opts.deltaY,
		iterLimit = opts.iterLimit,
		averageMode = opts.averageMode,
		columns = opts.columns;
	
	var r, g, b, scannedColors, dominantColorColHEX, dominantColorsGlobal = [];
	
	// Scan dominant color for X columns
	for (var i = 0; i < columns; i++) {
		scannedColors = Scanner.scanScreenUntil(
			// Initial position
			[(Math.floor(offsetX)) + i * deltaX,0],
			// Scanner movement
			[0,deltaY],
			// Limit
			iterLimit,
			// No mouse move
			false
		);

		// Find the dominant color for that column
		if (averageMode) {
			dominantColorColHEX = ColorManipulator.findAverageColor(scannedColors, true);
		} else {
			dominantColorColHEX = ColorManipulator.findDominantColor(scannedColors, true);
		}

		// Store that color
		dominantColorsGlobal.push(dominantColorColHEX);
	}

	// Extract the dominant color from each columns
	return ColorManipulator.findDominantColor(dominantColorsGlobal);
};

Scanner.scanOnLeftScreen = function(opts) {
	return Scanner.scanForDominantColor(90, Utils.mergeArgs(opts, defaultScanOptions));
};

Scanner.scanOnRightScreen = function(opts) {
	return Scanner.scanForDominantColor(screenSize.width - 90, Utils.mergeArgs(opts, defaultScanOptions));
};

Scanner.scanOnCenterScreen = function(opts) {
	return Scanner.scanForDominantColor(screenSize.width/3, Utils.mergeArgs(opts, defaultScanOptions));
};

module.exports = Scanner;