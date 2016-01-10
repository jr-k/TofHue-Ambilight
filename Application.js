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

Application.startIntervalColorMode = function (position, opts) {
	setInterval(function(){
		Ambilight.changeLightColor(2, Application.getScanPosition(position, opts));
	}, Application.refreshRate);
};

Application.startIntervalSwatchesMode = function (position, opts) {
	setInterval(function(){
		Ambilight.changeLightColorFromSwatches(2, Application.getScanPosition(position, opts));
	}, Application.refreshRate);
};

Application.startCallbackColorMode = function (position, opts) {
	Ambilight.changeLightColor(2, Application.getScanPosition(position, opts), function(){
		setTimeout(Application.startCallbackColorMode,1);
	});
};

Application.startCallbackSwatchesMode = function (position, opts) {
	Ambilight.changeLightColorFromSwatches(2, Application.getScanPosition(position, opts), function(){
		setTimeout(Application.startCallbackSwatchesMode,1);
	});
};

module.exports = Application;