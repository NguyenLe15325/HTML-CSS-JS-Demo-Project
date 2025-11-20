// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 600;

// Game constants
const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;

// Game state
let gameState = {
    running: false,
    score: 0,
    highScore: 0,
    speed: 1,
    gameSpeed: 150
};

// Snake
let snake = {
    body: [{x: 10, y: 10}],
    dx: 0,
    dy: 0,
    newDirection: {dx: 0, dy: 0}
};

// Food
let food = {
    x: 15,
    y: 15
};

// Input handling
document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
    
    if (!gameState.running) return;
    
    // Prevent opposite direction changes (can't go backwards)
    if (e.key === 'ArrowUp' && snake.dy === 0) {
        snake.newDirection = {dx: 0, dy: -1};
    } else if (e.key === 'ArrowDown' && snake.dy === 0) {
        snake.newDirection = {dx: 0, dy: 1};
    } else if (e.key === 'ArrowLeft' && snake.dx === 0) {
        snake.newDirection = {dx: -1, dy: 0};
    } else if (e.key === 'ArrowRight' && snake.dx === 0) {
        snake.newDirection = {dx: 1, dy: 0};
    }
});

// Difficulty selection
let selectedSpeed = 200;
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const difficultyButtons2 = document.querySelectorAll('.difficulty-btn-2');

// Start screen difficulty selector
difficultyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        difficultyButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedSpeed = parseInt(btn.dataset.speed);
    });
});

// Game over screen difficulty selector
difficultyButtons2.forEach(btn => {
    btn.addEventListener('click', () => {
        difficultyButtons2.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedSpeed = parseInt(btn.dataset.speed);
    });
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
    snake.body = [{x: 10, y: 10}];
    snake.dx = 1;
    snake.dy = 0;
    snake.newDirection = {dx: 1, dy: 0};
    gameState.score = 0;
    gameState.speed = 1;
    gameState.gameSpeed = selectedSpeed; // Use selected difficulty
    generateFood();
    updateUI();
}

// Generate food at random position
function generateFood() {
    let validPosition = false;
    
    while (!validPosition) {
        food.x = Math.floor(Math.random() * TILE_COUNT);
        food.y = Math.floor(Math.random() * TILE_COUNT);
        
        // Check if food is not on snake
        validPosition = !snake.body.some(segment => 
            segment.x === food.x && segment.y === food.y
        );
    }
}

// Update snake position
function updateSnake() {
    // Apply the new direction
    snake.dx = snake.newDirection.dx;
    snake.dy = snake.newDirection.dy;
    
    // Calculate new head position
    let head = {
        x: snake.body[0].x + snake.dx,
        y: snake.body[0].y + snake.dy
    };
    
    // Wrap around walls (teleport to opposite side)
    if (head.x < 0) head.x = TILE_COUNT - 1;
    if (head.x >= TILE_COUNT) head.x = 0;
    if (head.y < 0) head.y = TILE_COUNT - 1;
    if (head.y >= TILE_COUNT) head.y = 0;
    
    // Add new head to front
    snake.body.unshift(head);
    
    // Check if snake ate food
    if (head.x === food.x && head.y === food.y) {
        gameState.score += 10;
        updateUI();
        generateFood();
        
        // Increase speed every 50 points
        if (gameState.score % 50 === 0) {
            gameState.speed++;
            gameState.gameSpeed = Math.max(50, gameState.gameSpeed - 15);
        }
    } else {
        // Remove tail if no food eaten
        snake.body.pop();
    }
}

// Check collisions
function checkCollisions() {
    const head = snake.body[0];
    
    // Only check self collision (wall collision removed - snake wraps around now)
    for (let i = 1; i < snake.body.length; i++) {
        if (head.x === snake.body[i].x && head.y === snake.body[i].y) {
            endGame();
            return;
        }
    }
}

// Update UI
function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('highScore').textContent = gameState.highScore;
    
    // Display difficulty level instead of speed multiplier
    let difficultyName = 'Easy';
    if (selectedSpeed === 150) difficultyName = 'Normal';
    else if (selectedSpeed === 100) difficultyName = 'Hard';
    else if (selectedSpeed === 50) difficultyName = 'Insane';
    
    document.getElementById('speed').textContent = difficultyName;
}

// Draw functions
function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= TILE_COUNT; i++) {
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.stroke();
        
        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvas.width, i * GRID_SIZE);
        ctx.stroke();
    }
}

function drawSnake() {
    snake.body.forEach((segment, index) => {
        // Head is brighter
        if (index === 0) {
            ctx.fillStyle = '#4ecca3';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#4ecca3';
        } else {
            ctx.fillStyle = '#16a085';
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#16a085';
        }
        
        ctx.fillRect(
            segment.x * GRID_SIZE + 1,
            segment.y * GRID_SIZE + 1,
            GRID_SIZE - 2,
            GRID_SIZE - 2
        );
        
        // Draw eyes on head
        if (index === 0) {
            ctx.fillStyle = '#1a1a2e';
            ctx.shadowBlur = 0;
            
            const eyeSize = 3;
            const eyeOffset = 6;
            
            if (snake.dx === 1) { // Moving right
                ctx.fillRect(segment.x * GRID_SIZE + 12, segment.y * GRID_SIZE + 5, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + 12, segment.y * GRID_SIZE + 12, eyeSize, eyeSize);
            } else if (snake.dx === -1) { // Moving left
                ctx.fillRect(segment.x * GRID_SIZE + 5, segment.y * GRID_SIZE + 5, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + 5, segment.y * GRID_SIZE + 12, eyeSize, eyeSize);
            } else if (snake.dy === -1) { // Moving up
                ctx.fillRect(segment.x * GRID_SIZE + 5, segment.y * GRID_SIZE + 5, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + 12, segment.y * GRID_SIZE + 5, eyeSize, eyeSize);
            } else if (snake.dy === 1) { // Moving down
                ctx.fillRect(segment.x * GRID_SIZE + 5, segment.y * GRID_SIZE + 12, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + 12, segment.y * GRID_SIZE + 12, eyeSize, eyeSize);
            }
        }
    });
    ctx.shadowBlur = 0;
}

function drawFood() {
    ctx.fillStyle = '#ee5a6f';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ee5a6f';
    
    // Draw food as circle
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    ctx.shadowBlur = 0;
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawGrid();
    drawFood();
    drawSnake();
}

// Game loop
let lastUpdateTime = 0;

function gameLoop(currentTime = 0) {
    if (!gameState.running) return;
    
    const timeSinceLastUpdate = currentTime - lastUpdateTime;
    
    if (timeSinceLastUpdate >= gameState.gameSpeed) {
        updateSnake();
        checkCollisions();
        draw();
        lastUpdateTime = currentTime;
    }
    
    requestAnimationFrame(gameLoop);
}

// End game
function endGame() {
    gameState.running = false;
    
    // Update high score
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        document.getElementById('newHighScore').style.display = 'block';
    } else {
        document.getElementById('newHighScore').style.display = 'none';
    }
    
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('gameOver').style.display = 'block';
    updateUI();
}

// Initial draw
draw();