/* Sokoban: push the block onto the target.
 *
 * The player, block and target are persistent DOM nodes moved with transforms,
 * rather than a grid re-rendered each turn — that's what lets moves animate.
 * Each entity is two elements: the outer one translates (position), the inner
 * .skin scales (squash, pop). Keeping them separate means a squash can play
 * while a slide is still in flight without the two transforms fighting. */

const SIZE = 5;
const CELL = 32; // keep in sync with --cell in game.css

const board = document.getElementById('game-container');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let player, block, target, initial;
let won = false;
const els = {};

function randCell() {
    return { x: Math.floor(Math.random() * SIZE), y: Math.floor(Math.random() * SIZE) };
}
const same = (a, b) => a.x === b.x && a.y === b.y;
const inBounds = p => p.x >= 0 && p.x < SIZE && p.y >= 0 && p.y < SIZE;

const COLORS = ['c-blue', 'c-red', 'c-green'];

function shuffle(list) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

function createRandomLevel() {
    const p = randCell();
    // Block starts off the edges so it can always be pushed somewhere.
    let b;
    do {
        b = { x: Math.floor(Math.random() * 3) + 1, y: Math.floor(Math.random() * 3) + 1 };
    } while (same(b, p));
    let t;
    do {
        t = randCell();
    } while (same(t, p) || same(t, b));

    // Which colour plays which role is randomised too, so you have to work out
    // which piece you are.
    const [pc, bc, tc] = shuffle(COLORS);
    return { player: p, block: b, target: t, colors: { player: pc, block: bc, target: tc } };
}

function applyColors(colors) {
    for (const role of ['player', 'block', 'target']) {
        els[role].classList.remove(...COLORS);
        els[role].classList.add(colors[role]);
    }
}

function entity(kind) {
    const el = document.createElement('div');
    el.className = 'entity ' + kind;
    const skin = document.createElement('div');
    skin.className = 'skin';
    el.appendChild(skin);
    board.appendChild(el);
    return el;
}

function buildBoard() {
    board.innerHTML = '';
    els.target = entity('target');
    els.block = entity('block');
    els.player = entity('player');
}

function place(el, pos) {
    el.style.setProperty('--tx', pos.x * CELL + 'px');
    el.style.setProperty('--ty', pos.y * CELL + 'px');
}

// Re-adding a class in the same frame won't restart a CSS animation; forcing a
// reflow between removal and addition does.
function replay(el, cls) {
    if (reduceMotion) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
}

function squash(el, dx) {
    replay(el.querySelector('.skin'), dx !== 0 ? 'squash-x' : 'squash-y');
}

// Blocked move: lean into the obstacle and spring back, and knock the board
// along the axis of the collision — sideways for side walls, vertically for
// the top and bottom.
function bump(dx, dy) {
    els.player.style.setProperty('--bx', dx * 7 + 'px');
    els.player.style.setProperty('--by', dy * 7 + 'px');
    board.style.setProperty('--sx', dx * 2 + 'px');
    board.style.setProperty('--sy', dy * 2 + 'px');
    replay(els.player, 'bump');
    replay(board, 'shake');
}

function movePlayer(dx, dy) {
    if (won) return;

    const next = { x: player.x + dx, y: player.y + dy };
    if (!inBounds(next)) return bump(dx, dy);

    if (same(next, block)) {
        const pushed = { x: block.x + dx, y: block.y + dy };
        if (!inBounds(pushed)) return bump(dx, dy);

        block = pushed;
        place(els.block, block);
        squash(els.block, dx);
        replay(els.block, 'nudged');

        player = next;
        place(els.player, player);
        squash(els.player, dx);

        if (same(block, target)) landOnTarget();
        return;
    }

    player = next;
    place(els.player, player);
    squash(els.player, dx);
}

function landOnTarget() {
    won = true;
    board.classList.add('game-won');
    els.target.classList.add('filled');
    replay(els.block, 'pop');

    const win = document.getElementById('win-message');
    // Message picks up whichever colour happens to be the goal this round.
    win.style.color = getComputedStyle(els.target.querySelector('.skin')).backgroundColor;
    win.classList.remove('hidden');
    document.getElementById('play-again-btn').classList.remove('hidden');
    document.querySelector('.reset-btn').classList.add('hidden');
}

function layout(instant) {
    if (instant) board.classList.add('no-anim');
    place(els.target, target);
    place(els.block, block);
    place(els.player, player);
    if (instant) {
        void board.offsetWidth; // flush before re-enabling transitions
        board.classList.remove('no-anim');
    }
}

function loadLevel(level) {
    ({ player, block, target } = level);
    won = false;
    board.classList.remove('game-won');
    els.target.classList.remove('filled');
    applyColors(level.colors);
    layout(true);

    document.getElementById('win-message').classList.add('hidden');
    document.getElementById('play-again-btn').classList.add('hidden');
    document.querySelector('.reset-btn').classList.remove('hidden');
}

function startNewGame() {
    initial = createRandomLevel();
    loadLevel(structuredClone(initial));
    replay(els.player, 'drop-in');
    replay(els.block, 'drop-in');
}

function resetGame() {
    loadLevel(structuredClone(initial));
}

/* ---------- input ---------- */

document.addEventListener('keydown', event => {
    const moves = {
        ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
    };
    const move = moves[event.key];
    if (move) {
        event.preventDefault();
        movePlayer(move[0], move[1]);
    }
});

function pressFeedback(btn) {
    replay(btn, 'pressed');
}

document.addEventListener('click', event => {
    const moveBtn = event.target.closest('[data-move]');
    if (moveBtn) {
        const [dx, dy] = moveBtn.dataset.move.split(',').map(Number);
        pressFeedback(moveBtn);
        movePlayer(dx, dy);
        return;
    }
    const actionBtn = event.target.closest('[data-action]');
    if (actionBtn) {
        if (actionBtn.dataset.action === 'reset') resetGame();
        else if (actionBtn.dataset.action === 'play-again') startNewGame();
    }
});

document.addEventListener('touchstart', event => {
    const moveBtn = event.target.closest('[data-move]');
    if (moveBtn) {
        event.preventDefault();
        const [dx, dy] = moveBtn.dataset.move.split(',').map(Number);
        pressFeedback(moveBtn);
        movePlayer(dx, dy);
    }
}, { passive: false });

// Stop double-tap zoom on the control pad.
let lastTouchEnd = 0;
document.addEventListener('touchend', event => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) event.preventDefault();
    lastTouchEnd = now;
}, false);

buildBoard();
startNewGame();
