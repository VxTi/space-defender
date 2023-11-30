var pixelsPerMeter;

// Variables defining how fast the player moves per second in game meters.
const horizontalSpeed = 4.5;
const verticalSpeed = 6.5;

// Margins on the side of the screen, given in game meters
// If the player moves past these margins, the screen starts moving.
const screenEdgeMargin = 8;

const cmPerBlock = 0.9;
const blockReach = 3;

// Whether the player can double jump against walls
const allowDoubleJump = true;

// Hashmap containing all the resoucres as images.
// These resources must be loaded in the preload function.
// Adding new resources can be done using 'resources.set('key', object)'
const resources = new Map();

// Window dimensions in arbitrary game 'meters'
var windowWidthInMeters;
var windowHeightInMeters;

// The position of the screen relative to the player
var screenOffset = 0;

// Variable containing all information of the player.
var player;

let moonAnimation;
let skyBackground;
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
    const extension = 'png';
    const fileNames = ['playerImage', 'dirt', 'stone', 'grass_block_side',
                        'deepslate_bricks', 'cracked_deepslate_bricks', 'steve_animations',
                        'moon_phases', 'skyImage'];

    for (let element of fileNames)
        resources.set(element, loadImage(`./assets/${element}.${extension}`));

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
    pixelDensity(1);

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

    // Load all resources
    BlockType.stone = new Resource(resources.get("stone"));
    BlockType.dirt = new Resource(resources.get("dirt"));
    BlockType.grass = new Resource(resources.get("grass_block_side"));
    BlockType.deepslate = new Resource(resources.get("deepslate_bricks"));
    BlockType.deepslate_cracked = new Resource(resources.get("cracked_deepslate_bricks"));

    moonAnimation = new Resource(resources.get("moon_phases"), 4, 2);

    skyBackground = new Resource(resources.get("skyImage"));

    // Whenever the screen resizes, adapt the canvas size with it.
    window.addEventListener('resize', () => {
        resizeCanvas(window.innerWidth, window.innerHeight);
    });

    // Create an instance of the first player, for when the user decides to play single-player.
    player = new Entity(5, 15);

    loadMap();
    noSmooth(); // prevent pixel-smoothing (this makes images look wacky)

}

// Draw function is called every 1/60th a second.
// This means it has a 16.6ms interval.
function draw() {
    background(0);

    let sgnX = 0;
    let sgnY = 0;

    if (keyIsDown(65)) sgnX--;
    if (keyIsDown(68)) sgnX++;
    if (keyIsDown(32)) sgnY++;
    if (keyIsDown(16)) sgnX *= 0.5;

    if (sgnX !== 0 && player.colliding.x === 0)
        player.velocity.x = horizontalSpeed * sgnX;
    // Only allow the player to jump when either on ground or colliding in a wall (double jump)
    if (sgnY !== 0 && (player.colliding.y < 0 || (allowDoubleJump && player.colliding.x !== 0 && player.velocity.y < 0)))
        player.velocity.y = verticalSpeed * sgnY;

    timePhase += (deltaTime / 1000);

    push(); // Saves current matrix and pushes it on top of the stack
    rotate(timePhase * 0.005);
    translate(window.innerWidth/2, window.innerHeight/2);
    skyBackground.draw(-window.innerWidth/2, -window.innerWidth/2, window.innerWidth, window.innerWidth);
    pop(); // Pops the top matrix and goes to the previous one.

    // Moon rendering!
    moonAnimation.animate(window.innerWidth - 200, 50, 100, 100, Math.floor(timePhase));

    for (var i = 0; i < Environment.boundingBoxes.length; i++) {
        let other = Environment.boundingBoxes[i];

        if (other instanceof Block) {

            // Draw the block onto the screen.
            other.blockType.draw(
                (other.left + screenOffset) * pixelsPerMeter, window.innerHeight - (other.top + other.height) * pixelsPerMeter,
                other.width * pixelsPerMeter, other.height * pixelsPerMeter);
        }
    }


    // Render the player
    image(resources.get('playerImage'),
        (player.position.x + screenOffset - player.width * 0.4) * pixelsPerMeter,
        window.innerHeight - (player.height + player.position.y) * pixelsPerMeter,
        player.width * pixelsPerMeter * 2,
        player.height * pixelsPerMeter);
    stroke(255, 0, 0);
    fill(0, 0, 0, 0);
    rect((player.position.x + screenOffset) * pixelsPerMeter, window.innerHeight - (player.height + player.position.y) * pixelsPerMeter, player.width * pixelsPerMeter, player.height * pixelsPerMeter);


    // If the game isn't active, prevent updates.
    if (!gameActive)
        return;

    let dT = deltaTime / 1000;
    player.update(dT);

}

// Function for loading a map, based on a provided image.
// This image must be decoded into map elements and then placed
// into the Environment class's objects
function loadMap(mapImage) {
    /*if (!(mapImage instanceof p5.Image))
        throw new TypeError("Provided argument is not of type p5.Image");*/


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
                let blockType = y === posY - 1 ? BlockType.grass : y >= posY - 3 ? BlockType.dirt : BlockType.stone;
                Environment.introduce(new Block(x, y, blockType));
            }
        }
    }

    // Generate island (temporarily)
    for (let i = 0; i < 30; i++) {
        let posY = noise(i / 7) * 10;
        let posYd = -noise(i / 10) * 10;
        for (let j = 0; j < posY; j++) {

            Environment.introduce(new Block(10 + i, 25 + Math.floor(posYd) + j, Math.random() < 0.3 ? BlockType.deepslate_cracked : BlockType.deepslate));
        }
    }

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

                player.move(new Vec2(
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

    static DefaultMovementVector = new Vec2(horizontalSpeed, horizontalSpeed);
    static collisionThres = 0.05; // Detection threshold in meters

    constructor(posX, posY) {
        super(posX, posY, 0.9, 1.8);
        this.position  = new Vec2(posX, posY);
        this.velocity  = new Vec2(0, 0);
        this.colliding = new Vec2(0, 0);
    }

    // Function that allows the entity to move based on the input vector.
    // The provided vector must be normalized, e.g. -1 <= x & y <= 1
    // If this isn't the case, the player will move faster than necessary.
    move(movementVector = new Vec2(0, 0)) {
        if (!(movementVector instanceof Vec2))
            return;

        this.velocity.translate(
            movementVector.x * Entity.DefaultMovementVector.x,
            movementVector.y * Entity.DefaultMovementVector.y
        );
    }

    update(dT) {

        // Set it to an unrealistic number, just before testing for collision.
        // Makes it easier to test whether collision detection has finished, without allocating more memory.
        this.colliding.translate(0, 0);
        this.velocity.addY(-Environment.G * dT);

        // Check if the next position of the entity is colliding with another
        for (let i = 0; i < Environment.boundingBoxes.length; i++) {
            let target = Environment.boundingBoxes[i];

            // Collision detection with self is always going to be true so let's just skip that shall we...
            if (target === this)
                continue;

            let dSq = Math.pow(Math.max(this.left, target.left) - Math.min(this.right, target.right), 2) +
                Math.pow(Math.max(this.bottom, target.bottom) - Math.min(this.top, target.top) > Math.abs(this.velocity.y), 2);

            if (dSq < blockReach * blockReach) {
                if (target.intersectsPoint(mouseX / pixelsPerMeter - screenOffset, (window.innerHeight - mouseY) / pixelsPerMeter)) {
                    stroke(255, 0, 0);
                    fill(0, 0, 0, 0);
                    rect((target.left + screenOffset) * pixelsPerMeter, window.innerHeight - target.bottom * pixelsPerMeter, target.width * pixelsPerMeter, target.height * pixelsPerMeter);

                }
            }

            if (dSq > 2)
                continue;


            if (this.colliding.x === 0 && Math.abs(this.velocity.x) >= Entity.collisionThres) {
                for (let j = 0; j <= Math.abs(this.velocity.x * dT) + Entity.collisionThres * 2; j += Entity.collisionThres) {
                    if (this.copy.translateX(this.position.x + j * Math.sign(this.velocity.x)).intersects(target)) {
                        this.colliding.x = Math.sign(this.velocity.x);
                        this.velocity.x = 0;
                        break;
                    }
                }
            }

            if (this.colliding.y === 0 && Math.abs(this.velocity.y) >= Entity.collisionThres) {
                for (let j = 0; j <= Math.abs(this.velocity.y * dT) + Entity.collisionThres * 2; j += Entity.collisionThres) {
                    if (this.copy.translateY(this.position.y + j * Math.sign(this.velocity.y)).intersects(target)) {
                        this.colliding.y = Math.sign(this.velocity.y);
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

        // Check if the x-axis is colliding, if so, stop movement
        this.velocity.x *= 0.9;

        //console.log(`V: ${this.velocity.x}, ${this.velocity.y}`)

        // Limit falling to bottom screen so the player doesn't randomly disappear.
        this.position.y = Math.max(this.position.y, 0);

        // The left side of the screen, let it scroll if you come too close
        if (this.position.x + screenOffset < screenEdgeMargin)
            screenOffset = -this.position.x + screenEdgeMargin;
        else if (this.position.x + screenOffset > windowWidthInMeters - screenEdgeMargin)
            screenOffset = -this.position.x + windowWidthInMeters - screenEdgeMargin;

        //this.position.x = clamp(this.position.x, 0, windowWidthInMeters - this.width);

        // Update
        this.translate(this.position.x, this.position.y);
    }
}

class Environment {
    static G = 9.81; // gravitational constant in meters/second
    static boundingBoxes = [];
    static collides(boundingBox) {
        for (let other in this.boundingBoxes) {
            if (boundingBox.collides(other))
                return true;
        }
        return false;
    }

    // Method for introducing a new AABB into the world
    static introduce(aabb) {
        if (!(aabb instanceof AABB))
            return;

        this.boundingBoxes.push(aabb);
    }

    // Method for updating all entities in the boundingBoxes array.
    // Skips non-entities
    static update(deltaT) {
        this.boundingBoxes.forEach(aabb => {
            if (aabb instanceof Entity) {
                aabb.update(deltaT);
            }
        });
    }
}