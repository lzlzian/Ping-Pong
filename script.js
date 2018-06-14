/** CONSTANTS **/
// canvas
const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
// fps
const FRAME_PER_SECOND = 60;
// ball
const BALL_RADIUS = canvas.width / 60;
// paddle
const PADDLE_WIDTH = canvas.width / 6;
const PADDLE_HEIGHT = PADDLE_WIDTH / 10;
const PADDLE_TOP_Y = 10;
const PADDLE_BOTTOM_Y = canvas.height - PADDLE_TOP_Y - PADDLE_HEIGHT;
// winning score
const WINNING_SCORE = 7;
// sound effects
const BALL_SOUND = document.createElement('audio');
BALL_SOUND.src = "assets/sounds/ping_pong_sound.wav";
const WIN_SOUND = document.createElement('audio');
WIN_SOUND.src = "assets/sounds/win.wav";
const LOSS_SOUND = document.createElement('audio');
LOSS_SOUND.src = "assets/sounds/loss.wav";
const PLAYER_SCORE_SOUND = document.createElement('audio');
PLAYER_SCORE_SOUND.src = "assets/sounds/player_score.wav";
const CPU_SCORE_SOUND = document.createElement('audio');
CPU_SCORE_SOUND.src = "assets/sounds/cpu_score.wav";


/** VARIABLES **/
// ball
var ballSpeedX = canvas.width / 2;
var ballSpeedY = canvas.height / 2;
var ballX = canvas.width / 2;
var ballY = PADDLE_HEIGHT + BALL_RADIUS;
var ballDistanceX = (Math.random() - 0.5) * 2 * 
				ballSpeedX / FRAME_PER_SECOND;
var ballDistanceY = ballSpeedY / FRAME_PER_SECOND;
// paddle
var paddleTopX = 250;
var paddleBottomX = 250;
// cpu ai
var cpuSpeed = 500;
var cpuDistance = cpuSpeed / FRAME_PER_SECOND;
var cpuAccuracy = PADDLE_WIDTH / 2;
// scores
var playerScore = 0;
var cpuScore = 0;
// game state
var showingWinScreen = false;


/** GAME **/
window.onload = function() {
	// run game
	setInterval(function(){
		calculations();
		draw();
	}, 1000/FRAME_PER_SECOND);
	// use mouse to control paddle
	canvas.addEventListener('mousemove',
		function(event) {
			var mousePos = calculateMousePos(event);
			paddleBottomX = mousePos.x - (PADDLE_WIDTH/2);
		});
	// mouse click to restart
	canvas.addEventListener('click', handleMouseClick);
}


/** HELPERS **/
// calculate state of the game
function calculations() {
	// if game has ended, no need for calculations
	if (showingWinScreen) {
		return;
	}
	// move ball
	ballX += ballDistanceX;
	ballY += ballDistanceY;
	// side bounce
	if((ballX < 0 && ballDistanceX < 0) || 
		(ballX > canvas.width && ballDistanceX > 0)) {
		BALL_SOUND.currentTime = 0;
		BALL_SOUND.play();
		ballDistanceX = -ballDistanceX;
	}
	// hit detection for player
	if ((ballY + BALL_RADIUS) > PADDLE_BOTTOM_Y) {
		if (ballX >= paddleBottomX &&
			ballX <= (paddleBottomX + PADDLE_WIDTH) &&
			ballDistanceY > 0){
			BALL_SOUND.currentTime = 0;
			BALL_SOUND.play();
			ballDistanceY = -ballDistanceY;
			// ball control with paddle
			ballControl(true);
		}
	}
	// hit detection for CPU
	if ((ballY - BALL_RADIUS) < (PADDLE_TOP_Y + PADDLE_HEIGHT)) {
		if (ballX >= paddleTopX &&
			ballX <= (paddleTopX + PADDLE_WIDTH) &&
			ballDistanceY < 0){
			BALL_SOUND.currentTime = 0;
			BALL_SOUND.play();
			ballDistanceY = -ballDistanceY;
			// ball control with paddle
			ballControl(false);
		}
	}
	// ball reset if missed
	// if player missed
	if(ballY < 0) {
		playerScore += 1;
		PLAYER_SCORE_SOUND.play();
		ballReset(true);
	}
	// if cpu missed
	if (ballY > canvas.height) {
		CPU_SCORE_SOUND.play();
		cpuScore += 1;
		ballReset(false);
	}
	// calculate cpu's move
	cpuMovement();
}

// draw the game to canvas
function draw() {
	// draw canvas
	drawRect('#335BA1', 0, 0, canvas.width, canvas.height);
	// score diplay
	var score = 'SCORE: ' + playerScore + ' - ' + cpuScore;
	context.fillStyle = 'white';
	context.font="30px Arial";
	context.fillText(score , 100, canvas.height / 2 - 100);
	// if game has ended, no need for draw
	if (showingWinScreen) {
		var winLose = (playerScore > cpuScore) ? 'won' : 'lost';
		context.fillText('You ' + winLose + '! Click to rematch.', 100, canvas.height / 2);
		return;
	}
	// draw top paddle
	drawRect('#EF4B3C', paddleTopX, PADDLE_TOP_Y, 
			PADDLE_WIDTH, PADDLE_HEIGHT);
	// draw bottom paddle
	drawRect('#EF4B3C', paddleBottomX, PADDLE_BOTTOM_Y, 
			PADDLE_WIDTH, PADDLE_HEIGHT);
	// draw ball
	drawCircle('#F8A201', ballX, ballY, BALL_RADIUS);
	// draw net
	drawNet();
}

// draw rectangle on canvas
function drawRect(color, topLeftX, topLeftY, width, height){
	context.fillStyle = color;
	context.fillRect(topLeftX, topLeftY, width, height);
}

// draw circle on canvas
function drawCircle(color, centerX, centerY, radius){
	context.fillStyle = color;
	context.beginPath();
	// arc(centerX, centerY, radius, startRadian, endRadian, clockWise?)
	context.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
	context.fill();
}

// draw net
function drawNet() {
	for (i = 0; i < canvas.width; i += 40) {
		drawRect('white', i, (canvas.height-5) / 2, 30, 5);
	}

}

// serve the ball after one side scores
function ballReset(isPlayer) {
	if (playerScore >= WINNING_SCORE) {
		showingWinScreen = true;
		WIN_SOUND.play();
	}
	if (cpuScore >= WINNING_SCORE) {
		showingWinScreen = true;
		LOSS_SOUND.play();
	}
	ballX = canvas.width / 2;
	ballY = isPlayer ? 
	(PADDLE_BOTTOM_Y - BALL_RADIUS) : (PADDLE_HEIGHT + BALL_RADIUS); 
	ballDistanceX = (Math.random() - 0.5) * 2 * 
					ballSpeedX / FRAME_PER_SECOND;
}

// simple ai for cpu to move paddle
function cpuMovement() {
	var paddleTopCenter = paddleTopX + PADDLE_WIDTH/2;
	if (paddleTopCenter < ballX - cpuAccuracy) {
		paddleTopX += cpuDistance;
	}
	if (paddleTopCenter > ballX + cpuAccuracy) {
		paddleTopX -= cpuDistance;
	}
}

// control ball's horizontal speed basing on where it hits on the paddle
function ballControl(isPlayer) {
	var paddleX = isPlayer ? paddleBottomX : paddleTopX;
	var deltaX = ballX - (paddleX + PADDLE_WIDTH/2);
	ballDistanceX = deltaX / 3;
}

// calculate mouse position
function calculateMousePos(event) {
	var rect = canvas.getBoundingClientRect();
	var root = document.documentElement;
	var mouseX = event.clientX - rect.left - root.scrollLeft;
	var mouseY = event.clientY - rect.top - root.scrollTop;
	return {
		x: mouseX,
		y: mouseY,
	}
}

// handle mouse click when game ends
function handleMouseClick(event) {
	if(showingWinScreen) {
		playerScore = 0;
		cpuScore = 0;
		showingWinScreen = false;
	}
}
