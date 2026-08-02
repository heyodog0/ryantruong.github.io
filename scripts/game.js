const EMPTY = 0;
const PLAYER = 1;
const BLOCK = 2;
const TARGET = 3;
const PLAYER_ON_TARGET = 4;

let gameState = {
    grid: [],
    playerPos: { x: 0, y: 0 },
    targetPos: { x: 0, y: 0 }
};

let initialGameState = null;

function createRandomLevel() {
    const grid = Array(5).fill().map(() => Array(5).fill(EMPTY));
    const playerPos = { x: Math.floor(Math.random() * 5), y: Math.floor(Math.random() * 5) };
    grid[playerPos.y][playerPos.x] = PLAYER;

    let blockPos;
    do {
        blockPos = { 
            x: Math.floor(Math.random() * 3) + 1, 
            y: Math.floor(Math.random() * 3) + 1 
        };
    } while (grid[blockPos.y][blockPos.x] !== EMPTY);
    grid[blockPos.y][blockPos.x] = BLOCK;

    let targetPos;
    do {
        targetPos = { x: Math.floor(Math.random() * 5), y: Math.floor(Math.random() * 5) };
    } while (grid[targetPos.y][targetPos.x] !== EMPTY);
    grid[targetPos.y][targetPos.x] = TARGET;

    return { grid, playerPos, targetPos };
}

function renderGame() {
    const container = document.getElementById('game-container');
    container.innerHTML = '';
    
    for (let y = 0; y < gameState.grid.length; y++) {
        const row = document.createElement('div');
        row.className = 'game-row';
        
        for (let x = 0; x < gameState.grid[y].length; x++) {
            const cell = document.createElement('div');
            cell.className = 'game-cell';

            const content = document.createElement('div');
            
            switch (gameState.grid[y][x]) {
                case PLAYER:
                    content.className = 'player';
                    break;
                case BLOCK:
                    content.className = 'block';
                    break;
                case TARGET:
                    content.className = 'target';
                    break;
                case PLAYER_ON_TARGET:
                    content.className = 'player-on-target';
                    break;
            }
            
            cell.appendChild(content);
            row.appendChild(cell);
        }
        
        container.appendChild(row);
    }
}

function movePlayer(dx, dy) {
    const newX = gameState.playerPos.x + dx;
    const newY = gameState.playerPos.y + dy;
    
    if (newX >= 0 && newX < 5 && newY >= 0 && newY < 5) {
        if (gameState.grid[newY][newX] === BLOCK) {
            const pushX = newX + dx;
            const pushY = newY + dy;
            
            if (pushX >= 0 && pushX < 5 && pushY >= 0 && pushY < 5 && 
                (gameState.grid[pushY][pushX] === EMPTY || gameState.grid[pushY][pushX] === TARGET)) {
                gameState.grid[pushY][pushX] = BLOCK;
                gameState.grid[newY][newX] = (newX === gameState.targetPos.x && newY === gameState.targetPos.y) ? 
                    PLAYER_ON_TARGET : PLAYER;
                gameState.grid[gameState.playerPos.y][gameState.playerPos.x] = 
                    (gameState.playerPos.x === gameState.targetPos.x && gameState.playerPos.y === gameState.targetPos.y) ? 
                    TARGET : EMPTY;
                gameState.playerPos = { x: newX, y: newY };
                
                if (pushX === gameState.targetPos.x && pushY === gameState.targetPos.y) {
                    checkWin();
                }
            }
        } else if (gameState.grid[newY][newX] === EMPTY || gameState.grid[newY][newX] === TARGET) {
            gameState.grid[newY][newX] = (newX === gameState.targetPos.x && newY === gameState.targetPos.y) ? 
                PLAYER_ON_TARGET : PLAYER;
            gameState.grid[gameState.playerPos.y][gameState.playerPos.x] = 
                (gameState.playerPos.x === gameState.targetPos.x && gameState.playerPos.y === gameState.targetPos.y) ? 
                TARGET : EMPTY;
            gameState.playerPos = { x: newX, y: newY };
        }
    }
    
    renderGame();
}

function checkWin() {
    if (gameState.grid[gameState.targetPos.y][gameState.targetPos.x] === BLOCK) {
        showWinEffect();
    }
}

function showWinEffect() {
    const gameContainer = document.getElementById('game-container');
    const winMessage = document.getElementById('win-message');
    const playAgainBtn = document.getElementById('play-again-btn');
    const resetBtn = document.querySelector('.reset-btn');
    
    gameContainer.classList.add('game-won');
    winMessage.classList.remove('hidden');
    playAgainBtn.classList.remove('hidden');
    resetBtn.classList.add('hidden');
}

function startNewGame() {
    const gameContainer = document.getElementById('game-container');
    const winMessage = document.getElementById('win-message');
    const playAgainBtn = document.getElementById('play-again-btn');
    const resetBtn = document.querySelector('.reset-btn');
    
    gameContainer.classList.remove('game-won');
    winMessage.classList.add('hidden');
    playAgainBtn.classList.add('hidden');
    resetBtn.classList.remove('hidden');
    
    gameState = createRandomLevel();
    initialGameState = JSON.parse(JSON.stringify(gameState)); // Store initial state
    renderGame();
}

function resetGame() {
    if (initialGameState) {
        gameState = JSON.parse(JSON.stringify(initialGameState)); // Deep copy the initial state
    } else {
        gameState = createRandomLevel();
        initialGameState = JSON.parse(JSON.stringify(gameState));
    }
    
    renderGame();
    
    const gameContainer = document.getElementById('game-container');
    const winMessage = document.getElementById('win-message');
    const playAgainBtn = document.getElementById('play-again-btn');
    
    gameContainer.classList.remove('game-won');
    winMessage.classList.add('hidden');
    playAgainBtn.classList.add('hidden');
}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            movePlayer(0, -1);
            break;
        case 'ArrowDown':
            movePlayer(0, 1);
            break;
        case 'ArrowLeft':
            movePlayer(-1, 0);
            break;
        case 'ArrowRight':
            movePlayer(1, 0);
            break;
    }
});

document.addEventListener('click', (event) => {
    const moveBtn = event.target.closest('[data-move]');
    if (moveBtn) {
        const [dx, dy] = moveBtn.dataset.move.split(',').map(Number);
        movePlayer(dx, dy);
        return;
    }
    const actionBtn = event.target.closest('[data-action]');
    if (actionBtn) {
        if (actionBtn.dataset.action === 'reset') resetGame();
        else if (actionBtn.dataset.action === 'play-again') startNewGame();
    }
});

document.addEventListener('touchstart', (event) => {
    const moveBtn = event.target.closest('[data-move]');
    if (moveBtn) {
        event.preventDefault();
        const [dx, dy] = moveBtn.dataset.move.split(',').map(Number);
        movePlayer(dx, dy);
    }
}, { passive: false });

startNewGame();

var lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    var now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);