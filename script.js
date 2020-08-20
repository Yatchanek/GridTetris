const GAME_WIDTH = 12;
const GAME_HEIGHT = 18;
const gameBox = document.querySelector('.game-box');
const gameOverBox = document.querySelector('.game-over');
const scoreBox = document.querySelector('.score-box');
const nextBox = document.querySelector('.next-box');
const pausedBox = document.querySelector('.paused'); 
const bkgImages = ['./res/p1.jpg', './res/p2.jpg', './res/p3.jpg', './res/p4.jpg', './res/p5.jpg', './res/p6.jpg', './res/p7.jpg'];
const loadingScreen = document.querySelector('.loading-message');
const STARTING_SPEED = 25;
let bkg;
let grid = [];
let tetrominos = [];
let colors = ['rgb(255, 0, 0)', 'rgb(0, 100, 250)', 'rgb(7, 82, 37)', 'rgb(255, 100, 0)', 'rgb(255, 0, 255)', 'rgb(124, 8, 128)', 'rgb(220, 220, 0)', 'rgba(225, 225, 225, .7)', 'rgb(150, 150, 150)', 'rgb(0, 0, 0)'];
let currentPiece = Math.floor(Math.random() * 7);
let nextPiece = Math.floor(Math.random() * 7);
let currentX = GAME_WIDTH / 2;
let currentY = 0;
let currentRotation = 0;
let keyHold = false;
let gameTick = false;
let speed = STARTING_SPEED;
let counter = 0;
let fullLines = [];
let bkgCount = 0;
let gameOver = false;
let score = 0;
let linesCount = 0;
let isPaused = false;


tetrominos[0] = '..X...X...X...X.';
tetrominos[1] = '..X..XX...X.....';
tetrominos[2] = '.....XX..XX.....';
tetrominos[3] = '..X..XX..X......';
tetrominos[4] = '.X...XX...X.....';
tetrominos[5] = '.X...X...XX.....';
tetrominos[6] = '..X...X..XX.....';

setup();




function setup() {
    let len = bkgImages.length;
    let imgCount = 0;
    for (i=0; i < len; i++) {
        let img = new Image()
        img.src = bkgImages.shift()
        bkgImages.push(img);
        img.onload = () => {
            imgCount++;
            if (imgCount === len) {
                loadingScreen.style.display = 'none';
                createGrid();
                createDOMCells();
                gameLoop();
            }
        }
    }
}

async function gameLoop() {
    if (!gameOver && !isPaused) {  
        drawGrid();
        drawCurrentPiece();    
        await sleep(50);
        gameTick = false;
        counter++;
        if (counter === speed) {
            counter = 0;
            if (pieceFits(currentPiece, currentX, currentY+1, currentRotation)) {
                currentY++;
            }
            else {
                for (let px = 0; px < 4; px ++) {
                    for (let py = 0; py < 4; py ++) {
                        if (tetrominos[currentPiece][rotate(px, py, currentRotation)] === 'X') {
                            grid[(currentY + py) * GAME_WIDTH + (currentX + px)] = currentPiece;
                        }
                    }
                }
                
                score+= 5;
                scoreBox.innerHTML = `SCORE: ${score}`; 
                for (let py = 0; py < 4; py++) {
                    if (currentY + py < GAME_HEIGHT - 1) {
                        let isLine = true;
                        for (let px = 1; px < GAME_WIDTH - 1; px++) {
                            isLine &= grid[(currentY + py) * GAME_WIDTH + px] !=7;
                        }
                        if(isLine) {
                            for (let px = 1; px < GAME_WIDTH - 1; px++) {
                                grid[(currentY + py) * GAME_WIDTH + px] = 9;
                                gameBox.children[(currentY + py) * GAME_WIDTH + px].classList.add('remove');
                            }
                            fullLines.push(currentY + py);
                            linesCount++;
                        }
                    }
                    
                }
    
                if (fullLines.length) {
                    let bonus = 0.2 * fullLines.length;
                    score += fullLines.length * 50 * (1+bonus);
                    scoreBox.innerHTML = `SCORE: ${score}`; 
                    drawGrid();
                    await sleep(250);
                    
                    fullLines.forEach(line => {
                        for (let px = 1; px < GAME_WIDTH -1; px ++) {
                            for (let py = line; py > 0; py--) {
                                gameBox.children[py * GAME_WIDTH + px].classList.remove('remove');
                            }
                        }
                    }
                    
                    );
                    await sleep(250);
                    
                    fullLines.forEach(line => {
                        for (let px = 1; px < GAME_WIDTH -1; px ++) {
                            for (let py = line; py > 0; py--) {
                                
                                grid[py * GAME_WIDTH + px] = grid[(py - 1) * GAME_WIDTH + px];
                                grid[px] = 7;
                            }
                        }
                    }
    
                    );
                    fullLines = [];
                }
                currentPiece = nextPiece;
                nextPiece = Math.floor(Math.random() * 7);
                currentX = GAME_WIDTH / 2;
                currentY = 0;
                currentRotation = 0;
                drawNextPiece();
                if (!pieceFits(currentPiece, currentX, currentY, currentRotation)) {
                    gameOver = true;
                    drawCurrentPiece();    
                }

                
            }
        }
        if (linesCount > 0 && linesCount % 10 === 0) {
            speed-=3;
            if (speed <=0) {
                speed = 1;
            }
            linesCount = 0;
            bkgCount++;
            bkg = document.querySelector('.bkg');
            bkg.remove();
            bkg = bkgImages[bkgCount % bkgImages.length]
            bkg.classList.add('bkg');
            document.body.prepend(bkg);
            console.log(bkg);
        }
               
        gameLoop();
    }
    else if (gameOver) {
        gameOverBox.classList.remove('hidden');
    }
}


function rotate(px, py, r) {
    let pIndex = 0;
    switch(r % 4) {
        case 0:
        pIndex = py * 4 + px;
        break;
        case 1:
        pIndex = 12 + py - (px * 4);
        break;
        case 2:
        pIndex = 15 - (py * 4) - px;
        break;
        case 3:
        pIndex = 3 - py + (px * 4);
        break;
    }
    return pIndex;
}

function createGrid() { 
    for (let x = 0; x < GAME_WIDTH; x++) {
        for (let y = 0; y < GAME_HEIGHT; y++) {
            grid[y * GAME_WIDTH + x] = (x === 0 || x === GAME_WIDTH - 1 || y === GAME_HEIGHT - 1) ? 8 : 7;      
        }
    }
}

function createDOMCells() {
    let cellSize = `${95 / (GAME_HEIGHT)}vmin`;
    gameBox.style.gridTemplateColumns = `0px repeat(${GAME_WIDTH-2 }, ${cellSize}) 0px`;
    gameBox.style.gridTemplateRows = `repeat(${GAME_HEIGHT-1}, ${cellSize}) 0px`;
    for (let x = 0; x < GAME_WIDTH; x++) {
        for (let y = 0; y < GAME_HEIGHT; y++) {
            let cell = document.createElement('div');
            cell.style.width = cell.style.height = cellSize;
            gameBox.appendChild(cell);
        }
    }
    nextBox.style.gridTemplateColumns = `repeat(4, ${50/GAME_HEIGHT}vmin)`;
    nextBox.style.gridRows = `repeat(4, ${50/GAME_HEIGHT}vmin)`;
    for (let x = 0; x < 4; x++) {
        for (let y = 0; y < 4; y++) {
            let cell = document.createElement('div');
            cell.style.width = cell.style.height = `${50/GAME_HEIGHT}vmin`;
            nextBox.appendChild(cell);
        }
    }
    scoreBox.innerHTML = `SCORE: ${score}`;
    bkg = bkgImages[0];
    bkg.classList.add('bkg');
    document.body.prepend(bkg);
    drawNextPiece();
}

function drawGrid() {
    for (let x = 0; x < GAME_WIDTH; x++) {
        for (let y = 0; y < GAME_HEIGHT; y++) {
            if (x === 0 || x === GAME_WIDTH-1) {
                gameBox.children[y * GAME_WIDTH + x].style.width = '0px';
            }
            else if (y === GAME_HEIGHT-1) {
                gameBox.children[y * GAME_WIDTH + x].style.height = '0px';
            } 
            else {
                gameBox.children[y * GAME_WIDTH + x].style.backgroundColor = colors[grid[y * GAME_WIDTH + x]];
                if (grid[y * GAME_WIDTH +x] != 7) {
                    gameBox.children[y * GAME_WIDTH + x].classList.add('piece');
                }
                else {
                    if (gameBox.children[y * GAME_WIDTH + x].classList.contains('piece')) {
                        gameBox.children[y * GAME_WIDTH + x].classList.remove('piece');
                    }
                   
                }
            }
           
        }
        
    }
}

function drawCurrentPiece() {
    for (let px = 0; px < 4; px ++) {
        for (let py = 0; py < 4; py ++) {
            if (tetrominos[currentPiece][rotate(px, py, currentRotation)] === 'X') {
                gameBox.children[(currentY + py) * GAME_WIDTH + (currentX + px)].style.backgroundColor = colors[currentPiece];
                gameBox.children[(currentY + py) * GAME_WIDTH + (currentX + px)].classList.add('piece');
            }
        }
    }
}

function drawNextPiece() {
    for (let px = 0; px < 4; px ++) {
        for (let py = 0; py < 4; py ++) {
            nextBox.children[py * 4 + px].style.backgroundColor = 'rgba(255, 255, 255, 0)';
            if (tetrominos[nextPiece][4 * py + px] === 'X') {
                nextBox.children[py * 4 + px].style.backgroundColor = colors[nextPiece];
            }
        }
    }
}

function dropPiece() {
    while(pieceFits(currentPiece, currentX, currentY+1, currentRotation)) {
        currentY++;
    }
}

function pieceFits(piece, posX, posY, rotation) {
    for (let px = 0; px < 4; px ++) {
        for (let py = 0; py < 4; py ++) {
            let pIndex = rotate(px, py, rotation);
            let gIndex = (posY + py) * GAME_WIDTH + (posX + px);

            if (posX + px >= 0 && posX + px < GAME_WIDTH) {
                if (posY + py >=0 && posY + py < GAME_HEIGHT) {

                    if (tetrominos[piece][pIndex] === 'X' && grid [gIndex] != 7) {
                        return false;
                    }
                }
            }
        }
    }

    return true;
}

function keyPressed(e) {
    let code = e.keyCode;
    switch(code) {
        case 37: //Left Arrow
            if (!gameTick && pieceFits(currentPiece, currentX-1, currentY, currentRotation)) {
                currentX--;
                gameTick = true;
            }
        break;
        case 39: //Right Arrow    
            if (!gameTick && pieceFits(currentPiece, currentX+1, currentY, currentRotation)) {
            currentX++;
            gameTick = true;
            }
        break;
        case 38: //Up Arrow
            if (!keyHold && !gameTick && pieceFits(currentPiece, currentX, currentY, currentRotation+1)) {
            currentRotation++;
            keyHold = true;
            gameTick = true;
            }
        break;
        case 40: //Down Arrow
            if (!gameTick && pieceFits(currentPiece, currentX, currentY+1, currentRotation)) {
            currentY++;
            gameTick = true;
            }
        break;
        case 80: //P
            if (isPaused) {
                isPaused = false;
                pausedBox.classList.add('hidden');
                gameLoop();
            } else {
                isPaused = true;
                pausedBox.classList.remove('hidden');
            }
        break;
        case 32: //SPACE
            dropPiece();
        break;
    }
}

async function restartGame() {
    if(gameOver) {
        pieceCount = 0;
        score = 0;
        scoreBox.innerHTML = `SCORE: ${score}`;
        speed = STARTING_SPEED;
        gameOverBox.classList.add('hidden');
        grid = [];
        gameOver = false;
        currentPiece = Math.floor(Math.random() * 7);
        nextPiece = Math.floor(Math.random() * 7);
        setTimeout(() => {
            drawNextPiece();         
            gameLoop();
        }, 500);
        collapseGrid();
        createGrid();
        bkg = document.querySelector('.bkg');
        bkg.remove();
        bkg = bkgImages[0];
        bkg.classList.add('bkg');
        document.body.prepend(bkg);
        console.log(bkg)
    }
}

function collapseGrid() {
   
    for (let x = 0; x < GAME_WIDTH; x++) {
        for (let y = 0; y < GAME_HEIGHT; y++) {
            gameBox.children[y * GAME_WIDTH + x].style = `opacity: 0`;
            
        }
    }
    for (let x = 0; x < GAME_WIDTH; x++) {
        for (let y = 0; y < GAME_HEIGHT; y++) {
            gameBox.children[y * GAME_WIDTH + x].style = `opacity: 1`;
            
        }
    }
   
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

window.addEventListener('keydown', keyPressed);
window.addEventListener('keyup', () => keyHold = false);
window.addEventListener('click', restartGame);

