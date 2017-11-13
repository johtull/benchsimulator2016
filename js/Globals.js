/* OBJECTS */
var player = {
	x: 0,//canvas.width;
	y: 0,//canvas.height;
	mx: 0,	//horizontal movement speed
	my: 0,	//vertical movement speed
	sizeX: 80,
	sizeY: 64,
	img: 0,
	points: 0,
	health: 10,
	maxHealth: 10
};

var enemy = {
	x: 0,
	y: 0,
	mx: 0,	//movement speed x
	my: 0,	//movement speed y
	sizeX: 64,
	sizeY: 80,
	delay: 0,	//delay ticks before moving
	eggDelay: 0,	// delay before egg drop
	type: 'man',
	img: 'man'
};

var egg = {
	x: 0,
	y: 0,
	my: 2,
	sizeX: 24,
	sizeY: 32,
	delay: 0, //time until nade explosion
	type: 0,  //0=regular;1=hp;2=nade,
	img: 'eggy'
};

var explosion = {
	x: 0,
	y: 0,
	sizeX: 64,
	sizeY: 64,
	delay: 64,
	hit: false
};

/* GLOBALS */
var canvas = {};
var ctx = {};

var hard = false;
var soundEnabled = true;
var gamestarted = false;
var paused = false;
var gameover = false;


var enemies = [];
var eggies = [];
var explosions = [];
var man, purple, birdL, birdR;
var eggy = document.getElementById("img_egg");
var egghp = document.getElementById("img_hp");
var eggnade = document.getElementById("img_nade");
var colorboom = document.getElementById("img_boom");

var ding = new Audio('sounds/ding.wav');
var bird = new Audio('sounds/bird.wav');
var pain = new Audio('sounds/pain.wav');
var boom = new Audio('sounds/boom1.wav');
/* GLOBALS */


function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

function playSound(sound) {
	if(soundEnabled) {
		eval(sound).pause();
		eval(sound).currentTime = 0;
		eval(sound).play();
	}
}

function goFullScreen(element) {
    if(canvas.requestFullScreen)
        canvas.requestFullScreen();
    else if(canvas.webkitRequestFullScreen)
        canvas.webkitRequestFullScreen();
    else if(canvas.mozRequestFullScreen)
        canvas.mozRequestFullScreen();
}

function refreshCanvasSize() {
	//	set screen size to window size
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	console.log('updated screen');
}