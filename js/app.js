
// Master Class for all rendered objects
class RenderedObject {
    constructor(imageName, x, y, w = 101, h = 171) {
        this.sprite = 'images/'+imageName+'.png'; // e.g. 'enemy-bug'
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    // Draw the enemy on the screen, required method for game
    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y, this.w, this.h);
    }

    // Update the enemy's position, required method for game
    // Parameter: dt, a time delta between ticks
    update(dt) {
        // You should multiply any movement by the dt parameter
        // which will ensure the game runs at the same speed for
        // all computers.
    }
}

// Enemies our player must avoid
class Enemy extends RenderedObject {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    constructor() {
        super('enemy-bug', -100, [64, 147, 230][Math.floor(Math.random()*3)]); // Random X Position of Enemies in one of 3 paths ( rows )
        this.speeds = [100, 150, 200];
        this.randomSpeed = this.speeds[Math.floor(Math.random()*this.speeds.length)];
        this.height = 171;
        this.width = 101;

    }

    // Move Enemies
    update(dt) {
        this.x = this.x +  dt * this.randomSpeed;
    }

}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.

class Player extends RenderedObject {
    constructor(imageName = 'char-boy', x = 202, y = 400, w, h) {
        super(imageName, x, y, w, h);
        this.height = 171;
        this.width = 101;
        this.score = 0;
        this.winner = false;
        this.charSelected = false;
        this.lives = 3;
    }

    handleInput(allowedInput, yStart, yEnd, xStart, xEnd, yMove = 83, xMove = 101 ) {

        if (!player.winner && player.lives > 0) {

            switch (allowedInput) {
                case 'up' :
                    if ( this.y !== yStart ) this.y = this.y - yMove;
                    break;
                case 'right' :
                    if ( this.x !== xEnd ) this.x = this.x + xMove;
                    break;
                case 'down' :
                    if ( this.y !== yEnd ) this.y = this.y + yMove;
                    break;
                case 'left' :
                    if ( this.x !== xStart ) this.x = this.x - xMove;
                    break;
            }
        }

        if (player.y === -15 && player.winner === false) {
            player.winner = true;
            player.score += 10;
            showModal(player.lives);
        }

        if (player.lives === 0) {
            showModal(player.lives)
        }
    }
}

class Life extends RenderedObject {
    constructor(imageName = 'heart', x, y, w, h) { // blue || green || orange
        super(imageName, x, y, w, h);
        this.x = x;
        this.y = y;
    }

}

class Gem extends RenderedObject{
    constructor(imageName, x, y, w, h) { // blue || green || orange
        super(imageName, x, y, w, h);
        this.randomX = 20 + ( 101 * (Math.floor(Math.random()*5)) );
        this.randomY = 117 + ( 83 * (Math.floor(Math.random()*3)) );
    }

    render() {
        ctx.drawImage(Resources.get(this.sprite), this.randomX, this.randomY, 60, 90);
    }
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

let allEnemies = [new Enemy()];
let gems = [];
let lives = [new Life(undefined, 0, 10, 20, 35), new Life(undefined, 20, 10, 20, 35), new Life(undefined, 40, 10, 20, 35)];
let resetGame = false;

const player = new Player('char-boy', 205, 400);
const plImagesNames = ['char-boy', 'char-cat-girl', 'char-horn-girl', 'char-pink-girl'];

const playerSelection = document.getElementById('player-selection');
const selectPlayer = document.querySelector('.players');
const modal = document.querySelector('.modal-window');
const modalTitle = document.querySelector('.messageTitle');
const gameStatus = document.querySelector('.gameStatus');
const totalScore = document.querySelector('.rating-score');

// Initialize Game & Show Player Select
function initGame(player) {
    selectPlayer.innerHTML = '';
    const fragment = document.createDocumentFragment();

    for (playerImage of plImagesNames) {
        const element = document.createElement('li');
        element.dataset.image = playerImage;
        element.innerHTML = '<div class="player-image" data-image="'+playerImage+'"><img class="" src="images/'+playerImage+'.png" data-image="'+playerImage+'" alt="boy"></div><button data-image="'+playerImage+'" class="select-player">Select Player</button>';
        fragment.appendChild(element);
    }
    selectPlayer.appendChild(fragment);

    // Listen to Player Selected to Begin the Game
    selectPlayer.addEventListener('click', function(e){

        // Generating Enemies
        setInterval(()=> {
            let newEnemey = new Enemy();
            allEnemies.push(newEnemey);
        }, 1500);


        setInterval(()=> {

            // If player didn't win & still have lives => Generate Random Gems
            if (!player.winner && player.lives > 0) {

                let randomImage = ['gem-blue', 'gem-orange', 'gem-orange'][Math.floor(Math.random()*3)];

                let newGem = new Gem(randomImage);
                gems.push(newGem);

                // Remove Gem after 3 Seconds
                setTimeout(()=> {
                    if (!player.winner) {
                        gems.splice(0, 1);
                    }
                }, 3000);
            }
        }, 10000);

        /* Player Character Selected
        ** change player image to the player selected and hide selection modal
        */
        player.charSelected = true;

        let fileName = e.target.attributes.getNamedItem('data-image').value;
        player.sprite = 'images/'+fileName+'.png';
        playerSelection.classList.toggle('hidden')

    });
}

initGame(player);


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    const allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode], -15, 400, 0, 404);
});

// listen for modal confirmation buttons click
document.addEventListener('click', function(e){

    const target = e.target;

    // If user chose to play again => Reset Game & Close Modal
    if ( target.matches('.btn-primary') ) {
        resetGame = true;
        closeModal(e);
    }

    if ( target.matches('.modal-close') || target.matches('.btn-secondary') ) {
        closeModal(e);
    }

});


// Set Game Status Statistics & Open Modal
function showModal(playerLives) {
    totalScore.innerHTML = player.score;

    // Prepare Modal content in case of winning or game over
    if (playerLives > 0) {
        modalTitle.innerHTML = 'Congratulations';
        gameStatus.innerHTML = 'won';
    } else {
        modalTitle.innerHTML = 'Game Over';
        gameStatus.innerHTML = 'lost';
    }

    setTimeout(function(){
        openModal();
    }, 500);
}

// Open Modal
function openModal() {
    modal.classList.add('show-modal');
}

// Close Modal
function closeModal() {
    modal.classList.remove('show-modal');
}
