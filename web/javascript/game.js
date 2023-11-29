const framerate = 60; // frames per second.
var pixelsPerMeter;
const movementSpeedMetersPerSecond = 5.5;

// Window dimensions in arbitrary game 'meters'
var windowWidthInMeters;
var windowHeightInMeters;

const collisionDetectionPrecision = 0.05;
const collisionDetectionDelta = 0.05;

var environmentPosition = 0;
const environmentVisibilityMargins = 10; // Visibility in

var player;

var connectedControllers = [];
var gameActive = false;

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
    resources.set("entityPlayer", loadImage("./assets/playerImage.png"));
    resources.set("blockSprite", loadImage("./assets/blocksprite.png"));

    pixelsPerMeter = document.querySelector(".pixel-size").clientWidth * 0.8;
    windowWidthInMeters = window.innerWidth / pixelsPerMeter;
    windowHeightInMeters = window.innerHeight / pixelsPerMeter;
}

// Setup function for loading in various
function setup() {

    document.querySelector(".controller-connect")
        .addEventListener("click", () => {
        checkBluetoothConnections();
    })

    // Create a canvas to render onto
    createCanvas(window.innerWidth, window.innerHeight);

    BlockType.bricks = new Resource(resources.get("blockSprite"));

    // Whenever the screen resizes, adapt the canvas size with it.
    window.addEventListener('resize', () => {
        resizeCanvas(window.innerWidth, window.innerHeight);
    });

    // Create an instance of the first player, for when the user decides to play single-player.
    player = new Entity(5, 10);

    loadMap();
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
    if (keyIsDown(16)) sgnY--;
    if (sgnX !== 0 && player.colliding.x === 0)
        player.velocity.x = movementSpeedMetersPerSecond * sgnX;
    if (sgnY !== 0 && player.colliding.y === 0)
        player.velocity.y = movementSpeedMetersPerSecond * sgnY * 2;


    image(resources.get('entityPlayer'), player.position.x * pixelsPerMeter, window.innerHeight - (player.height + player.position.y) * pixelsPerMeter, player.width * pixelsPerMeter, player.height * pixelsPerMeter);


    for (var i = 0; i < Environment.boundingBoxes.length; i++) {
        let other = Environment.boundingBoxes[i];
        if (other instanceof Block) {
            other.blockType.draw(
                other.left * pixelsPerMeter, window.innerHeight - (other.top + other.height) * pixelsPerMeter,
                other.width * pixelsPerMeter, other.height * pixelsPerMeter);
        }}

    let dT = deltaTime / 1000;
    player.update(dT);

}

// Function for loading a map, based on a provided image.
// This image must be decoded into map elements and then placed
// into the Environment class's objects
function loadMap(mapImage) {
    /*if (!(mapImage instanceof p5.Image))
        throw new TypeError("Provided argument is not of type p5.Image");*/

    let n = window.innerWidth / pixelsPerMeter * 10;
    for (let i = 0; i < n; i++) {
        let posY = 3 + noise(i / 7) * 3 + noise(i / 13) * 2 + noise(i / 16) * 2;
        for (let j = 0; j < posY; j++) {
            Environment.introduce(new Block(i, j, BlockType.bricks));
        }
    }

    for (let i = 0; i < 30; i++) {
        let posY = noise(i / 7) * 10;
        let posYd = -noise(i / 10) * 10;
        for (let j = 0; j < posY; j++) {
            Environment.introduce(new Block(10 + i, 25 + Math.floor(posYd) + j, BlockType.bricks));
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

                let inputCode = event.getUint8(0);

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

    static DefaultMovementVector = new Vec2(movementSpeedMetersPerSecond, movementSpeedMetersPerSecond);
    static collisionDetectionThreshold = 0.001;


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

        this.colliding.translate(0, 0);
        // Check if the next position of the entity is colliding with another
        for (let i = 0; i < Environment.boundingBoxes.length; i++) {
            let p = Environment.boundingBoxes[i];
            if (this === p)
                continue;

            if (this.colliding.x === 0) {
                for (let j = 0; j <= Math.abs(this.velocity.x * dT) + collisionDetectionDelta; j += collisionDetectionPrecision) {
                    if (this.copy().translateX(this.position.x + j * Math.sign(this.velocity.x)).intersects(p)) {
                        this.colliding.x = Math.sign(this.velocity.x);
                        break;
                    }
                }
            }

            if (this.colliding.y === 0 && Math.abs(this.velocity.y) >= Entity.collisionDetectionThreshold) {
                for (let j = 0; j <= Math.abs(this.velocity.y * dT) + collisionDetectionDelta; j += collisionDetectionPrecision) {
                    if (this.copy().translateY(this.position.y + j * Math.sign(this.velocity.y)).intersects(p)) {
                        this.colliding.y = Math.sign(this.velocity.y);
                        break;
                    }
                }
            }

            // If we're colliding on both axis, stop further checks
            if (this.colliding.x !== 0 && this.colliding.y !== 0)
                break;
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
        else
            this.velocity.addY(-Environment.G);

        //console.log(`V: ${this.velocity.x}, ${this.velocity.y}`)

        // Limit falling to bottom screen so the player doesn't randomly disappear.
        this.position.y = Math.max(this.position.y, 0);

        if (!isWithinBounds(this.position.x, ))

        this.position.x = clamp(this.position.x, 0, windowWidthInMeters - this.width);

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