const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

// Load images
const birdImage = new Image();
birdImage.src = 'bird.png'; // Path to your bird texture

const pipeTopImage = new Image();
pipeTopImage.src = 'pipeTop.png'; // Path to your top pipe texture

const pipeBottomImage = new Image();
pipeBottomImage.src = 'pipeBottom.png'; // Path to your bottom pipe texture

const bird = {
    x: 50,
    y: 150,
    width: 20,
    height: 20,
    gravity: 0.6,
    lift: -15,
    velocity: 0
};

const pipes = [];
const pipeWidth = 20;
const pipeGap = 100;
let frame = 0;
let gameState = 'start'; // start, playing, gameover
let scaleX, scaleY;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    scaleX = canvas.width / 320;  // base width
    scaleY = canvas.height / 480; // base height
}

function drawBird() {
    context.drawImage(birdImage, bird.x * scaleX, bird.y * scaleY, bird.width * scaleX, bird.height * scaleY);
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.height > canvas.height / scaleY || bird.y < 0) {
        gameState = 'gameover';
    }
}

function drawPipes() {
    pipes.forEach(pipe => {
        context.drawImage(pipeTopImage, pipe.x * scaleX, pipe.y * scaleY, pipeWidth * scaleX, pipe.height * scaleY);
        context.drawImage(pipeBottomImage, pipe.x * scaleX, (pipe.y + pipe.height + pipeGap) * scaleY, pipeWidth * scaleX, (canvas.height / scaleY - pipe.y - pipe.height - pipeGap) * scaleY);
    });
}

function updatePipes() {
    if (frame % 75 === 0) {
        const pipeY = Math.floor(Math.random() * (canvas.height / scaleY - pipeGap));
        pipes.push({ x: canvas.width / scaleX, y: pipeY, height: pipeY });
    }

    pipes.forEach(pipe => {
        pipe.x -= 2;

        if (pipe.x + pipeWidth < 0) {
            pipes.shift();
        }

        if (bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.y + pipe.height || bird.y + bird.height > pipe.y + pipe.height + pipeGap)) {
            gameState = 'gameover';
        }
    });
}

function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes.length = 0;
    frame = 0;
    gameState = 'start';
}

function drawStartScreen() {
    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'white';
    context.font = `${24 * scaleX}px Arial`;
    context.fillText('Press any key to start', canvas.width / 2 - 80 * scaleX, canvas.height / 2);
}

function gameLoop() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'start') {
        drawStartScreen();
    } else if (gameState === 'playing') {
        drawBird();
        updateBird();

        drawPipes();
        updatePipes();
    } else if (gameState === 'gameover') {
        resetGame();
    }

    frame++;
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', () => {
    if (gameState === 'start') {
        gameState = 'playing';
    } else if (gameState === 'playing') {
        bird.velocity = bird.lift;
    }
});

window.addEventListener('resize', resizeCanvas);

resizeCanvas();
gameLoop();
