//
// Globals
//
var Ambilight = require('./Ambilight');
var Scanner = require('./Scanner');

//
// Class
//
var Application = {
	refreshRate: 100,
	DEFAULT_LIGHT_ID: 1,
	SCAN_LEFT: 'left',
	SCAN_CENTER: 'center',
	SCAN_RIGHT: 'right'
};


Application.getScanPosition = function (position, opts) {
	switch (position) {
		case Application.SCAN_LEFT:
			return Scanner.scanOnLeftScreen(opts);
		break;
		case Application.SCAN_CENTER:
			return Scanner.scanOnCenterScreen(opts);
		break;
		case Application.SCAN_RIGHT:
			return Scanner.scanOnRightScreen(opts);
		break;
		default:
			return Scanner.scanOnCenterScreen(opts);
		break;
	}
};

Application.initNewSetup = function() {
	Ambilight.searchBridge(true, function() {
		console.log('Done !');
	}, function() {
		console.log('No bridge found in your local network');
	});
}

Application.changeLightColor = function (lightId, r, g, b, brightness) {
	Ambilight.changeLightColor(lightId, {r:r,g:g,b:b,brightness:brightness});
};

Application.turnOffLight = function (lightId) {
	Ambilight.changeLightColor(lightId, {turnOn:false, r:255,g:255,b:255,brightness:255});
};

Application.startIntervalColorMode = function (position, opts) {
	setInterval(function(){
		Ambilight.changeLightColor(Application.DEFAULT_LIGHT_ID, Application.getScanPosition(position, opts));
	}, Application.refreshRate);
};

Application.startIntervalSwatchesMode = function (position, opts) {
	setInterval(function(){
		Ambilight.changeLightColorFromSwatches(Application.DEFAULT_LIGHT_ID, Application.getScanPosition(position, opts));
	}, Application.refreshRate);
};

Application.startCallbackColorMode = function (position, opts) {
	Ambilight.changeLightColor(Application.DEFAULT_LIGHT_ID, Application.getScanPosition(position, opts), function(){
		setTimeout(Application.startCallbackColorMode,1);
	});
};

Application.startCallbackSwatchesMode = function (position, opts) {
	Ambilight.changeLightColorFromSwatches(Application.DEFAULT_LIGHT_ID, Application.getScanPosition(position, opts), function(){
		setTimeout(Application.startCallbackSwatchesMode,1);
	});
};

module.exports = Application;