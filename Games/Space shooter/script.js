// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Game state
let gameState = {
    running: false,
    score: 0,
    lives: 3,
    level: 1
};

// Input handling
let keys = {};

// Player object
let player = {
    x: 375,
    y: 520,
    width: 50,
    height: 40,
    speed: 5,
    color: '#00ffff'
};

// Game arrays
let bullets = [];
let enemies = [];
let particles = [];
let stars = [];

// Initialize stars for background
function initStars() {
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            speed: Math.random() * 2 + 1
        });
    }
}

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space' && gameState.running) {
        e.preventDefault();
        shootBullet();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', restartGame);

// Game functions
function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    gameState.running = true;
    initStars();
    gameLoop();
}

function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    gameState.score = 0;
    gameState.lives = 3;
    gameState.level = 1;
    player.x = 375;
    bullets = [];
    enemies = [];
    particles = [];
    updateUI();
    gameState.running = true;
    gameLoop();
}

function shootBullet() {
    bullets.push({
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 15,
        speed: 8,
        color: '#ffff00'
    });
}

function spawnEnemy() {
    enemies.push({
        x: Math.random() * (canvas.width - 40),
        y: -40,
        width: 40,
        height: 40,
        speed: 1 + gameState.level * 0.3,
        color: '#ff0066'
    });
}

function createExplosion(x, y) {
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            size: Math.random() * 4 + 2,
            life: 30,
            color: `hsl(${Math.random() * 60 + 300}, 100%, 50%)`
        });
    }
}

// Update functions
function updatePlayer() {
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
}

function updateBullets() {
    bullets = bullets.filter(b => b.y > 0);
    bullets.forEach(b => b.y -= b.speed);
}

function updateEnemies() {
    enemies = enemies.filter(e => e.y < canvas.height);
    enemies.forEach(e => {
        e.y += e.speed;
        if (e.y + e.height > canvas.height) {
            gameState.lives--;
            updateUI();
            e.y = canvas.height + 100;
        }
    });
}

function updateParticles() {
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
    });
}

function updateStars() {
    stars.forEach(s => {
        s.y += s.speed;
        if (s.y > canvas.height) {
            s.y = 0;
            s.x = Math.random() * canvas.width;
        }
    });
}

function checkCollisions() {
    // Bullet-enemy collisions
    bullets.forEach((b, bi) => {
        enemies.forEach((e, ei) => {
            if (b.x < e.x + e.width &&
                b.x + b.width > e.x &&
                b.y < e.y + e.height &&
                b.y + b.height > e.y) {
                bullets.splice(bi, 1);
                enemies.splice(ei, 1);
                gameState.score += 10;
                updateUI();
                createExplosion(e.x + e.width / 2, e.y + e.height / 2);
            }
        });
    });

    // Player-enemy collisions
    enemies.forEach((e, ei) => {
        if (e.x < player.x + player.width &&
            e.x + e.width > player.x &&
            e.y < player.y + player.height &&
            e.y + e.height > player.y) {
            enemies.splice(ei, 1);
            gameState.lives--;
            updateUI();
            createExplosion(player.x + player.width / 2, player.y + player.height / 2);
        }
    });
}

function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('lives').textContent = gameState.lives;
}

// Draw functions
function drawStars() {
    stars.forEach(s => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(s.x, s.y, s.size, s.size);
    });
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = player.color;
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawBullets() {
    bullets.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = b.color;
        ctx.fillRect(b.x, b.y, b.width, b.height);
        ctx.shadowBlur = 0;
    });
}

function drawEnemies() {
    enemies.forEach(e => {
        ctx.fillStyle = e.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = e.color;
        ctx.fillRect(e.x, e.y, e.width, e.height);
        ctx.shadowBlur = 0;
    });
}

function drawParticles() {
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 30;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.globalAlpha = 1;
}

// Main game loop
let lastEnemySpawn = 0;

function gameLoop(timestamp = 0) {
    if (!gameState.running) return;

    if (gameState.lives <= 0) {
        endGame();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update
    updateStars();
    updatePlayer();
    updateBullets();
    updateEnemies();
    updateParticles();
    checkCollisions();

    // Draw
    drawStars();
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawParticles();

    // Spawn enemies
    if (timestamp - lastEnemySpawn > 1000 - gameState.level * 50) {
        spawnEnemy();
        lastEnemySpawn = timestamp;
    }

    // Level progression
    if (gameState.score > 0 && gameState.score % 100 === 0) {
        gameState.level = Math.floor(gameState.score / 100) + 1;
    }

    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameState.running = false;
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('gameOver').style.display = 'block';
}