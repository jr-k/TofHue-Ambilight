//
// Globals
//
var hue = require('node-hue-api');
var HueApi = require('node-hue-api').HueApi;
var lightState = hue.lightState;
var filesystem = require('fs');
var Utils = require('./Utils');
var ColorManipulator = require('./ColorManipulator');

var configFilename = './tofhue.json';
var registerIfNoConfiguration = true;
var token = null;
var api = null;
var defaultChangeLightColorArgs = {
	r: 255,
	g: 0,
	b: 0,
	brightness: 50,
	transition: 400,
	turnOn: true
};

var ERROR_USERNAME_MISSING = 0;
var ERROR_BUTTON_NOT_PRESSED = 101;
var ERROR_DEVICE_OFF = 201;

//
// Class
//
var Ambilight = {
	username: 'TofHUE Ambilight',
	registerTimout: 30,
	lightState: lightState,
	swatchesColorsMapping: {
		'892BE2': {name: 'Light Purple', r:137, g:43, b:226, turnOn:true, brightness:50},
		'c8bfe7': {name: 'Light Purple', r:137, g:43, b:226, turnOn:true, brightness:50},
		'0000FF': {name: 'Blue', r:0, g:0, b:255, turnOn:true, brightness:50},
		'44859d': {name: 'Blue', r:0, g:0, b:255, turnOn:true, brightness:50},
		'00FFFF': {name: 'Aqua', r:0, g:255, b:255, turnOn:true, brightness:50},
		'A52828': {name: 'Light Red', r:165, g:40, b:40, turnOn:true, brightness:50},
		'FF0000': {name: 'Red', r:255, g:0, b:0, turnOn:true, brightness:50},
		'7FFF28': {name: 'Light Green', r:127, g:255, b:40, turnOn:true, brightness:50},
		'00ff60': {name: 'Green', r:0, g:255, b:0, turnOn:true, brightness:0},
		'869647': {name: 'Green', r:0, g:255, b:0, turnOn:true, brightness:0},
		'659647': {name: 'Green', r:0, g:255, b:0, turnOn:true, brightness:0},
		'FF7F28': {name: 'Orange', r:255, g:127, b:0, turnOn:true, brightness:50},
		'967f47': {name: 'Orange', r:255, g:127, b:0, turnOn:true, brightness:0},
		'FF1493': {name: 'Pink', r:255, g:20, b:147, turnOn:true, brightness:50},
		'ffaec9': {name: 'Pink Light', r:255, g:20, b:147, turnOn:true, brightness:0},
		'FFC800': {name: 'Yellow', r:255, g:200, b:0, turnOn:true, brightness:50},
		'FFFFFF': {name: 'White', r:255, g:255, b:255, turnOn:true, brightness:50},
		'6F6F6F': {name: 'Grey', r:111, g:111, b:111, turnOn:true, brightness:0},
		'c3c3c3': {name: 'Grey', r:111, g:111, b:111, turnOn:true, brightness:0},
//		'000000': {name: 'Black', r:0, g:0, b:0, turnOn:false, brightness:0},
		'000000': {name: 'Black', r:111, g:111, b:111, turnOn:true, brightness:0},
		'008aff': {name: 'Blue Marine', r:0, g:0, b:150, turnOn:true, brightness:50},
		'00e4ff': {name: 'Blue Truquoise', r:135, g:60, b:249 , turnOn:true, brightness:100},
	}
};

// Executed one time at startup
Ambilight.init = function () {

};

// Return an instance of the authenticated api (singleton)
Ambilight.getAuthenticatedApi = function () {
	if (api !== null) {
		return api;
	}

	var config = Ambilight.getConfiguration();

	if (config) {
	api = new HueApi(config.hostname, config.token);
	Ambilight.init();
	return api;
	}

	throw new Error('You aren\'t connected to any bridge.');
};


// Returns the last known bridge configuration
Ambilight.getConfiguration = function() {
	try {
		stats = filesystem.lstatSync(configFilename);

		if (stats.isFile()) {
			var config = JSON.parse(filesystem.readFileSync(configFilename, "utf8"));
			console.log('===================');
			console.log('Configuration Found !');
			console.log('===================');
			console.log("Hostname", config.hostname);
			console.log("Token", config.token);
			return config;
		}
	} catch(e) {
		console.log('Error: No config file');
		Ambilight.searchBridge(registerIfNoConfiguration);
	}
};

// Search for bridges and register
Ambilight.searchBridge = function (registerForFirstBridge, callback, errCallback) {
	if (typeof errCallback !== 'function') {
		errCallback = function(){};
	}
	
	hue.nupnpSearch()
		.then(function(bridges) {
			if (bridges.length > 0) {
				bridge = bridges[0];
				console.log('===================');
				console.log('Hue Bridges Found !');
				console.log('===================');
				console.log('ID',bridge.id);
				console.log('IP',bridge.ipaddress);

				if (registerForFirstBridge) {
					Ambilight.registerOnBridge(bridge, callback);
				} else if (callback) {
					callback(bridges);
				}
			} else {
				errCallback();
			}
		})
		.fail(errCallback)
		.done()
	;
};

// Register into a bridge
Ambilight.registerOnBridge = function (bridge, callback) {
	api = new HueApi();
	var stopWatch = 0;
	var registering = setInterval(function(){
		api.registerUser(bridge.ipaddress, Ambilight.username)
			.then(function(result){
				console.log('===================');
				console.log('Connected !');
				console.log('===================');
				console.log("Generated token", result);

				filesystem.writeFileSync(configFilename, JSON.stringify({
					username: Ambilight.username,
					hostname: bridge.ipaddress,
					token: result
				}));

				clearInterval(registering);

				if (callback)
					callback(true);
			})
			.fail(function(err){
				if (err.type !== ERROR_BUTTON_NOT_PRESSED && err.type !== ERROR_USERNAME_MISSING) {
					console.log('===================');
					console.log('Error on registration !');
					console.log('===================');
					console.log(err);
				}
			})
			.done()
		;

		if (stopWatch >= Ambilight.registerTimout) {
			clearInterval(registering);
			console.log("You didn't pressed the button.");

			if (callback)
				callback(false);
		} else {
			var leftTime = Ambilight.registerTimout - stopWatch;
			var unit = leftTime > 1 ? 'seconds' : 'second';
			console.log("You have", leftTime, unit, "left to push the button on the bridge");
		}

		stopWatch++;
	},1000);


};



// Returns the list of all users registered in the current bridge
Ambilight.registeredUsers = function(callback) {
	Ambilight.getAuthenticatedApi().registeredUsers()
		.then(callback)
		.done()
	;
};

// Delete a user by the token
Ambilight.deleteUserByToken = function(token, callback) {
	Ambilight.getAuthenticatedApi().deleteUser(token)
		.then(callback)
		.fail(function(err) {
			console.log(err);
		})
		.done()
	;
};

// Returns the list of all light bulbs connected to the current bridge
Ambilight.getLightBulbs = function (callback) {
	Ambilight.getAuthenticatedApi().lights()
		.then(callback)
		.done()
	;
};

// Returns the list of all groups registered to the current bridge
Ambilight.getGroups = function (callback) {
	Ambilight.getAuthenticatedApi().groups()
		.then(callback)
		.done()
	;
};

// Change light state of a given light bulb (Direct Input Mode)
Ambilight.changeLightState = function (lightId, state, callback) {
	Ambilight.getAuthenticatedApi().setLightState(lightId, state)
		.then(callback)
		.done()
	;
};

// Change light state of a given light bulb (Direct Input Mode)
Ambilight.changeGroupLightState = function (groupId, state, callback) {
	Ambilight.getAuthenticatedApi().setGroupLightState(groupId, state)
		.then(callback)
		.done()
	;
};

// Change the color of a given light bulb
Ambilight.changeLightColor = function (lightId, opts, callback) {
	var stateOptions = Utils.mergeArgs(opts, defaultChangeLightColorArgs);
	var r = stateOptions.r,
		g = stateOptions.g,
		b = stateOptions.b,
		turnOn = stateOptions.turnOn,
		transition = stateOptions.transition,
		brightness = stateOptions.brightness;

	var state = lightState.create().on();

	if (turnOn) {
		state = state.transition(transition).rgb(r, g, b).bri(brightness);
	} else {
		state = state.transition(transition).off();
	}

	Ambilight.getAuthenticatedApi().setLightState(lightId, state)
		.then(callback)
		.fail(function(err){
			if (err.type == ERROR_DEVICE_OFF) {
				Ambilight.changeLightState(lightId, lightState.create().on(), function(){
					Ambilight.changeLightState(lightId, state);
				});
			} else {
				console.log(err);
			}
		})
		.done()
	;
};


// Generate the swatches array
Ambilight.generateSwatchesHex = function() {
	Ambilight.swatchesColorsHexCodes = [];

	for (var hex in Ambilight.swatchesColorsMapping) {
		var swatche = Ambilight.swatchesColorsMapping[hex];
		Ambilight.swatchesColorsHexCodes.push(hex);
	}

	return Ambilight.swatchesColorsHexCodes;
};

// Change the color of a given light bulb following the swatches
Ambilight.changeLightColorFromSwatches = function (lightId, opt, callback) {

	var hex = ColorManipulator.rgbToHex(opt.r, opt.g, opt.b);
	var swatches = Ambilight.swatchesColorsHexCodes === undefined
		? Ambilight.generateSwatchesHex()
		: Ambilight.swatchesColorsHexCodes;

	var closestHex = ColorManipulator.getClosestColor(swatches, hex);
	var swatche = Ambilight.swatchesColorsMapping[closestHex];

	Ambilight.changeLightColor(lightId, swatche, callback);
};

// Create a new light state and use it directly
Ambilight.newLightState = function (turnOff) {
	if (turnOff)
		return lightState.create().off();

	return lightState.create().on();
};

module.exports = Ambilight;