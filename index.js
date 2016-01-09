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
////	Ambilight.changeLightColor(2, rgb);
//	Ambilight.changeLightColorFromSwatches(2, rgb);
//	T_START = T_END;
//},refreshRate);


function upd() {
	rgb = Scanner.scanOnCenterScreen({averageMode: false, deltaX:400});
	console.log(rgb);
	Ambilight.changeLightColorFromSwatches(2, rgb, function(){
		setTimeout(upd,10);
	});
}

upd();



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


