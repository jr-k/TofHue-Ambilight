//
// Globals
//
var hue = require('node-hue-api');
var HueApi = require('node-hue-api').HueApi;
var lightState = hue.lightState;
var filesystem = require('fs');
var Utils = require('./Utils');
var ColorManipulator = require('./ColorManipulator');

var username = 'TofHue Amiblight';
var configFilename = './tofhue.json';
var registerIfNoConfiguration = true;
var token = null;
var api = null;
var defaultChangeLightColorArgs = {
	r: 255,
	g: 0,
	b: 0,
	brightness: 50,
	transition: 100
};

var ERROR_BUTTON_NOT_PRESSED = 101;
var ERROR_DEVICE_OFF = 201;

//
// Class
//
var Ambilight = {
	registerTimout: 4,
	swatchesColors: [
		{name: 'Light Purple', r:137, g:43, b:226, hex:'892BE2', turnOn:1, brightness:50, transition:100},
		{name: 'Blue', r:0, g:0, b:255, hex:'0000FF', turnOn:1, brightness:50, transition:100},
		{name: 'Aqua', r:0, g:255, b:255, hex:'00FFFF', turnOn:1, brightness:50, transition:100},
		{name: 'Light Red', r:165, g:40, b:40, hex:'A52828', turnOn:1, brightness:50, transition:100},
		{name: 'Red', r:255, g:0, b:0, hex:'FF0000', turnOn:1, brightness:50, transition:100},
		{name: 'Light Green', r:127, g:255, b:40, hex:'7FFF28', turnOn:1, brightness:50, transition:100},
		{name: 'Orange', r:255, g:127, b:0, hex:'FF7F28', turnOn:1, brightness:50, transition:100},
		{name: 'Pink', r:255, g:20, b:147, hex:'FF1493', turnOn:1, brightness:50, transition:100},
		{name: 'Yellow', r:255, g:200, b:0, hex:'FFC800', turnOn:1, brightness:50, transition:100},
		{name: 'White', r:255, g:255, b:255, hex:'FFFFFF', turnOn:1, brightness:50, transition:100},
		{name: 'Grey', r:111, g:111, b:111, hex:'6F6F6F', turnOn:1, brightness:0, transition:100},
		{name: 'Black', r:0, g:0, b:0, hex:'000000', turnOn:0, brightness:0, transition:100}
	]
};

// Return an instance of the authenticated api (singleton)
Ambilight.getAuthenticatedApi = function () {
	if (api !== null) {
		return api;
	}

	var config = Ambilight.getConfiguration();
	api = new HueApi(config.hostname, config.token);
	return api;
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
Ambilight.searchBridge = function (registerForFirstBridge, callback) {
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
			}
		})
		.fail(callback)
		.done()
	;
};

// Register into a bridge
Ambilight.registerOnBridge = function (bridge, callback) {
	api = new HueApi();
	var stopWatch = 0;
	var registering = setInterval(function(){
		api.registerUser(bridge.ipaddress, username)
			.then(function(token){
				console.log('===================');
				console.log('Connected !');
				console.log('===================');
				console.log("Generated token", result);

				filesystem.writeFileSync(configFilename, JSON.stringify({
					hostname: bridge.ipaddress,
					token: result
				}));

				clearInterval(registering);

				if (callback)
					callback(true);
			})
			.fail(function(err){
				if (err.type !== ERROR_BUTTON_NOT_PRESSED) {
					console.log(err);
				}
			})
			.done()
		;
		stopWatch++;

		if (stopWatch >= Ambilight.registerTimout) {
			clearInterval(registering);
			console.log("You didn't pressed the button.");

			if (callback)
				callback(false);
		} else {
			console.log("You have", Ambilight.registerTimout - stopWatch ,"seconds left to push the button on the bridge");
		}
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

// Change light state of a given light bulb (Direct Input Mode)
Ambilight.changeLightState = function (lightId, state, callback) {
	Ambilight.getAuthenticatedApi().setLightState(lightId, state)
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
		transition = stateOptions.transition,
		brightness = stateOptions.brightness;

	var state = lightState.create().on().transition(transition).rgb(r, g, b).bri(brightness);

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

// Change the color of a given light bulb
Ambilight.changeLightColorFromSwatches = function (lightId, rgb, callback) {

	ColorManipulator
	var stateOptions = Utils.mergeArgs(opts, defaultChangeLightColorArgs);
	var r = stateOptions.r,
		g = stateOptions.g,
		b = stateOptions.b,
		transition = stateOptions.transition,
		brightness = stateOptions.brightness;

};

// Create a new light state and use it directly
Ambilight.newLightState = function (turnOff) {
	if (turnOff)
		return lightState.create().off();

	return lightState.create().on();
};

module.exports = Ambilight;
