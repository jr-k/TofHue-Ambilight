var Ambilight = require('./Ambilight');
var Scanner = require('./Scanner');
var ScreenshotManipulator = require('./ScreenshotManipulator');
var ColorManipulator = require('./ColorManipulator');
var rgb, refreshRate = 100;

var robot = require('robotjs');

var T_END, T_START = new Date().getTime();

//setInterval(function(){
//	rgb = Scanner.scanOnCenterScreen({averageMode: false});
//	console.log(rgb);
//	T_END = new Date().getTime();
//	console.log('It tooks:', T_END - T_START, 'ms');
//	Ambilight.changeLightColor(2, rgb.r,rgb.g,rgb.b);
//	T_START = T_END;
//},refreshRate);



//setInterval(function(){
//	T_END = new Date().getTime();
//	ScreenshotManipulator.capture();
//	console.log('It tooks:', T_END - T_START, 'ms');
//	T_START = T_END;
//},refreshRate);

//
//recapture = function() {
//	T_END = new Date().getTime();
//	console.log('It tooks:', T_END - T_START, 'ms');
//	T_START = T_END;
//	ScreenshotManipulator.capture(recapture);
//};
//
//ScreenshotManipulator.capture(recapture);

//var way = true;
//setInterval(function(){
//	Ambilight.changeLightColor(2,way ? 255 : 0,0,way ? 0 : 255);
//	way = !way;
//},1000);

//var p = 2;
//Ambilight.changeLightColor(2,p,p,p, 200);
////
//Ambilight.getLightBulbs(function(r){
//		console.log(r);
//});
//var d = ColorManipulator.getClosestColor(["FF0000","0000FF"],"FF11FF");
//console.log(d);

var rgb = [111,111,111];

for (var i=0;i<5;i++) {
	Ambilight.changeLightColor(2, {
		r: rgb[0],
		g: rgb[1],
		b: rgb[2],
		brightness:0
	}, function (a) {
		console.log(a);
	});
}