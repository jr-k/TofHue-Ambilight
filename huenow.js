var Application = require('./Application');

// node huenow 0 0 255 0 0 255

var enumL = {
	ALL: 0
};

var enumF = {
	ON: 0,
	OFF: -1,
	TOGGLE: -2
};

var L = process.argv[2];	// Light ID (0 = ALL or use comma separated values)
var F = process.argv[3];	// Infinite timeout (0 = ON) (-1 = OFF) (-2 = TOGGLE)
var R = process.argv[4];	// Red (0-255)	
var G = process.argv[5];	// Green (0-255)
var B = process.argv[6];	// Blue (0-255)
var N = process.argv[7]; 	// Brightness (0-255)

if (typeof enumL[L.toUpperCase()] !== 'undefined') {
	L = enumL[L.toUpperCase()] + "";
}

if (typeof enumF[F.toUpperCase()] !== 'undefined') {
	F = enumF[F.toUpperCase()];
}

var BULBS = {};

var argLights = L.split(',');
var baseState = null;
var baseLight = null;

var loopBulbs = function(cb) {
	Application.API.getLightBulbs(function(bulbs) {
		bulbs.lights.forEach(function(bulb) {
			BULBS[bulb.id] = {id: bulb.id, name: bulb.name, state: bulb.state.on};
			console.log('Register bulbId:', bulb.id,' name:', bulb.name);

			if ((bulb.id == argLights[0] || L == 0) && baseState === null) {
				baseState = bulb.state.on;
				baseLight = bulb.id;
			}
		});
		cb();
	});
};


var colorSwitch = function() {
	if (L == 0) {
		var BULBS_KEYS = Object.keys(BULBS);

		BULBS_KEYS.forEach(function(bulbKey) {
			var bulb = BULBS[bulbKey];

			if (F == -1) {
				Application.turnOffLight(bulb.id);
			} else if (F == -2) {
				if (baseState) {
					Application.turnOffLight(bulb.id);
				} else {
					Application.changeLightColor(bulb.id,R,G,B,N);
				}
			}  else {
				Application.changeLightColor(bulb.id,R,G,B,N);
			}
		});
	} else {
		argLights.forEach(function(bulbId) {
			if (F == -1) {
				Application.turnOffLight(bulbId);
			} else if (F == -2) {
				if (baseState) {
					Application.turnOffLight(bulbId);
				} else {
					Application.changeLightColor(bulbId,R,G,B,N);
				}
			} else {
				Application.changeLightColor(bulbId,R,G,B,N);
			}
		});
	}
};


loopBulbs(function() {
	console.log('Base light: ', baseLight);
	console.log('Base state: ', (baseState ? 'ON' : 'OFF'));

	if (F > 0) {
		setInterval(function() {
			colorSwitch();
		},Math.abs(F));
	} else {
		colorSwitch();
	}
});
