//
// Globals
//
var extend = require('util')._extend;

//
// Class
//
var Utils = {};

// Merge arguments partials
Utils.mergeArgs = function (userArgs, defaultArgs) {
	var outputArgs = extend({}, defaultArgs);

	for (var k in userArgs) {
		outputArgs[k] = userArgs[k];
	}
	return outputArgs;
};

module.exports = Utils;