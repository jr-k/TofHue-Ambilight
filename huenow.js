var Application = require('./Application');

// node huenow 0 0 255 0 0 255

var L = process.argv[2];	// Light ID (0 = all)
var F = process.argv[3];	// Infinite timeout (0 = off)
var R = process.argv[4];	// Red (0-255)	
var G = process.argv[5];	// Green (0-255)
var B = process.argv[6];	// Blue (0-255)
var N = process.argv[7]; 	// Brightness (0-255)


var colorSwitch = function() {
	if (L == 0) {
		for (var i = 1; i <= 2; i++) {
			Application.changeLightColor(i,R,G,B,N);
		}
	} else {
			Application.changeLightColor(L,R,G,B,N);
	}
}

if (F != 0) {
	setInterval(function() {
		colorSwitch();
	},Math.abs(F));
} else {
	colorSwitch();
}


