// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

// Game constants
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 15;
const WINNING_SCORE = 5;
const PADDLE_SPEED = 7;
const INITIAL_BALL_SPEED = 5;

// Game state
let gameState = {
    running: false,
    score1: 0,
    score2: 0
};

// Paddles
let paddle1 = {
    x: 30,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: PADDLE_SPEED,
    dy: 0
};

let paddle2 = {
    x: canvas.width - 30 - PADDLE_WIDTH,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: PADDLE_SPEED,
    dy: 0
};

// Ball
let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: BALL_SIZE,
    dx: INITIAL_BALL_SPEED,
    dy: INITIAL_BALL_SPEED,
    speed: INITIAL_BALL_SPEED
};

// Input handling
let keys = {};

document.addEventListener('keydown', (e) => {
    if (['w', 's', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
    }
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Button event listeners
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', restartGame);

// Initialize game
function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    resetGame();
    gameState.running = true;
    gameLoop();
}

function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    resetGame();
    gameState.running = true;
    gameLoop();
}

function resetGame() {
    gameState.score1 = 0;
    gameState.score2 = 0;
    paddle1.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
    paddle2.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
    resetBall();
    updateUI();
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = INITIAL_BALL_SPEED;
    
    // Random direction
    const angle = (Math.random() * Math.PI / 2) - Math.PI / 4; // -45 to 45 degrees
    const direction = Math.random() < 0.5 ? 1 : -1; // Left or right
    
    ball.dx = Math.cos(angle) * ball.speed * direction;
    ball.dy = Math.sin(angle) * ball.speed;
}

// Update paddles
function updatePaddles() {
    // Player 1 (W/S keys)
    if (keys['w'] || keys['W']) {
        paddle1.dy = -paddle1.speed;
    } else if (keys['s'] || keys['S']) {
        paddle1.dy = paddle1.speed;
    } else {
        paddle1.dy = 0;
    }
    
    // Player 2 (Arrow keys)
    if (keys['ArrowUp']) {
        paddle2.dy = -paddle2.speed;
    } else if (keys['ArrowDown']) {
        paddle2.dy = paddle2.speed;
    } else {
        paddle2.dy = 0;
    }
    
    // Update paddle positions
    paddle1.y += paddle1.dy;
    paddle2.y += paddle2.dy;
    
    // Keep paddles in bounds
    paddle1.y = Math.max(0, Math.min(canvas.height - paddle1.height, paddle1.y));
    paddle2.y = Math.max(0, Math.min(canvas.height - paddle2.height, paddle2.y));
}

// Update ball
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Top and bottom wall collision
    if (ball.y - ball.size / 2 <= 0 || ball.y + ball.size / 2 >= canvas.height) {
        ball.dy *= -1;
    }
    
    // Paddle collision - Player 1
    if (ball.x - ball.size / 2 <= paddle1.x + paddle1.width &&
        ball.x + ball.size / 2 >= paddle1.x &&
        ball.y >= paddle1.y &&
        ball.y <= paddle1.y + paddle1.height) {
        
        // Calculate hit position on paddle (-1 to 1)
        const hitPos = (ball.y - (paddle1.y + paddle1.height / 2)) / (paddle1.height / 2);
        const angle = hitPos * (Math.PI / 4); // Max 45 degrees
        
        ball.speed += 0.3; // Increase speed slightly
        ball.dx = Math.cos(angle) * ball.speed;
        ball.dy = Math.sin(angle) * ball.speed;
        ball.x = paddle1.x + paddle1.width + ball.size / 2; // Prevent sticking
    }
    
    // Paddle collision - Player 2
    if (ball.x + ball.size / 2 >= paddle2.x &&
        ball.x - ball.size / 2 <= paddle2.x + paddle2.width &&
        ball.y >= paddle2.y &&
        ball.y <= paddle2.y + paddle2.height) {
        
        const hitPos = (ball.y - (paddle2.y + paddle2.height / 2)) / (paddle2.height / 2);
        const angle = hitPos * (Math.PI / 4);
        
        ball.speed += 0.3;
        ball.dx = -Math.cos(angle) * ball.speed;
        ball.dy = Math.sin(angle) * ball.speed;
        ball.x = paddle2.x - ball.size / 2; // Prevent sticking
    }
    
    // Score - Player 1 scores (ball goes past paddle 2)
    if (ball.x - ball.size / 2 > canvas.width) {
        gameState.score1++;
        updateUI();
        checkWinner();
        resetBall();
    }
    
    // Score - Player 2 scores (ball goes past paddle 1)
    if (ball.x + ball.size / 2 < 0) {
        gameState.score2++;
        updateUI();
        checkWinner();
        resetBall();
    }
}

// Check for winner
function checkWinner() {
    if (gameState.score1 >= WINNING_SCORE) {
        endGame(1);
    } else if (gameState.score2 >= WINNING_SCORE) {
        endGame(2);
    }
}

// Update UI
function updateUI() {
    document.getElementById('score1').textContent = gameState.score1;
    document.getElementById('score2').textContent = gameState.score2;
}

// Draw functions
function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 4;
    ctx.setLineDash([20, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawPaddle(paddle, color) {
    ctx.fillStyle = color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowBlur = 0;
}

function drawBall() {
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawCenterLine();
    drawPaddle(paddle1, '#00ff88');
    drawPaddle(paddle2, '#ff6b6b');
    drawBall();
}

// Game loop
function gameLoop() {
    if (!gameState.running) return;
    
    updatePaddles();
    updateBall();
    draw();
    
    requestAnimationFrame(gameLoop);
}

// End game
function endGame(winner) {
    gameState.running = false;
    
    document.getElementById('winnerText').textContent = `PLAYER ${winner} WINS!`;
    document.getElementById('finalScore').textContent = 
        `${gameState.score1} - ${gameState.score2}`;
    document.getElementById('gameOver').style.display = 'block';
}

// Initial draw
draw();