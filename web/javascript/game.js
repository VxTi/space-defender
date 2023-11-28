const framerate = 60; // frames per second.
var pixelsPerMeter;
const metersInWidth = 130;
const movementSpeedMetersPerSecond = 10;

// Window dimensions in arbitrary game 'meters'
var windowWidthInMeters;
var windowHeightInMeters;

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

// This function is called before the setup function.
// This can be used to load images for resources.
function preload() {
    resources.set("entityPlayer", loadImage("./assets/playerImage.png"));
    pixelsPerMeter = window.innerWidth / metersInWidth //document.querySelector(".pixel-size").clientWidth / 2;
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

    // Whenever the screen resizes, adapt the canvas size with it.
    window.addEventListener('resize', () => {
        resizeCanvas(window.innerWidth, window.innerHeight);
    });

    // Create an instance of the first player, for when the user decides to play single-player.
    player = new Entity(5, 50);

    loadMap();
}

// Draw function is called every 1/60th a second.
// This means it has a 16.6ms interval.
function draw() {
    background(0);
    fill(255, 0, 0);

    let sgnX = 0;
    let sgnY = 0;

    if (keyIsDown(65)) sgnX++;
    if (keyIsDown(68)) sgnX--;
    if (keyIsDown(32)) sgnY++;
    if (keyIsDown(83)) sgnY--;

    image(resources.get('entityPlayer'), player.position.x * pixelsPerMeter, window.innerHeight - (player.height + player.position.y) * pixelsPerMeter, player.width * pixelsPerMeter, player.height * pixelsPerMeter);


    for (var i = 0; i < Environment.boundingBoxes.length; i++) {
        let other = Environment.boundingBoxes[i];
        let intersects = other.intersects(player);
        fill(intersects ? 255 : 0, 50, 0);
        rect(other.left * pixelsPerMeter, window.innerHeight - (other.top + other.height) * pixelsPerMeter, other.width * pixelsPerMeter, other.height * pixelsPerMeter);
    }

    let dT = deltaTime / 1000;
    //player.move(new Vec2(-sgnX, sgnY));
    player.update(dT);

}

// Function for loading a map, based on a provided image.
// This image must be decoded into map elements and then placed
// into the Environment class's objects
function loadMap(mapImage) {
    /*if (!(mapImage instanceof p5.Image))
        throw new TypeError("Provided argument is not of type p5.Image");*/

    let n = window.innerWidth / pixelsPerMeter;
    for (let i = 0; i < n; i++) {
        Environment.introduce(new AABB(i, 0, 1, 3 + noise(i / 7) * 10 + noise(i / 13) * 7 + noise(i / 16) * 4));
    }

}


function checkBluetoothConnections() {
    if (!(navigator.bluetooth))
        throw new Error("Bluetooth not supported on this browser!");

    let bleServiceUUID = '73770700-a4e0-4ff2-bd68-47a5250d5ec2';
    let bleCharacteristicsUUID = '544a3ce0-5ca6-411e-a0c2-17789dc0cec8'

    BluetoothService.search({filters: [{ name: 'ESP32 Controller'}], optionalServices: [bleServiceUUID]})
        .then(device => {
            let connection = new BluetoothService(device);
            connection.onConnect = (device) => console.log(`Connected with Bluetooth device '${device.name}'`);
            connection.onReceive = (event) => {

                /*player.move(new Vec2(
                    -((res >> Input.BUTTON_LEFT_BP) & 1) + ((res >> Input.BUTTON_RIGHT_BP) & 1),
                    (res >> Input.BUTTON_A_BP) & 1));*/
                let errorOffset = 0.314159265 - 0.237;
                let angleX = (0.000767177693 * (((event.target.value.getUint8(1) << 4) | (event.target.value.getUint8(2) >> 4)) & 0xFFF)) - Math.PI / 2 + errorOffset;
                let angleY = (0.000767177693 * (((event.target.value.getUint8(2) << 8) | event.target.value.getUint8(3)) & 0xFFF)) - Math.PI / 2 + errorOffset;
                player.move(new Vec2(
                    Math.sin(angleX), Math.sin(angleY)
                ));

            };
            connection.onDisconnect = (e) => console.log("BT device disconnected", e);
            connection.primaryCharacteristicUuid = bleCharacteristicsUUID;
            connection.primaryServiceId = bleServiceUUID;
            connection.connect();
        })
        .catch(err => console.error("An error occurred whilst attempting to connect to Bluetooth device", err));

}

/*
 * Class for representing an Axis Aligned Bounding Box (AABB).
 * An AABB Class contains a few variables, the top left coordinates (left, top)
 * the bottom right coordinates (bottom, right) and the dimensions (width, height).
 * These parameters can be changed after initialization with helper functions
 *
 * */
class AABB {
    left;
    top;
    right;
    bottom;
    width;
    height;

    // Constructor for defining a bounding box with specified dimensions.
    constructor(x, y, width, height) {
        this.left = x;
        this.top = y;
        this.right = x + width;
        this.bottom = y + height;
        this.width = width;
        this.height = height;
    }

    // Method of setting the width of this AABB
    // Automatically updates the 'right' variable as well
    set width(w) {
        this.width = w;
        this.right = this.left + w;
    }

    // Method for setting the height of this AABB
    // Automatically updates the 'bottom' variable as well
    set height(h) {
        this.height = h;
        this.bottom = this.top + h;
    }

    // Returns a copy of this Environment
    copy() {
        return new AABB(this.left, this.top, this.width, this.height);
    }

    // Function for translating the X coordinate of the Environment
    translateX(newX) {
        this.left = newX;
        this.right = newX + this.width;
        return this;
    }

    // Function for translating the Y coordinate of the Environment
    translateY(newY) {
        this.top = newY;
        this.bottom = newY + this.height;
        return this;
    }

    // Function for translating the XY position of the Environment.
    translate(newX, newY) {
        this.left = newX;
        this.top = newY;
        this.right = newX + this.width;
        this.bottom = newY + this.height;
        return this;
    }

    // Function for checking whether a point lies within the specified boundaries
    intersectsPoint(x, y) {
        return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom;
    }

    // Function for checking X and Y collisions with `boundingBox`
    intersects(boundingBox) {

        // Check whether our input is of type BoundingBox
        // If not, return false.
        if (!(boundingBox instanceof AABB))
            return false;

        return this.bottom >= boundingBox.top && this.top <= boundingBox.bottom
            && this.right >= boundingBox.left && this.left <= boundingBox.right;
    }
}
class Entity extends AABB {

    position; // position of the entity
    velocity; // velocity of the entity
    colliding; // colliding states, containing the direction of collision (x, y)

    static DefaultMovementVector = new Vec2(movementSpeedMetersPerSecond, movementSpeedMetersPerSecond * 2);


    constructor(posX, posY) {
        super(posX, posY, 1, 2);
        this.position = new Vec2(posX, posY);
        this.velocity = new Vec2(0, 0);
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
        if (this.colliding.y !== 0)
            this.velocity.addY(-Environment.G);

        let collisionPrecision = 0.1;

        this.colliding.translate(0, 0);
        // Check if the next position of the entity is colliding with another
        for (let i = 0; i < Environment.boundingBoxes.length; i++) {
            let p = Environment.boundingBoxes[i];
            if (this === p)
                continue;

            if (this.colliding.x !== 0) {
                for (let j = 0; j < Math.abs(this.velocity.x) + collisionPrecision; j += collisionPrecision) {
                    if (this.copy().translateX(this.position.x + j * Math.sign(this.velocity.x)).intersects(p)) {
                        this.colliding.x = Math.sign(this.velocity.x);
                        break;
                    }
                }
            }

            if (this.colliding.y !== 0) {
                for (let j = 0; j < Math.abs(this.velocity.y) + collisionPrecision; j += collisionPrecision) {
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

        if (this.colliding.x !== 0)
            this.velocity.x = 0;

        if (this.colliding.y !== 0) {
            if (this.colliding.y < 0) {
                this.position.y += 0.1;
            } else this.velocity.y = 0;
        }

        // Limit falling to bottom screen so the player doesn't randomly disappear.
        this.position.y = Math.max(this.position.y, 0);
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