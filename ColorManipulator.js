//
// Globals
//

var R = 0;
var G = 1;
var B = 2;

//
// Class
//
var ColorManipulator = {};

// Convert a color from HEX to RGB format
ColorManipulator.hexToRgb = function (hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {r: parseInt(result[1], 16),g: parseInt(result[2], 16),b: parseInt(result[3], 16)} : null;
};

// Convert a color from RGB to HEX format
ColorManipulator.rgbToHex = function (red, green, blue) {
	red = Math.max(0, Math.min(~~red, 255));
	green = Math.max(0, Math.min(~~green, 255));
	blue = Math.max(0, Math.min(~~blue, 255));
	return '#' + ('00000' + (red << 16 | green << 8 | blue).toString(16)).slice(-6);
};

//
// Returns dominant color with a given hex color list
//		With 'colorList' in HEX format
//
// 		if hex == true:
// 			returns hex format
//		otherwise
//			returns rgb format
//
ColorManipulator.findDominantColor = function (colorList, hex) {
	var colorMap = [
		{},
		{},
		{}
	];
	var color = r = g = b = rC = gC = bC = colorDecomposed = 0;

	for (var i = 0; i < colorList.length; i++) {
		color = colorList[i];
		colorDecomposed = ColorManipulator.hexToRgb(color);

		if (colorDecomposed === null)
			continue;

		r = colorDecomposed.r;
		g = colorDecomposed.g;
		b = colorDecomposed.b;

		rC = colorMap[R][r];
		if (rC === undefined)
			rC = 0;
		colorMap[R][r] = ++rC;

		gC = colorMap[G][g];
		if (gC === undefined)
			gC = 0;
		colorMap[G][g] = ++gC;

		bC = colorMap[B][b];
		if (bC === undefined)
			bC = 0;
		colorMap[B][b] = ++bC;
	}

	var rgb = [0, 0, 0];

	for (var i = 0; i <= 2; i++) {
		var max = 0;
		var val = 0;

		for (var k in colorMap[i]) {
			if (colorMap[i][k] > max) {
				max = colorMap[i][k];
				val = k;
			}
		}
		rgb[i] = val;
	}

	if (hex) {
		return ColorManipulator.rgbToHex(rgb[R], rgb[G], rgb[B]);
	}

	return {r: rgb[R], g: rgb[G], b: rgb[B]};
};


//
// Returns average color with a given hex color list
//		With 'colorList' in HEX format
//
// 		if hex == true:
// 			returns hex format
//		otherwise
//			returns rgb format
//
ColorManipulator.findAverageColor = function (colorList, hex) {
	var colorDecomposed, r = g = b = 0, countColors = colorList.length;
	var rgb = {r:0,g:0,b:0};

	for (var i = 0;i < countColors; i++) {

		colorDecomposed = ColorManipulator.hexToRgb(colorList[i]);
		r += colorDecomposed.r;
		g += colorDecomposed.g;
		b += colorDecomposed.b;
	}

	rgb.r = ~~(r/countColors);
	rgb.g = ~~(g/countColors);
	rgb.b = ~~(b/countColors);

	if (hex) {
		return ColorManipulator.rgbToHex(rgb.r, rgb.g, rgb.b);
	}

	return rgb;
};

// Get distance between 2 HEX colors
ColorManipulator.getColorDistanceBetween = function (source, target) {
	source = source.replace('#','',source.toLowerCase());
	target = target.replace('#','',target.toLowerCase());

	if (!source.length || !target.length) return 0;

	return ColorManipulator.getColorDistanceBetween(source.slice(2), target.slice(2)) +
		Math.abs(parseInt(source.slice(0, 2), 16) - parseInt(target.slice(0, 2), 16));
};

// Get the closest color from a swatches
ColorManipulator.getClosestColor = function (haystack, needle) {
	var min = 0xffffff;
	var best, current, i;

	for (i = 0; i < haystack.length; i++) {
		current = ColorManipulator.getColorDistanceBetween(haystack[i], needle);

		if (current < min) {
			min = current;
			best = haystack[i];
		}
	}
	return best;
};

module.exports = ColorManipulator;