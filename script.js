const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 320;
canvas.height = 480;

const bird = {
  x: 50,
  y: 150,
  width: 20,
  height: 20,
  gravity: 0.3,  // Reduce gravity to slow down fall
  lift: -7,     // Reduce lift to make jump more gradual
  velocity: 0,
};

const pipes = [];
const pipeWidth = 40;
const pipeGap = 120; // Increase gap between pipes
let frameCount = 0;
let score = 0;
let gameStarted = false;

function drawBird() {
  ctx.fillStyle = 'yellow';
  ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
  ctx.fillStyle = 'green';
  pipes.forEach(pipe => {
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
    ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipeWidth, pipe.bottom);
  });
}

function updateBird() {
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;
  if (bird.y + bird.height > canvas.height || bird.y < 0) {
    resetGame();
  }
}

function updatePipes() {
  if (frameCount % 150 === 0) { // Increase interval to slow down pipe generation
    const top = Math.random() * (canvas.height / 2);
    const bottom = canvas.height - top - pipeGap;
    pipes.push({ x: canvas.width, top: top, bottom: bottom });
  }
  pipes.forEach(pipe => {
    pipe.x -= 1.5; // Reduce pipe speed
    if (pipe.x + pipeWidth < 0) {
      pipes.shift();
      score++;
    }
    if (
      bird.x < pipe.x + pipeWidth &&
      bird.x + bird.width > pipe.x &&
      (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom)
    ) {
      resetGame();
    }
  });
}

function resetGame() {
  bird.y = 150;
  bird.velocity = 0;
  pipes.length = 0;
  score = 0;
  gameStarted = false;
  showStartScreen();
}

function drawScore() {
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, 10, 20);
}

function showStartScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'black';
  ctx.font = '30px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Press to Start', canvas.width / 2, canvas.height / 2);
}

function startGame() {
  gameStarted = true;
  frameCount = 0;
  bird.y = 150;
  bird.velocity = 0;
  pipes.length = 0;
  score = 0;
  loop();
}

function loop() {
  if (gameStarted) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateBird();
    updatePipes();
    drawBird();
    drawPipes();
    drawScore();
    frameCount++;
    requestAnimationFrame(loop);
  }
}

document.addEventListener('keydown', () => {
  if (!gameStarted) {
    startGame();
  } else {
    bird.velocity = bird.lift;
  }
});

document.addEventListener('click', () => {
  if (!gameStarted) {
    startGame();
  } else {
    bird.velocity = bird.lift;
  }
});

showStartScreen();
