/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine makes the canvas' context (ctx) object globally available to make
 * writing app.js a little simpler to work with.
 */

const Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas element's height/width and add it to the DOM.
     */
    let doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        let now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();

    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {

        if(!player.winner && player.charSelected && player.lives > 0){
            updateEntities(dt);
            checkCollisions();
        }

        if (player.winner && resetGame || ( player.lives === 0 && resetGame ) ) {
            reset();
        }


    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy, index, arr) {
            enemy.update(dt);

            // Remove Enemies Out of Board from allEnemies Array - Optimize Performance
            if (enemy.x > 500) arr.splice(index, 1);
        });

        player.update();

    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        let rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        // Before drawing, clear existing canvas
        ctx.clearRect(0,0,canvas.width,canvas.height);

        // Insert Score on top of game board
        ctx.font = "20px Georgia";
        ctx.fillText('Score : '+player.score+'', 402, 40);

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies, lives, gems arrays and player and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            // console.log(enemy);
            enemy.render();
        });

        lives.forEach(function(life) {
            // console.log(life);
            life.render();
        });

        gems.forEach(function(gem) {
            // console.log(gem);
            gem.render();
        });

        player.render();

    }


    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function lose(playerLives, lives) {
        console.log(playerLives, lives);
        // noop
        player.lives --;
        lives.splice(lives.length - 1);

        if (player.lives > 0) {
            console.log(playerLives, lives);
            allEnemies = [];
            gems = [];
            player.x = 202;
            player.y = 400;

            return;
        }
        console.log(player.lives, lives);
        showModal();

    }


    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        // noop
        allEnemies = [];
        gems = [];
        player.x = 202;
        player.y = 400;
        player.score = 0;

        if (player.lives === 0 || player.winner) {
            player.lives = 3;
            lives = [new Life(undefined, 0, 10, 20, 35), new Life(undefined, 20, 10, 20, 35), new Life(undefined, 40, 10, 20, 35)];
        }

        player.winner = false;
        resetGame = false;
    }

    /* This function check and handle player collision with Enemies and Gems.
    *  If collision with enemy .. player lose life and return to point 0 .. / if no lif
    */
    function checkCollisions() {

        let playerLeft = Math.floor(player.x) + 17;
        let playerRight = playerLeft + player.width - 34;
        let playerTop = player.y + 62;
        let playerBottom = playerTop + player.height - 86;

        allEnemies.forEach(function(enemy){

            let enemyLeft = Math.floor(enemy.x);
            let enemyRight = enemyLeft + enemy.width;
            let enemyTop = Math.floor(enemy.y) + 76;
            let enemyBottom = enemyTop + enemy.height - 98;

            if ( enemyLeft < playerRight && enemyRight > playerLeft && enemyTop < playerBottom && enemyBottom > playerTop ) {
                lose(player.lives, lives);
            }
        });

        // Check collision with Gems => Gem Collected
        if(gems.length) {

            let currentGem = gems[0];
            let gemWidth = 60;
            let gemHeight = 30;
            let gemLeft = currentGem.randomX;
            let gemRight = gemLeft + gemWidth;
            let gemTop = currentGem.randomY + 30;
            let gemBottom = gemTop + gemHeight;

            if ( gemLeft < playerRight && gemRight > playerLeft && gemTop < playerBottom && gemBottom > playerTop ) {
                gems.splice(0,1);
                player.score += 50;
            }
        }
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/heart.png',
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png',
        'images/gem-blue.png',
        'images/gem-green.png',
        'images/gem-orange.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
