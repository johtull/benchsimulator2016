// johtull.com/bench
//https://developer.mozilla.org/en-US/docs/Web/API/Detecting_device_orientation

// TODO:
// add gyroscope support
// polish UI + UI scaling (mobile)
// device orientation
var lastPt = null;

function init() {
	document.getElementById('hard_mode_toggle').checked = false;
	document.getElementById('sound_toggle').checked = true;
	
	
	/* LISTENERS */
	document.getElementById('hard_mode_toggle')
			.addEventListener('click', function(e) {
				if(e.target.checked) {
					hard = true;
				}else {
					hard = false;
				}
				
				if(hard) {
					document.getElementsByTagName('html')[0].className = 'hard';
				}else {
					document.getElementsByTagName('html')[0].className = '';
				}
				var images = document.getElementsByClassName('direction_images');
				for(var i = 0; i < images.length; i++) {
					var className = images[i].className;
					if(hard && className.indexOf('normalmode') >= 0) {
						images[i].style = 'display: none;';
					}else if(hard && className.indexOf('hardmode') >= 0) {
						images[i].style = '';
					}else if(!hard && className.indexOf('normalmode') >= 0) {
						images[i].style = '';
					}else if(!hard && className.indexOf('hardmode') >= 0) {
						images[i].style = 'display: none;';
					}
				}
			}, false);
			
	document.getElementById('sound_toggle')
			.addEventListener('click', function(e) {
				if(e.target.checked) {
					soundEnabled = true;
				}else {
					soundEnabled = false;
				}
			}, false);
			
	document.getElementById('start')
			.addEventListener('click', function() {
				initGame();
			}, false);
			
	document.getElementById('back')
			.addEventListener('click', function() {
				if(gameover) {
					gamestarted = false;
					canvas.width = 0;
					canvas.height = 0;
					document.getElementById('stage').className = '';
					document.getElementById('splash').className = '';
					document.getElementById('back').className = 'nodisplay';
				}
			}, false);
			
	/*
	if(window.DeviceOrientationEvent) {
		console.log('window.DeviceOrientationEvent');
		window.addEventListener('deviceorientation', function() {
			console.log('window.addEventListener');
			refreshCanvasSize();
		}, true);
	}
	*/
	
	//	set mouse listener
	document.addEventListener('mousemove', function(e) {
		if(gamestarted) {
			if(e.clientX > 0 && e.clientX < canvas.width && e.clientY > 0 && e.clientY < canvas.height) {
				player.x = e.clientX;
				player.y = e.clientY;
			}
		}
	}, false);
	
	document.addEventListener("keydown", function(e) {
		//wasd = 87, 65, 83, 68
		switch(e.keyCode) {
			case 87:
				player.my = -2;
				break;
			case 83:
				player.my = 2;
				break;
			case 65:
				player.mx = -2;
				break;
			case 68:
				player.mx = 2;
				break;
			case 77:
				soundEnabled = !soundEnabled;
				break;
			case 219: // [
				player.points ++;
				break;
			case 221: // ]
				addEnemy();
				
				break;
			case 32: // spacebar
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight;
				break;
			case 75: // K
				gameover = true;
				break;
			case 80: // P - pause
				paused = !paused;
				// if unpaused, restart main()
				if(!paused) {
					main();
				}else {
					renderPauseBox();
				}
				break;
			default:
				console.log(e.keyCode);
				break;
		}
	}, false);
	/* LISTENERS */
}//init

function initGame() {
	gamestarted = true;
	gameover = false;
	paused = false;
	
	// init canvas and context
	canvas = document.getElementById('stage');
	// check if canvas is supported
	if(!canvas.getContext) {
		alert("Your browser does not support HTML5 Canvas :(");
		return;
	}
	ctx = canvas.getContext('2d');
	
	// set touch
	canvas.addEventListener('touchmove', function(e) {
		e.preventDefault();
		if(gamestarted) {
			if(lastPt != null) {
				player.x = e.touches[0].pageX;
				player.y = e.touches[0].pageY;
			}
			lastPt = { x:e.touches[0].pageX, y:e.touches[0].pageY };
			/*if(e.clientX > 0 && e.clientX < canvas.width && e.clientY > 0 && e.clientY < canvas.height) {
				player.x = e.clientX;
				player.y = e.clientY;
			}*/
		}
	}, false);
	
	canvas.addEventListener('touchend', function(e) {
		e.preventDefault();
		if(gamestarted) {
			lastPt = null;
		}
	},false);
	
	// hide splash
	document.getElementById("splash").className = "nodisplay";
	
	//goFullScreen(canvas);
	
	setTimeout(function() {
		
		refreshCanvasSize();
		
		canvas.background = new Image();
		if(hard) {
			canvas.background.src = 'img/hardmode.png';
			
			//	grab graphics from DOM
			player.img = document.getElementById("img_player_hard");
		
			man = document.getElementById("img_man_hard");
			purple = document.getElementById("img_bad_hard");
			birdL = document.getElementById("img_bird_left_hard");
			birdR = document.getElementById("img_bird_right_hard");
		}else {
			canvas.background.src = 'img/game.png';
			
			//	grab graphics from DOM
			player.img = document.getElementById("img_player");
			
			man = document.getElementById("img_man");
			purple = document.getElementById("img_bad");
			birdL = document.getElementById("img_bird_left");
			birdR = document.getElementById("img_bird_right");
		}
		
		// reset arrays
		enemies = [];
		eggies = [];
		explosions = [];
		
		// reset player
		player.x = canvas.width/2;
		player.y = canvas.height/2;
		player.points = 0;
		if(hard) {
			player.maxHealth = 20;
		}else {
			player.maxHealth = 10;
		}
		player.health = player.maxHealth;
		
		
		//	init first 10 enemies
		for(var i = 0; i < 10; i++) {
			addEnemy();
		}
		
		// start game
		main();
	}, 2000);
}

function main() {
	if(gameover) {
		renderGameOver();
	}else if(!paused) {
		collision();
		draw();
		levels();
		//	consistent framerate
		requestAnimationFrame(main);
	}
}

//	reset enemy for immediate use
function addEnemy() {
	enemy.y = Math.floor((Math.random() * canvas.height) - 32);
	var left_or_right = Math.floor((Math.random() * 2));
	switch(left_or_right) {
		case 0:
			enemy.x = -100;
			if(hard) {
				enemy.mx = Math.floor((Math.random() * 15) + 2);
			}else {
				enemy.mx = Math.floor((Math.random() * 5) + 2);
			}
			break;
		case 1:
			enemy.x = canvas.width + 100;
			enemy.mx = enemy.mx * -1;
			break;
		default:
			console.log("left_or_right OOB: " + left_or_right);
			break;
	}
	enemy.delay = Math.floor((Math.random() * 50));
	enemies.push(clone(enemy));
}

function repurposeEnemy(index) {
	var left_or_right = Math.floor((Math.random() * 2));
	switch(left_or_right) {
		case 0:
			enemies[index].x = -100;
			if(hard) {
				enemy.mx = Math.floor((Math.random() * 15) + 2);
			}else {
				enemy.mx = Math.floor((Math.random() * 5) + 2);
			}
			break;
		case 1:
			enemies[index].x = canvas.width + 100;
			enemies[index].mx = enemies[index].mx * -1;
			break;
		default:
			console.log("left_or_right OOB: " + left_or_right);
			break;
	}
	
	enemies[index].sizeX = 64;
	enemies[index].sizeY = 80;
	enemies[index].y = Math.floor((Math.random() * canvas.height)) + 32;
	
	var enemy_type = Math.floor((Math.random() * 3));
	switch(enemy_type) {
		case 0: //purple
			enemies[index].type = 'purple';
			enemies[index].img = 'purple';
			break;
		case 1:	//bird
			if(left_or_right == 0) {
				enemies[index].type = 'birdR';
				enemies[index].img = 'birdR';
			}else {
				enemies[index].type = 'birdL';
				enemies[index].img = 'birdL';
			}
			if(hard) {
				enemies[index].type += 'Carpet';
					enemies[index].eggDelay = 15;
			}else {
				if(Math.floor((Math.random() * 10)) === 0) {
					enemies[index].type += 'Carpet';
					enemies[index].eggDelay = 25;
				}else {
					enemies[index].eggDelay = Math.floor((Math.random() * (canvas.width / Math.abs(enemies[index].mx))));
				}
			}
			enemies[index].y = Math.floor((Math.random() * 75)) - 10;
			enemies[index].sizeX = 32;
			enemies[index].sizeY = 20;
			
			break;
		default:
			enemies[index].type = 'man';
			enemies[index].img = 'man';
			break;
	}
	
	enemies[index].delay = Math.floor((Math.random() * 50));
}
function addExplosion(eX, eY) {
	explosion.x = eX;
	explosion.y = eY;
	explosions.push(clone(explosion));
}
function addEgg(bX, bY, mY) {
	egg.x = bX;
	egg.y = bY;
	egg.my = mY;
	if(hard) {
		var egg_type = Math.floor((Math.random() * 20));
		if(egg_type === 0) {
			egg.type = 'egghp';
			egg.img = 'egghp';
		}else if(egg_type <= 10) {
			egg.type = 'eggnade';
			egg.img = 'eggnade';
			egg.delay = Math.floor((Math.random() * (canvas.height/egg.my) - 32) + 32);
		}else {
			egg.type = 'eggy';
			egg.img = 'eggy';
		}
	}else {
		var egg_type = Math.floor((Math.random() * 4));
		switch(egg_type) {
			case 1:
				egg.type = 'egghp';
				egg.img = 'egghp';
				break;
			case 2:
				egg.type = 'eggnade';
				egg.img = 'eggnade';
				//egg.delay = Math.floor((Math.random() * (canvas.height - (bY * 2))) + 32);
				egg.delay = Math.floor((Math.random() * (canvas.height/egg.my) - 32) + 32);
				break;
			case 0:
			default:
				egg.type = 'eggy';
				egg.img = 'eggy';
				break;
		}
	}
	eggies.push(clone(egg));
}

function collision() {
	//	unused keyboard controls
	//player.x += player.mx;
	//player.y += player.my;
	
	if(player.x < 0) {
		player.x = 0;
	}
	if(player.y < 0) {
		player.y = 0;
	}
	if(player.x > canvas.width) {
		player.x = canvas.width;
	}
	if(player.y > canvas.height) {
		player.y = canvas.height;
	}
	
	//	enemy stage + player collision
	for(var i = 0; i < enemies.length; i++) {
		//	enemies are delaying
		if(enemies[i].delay > 0) {
			enemies[i].delay--;
		//	enemies are moving
		}else {
			//	if enemy is OOB, reset
			if(enemies[i].x > canvas.width + 100 || enemies[i].x < -100) {
				repurposeEnemy(i);
				
			//	if enemy collides with player, add points
			} else if(player.x < enemies[i].x + enemies[i].sizeX && player.x > enemies[i].x &&
					player.y < enemies[i].y + enemies[i].sizeY && player.y > enemies[i].y) {
						
				if(enemies[i].type == 'man') {
					player.points++;
					if(soundEnabled)
						playSound('ding');
				}else {
					player.health--;
					if(soundEnabled) {
						if(enemies[i].type.startsWith('bird')) {
							playSound('bird');
						}else {
							playSound('pain');
						}
					}
				}
				repurposeEnemy(i);
				
			//	else, enemy is in bounds - move
			} else {
				enemies[i].x += enemies[i].mx;
				enemies[i].y += enemies[i].my;
				
				if(enemies[i].type.startsWith('bird') && enemies[i].eggDelay != -1) {
					switch(enemies[i].eggDelay) {
						case 0:
							if(hard) {
								addEgg(enemies[i].x, enemies[i].y, Math.abs((Math.random() * 5) + 2));
							}else {
								addEgg(enemies[i].x, enemies[i].y, 2);
							}
							enemies[i].eggDelay--;
							if(enemies[i].type.indexOf('Carpet') >= 0) {
								enemies[i].eggDelay = 10;
							}
							break;
						default:
							enemies[i].eggDelay--;
					}
				}
			}
		}
	}//for enemies
	
	for(var i = 0; i < eggies.length; i++) {
		eggies[i].y += eggies[i].my;
		
		if(eggies[i].y > canvas.height + 32) {
			if(eggies[i].type === 'eggnade')
			eggies.splice(i, 1);
			continue;
		}
		//console.log(i + '\t' + eggies.length);
		if(player.x < eggies[i].x + eggies[i].sizeX && player.x > eggies[i].x &&
		   player.y < eggies[i].y + eggies[i].sizeY && player.y > eggies[i].y) {
			   if(eggies[i].type == 'egghp') {
				    if(player.health < player.maxHealth) {
						player.health++;
				    }
			   }else {
				   player.health--;
				   if(soundEnabled)
						playSound('pain');
			   }
			   eggies.splice(i, 1);
			   continue;
		}
		
		if(eggies[i].type == 'eggnade' && eggies[i].delay != -1) {
			switch(eggies[i].delay) {
				case 0:
					//console.log(eggies[i].x - (explosion.sizeX/4) + ',' + eggies[i].y);
					addExplosion(eggies[i].x - (explosion.sizeX/4), eggies[i].y);
					eggies.splice(i, 1);
					if(soundEnabled)
						playSound('boom');
					break;
				default:
					eggies[i].delay--;
			}
		}
		
	}//for eggies
	
	for(var i = 0; i < explosions.length; i++) {
		if(explosions[i].delay > 0) {
			explosions[i].delay--;
			if(explosions[i].hit == false && player.x < explosions[i].x + explosions[i].sizeX && player.x > explosions[i].x &&
			   player.y < explosions[i].y + explosions[i].sizeY && player.y > explosions[i].y) {
				   explosions[i].hit = true;
				   player.health--;
				   if(soundEnabled) {
						//playSound('boom');
						playSound('pain');
				   }
			}
			for(var j = 0; j < enemies.length; j++) {
				var myEX = enemies[j].x + enemies[j].sizeX/2 - 1;
				var myEY = enemies[j].y + enemies[j].sizeY/2 - 1;
				if(myEX < explosions[i].x + explosions[i].sizeX && myEX > explosions[i].x &&
				   myEY < explosions[i].y + explosions[i].sizeY && myEY > explosions[i].y) {
					   repurposeEnemy(j);
				}
			}
			for(var j = 0; j < eggies.length; j++) {
				var myEX = eggies[j].x + eggies[j].sizeX/2 - 1;
				var myEY = eggies[j].y + eggies[j].sizeY/2 - 1;
				if(myEX < explosions[i].x + explosions[i].sizeX && myEX > explosions[i].x &&
				   myEY < explosions[i].y + explosions[i].sizeY && myEY > explosions[i].y) {
					    eggies.splice(j, 1);
						continue;
				}
			}
		}else {
			explosions.splice(i, 1);
		}
	}//explosions
	
	if(player.health <= 0) {
		gameover = true;
	}
}




// -------------------------------------
function draw() {
	//ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(canvas.background, 0, 0, canvas.width, canvas.height);
	
	ctx.drawImage(player.img, (player.x - player.sizeX/2 - 1), (player.y - player.sizeY/2));
	
	for(var i = 0; i < enemies.length; i++) {
		ctx.drawImage(eval(enemies[i].img), enemies[i].x, enemies[i].y, enemies[i].sizeX, enemies[i].sizeY);
		//ctx.strokeRect(enemies[i].x, enemies[i].y, enemies[i].sizeX, enemies[i].sizeY);
	}
	
	for(var i = 0; i < eggies.length; i++) {
		ctx.drawImage(eval(eggies[i].img), eggies[i].x, eggies[i].y, eggies[i].sizeX, eggies[i].sizeY);
	}
	
	for(var i = 0; i < explosions.length; i++) {
		ctx.drawImage(colorboom, explosions[i].x, explosions[i].y, explosions[i].sizeX, explosions[i].sizeY);
		//ctx.strokeRect(explosions[i].x, explosions[i].y, explosions[i].sizeX, explosions[i].sizeY);
	}
	
	//	show bench center
	//ctx.beginPath();
	//ctx.arc(player.x, player.y, 1, 1, Math.PI*2);
	//ctx.fillStyle = "#FF0000";
	//ctx.fill();
	//ctx.closePath();
	ctx.font = "24px Verdana";
	ctx.textAlign = 'left';
	ctx.strokeText(player.health + '/' + player.maxHealth, 20, 40);
	ctx.strokeText('Score: ' + player.points, 20, 80);
	
	//ctx.strokeText(enemies.length, 50, 40);
	
}

function renderPauseBox() {
	ctx.fillStyle = 'black';
	ctx.fillRect(canvas.width/4, canvas.height/4, canvas.width/2, canvas.height/2);
	ctx.stroke();
	
	ctx.font = "48px Verdana";
	ctx.textAlign = 'center';
	ctx.fillStyle = 'white';
	ctx.fillText('PAUSED', canvas.width/2, canvas.height/2);
	ctx.font = "12px Verdana";
	ctx.fillText('Press P to resume.', canvas.width/2, canvas.height/2 + 48);
}
function renderGameOver() {
	ctx.fillStyle = 'black';
	ctx.fillRect(canvas.width/4, canvas.height/4, canvas.width/2, canvas.height/2);
	ctx.stroke();
	
	ctx.font = "48px Verdana";
	ctx.textAlign = 'center';
	ctx.fillStyle = 'white';
	ctx.fillText('YOU LOST!', canvas.width/2, canvas.height/2);
	ctx.font = "12px Verdana";
	ctx.fillText('Number of enemies: ' + enemies.length, canvas.width/2, canvas.height/2 + 32);
	ctx.fillText('Your score: ' + player.points, canvas.width/2, canvas.height/2 + 48);
	
	var back = document.getElementById('back');
	back.className = '';
	back.style = 'margin-left: -' + back.clientWidth/2 + 'px;';
	
	document.getElementById('stage').className = 'gameover';
}

function levels() {
	// more than 50 uses too much CPU - find a way around this?
	if(player.points % 10 == 0 && enemies.length < 500) {
		addEnemy();
		player.points++;
	}
}