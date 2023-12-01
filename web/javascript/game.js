
// Variables defining how fast the player moves per second in game meters.
const horizontalSpeed = 4.5;
const verticalSpeed = 6.5;

// Margins on the side of the screen, given in game meters
// If the player moves past these margins, the screen starts moving.
const screenEdgeMargin = 8;
// The position of the screen relative to the player
var screenOffsetX = 0;
var screenOffsetY = 0;

// How many on-screen pixels represent an ingame meter
var pixelsPerMeter;

const cmPerBlock = 1.2; // size of each 'meter' on screen.
const blockReach = 3;

// Whether the player can double jump against walls
var allowDoubleJump = true;

// Whether to draw outlines around the player(s)
var showBoundingBox = true;

// Object containing all loaded images.
// If one wants to add images to the resources variable, you can do
// 'resources.something = ...' or 'let a = resources.something'
var resources = {};

// Object containing all moving resources (animations)
var animations = {}

// Window dimensions in arbitrary game 'meters'
var windowWidthInMeters;
var windowHeightInMeters;

// Variable containing all information of the player.
var mainPlayer;

let timePhase = 0; // used for timed animations.

var connectedControllers = [];
var gameActive = true;

const Input = {
    BUTTON_UP_BP: 0,
    BUTTON_LEFT_BP: 1,
    BUTTON_RIGHT_BP: 2,
    BUTTON_DOWN_BP: 3,
    BUTTON_A_BP: 4,
    BUTTON_B_BP: 5,
    BUTTON_OPT_BP: 6
}

clamp = function(x, a, b) { return x < a ? a : x > b ? b : x; }
isWithinBounds = function(x, a, b) { return x >= a && x <= b; }

/** This function is called before the setup function.
 *  This can be used to load images for resources.
 */
function preload() {

    // All filenames.
    // If one wants to add a new resource to the resources array,
    // one must simply add the name in the 'fileNames' array, as long as the file ends
    // with the same extension type as defined below.
    // If one wants to access the resource afterwards, simply do 'resources['rs name']'
    const extension = 'png';
    const fileNames = ['player_animation', 'dirt', 'stone', 'grass_block',
                        'deepslate_bricks', 'cracked_deepslate_bricks',
                        'moon_phases', 'skyImage', 'diamond_ore', 'gold_ore', 'coal_ore',
                        'heart', 'heart_half', 'heart_background'];

    for (let element of fileNames)
        resources[element] = loadImage(`./assets/${element}.${extension}`);

    // How many pixels represent a 'meter' ingame. This uses an invisible div element that's one cm large.
    pixelsPerMeter = document.querySelector(".pixel-size").clientWidth * cmPerBlock;
    windowWidthInMeters = window.innerWidth / pixelsPerMeter;
    windowHeightInMeters = window.innerHeight / pixelsPerMeter;
}

/**
 * Method for setting up variables, after pre-initialization.
 * Here we can add event listeners, register preloaded images as resource
 * and create the canvas.
 */
function setup() {

    // When pressed on the 'select controller' button,
    // we attempt to find a bluetooth controler.
    document.querySelector(".controller-connect")
        .addEventListener("click", () => checkBluetoothConnections());

    let settingsElem = document.querySelector(".game-settings-button");

    // The settings button, one can pause the game with this

    settingsElem.addEventListener("click", () => {
        gameActive = false;
        document.querySelector(".game-menu-container")
            .style.visibility = 'visible';
        settingsElem.style.visibility = 'hidden';
    });

    document.querySelector(".game-resume")
        .addEventListener("click", () => {
           gameActive = true;
           settingsElem.style.visibility = 'visible';
           document.querySelector(".game-menu-container").style.visibility = 'hidden';
        });

    // Create a canvas to render onto
    createCanvas(window.innerWidth, window.innerHeight);

    // Load all block resources
    for (const [key, value] of Object.entries(resources))
        if (typeof BlockType[key] !== null)  BlockType[key] = new Resource(value);

    animations['moonAnimation'] = new Resource(resources['moon_phases'], 4, 2);
    animations['skyBackground'] = new Resource(resources['skyImage']);
    animations['playerAnimation'] = new Resource(resources['player_animation'], 4, 1);


    // Whenever the screen resizes, adapt the canvas size with it.
    window.addEventListener('resize', () => resizeCanvas(window.innerWidth, window.innerHeight));

    // Create an instance of the first player, for when the user decides to play single-player.
    mainPlayer = new Player(5, 15);
    Environment.generate();            // generate environment
    Environment.introduce(mainPlayer); // add player to the environment
    Environment.introduce(new Player(10, 15));
    noSmooth(); // prevent pixel-smoothing (this makes images look wacky)

}

// Draw function is called every 1/60th a second.
// This means it has a 16.6ms interval.
function draw() {
    background(0);

    let sgnX = 0;
    let sgnY = 0;

    if (keyIsDown(65)) sgnX--;      // left (A)
    if (keyIsDown(68)) sgnX++;      //right (D)
    if (keyIsDown(32)) sgnY++;      // jump (space)
    if (keyIsDown(16)) sgnX *= 0.5; // sneak (shift)

    if (sgnX !== 0 && mainPlayer.colliding.x === 0)
        mainPlayer.velocity.x = horizontalSpeed * sgnX;
    // Only allow the player to jump when either on ground or colliding in a wall (double jump)

    if (sgnY !== 0 && (mainPlayer.colliding.y < 0 || (allowDoubleJump && mainPlayer.colliding.x !== 0 && mainPlayer.velocity.y < 0)))
        mainPlayer.velocity.y = verticalSpeed * sgnY;

    // Saves current matrix and pushes it on top of the stack
    push();
    { // does nothing, just nice.

        // Rotate the matrix (sky)
        rotate(timePhase * 0.005);
        // translate sky to the middle so it rotates from the middle
        translate(window.innerWidth / 2, window.innerHeight / 2);

        // Render the stars
        animations['skyBackground'].draw(-window.innerWidth / 2, -window.innerWidth / 2, window.innerWidth, window.innerWidth);
    }
    pop(); // Pops the top matrix and goes to the previous one.


    // Draw the moon animation in the top right of the screen
    animations['moonAnimation'].animate(window.innerWidth - 200, 50, 100, 100, Math.floor(timePhase));

    // Offset the screen by the scrolling position
    translate(screenOffsetX * pixelsPerMeter, -screenOffsetY * pixelsPerMeter);

    // If the game isn't active, prevent updates.
    if (!gameActive)
        return;

    let dT = deltaTime / 1000;

    timePhase += dT;
    Environment.draw(dT);
    Environment.update(dT);

}

function checkBluetoothConnections() {
    if (!(navigator.bluetooth))
        throw new Error("Bluetooth not supported on this browser!");

    let bleServiceUUID = 'a8a5a50f-12c1-4b83-bcd3-71ec79287967';
    let bleCharacteristicsUUID = 'bb4843e0-d2fc-4b26-8fca-b99bd452acaa'

    BluetoothService.search({filters: [{namePrefix: "ESP32 Controller"}], optionalServices: [bleServiceUUID]})
        .then(device => {
            let connection = new BluetoothService(device);
            connection.onConnect = (device) => console.log(`Connected with Bluetooth device '${device.name}'`);
            connection.onReceive = (event) => {

                let inputCode = event.target.value.getUint8(0);

                mainPlayer.move(new Vec2(
                    -((inputCode >> Input.BUTTON_LEFT_BP) & 1) + ((inputCode >> Input.BUTTON_RIGHT_BP) & 1),
                    (inputCode >> Input.BUTTON_A_BP) & 1));

            };
            connection.onDisconnect = (e) => console.log("BT device disconnected", e);
            connection.primaryCharacteristicUuid = bleCharacteristicsUUID;
            connection.primaryServiceId = bleServiceUUID;
            connection.connect();
        })
        .catch(err => console.error("An error occurred whilst attempting to connect to Bluetooth device", err));
}

class Entity extends AABB {

    position; // position of the entity
    velocity; // velocity of the entity
    colliding; // colliding states, containing the direction of collision (x, y)
    fallingDistance; // Distance how long the entity has fallen for.
    health;
    maxHealth;
    isAlive;

    static regenerationInterval = 5; // how many seconds need to pass for one heart to regenerate

    static collisionThres = 0.05; // Detection threshold in meters

    constructor(posX, posY, maxHealth) {
        super(posX, posY, 0.9, 1.8);
        this.position  = new Vec2(posX, posY);
        this.velocity  = new Vec2(0, 0);
        this.colliding = new Vec2(0, 0);
        this.fallingDistance = 0;
        this.isAlive = true;
        this.health = maxHealth;
        this.maxHealth = maxHealth;
    }

    // Function that allows the entity to move based on the input vector.
    // The provided vector must be normalized, e.g. -1 <= x & y <= 1
    // If this isn't the case, the player will move faster than necessary.
    move(movementVector = new Vec2(0, 0)) {
        if (!(movementVector instanceof Vec2))
            return;

        this.velocity.translate(
            movementVector.x * horizontalSpeed,
            movementVector.y * verticalSpeed
        );
    }

    update(dT) {

        // Set it to an unrealistic number, just before testing for collision.
        // Makes it easier to test whether collision detection has finished, without allocating more memory.
        this.colliding.translate(0, 0);
        this.velocity.addY(-Environment.G * dT);

        // Natural regeneration, every ten seconds
        this.health = Math.min(this.health + dT / Entity.regenerationInterval, this.maxHealth);

        // Check if the next position of the entity is colliding with another
        for (let i = 0; i < Environment.boundingBoxes.length; i++) {
            let target = Environment.boundingBoxes[i];

            // Collision detection with self is always going to be true so let's just skip that shall we...
            if (target === this)
                continue;

            // If another class extends this class and defines the function 'onCollisionCheck',
            // this then calls the function with the current target as parameter.
            // If this function returns false, collision detection should skip this target
            if (typeof(this['onCollisionCheck']) === 'function' && !this['onCollisionCheck'](target))
                continue;

            // perform calculations for x-axis collision detection
            if (this.colliding.x === 0 && Math.abs(this.velocity.x) >= Entity.collisionThres) {
                for (let j = 0; j <= Math.abs(this.velocity.x * dT) + Entity.collisionThres * 2; j += Entity.collisionThres) {
                    if (this.copy.translateX(this.position.x + j * Math.sign(this.velocity.x)).intersects(target)) {
                        this.colliding.x = Math.sign(this.velocity.x);
                        if (typeof(this['onCollisionX']) === 'function')
                            this['onCollisionX'](target);
                        this.velocity.x = 0;
                        break;
                    }
                }
            }

            // Perform calculations for y-axis collision detection
            if (this.colliding.y === 0 && Math.abs(this.velocity.y) >= Entity.collisionThres) {
                for (let j = 0; j <= Math.abs(this.velocity.y * dT) + Entity.collisionThres * 2; j += Entity.collisionThres) {
                    if (this.copy.translateY(this.position.y + j * Math.sign(this.velocity.y)).intersects(target)) {

                        this.colliding.y = Math.sign(this.velocity.y);

                        if (typeof(this['onCollisionY']) === 'function')
                            this['onCollisionY'](target);

                        this.velocity.y = 0;
                        break;
                    }
                }
            }

            // If we're colliding on both axis, stop further checks
            if (this.colliding.x !== 0 && this.colliding.y !== 0)
                break;
        }

        // Add velocity to position
        this.position.add(this.velocity.x * dT, this.velocity.y * dT);

        // If we're falling, add fall distance
        if (this.velocity.y < 0)
            this.fallingDistance -= this.velocity.y * dT;

        // Check if we've fallen down
        if (this.colliding.y < 0) {
            // If fallen from a large enough area, induce fall damage
            if (this.fallingDistance >= 4)  {
                this.damage(this.fallingDistance * 0.3);
                this.fallingDistance = 0;
            }
        }

        // Reduce x-axis motion gradually
        this.velocity.x *= 0.8;

        // Limit falling to bottom screen so the player doesn't randomly disappear.
        this.position.y = Math.max(this.position.y, 0);

        // Update the AABB position
        this.translate(this.position.x, this.position.y);
    }

    /**
     * Method for inducing damage to the entity.
     * @param amount How many hearts of damage to induce
     */
    damage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.isAlive = this.health !== 0;
    }

    /**
     * Method for rendering the entity onto the screen
     * @param dt difference in time from last rendering.
     */
    draw(dt) {

    }
}

class Player extends Entity {

    static playerHealth = 20;
    constructor(x, y) {
        super(x, y, Player.playerHealth);
    }

    // Updates player-related variables, such as screen position
    update(dT) {
        super.update(dT);
        if (this !== mainPlayer)
            return;
        // If you come too close to the corner of the screen horizontally, move the camera accordingly.
        if (this.position.x + screenOffsetX < screenEdgeMargin) // left side of the screen
            screenOffsetX = -this.position.x + screenEdgeMargin;
        else if (this.position.x + screenOffsetX > windowWidthInMeters - screenEdgeMargin) // right side
            screenOffsetX = -this.position.x + windowWidthInMeters - screenEdgeMargin;

        // Perform the same translation on the Y axis
        if (this.position.y + screenOffsetY < screenEdgeMargin * 0.5) // bottom side of the screen
            screenOffsetY = -this.position.y + screenEdgeMargin * 0.5;
        else if (this.position.y + screenOffsetY > windowHeightInMeters - screenEdgeMargin * 0.5) // top side
            screenOffsetY = -this.position.y + windowHeightInMeters - screenEdgeMargin * 0.5;
    }

    onCollisionCheck(target) {
        let dSq = Math.pow(Math.max(this.left, target.left) - Math.min(this.right, target.right), 2) +
            Math.pow(Math.max(this.bottom, target.bottom) - Math.min(this.top, target.top) > Math.abs(this.velocity.y), 2);

        // Render the block selection
        if (dSq < blockReach * blockReach) {
            if (target.intersectsPoint(mouseX / pixelsPerMeter - screenOffsetX, (window.innerHeight - mouseY) / pixelsPerMeter - screenOffsetY)) {
                stroke(255, 255, 255); // outline rect color red
                fill(0, 0, 0, 0); // don't draw the rest of the rect
                rect((target.left) * pixelsPerMeter, window.innerHeight - target.bottom * pixelsPerMeter, target.width * pixelsPerMeter, target.height * pixelsPerMeter);

            }
        }
        return dSq < 2;
    }

    // For when one actually collides
    onCollisionX(target) {
        if (target instanceof Entity)
            target.velocity.x += this.velocity.x * 0.5;
    }

    // Rendering player related thingies
    draw(dt) {
        super.draw(dt);

        // Render the player image
        push();
        {
            // Translate draw location to player's screen position
            translate((this.position.x) * pixelsPerMeter,
                window.innerHeight - (this.height + this.position.y) * pixelsPerMeter);
            animations['playerAnimation'].animate(
                -10, 0, // since we translated, the player's screen pos is at 0, 0 in the current matrix.
                this.width * pixelsPerMeter * 2,
                this.height * pixelsPerMeter,
                Math.abs(this.velocity.x) > horizontalSpeed * 0.5 ?
                    Math.floor(timePhase * 5) % 4 : 0);

            // Rendering of the hearts above the player
            for (let i = 1, w = pixelsPerMeter * 0.4; i <= this.maxHealth / 2; i++) {
                image(resources[this.health >= i * 2 ? "heart" : Math.round(this.health )=== i * 2 ? "heart_half" : "heart_background"],
                    - (this.maxHealth / 4) * w + (i + 1) * (w - 2),
                    -10, w, w);
            }
            // And shortly, the outline of the player (AABB)
            if (showBoundingBox) {
                stroke(255, 0, 0);
                fill(0, 0, 0, 0);
                rect(0, 0, this.width * pixelsPerMeter, this.height * pixelsPerMeter);
            }
        }
        pop();
    }

}

class Environment {
    static G = 16; // gravitational constant in meters/second
    static boundingBoxes = [];
    static entities = [];


    // Method for introducing a new AABB into the world
    static introduce(aabb) {
        if (!(aabb instanceof AABB))
            return;

        if (aabb instanceof Entity)
            this.entities.push(aabb);
        this.boundingBoxes.push(aabb);
    }

    // Method for updating all entities in the entities array
    static update(deltaT) {
        this.entities.forEach(object => object.update(deltaT));
    }

    // Method for procedurally generating terrain
    static generate() {

        // generate ground (temp)
        let n = 500;
        let interpFactor = 2;
        let fnY = (x) => -4 + Math.floor(3 + noise(x) * 10 + noise(x / 2) * 5 + noise(x / 4) * 2);
        for (let x = 0; x < n; x++) {
            let A = fnY(x);
            let B = fnY(x + 1);

            for (let i = 0; i < interpFactor; i++) {
                let posY = Math.round(A + 0.5 * (B - A));


                for (let y = 0; y < posY; y++) {
                    let blockType =
                        y === posY - 1 ? BlockType.grass_block :
                            y >= posY - 3 ? BlockType.dirt :
                                Math.random() < 0.050 ? BlockType.coal_ore :
                                Math.random() < 0.025 ? BlockType.gold_ore :
                                Math.random() < 0.015 ? BlockType.diamond_ore : BlockType.stone;
                    Environment.introduce(new Block(x, y, blockType));
                }
            }
        }

        // Generate island (temporarily)
        for (let i = 0; i < n; i++) {
            let posY = noise(i / 7) * 10;
            let posYd = -noise(i / 10) * 20 * Math.random();
            for (let j = 0; j < posY; j++) {
                Environment.introduce(new Block(10 + i, 25 + Math.floor(posYd) + j, Math.random() < 0.3 ? BlockType.cracked_deepslate_bricks : BlockType.deepslate_bricks));
            }
        }

    }

    // Method for drawing all objects in the world.
    // This includes entities and blocks (currently)
    static draw(dT) {
        this.boundingBoxes.forEach(element => {
            if (element instanceof Block) {
                element.blockType.draw(
                    element.left * pixelsPerMeter, window.innerHeight - (element.top + element.height) * pixelsPerMeter,
                    element.width * pixelsPerMeter, element.height * pixelsPerMeter);
            } else if (element instanceof Entity) {
                element.draw(dT);
            }
        });
    }
}