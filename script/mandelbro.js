var canvas;
var context;  
var pixel;    //drawing surface for blitting
var updating; //bool
var focusx, focusy, magnify, bound, lineWidth; //user-controlled parameters
var palette; //colour pallete (Uint8 array)
var updateLine, minx, miny, ratio, width, height, step; //drawing parameters.
var mandelLoop; //handle for the drawing process


function init(){
	canvas = document.getElementById('mandelImage');
	context = canvas.getContext('2d');
	canvas.addEventListener('click', handleMouse, false);
	window.addEventListener('keydown', handleKey, false);
	window.onresize = canvasResize;
	focusx = -0.5;
	focusy = 0;
	magnify = 1.0;
	bound = 100;
	lineWidth = 20;
	palette = new Uint8Array(3000);

	generatePalette();
	canvasResize();
}

function setup(){
	window.clearInterval(mandelLoop);

	updateLine = 0;
	ratio = canvas.width/canvas.height;
	width = 3 * ratio/magnify;
	height = 3/magnify;
	minx = focusx - width/2;
	miny = focusy - height/2;
	step = 3/magnify/canvas.height;
	

	mandelLoop = window.setInterval(drawLine, 15);
}

function canvasResize(){
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	pixel = context.getImageData(0,0, canvas.width, lineWidth);
	setup();
}

function handleMouse(e){
	focusx = minx + step*e.clientX;
	focusy = miny + step*e.clientY;
	setup();
}

function handleKey(e){
	if (e.which == 33){ 
		magnify *= 2;
	}
	else if (e.which == 34){
		magnify /= 2;
		if (magnify < 1) magnify = 1;
	}
	else if (e.which == 107){
		bound += 100;
	}
	else if (e.which == 109){
		bound -= 100;
		if (bound <= 0) bound = 100;
	}
	else return;

	setup();
}

function evalPoint(real, imag){
	var p = Math.sqrt(Math.pow(real - 0.25, 2) + Math.pow(imag, 2));
	if (real < p - 2*Math.pow(p, 2) + 0.25 || Math.pow(real + 1, 2) + Math.pow(imag, 2) < 1/16){
		return 1000;
	}
	else {
		var n = 0;
		var zReal = real;
		var zImag = imag;
		var temp;
		while (n < bound && Math.sqrt(Math.pow(zReal, 2) + Math.pow(zImag, 2)) < 3){
			temp = real + Math.pow(zReal, 2) - Math.pow(zImag, 2);
			zImag = imag + 2*zReal*zImag;
			zReal = temp;
			n++;
		}
		if (n == bound){
			return 1000;
		}
		else{
			return (Math.floor(10*(n + 1 - Math.log(Math.log(Math.sqrt(Math.pow(zReal, 2) + Math.pow(zImag, 2))))/Math.LN2)))%1000;
		}
	}
}

function drawLine(){
	var currentx = minx;
	var currenty = miny + updateLine*step;
	var col;
	for (var i = 0; i < pixel.data.length; i+=4) {
		col = evalPoint(currentx, currenty);
		pixel.data[i] = (col == 1000)?0:palette[col*3];
		pixel.data[i+1] = (col == 1000)?0:palette[col*3 + 1];
		pixel.data[i+2] = (col == 1000)?0:palette[col*3 + 2];
		pixel.data[i+3] = 255;
		currentx += step;
		if ((i/4)%canvas.width == 0 && i > 0){
			currenty += step;
			currentx = minx;
		}
	}
	context.putImageData(pixel, 0, updateLine);
	updateLine += lineWidth;
	if (updateLine >= canvas.height) {
		updateLine = 0;
		updating = false;
		window.clearInterval(mandelLoop);
	}
}

function generatePalette(){
	var c1 = [25, 25, 122];
	//var c2 = [205, 1333, 0];
	//var c3 = [255, 255, 255];
	var c4 = [180, 205, 205];

	var c2 = [138, 54, 15];
	var c3 = [255,246,143];
	//var c1 = [56, 142, 142];
	//var c4 = [255, 215, 0];

	for (var i = 0; i < 250; i++){
		palette[i*3]    = c1[0] + (i * (c2[0] - c1[0]) / 250);
		palette[i*3 + 1] = c1[1] + (i * (c2[1] - c1[1]) / 250);
		palette[i*3 + 2] = c1[2] + (i * (c2[2] - c1[2]) / 250);

		palette[i*3 + 750] = c2[0] + (i * (c3[0] - c2[0]) / 250);
		palette[i*3 + 751] = c2[1] + (i * (c3[1] - c2[1]) / 250);					
		palette[i*3 + 752] = c2[2] + (i * (c3[2] - c2[2]) / 250);

		palette[i*3 + 1500] = c3[0] + (i * (c4[0] - c3[0]) / 250);
		palette[i*3 + 1501] = c3[1] + (i * (c4[1] - c3[1]) / 250);
		palette[i*3 + 1502] = c3[2] + (i * (c4[2] - c3[2]) / 250);

		palette[i*3 + 2250] = c4[0] + (i * (c1[0] - c4[0]) / 250);
		palette[i*3 + 2251] = c4[1] + (i * (c1[1] - c4[1]) / 250);
		palette[i*3 + 2252] = c4[2] + (i * (c1[2] - c4[2]) / 250);
	}
}

