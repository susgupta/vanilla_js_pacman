import { LEVEL, OBJECT_TYPE } from './setup';
import { randomMovement } from './ghostMoves';

import GameBoard from './GameBoard';
import Pacman from './Pacman';
import Ghost from './Ghost';

// Sounds
import soundDot from './sounds/munch.wav';
import soundPill from './sounds/pill.wav';
import soundGameStart from './sounds/game_start.wav';
import soundGameOver from './sounds/death.wav';
import soundGhost from './sounds/eat_ghost.wav';

//get DOM elements
const gameGrid = document.querySelector('#game');
const scoreTable = document.querySelector('#score');
const startButton = document.querySelector('#start-button');

//game constants
const POWER_PILL_TIME = 10000; //ms
const GLOBAL_SPEED = 80; //ms
const gameBoard = GameBoard.createGameBoard(gameGrid, LEVEL);

//initial set-up
let score = 0
let timer = null;
let gameWin = false;
let powerPillActive = false;
let powerPillTimer = null;

function playAudio(audio) {
    const soundEffect = new Audio(audio);
    soundEffect.play();
}

function gameOver(pacman, grid) {

    playAudio(soundGameOver);

    document.removeEventListener('keydown', e => pacman.handleKeyInput(e, gameBoard.objectExist));

    gameBoard.showGameStatus(gameWin);

    //stop the game
    clearInterval(timer);
    startButton.classList.remove('hide')
}

function checkCollision(pacman, ghosts) {
    const collidedGhost = ghosts.find(ghost => pacman.pos === ghost.pos);

    //see if have collided ghost
    if (collidedGhost) {

        if (pacman.powerPill) {

            playAudio(soundGhost);

            gameBoard.removeObject(collidedGhost.pos, [
                OBJECT_TYPE.GHOST,
                OBJECT_TYPE.SCARED,
                collidedGhost.name
            ]);

            //reset ghost position
            collidedGhost.pos = collidedGhost.startPos;
            score += 100;
        }
        else {
            //pacman dies
            gameBoard.removeObject(pacman.pos, [
                OBJECT_TYPE.PACMAN
            ]);
            gameBoard.rotateDiv(pacman.pos, 0);
            gameOver(pacman, gameGrid);
        }

    }
}

function gameLoop(pacman, ghosts) {

    gameBoard.moveCharacter(pacman);
    checkCollision(pacman, ghosts);

    ghosts.forEach(ghost => gameBoard.moveCharacter(ghost));
    checkCollision(pacman, ghosts);

    //check pacman eats dot
    if (gameBoard.objectExist(pacman.pos, OBJECT_TYPE.DOT)) {
        playAudio(soundDot);
        gameBoard.removeObject(pacman.pos, [
            OBJECT_TYPE.DOT
        ]);
        gameBoard.dotCount--
        score += 10;
    }

    //check if pacman eats power pill
    if (gameBoard.objectExist(pacman.pos, OBJECT_TYPE.PILL)) {
        playAudio(soundPill);
        gameBoard.removeObject(pacman.pos, [
            OBJECT_TYPE.PILL
        ]);

        pacman.powerPill = true;
        score += 50;

        clearTimeout(powerPillTimer);
        powerPillTimer = setTimeout(
            () => (pacman.powerPill = false),
            POWER_PILL_TIME
        );
    }

    //change ghost scare mode 
    if (pacman.powerPill !== powerPillActive) {
        powerPillActive = pacman.powerPill;
        ghosts.forEach((ghost) => (ghost.isScared = pacman.powerPill));
    }

    //check if all dots eaten
    if (gameBoard.dotCount === 0) {
        gameWin = true;
        gameOver(pacman, ghosts);
    }

    //show the score
    scoreTable.innerHTML = score;
}

function startGame() {

    playAudio(soundGameStart);

    gameWin = false;
    powerPillActive = false;
    score = 0;

    startButton.classList.add('hide');

    //new game grid
    gameBoard.createGrid(LEVEL);

    //create pacman
    const pacman = new Pacman(2, 287);
    gameBoard.addObject(287, [OBJECT_TYPE.PACMAN]);
    //add listeners for pacman
    document.addEventListener('keydown', (e) => {
        pacman.handleKeyInput(e, gameBoard.objectExist);
    });

    //create ghosts
    const ghosts = [
        new Ghost(5, 188, randomMovement, OBJECT_TYPE.BLINKY),
        new Ghost(4, 209, randomMovement, OBJECT_TYPE.PINKY),
        new Ghost(3, 230, randomMovement, OBJECT_TYPE.INKY),
        new Ghost(2, 251, randomMovement, OBJECT_TYPE.CLYDE)
    ]

    //begin game loop
    timer = setInterval(() => gameLoop(pacman, ghosts), GLOBAL_SPEED);

}

//init game event listeners
startButton.addEventListener('click', startGame);