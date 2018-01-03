# TofHue-Ambilight
Philips HUE Ambilight for your computer

Installation
============
First you need to call `node register.js` and follow instructions

Use
===
1. You can use `node huenow.js` to command lights

```js
// node huenow 0 0 255 0 0 255

var L = process.argv[2];	// Light ID (0 = all)
var F = process.argv[3];	// Infinite timeout (interval time in ms) (0 = onetime) (-1 = lightoff)
var R = process.argv[4];	// Red (0-255)	
var G = process.argv[5];	// Green (0-255)
var B = process.argv[6];	// Blue (0-255)
var N = process.argv[7]; 	// Brightness (0-255)
```

2. There is also `node index.js`, in this mode hue lights color will match your computer screen 