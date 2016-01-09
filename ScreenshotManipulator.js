//
// Globals
//
var screenshot = require('desktop-screenshot');
var robot = require('robotjs');
var screenSize = robot.getScreenSize();
var screenSizeDownscale = {width: Math.floor(screenSize.width/3), height:Math.floor(screenSize.height/3), quality:75};
var jimp = require('jimp');

//
// Class
//
var ScreenshotManipulator = {};

ScreenshotManipulator.capture = function (callback) {
	screenshot("screenshot.jpg", screenSizeDownscale, callback);
};

module.exports = ScreenshotManipulator;