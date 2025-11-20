
// --- GAME CONSTANTS ---
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30; // 30px per block

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextPieceCanvas');
const nextCtx = nextCanvas.getContext('2d');

canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

// Scale context for easier drawing (1 unit = 1 block)
ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
nextCtx.scale(BLOCK_SIZE, BLOCK_SIZE);

// UI elements
const scoreElement = document.getElementById('score');
const linesElement = document.getElementById('lines');
const startButton = document.getElementById('startButton');
const messageBox = document.getElementById('messageBox');

// Block colors (index 1-7 correspond to piece names below)
const COLORS = [
    null,       // 0: Empty
    '#00FFFF',  // 1: I - Cyan
    '#0000FF',  // 2: J - Blue
    '#FFA500',  // 3: L - Orange
    '#FFFF00',  // 4: O - Yellow
    '#008000',  // 5: S - Green
    '#800080',  // 6: T - Purple
    '#FF0000'   // 7: Z - Red
];

// Tetromino shapes (matrices)
const PIECES = [
    // I-piece (Cyan) - ID 1
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    // J-piece (Blue) - ID 2
    [[2, 0, 0], [2, 2, 2], [0, 0, 0]],
    // L-piece (Orange) - ID 3
    [[0, 0, 3], [3, 3, 3], [0, 0, 0]],
    // O-piece (Yellow) - ID 4
    [[4, 4], [4, 4]],
    // S-piece (Green) - ID 5
    [[0, 5, 5], [5, 5, 0], [0, 0, 0]],
    // T-piece (Purple) - ID 6
    [[0, 6, 0], [6, 6, 6], [0, 0, 0]],
    // Z-piece (Red) - ID 7
    [[7, 7, 0], [0, 7, 7], [0, 0, 0]]
];

// --- GAME STATE VARIABLES ---
let board = createBoard(COLS, ROWS);
let currentPiece = null;
let nextPiece = null;
let score = 0;
let lines = 0;
let gameOver = false;
let paused = true;

// Game timing
let dropCounter = 0;
let dropInterval = 1000; // Milliseconds per auto-drop
let lastTime = 0;

// --- TONE.JS AUDIO SETUP ---
let synth, clearSynth, lockSynth;

Tone.start().then(() => {
    console.log("Tone.js initialized. Audio context running.");
    
    // Synth for movement/rotation (simple beep)
    synth = new Tone.MembraneSynth().toDestination();
    synth.volume.value = -12;

    // Synth for line clear (chord)
    clearSynth = new Tone.PolySynth(Tone.Synth).toDestination();
    clearSynth.volume.value = -8;

    // Synth for piece lock (short, low pulse)
    lockSynth = new Tone.MetalSynth().toDestination();
    lockSynth.envelope.decay = 0.1;
    lockSynth.volume.value = -15;
});

function playMoveSound() {
    if (synth) synth.triggerAttackRelease("C5", "64n");
}

function playRotateSound() {
    if (synth) synth.triggerAttackRelease("G5", "64n");
}

function playLockSound() {
    if (lockSynth) lockSynth.triggerAttackRelease("C2", "16n");
}

function playClearSound() {
    if (clearSynth) clearSynth.triggerAttackRelease(["C4", "E4", "G4"], "8n");
}

function playGameOverSound() {
    // Low, dissonant chord for game over
    if (clearSynth) clearSynth.triggerAttackRelease(["C3", "Gb3", "C2"], "2n");
}

// --- CORE GAME FUNCTIONS ---

/**
 * Creates an empty game board matrix filled with 0s.
 */
function createBoard(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

/**
 * Clears completed lines and shifts blocks down.
 */
function clearLines() {
    let linesCleared = 0;
    outer: for (let y = board.length - 1; y >= 0; --y) {
        for (let x = 0; x < board[y].length; ++x) {
            if (board[y][x] === 0) {
                continue outer; // This line is not full, move to the next row
            }
        }

        // If we reach here, the line is full. Clear it.
        playClearSound();
        
        // Remove the row and prepend a new empty row
        const row = board.splice(y, 1)[0].fill(0);
        board.unshift(row);
        y++; // Re-check the same index since all rows shifted down

        linesCleared++;
    }
    if (linesCleared > 0) {
        updateScore(linesCleared);
    }
}

/**
 * Updates the score based on lines cleared (NES-style scoring)
 */
function updateScore(linesCleared) {
    const lineScores = [0, 40, 100, 300, 1200]; // 0, Single, Double, Triple, Tetris
    score += lineScores[linesCleared];
    lines += linesCleared;
    scoreElement.innerText = score;
    linesElement.innerText = lines;
    // Increase drop speed slightly with every 10 lines
    // dropInterval = Math.max(100, dropInterval - (linesCleared * 5)); // Simple speed increase
}

/**
 * Generates a random piece and its initial position.
 */
function createPiece() {
    const pieceIndex = Math.floor(Math.random() * PIECES.length);
    const matrix = PIECES[pieceIndex];
    const colorId = pieceIndex + 1; // ID 1-7

    return {
        matrix: matrix.map(row => row.map(cell => cell ? colorId : 0)), // Apply color ID
        pos: { x: Math.floor(COLS / 2) - Math.floor(matrix[0].length / 2), y: 0 }
    };
}

/**
 * Copies the piece matrix into the board matrix (locking the piece).
 */
function merge() {
    currentPiece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[currentPiece.pos.y + y][currentPiece.pos.x + x] = value;
            }
        });
    });
    playLockSound();
}

/**
 * Checks for collision between the piece and the board boundaries/settled blocks.
 */
function collide(piece, board) {
    const [m, o] = [piece.matrix, piece.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (
                // Check board boundary collision (y-coordinate)
                (board[o.y + y] && board[o.y + y][o.x + x]) !== 0 ||
                // Check bottom boundary
                o.y + y >= ROWS
            )) {
                return true;
            }
            // Check horizontal boundaries explicitly
            if (m[y][x] !== 0) {
                    if (o.x + x < 0 || o.x + x >= COLS) return true;
            }
        }
    }
    return false;
}

/**
 * Draws the matrix (either the board or a piece) to the canvas.
 */
function drawMatrix(matrix, offset, context) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = COLORS[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
                // Add a subtle grid/border effect
                context.strokeStyle = '#2d3748';
                context.lineWidth = 0.05;
                context.strokeRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

/**
 * Main drawing function: Clears canvas and redraws everything.
 */
function draw() {
    // Draw background
    ctx.fillStyle = '#111'; // Game board background
    ctx.fillRect(0, 0, canvas.width / BLOCK_SIZE, canvas.height / BLOCK_SIZE);
    
    // Draw the settled blocks (the board)
    drawMatrix(board, { x: 0, y: 0 }, ctx);
    
    // Draw the currently falling piece
    if (currentPiece) {
        drawMatrix(currentPiece.matrix, currentPiece.pos, ctx);
    }
    
    // Draw the next piece preview
    drawNextPiece();
}

/**
 * Draws the next piece preview in the dedicated side panel.
 */
function drawNextPiece() {
    if (!nextPiece) return;

    nextCtx.fillStyle = '#2d3748';
    nextCtx.fillRect(0, 0, nextCanvas.width / BLOCK_SIZE, nextCanvas.height / BLOCK_SIZE);

    // Center the piece within the 4x4 next-piece canvas
    const matrixSize = nextPiece.matrix.length;
    const xOffset = (4 - matrixSize) / 2;
    const yOffset = (4 - matrixSize) / 2;
    
    drawMatrix(nextPiece.matrix, { x: xOffset, y: yOffset }, nextCtx);
}

/**
 * Drops the current piece by one row. Handles locking and game over.
 */
function pieceDrop() {
    currentPiece.pos.y++;
    if (collide(currentPiece, board)) {
        currentPiece.pos.y--; // Revert to safe position
        merge();
        clearLines();
        resetPiece();
    }
    dropCounter = 0;
}

/**
 * Hard drop: drops the piece instantly to the bottom.
 */
function pieceHardDrop() {
    if (paused || gameOver) return;
    
    let distance = 0;
    while (!collide({ ...currentPiece, pos: { x: currentPiece.pos.x, y: currentPiece.pos.y + 1 } }, board)) {
        currentPiece.pos.y++;
        distance++;
    }
    if (distance > 0) {
        merge();
        clearLines();
        resetPiece();
        // Optionally score for hard drop
        updateScore(0); 
        playMoveSound();
    }
}

/**
 * Moves the piece horizontally.
 */
function pieceMove(dir) {
    if (paused || gameOver) return;
    currentPiece.pos.x += dir;
    if (collide(currentPiece, board)) {
        currentPiece.pos.x -= dir; // Revert if collision
    } else {
        playMoveSound();
    }
}

/**
 * Rotates the piece matrix 90 degrees clockwise.
 * Based on matrix transposition and reversal.
 */
function rotate(matrix, dir) {
    // Transpose
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }

    // Reverse columns (for clockwise) or rows (for counter-clockwise, if dir is -1)
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
            for (let y = 0; y < matrix.length; ++y) {
            matrix[y].reverse();
        }
    }
}

/**
 * Rotates the current piece, checking for wall kicks if necessary.
 */
function pieceRotate() {
    if (paused || gameOver) return;
    const pos = currentPiece.pos.x;
    let offset = 1;
    
    playRotateSound();
    rotate(currentPiece.matrix, 1);
    
    // Wall-kick logic (simple)
    while (collide(currentPiece, board)) {
        currentPiece.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > currentPiece.matrix[0].length) {
            rotate(currentPiece.matrix, -1); // Revert rotation
            currentPiece.pos.x = pos; // Revert position
            return;
        }
    }
}

/**
 * Spawns the next piece and checks for game over.
 */
function resetPiece() {
    currentPiece = nextPiece || createPiece();
    nextPiece = createPiece();

    // Check for game over (piece spawns already colliding)
    if (collide(currentPiece, board)) {
        gameOver = true;
        paused = true;
        messageBox.classList.remove('hidden');
        startButton.innerText = 'RESTART GAME';
        playGameOverSound();
    }
}

// --- MAIN GAME LOOP ---
function update(time = 0) {
    if (paused || gameOver) {
        draw(); // Still draw the final state
        requestAnimationFrame(update);
        return;
    }

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        pieceDrop();
    }

    draw();
    requestAnimationFrame(update);
}

/**
 * Initializes and starts/pauses the game.
 */
function startGame() {
    // Initialize audio context on first click for many browsers
    Tone.context.resume();
    
    if (gameOver) {
        // Restart game
        board = createBoard(COLS, ROWS);
        score = 0;
        lines = 0;
        scoreElement.innerText = 0;
        linesElement.innerText = 0;
        gameOver = false;
        messageBox.classList.add('hidden');
        startButton.innerText = 'PAUSE';
        resetPiece(); // Reset piece state
        paused = false;
        update();
        return;
    }

    paused = !paused;
    startButton.innerText = paused ? 'RESUME' : 'PAUSE';

    if (!paused) {
        // If unpausing, ensure a piece is ready
        if (!currentPiece) {
            resetPiece(); 
        }
        update(); // Resume loop
    }
    
    // Display message box if paused
    if (paused && !gameOver) {
        messageBox.innerText = 'PAUSED';
        messageBox.classList.remove('hidden');
    } else if (!gameOver) {
        messageBox.classList.add('hidden');
    }
}

// --- INPUT HANDLING ---

document.addEventListener('keydown', event => {
    if (gameOver) return;

    if (event.key === 'ArrowLeft') {
        event.preventDefault();
        pieceMove(-1);
    } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        pieceMove(1);
    } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        pieceDrop(); // Soft drop
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        pieceRotate();
    } else if (event.key === ' ') {
        event.preventDefault();
        pieceHardDrop(); // Spacebar for hard drop
    } else if (event.key === 'p' || event.key === 'P') {
            event.preventDefault();
            startGame();
    }
});

// Touch Control Handlers (using data-key attributes)
document.getElementById('touchControls').addEventListener('click', event => {
    const key = event.target.dataset.key;
    if (!key) return;

    if (key === 'ArrowLeft') {
        pieceMove(-1);
    } else if (key === 'ArrowRight') {
        pieceMove(1);
    } else if (key === 'ArrowDown') {
        pieceDrop();
    } else if (key === 'ArrowUp') {
        pieceRotate();
    }
});

// Initialize and Start Button Listener
startButton.addEventListener('click', startGame);

// Initial setup
resetPiece(); // Creates the first piece and the next piece
draw(); // Draw the initial empty board and next piece

