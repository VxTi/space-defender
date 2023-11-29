const framerate = 60; // frames per second.
var pixelsPerMeter;
const horizontalSpeed = 10; // Speed at which the player moves per second in abstract meters.
const verticalSpeed = 5.5;

// Window dimensions in arbitrary game 'meters'
var windowWidthInMeters;
var windowHeightInMeters;

const collisionDetectionPrecision = 0.05;
const collisionDetectionDelta = 0.05;

// The position of the screen relative to the player
var screenHorizontalOffset = 0;

// Margins on the side of the screen.
// If the player moves past these margins, the screen starts moving.
const environmentVisibilityMargins = 10;

var player;

let playerAnimation;
let moonAnimation;

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

// Hashmap containing all the resoucres as images.
// These resources must be loaded in the preload function.
// Adding new resources can be done using 'resources.set('key', object)'
const resources = new Map();

clamp = function(x, a, b) { return x < a ? a : x > b ? b : x; }
isWithinBounds = function(x, a, b) { return x >= a && x <= b; }

// This function is called before the setup function.
// This can be used to load images for resources.
function preload() {

    const res = ['playerImage', 'dirt', 'stone', 'grass_block_side',
                        'deepslate_bricks', 'cracked_deepslate_bricks', 'steve_animations', 'moon_phases'];

    for (let element of res) {
        resources.set(element, loadImage(`./assets/${element}.png`));
    }

    /*resources.set("entityPlayer", loadImage("./assets/playerImage.png"));
    resources.set("blockSprite", loadImage("./assets/blocksprite.png"));
    resources.set("dirt", loadImage("./assets/dirt.png"));
    resources.set("stone", loadImage("./assets/stone.png"));
    resources.set("grass", loadImage("./assets/grass_block_side.png"));
    resources.set("deepslate", loadImage("./assets/deepslate_bricks.png"));
    resources.set("deepslate_crack", loadImage("./assets/cracked_deepslate_bricks.png"));
    resources.set("steve_anim", loadImage("./assets/steve_animations.png"))*/

    // How many pixels represent a 'meter' ingame. This uses an invisible div element that's one cm large.
    pixelsPerMeter = document.querySelector(".pixel-size").clientWidth * 0.7;
    windowWidthInMeters = window.innerWidth / pixelsPerMeter;
    windowHeightInMeters = window.innerHeight / pixelsPerMeter;
}

// Setup function for loading in various
function setup() {

    // When pressed on the 'select controller' button,
    // we attempt to find a bluetooth controler.
    document.querySelector(".controller-connect")
        .addEventListener("click", () => {
        checkBluetoothConnections();
    })

    // Create a canvas to render onto
    createCanvas(window.innerWidth, window.innerHeight);

    //BlockType.bricks = new Resource(resources.get("blockSprite"));
    BlockType.stone = new Resource(resources.get("stone"));
    BlockType.dirt = new Resource(resources.get("dirt"));
    BlockType.grass = new Resource(resources.get("grass_block_side"));
    BlockType.deepslate = new Resource(resources.get("deepslate_bricks"));
    BlockType.deepslate_cracked = new Resource(resources.get("cracked_deepslate_bricks"));

    moonAnimation = new Resource(resources.get("moon_phases"), 4, 2);

    playerAnimation = new Resource(resources.get("steve_animations"), 5, 2);

    // Whenever the screen resizes, adapt the canvas size with it.
    window.addEventListener('resize', () => {
        resizeCanvas(window.innerWidth, window.innerHeight);
    });

    // Create an instance of the first player, for when the user decides to play single-player.
    player = new Entity(5, 10);

    loadMap();
}

let timePhase = 0;

// Draw function is called every 1/60th a second.
// This means it has a 16.6ms interval.
function draw() {
    background(0);

    let sgnX = 0;
    let sgnY = 0;

    if (keyIsDown(65)) sgnX--;
    if (keyIsDown(68)) sgnX++;
    if (keyIsDown(32)) sgnY++;
    if (keyIsDown(16)) sgnY--;
    if (sgnX !== 0 && player.colliding.x === 0)
        player.velocity.x = horizontalSpeed * sgnX;
    if (sgnY !== 0 && player.colliding.y === 0)
        player.velocity.y = verticalSpeed * sgnY;

    timePhase += (deltaTime / 1000) * 4; // 3 frames per second.


    moonAnimation.animate(100, 10, 30, 30, Math.floor(timePhase));
    /*playerAnimation.animate(
        player.position.x * pixelsPerMeter,  // screen X
        window.height - (player.height + player.position.y) * pixelsPerMeter, // screen Y
        player.width * pixelsPerMeter,
        player.height * pixelsPerMeter,
        Math.floor(timePhase));*/



    for (var i = 0; i < Environment.boundingBoxes.length; i++) {
        let other = Environment.boundingBoxes[i];
        if (other instanceof Block) {
            other.blockType.draw(
                (other.left + screenHorizontalOffset) * pixelsPerMeter, window.innerHeight - (other.top + other.height) * pixelsPerMeter,
                other.width * pixelsPerMeter, other.height * pixelsPerMeter);
        }
    }
    image(resources.get('playerImage'), (player.position.x + screenHorizontalOffset) * pixelsPerMeter, window.innerHeight - (player.height + player.position.y) * pixelsPerMeter, player.width * pixelsPerMeter, player.height * pixelsPerMeter);


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
    let n = window.innerWidth / pixelsPerMeter * 10;
    for (let i = 0; i < n; i++) {
        let posY = Math.floor(3 + noise(i / 7) * 5 + noise(i / 13) * 2 + noise(i / 16) * 2);
        for (let j = 0; j < posY; j++) {
            let blockType = j === posY - 1 ? BlockType.grass : j >= posY - 3 ? BlockType.dirt : BlockType.stone;
            Environment.introduce(new Block(i, j, blockType));
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
    static collisionDetectionThreshold = 0.001;
    static collisionDetectionSteps = 5;


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
        this.colliding.translate(Infinity, Infinity);
        this.velocity.addY(-Environment.G * dT);

        // Check if the next position of the entity is colliding with another
        for (let i = 0; i < Environment.boundingBoxes.length; i++) {
            let p = Environment.boundingBoxes[i];
            if (this === p)
                continue;

            let v = this.velocity.copy; // velocity copy
            let cpy = this.copy; // aabb copy


            // Check in steps whether we're colliding with another object.
            // This method checks whether the velocity vector on both dimensions collides with an object
            // If this isn't the case in the first step, halve the velocity vector and try again.
            // If the next vector after halving doesn't intersect, increase the vector size to 0.5 * (V_half + V_start);
            for (let j = 0; j < Entity.collisionDetectionSteps; j++) {

                // Check if we're not already colliding on the x-axis
                if (this.colliding.x === Infinity) {

                    // Check if we're colliding in the next possible X position
                    if (cpy.translate(this.position.x + v.x * dT, this.position.y).intersects(p)) {

                        if (j === Entity.collisionDetectionSteps - 1) {
                            this.colliding.x = Math.sign(this.velocity.x);
                            v.x = 0;
                        } else {
                            v.multX(0.5);
                        }
                    } else {
                        // It doesn't intersect at the current step.
                        // If the step is 0 or Steps-1, we can just say it doesn't collide.
                        if (j === 0 || j === Entity.collisionDetectionSteps - 1) {
                            this.colliding.x = 0;
                            v.x = this.velocity.x;
                        } else {
                            // Increase vector size
                            v.x = 0.5 * (this.velocity.x + v.x);
                        }
                    }
                }

                // Check if we're not already colliding
                if (this.colliding.y === Infinity) {

                    // Check if we're colliding in the next possible Y position
                    if (cpy.translate(this.position.x, this.position.y + this.velocity.y * dT).intersects(p)) {
                        // If the last attempt collides, set next y velocity to 0 and stop checking.
                        if (j === Entity.collisionDetectionSteps - 1) {
                            this.colliding.y = Math.sign(this.velocity.y);
                        } else {
                            v.multY(0.5);
                        }
                    } else {
                        // It doesn't intersect at the current step.
                        // If the step is 0 or Steps-1, we can just say it doesn't collide.
                        if (j === 0 || j === Entity.collisionDetectionSteps - 1) {
                            this.colliding.y = 0;
                            v.y = this.velocity.y;
                        } else {
                            v.y = 0.5 * (this.velocity.y + v.y);
                        }
                    }
                }
            }

            this.velocity.translate(v.x, v.y);

            /*if (this.colliding.x === 0) {
                for (let j = 0; j <= Math.abs(this.velocity.x * dT) + collisionDetectionDelta; j += collisionDetectionPrecision) {
                    if (this.copy.translateX(this.position.x + j * Math.sign(this.velocity.x)).intersects(p)) {
                        this.colliding.x = Math.sign(this.velocity.x);
                        break;
                    }
                }
            }

            if (this.colliding.y === 0 && Math.abs(this.velocity.y) >= Entity.collisionDetectionThreshold) {
                for (let j = 0; j <= Math.abs(this.velocity.y * dT) + collisionDetectionDelta; j += collisionDetectionPrecision) {
                    if (this.copy.translateY(this.position.y + j * Math.sign(this.velocity.y)).intersects(p)) {
                        this.colliding.y = Math.sign(this.velocity.y);
                        break;
                    }
                }
            }

            // If we're colliding on both axis, stop further checks
            if (this.colliding.x !== 0 && this.colliding.y !== 0)
                break;*/
        }

        // Add velocity to position
        this.position.add(
            this.colliding.x !== 0 ? 0 : this.velocity.x * dT,
            this.colliding.y !== 0 ? 0 : this.velocity.y * dT
        );

        // Check if the x axis is colliding, if so, stop movement
        if (this.colliding.x !== 0)
            this.velocity.x = 0;
        else
            this.velocity.x *= 0.9;

        if (this.colliding.y !== 0)
            this.velocity.y = 0;

        //console.log(`V: ${this.velocity.x}, ${this.velocity.y}`)

        // Limit falling to bottom screen so the player doesn't randomly disappear.
        this.position.y = Math.max(this.position.y, 0);

        if (!isWithinBounds(this.position.x, environmentVisibilityMargins + screenHorizontalOffset, windowWidthInMeters - environmentVisibilityMargins + screenHorizontalOffset)) {
            screenHorizontalOffset = -this.position.x;
        }

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