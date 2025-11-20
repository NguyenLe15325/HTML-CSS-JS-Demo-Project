// Game Constants
const CANVAS_SIZE = 600;
const UNIT = 20; // Size of a single grid square/bike segment
const GRID_SIZE = CANVAS_SIZE / UNIT; // 30x30 grid
const SPEED = 100; // Game tick speed in milliseconds (100ms = 10 updates/second)

// DOM Elements
const canvas = document.getElementById('tron-canvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const finalMessage = document.getElementById('final-message');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const statusMessage = document.getElementById('status-message');

// Game State
let gameInterval = null;
let isRunning = false;

/**
 * Represents a single Light Cycle (Player).
 */
class Cycle {
    constructor(x, y, color, controls) {
        this.startX = x;
        this.startY = y;
        this.color = color;
        this.controls = controls;
        this.reset();
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        // Initial direction (1, 0) is right, (-1, 0) is left, (0, -1) is up, (0, 1) is down
        this.dx = 0; 
        this.dy = 0; 
        // Direction pending change (used to prevent instant reversal)
        this.nextDx = 0;
        this.nextDy = 0;
        // Trail is an array of {x, y} coordinates representing the bike's path
        this.trail = [{ x: this.x, y: this.y }]; 
        this.isDead = false;
    }

    // Sets the direction for the next movement tick
    setDirection(dx, dy) {
        // Prevent reversing instantly (e.g., cannot go right immediately after going left)
        if (this.dx === -dx && this.dy === -dy) {
            return;
        }
        this.nextDx = dx;
        this.nextDy = dy;
    }

    move() {
        // Apply the buffered direction change
        this.dx = this.nextDx;
        this.dy = this.nextDy;
        
        // Update position
        this.x += this.dx * UNIT;
        this.y += this.dy * UNIT;

        // Add current position to the trail
        if (this.dx !== 0 || this.dy !== 0) { // Only add to trail if moving
            this.trail.push({ x: this.x, y: this.y });
        }
    }

    draw() {
        // Draw the trail
        ctx.fillStyle = this.color;
        this.trail.forEach(segment => {
            ctx.fillRect(segment.x, segment.y, UNIT, UNIT);
        });

        // Draw the head (more prominently, with a glow effect)
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.fillRect(this.x, this.y, UNIT, UNIT);
        ctx.shadowBlur = 0; // Reset shadow for other drawings
    }
}

// Initialize Players
const p1 = new Cycle(
    UNIT * 5, // Start position X (5 blocks in)
    UNIT * (GRID_SIZE / 2), // Start position Y (middle of grid)
    '#00F0FF', // Cyan
    { up: 'w', down: 's', left: 'a', right: 'd' }
);

const p2 = new Cycle(
    UNIT * (GRID_SIZE - 6), // Start position X (5 blocks from right)
    UNIT * (GRID_SIZE / 2), // Start position Y (middle of grid)
    '#FF5050', // Red
    { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' }
);

const players = [p1, p2];

// --- Core Game Functions ---

function drawGrid() {
    // Draw faint grid lines
    ctx.strokeStyle = '#051828';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(i * UNIT, 0);
        ctx.lineTo(i * UNIT, CANVAS_SIZE);
        ctx.stroke();

        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(0, i * UNIT);
        ctx.lineTo(CANVAS_SIZE, i * UNIT);
        ctx.stroke();
    }
}

function collisionCheck(cycle, otherCycle) {
    const headX = cycle.x;
    const headY = cycle.y;

    // 1. Check for wall collision
    if (headX < 0 || headX >= CANVAS_SIZE || headY < 0 || headY >= CANVAS_SIZE) {
        return true;
    }

    // 2. Check for self-collision (hitting own trail)
    // Start checking from the 5th segment back to avoid immediate crash on start/turn
    for (let i = 0; i < cycle.trail.length - 1; i++) { 
        if (headX === cycle.trail[i].x && headY === cycle.trail[i].y) {
            return true;
        }
    }

    // 3. Check for opponent trail collision
    for (let i = 0; i < otherCycle.trail.length; i++) {
        if (headX === otherCycle.trail[i].x && headY === otherCycle.trail[i].y) {
            return true;
        }
    }
    
    return false;
}

function checkHeadOnCollision(c1, c2) {
    // Check if both cycles hit the exact same tile in the same tick
    return c1.x === c2.x && c1.y === c2.y;
}

function endGame(winner) {
    clearInterval(gameInterval);
    isRunning = false;
    
    overlay.style.display = 'flex';
    startButton.style.display = 'none';
    restartButton.style.display = 'inline-block';
    
    let message = '';
    if (winner) {
        const winnerClass = winner === p1 ? 'player-1-text' : 'player-2-text';
        message = `<span class="${winnerClass}">PLAYER ${players.indexOf(winner) + 1} WINS!</span>`;
    } else {
        message = "CRASH! IT'S A DRAW!";
    }
    finalMessage.innerHTML = message;
    statusMessage.innerHTML = 'Game Over!';
}

function gameLoop() {
    if (!isRunning) return;

    // 1. Move Cycles
    p1.move();
    p2.move();

    // 2. Check Collisions
    const p1crashed = collisionCheck(p1, p2);
    const p2crashed = collisionCheck(p2, p1);
    const headOn = checkHeadOnCollision(p1, p2);

    if (headOn) {
        p1.isDead = true;
        p2.isDead = true;
    } else {
        if (p1crashed) p1.isDead = true;
        if (p2crashed) p2.isDead = true;
    }
    
    // 3. Determine Winner and End Game
    if (p1.isDead && p2.isDead) {
        // Both crashed (either head-on or simultaneously)
        endGame(null); 
    } else if (p1.isDead) {
        // P1 crashed, P2 wins
        endGame(p2);
    } else if (p2.isDead) {
        // P2 crashed, P1 wins
        endGame(p1);
    }

    // 4. Redraw everything
    // Clear canvas for the new frame
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    drawGrid();

    p1.draw();
    p2.draw();
}

function startGame() {
    // Reset players and state
    p1.reset();
    p2.reset();
    
    // Player 1 starts moving right, Player 2 starts moving left
    p1.setDirection(1, 0); 
    p2.setDirection(-1, 0);

    // Hide overlay
    overlay.style.display = 'none';
    statusMessage.innerHTML = `<span class="player-1-text">P1: WASD</span> vs <span class="player-2-text">P2: Arrows</span>`;

    // Start the game loop
    gameInterval = setInterval(gameLoop, SPEED);
    isRunning = true;
}

// --- Event Listeners and Initialization ---

function handleKeyDown(event) {
    if (!isRunning) return;

    const key = event.key;

    // Player 1 (WASD)
    switch (key.toLowerCase()) {
        case p1.controls.up:
            p1.setDirection(0, -1); event.preventDefault(); break;
        case p1.controls.down:
            p1.setDirection(0, 1); event.preventDefault(); break;
        case p1.controls.left:
            p1.setDirection(-1, 0); event.preventDefault(); break;
        case p1.controls.right:
            p1.setDirection(1, 0); event.preventDefault(); break;
    }

    // Player 2 (Arrow Keys)
    switch (key) {
        case p2.controls.up:
            p2.setDirection(0, -1); event.preventDefault(); break;
        case p2.controls.down:
            p2.setDirection(0, 1); event.preventDefault(); break;
        case p2.controls.left:
            p2.setDirection(-1, 0); event.preventDefault(); break;
        case p2.controls.right:
            p2.setDirection(1, 0); event.preventDefault(); break;
    }
}

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
document.addEventListener('keydown', handleKeyDown);

// Initial Draw (Show empty grid and bikes on start screen)
window.onload = () => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    drawGrid();
    p1.draw();
    p2.draw();
    overlay.style.display = 'flex';
};
