const frictionConstant = 0.5;
const framerate = 60; // frames per second.
var pixelsPerMeter;
const movementSpeedMetersPerSecond = 10;

// Window dimensions in arbitrary game 'meters'
var windowWidthInMeters;
var windowHeightInMeters;

var player;

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
    pixelsPerMeter = document.querySelector(".pixel-size").clientWidth;
    windowWidthInMeters = window.innerWidth / pixelsPerMeter;
    windowHeightInMeters = window.innerHeight / pixelsPerMeter;
}

// Setup function for loading in various
function setup() {

    document.querySelector(".controller-connect")
        .addEventListener("click", () => {
        checkBluetoothConnections();
    })

    createCanvas(window.innerWidth, window.innerHeight);

    player = new Entity(5, 5);
    for (let i = 0; i < 10; i++)
        Environment.introduce(new Entity(Math.random() * window.innerWidth / pixelsPerMeter, Math.random() * window.innerHeight / pixelsPerMeter));


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

    image(resources.get('entityPlayer'), player.position.x * pixelsPerMeter, window.innerHeight - (player.height - player.position.y) * pixelsPerMeter, player.width * pixelsPerMeter, player.height * pixelsPerMeter);


    for (var i = 0; i < Environment.boundingBoxes.length; i++) {
        let other = Environment.boundingBoxes[i];
        let intersects = other.intersects(player);
        fill(intersects ? 255 : 0, 50, 0);
        rect(other.left, window.innerHeight - other.top - other.height, other.width, other.height);
    }

    let dT = deltaTime / 1000;
    player.move(new Vec2(-sgnX, sgnY));
    player.update(dT);

}

// Function for loading a map, based on a provided image.
// This image must be decoded into map elements and then placed
// into the Environment class's objects
function loadMap(mapImage) {
    /*if (!(mapImage instanceof p5.Image))
        throw new TypeError("Provided argument is not of type p5.Image");*/

    let n = 50;
    let s = window.innerWidth / n;
    for (let i = 0; i < n; i++) {
        Environment.introduce(new AABB(s * i, noise(i / n * 10) * 100, s, s));
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
            connection.onReceive = (device, content) => {

                let res = content.charCodeAt(0);

                player.move(new Vec2(
                    -((res >> Input.BUTTON_LEFT_BP) & 1) +
                ((res >> Input.BUTTON_RIGHT_BP) & 1), (res >> Input.BUTTON_A_BP) & 1));

            };
            connection.onDisconnect = (e) => console.log("BT device disconnected", e);
            connection.primaryCharacteristicUuid = bleCharacteristicsUUID;
            connection.primaryServiceId = bleServiceUUID;
            connection.connect();
        })
        .catch(err => console.error("An error occurred whilst attempting to connect to Bluetooth device", err));

}


class AABB {
    left;
    top;
    right;
    bottom;
    width;
    height;
    static collisionDetectionPrecision = 1; // Lower number means higher precision.

    // Constructor for defining a bounding box with specified dimensions.
    constructor(x, y, width, height) {
        this.left = x;
        this.top = y;
        this.right = x + width;
        this.bottom = y + height;
        this.width = width;
        this.height = height;
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

    position;
    velocity;
    collidingX;
    collidingY;

    static DefaultMovementVector = new Vec2(movementSpeedMetersPerSecond, movementSpeedMetersPerSecond * 2);


    constructor(posX, posY) {
        super(posX, posY, 1, 2);
        this.position = new Vec2(posX, posY);
        this.velocity = new Vec2(0, 0);
    }

    // Function that allows the entity to move based on the input vector.
    // The provided vector must be normalized, e.g. -1 <= x & y <= 1
    // If this isn't the case, the player will move faster than necessary.
    move(movementVector) {
        if (!(movementVector instanceof Vec2))
            return;

        this.velocity.translate(
            movementVector.x * Entity.DefaultMovementVector.x,
            movementVector.y * Entity.DefaultMovementVector.y
        );
    }

    update(dT) {
        if (!this.collidingY)
            this.velocity.addY(-Environment.G * pixelsPerMeter);
        this.collidingX = this.collidingY = false;
        let cpy;
        // Check if the next position of the entity is colliding with another
        for (let i = 0; i < Environment.boundingBoxes.length; i++) {
            let p = Environment.boundingBoxes[i];
            if (this === p)
                continue;


            // Check for X collisions
            if (!this.collidingX) {
                cpy = this.copy();
                // Velocity is measured in pixels, so let's check for every n pixels for collision
                for (let i = 0; i < Math.round(Math.abs(this.velocity.x * dT) / AABB.collisionDetectionPrecision); i++) {
                    if (cpy.translate(this.position.x + (i * AABB.collisionDetectionPrecision) * Math.sign(this.velocity.x * dT), this.position.y).intersects(p)) {
                        this.collidingX = true;
                        break;
                    }
                }
            }

            // Check for Y collisions
            if (!this.collidingY) {
                cpy = this.copy();
                // Velocity is measured in pixels, so let's check for every n pixels for collision
                for (let i = 0; i < Math.round(Math.abs(this.velocity.y * dT) / AABB.collisionDetectionPrecision); i++) {
                    if (cpy.translate(this.position.x, this.position.y + (i * AABB.collisionDetectionPrecision) * Math.sign(this.velocity.y * dT)).intersects(p)) {
                        this.collidingY = true;
                        break;
                    }
                }
            }

            // If we're colliding on both axis, stop further checks
            if (this.collidingX && this.collidingY)
                break;
        }

        // Add velocity to position
        this.position.add(
            this.collidingX ? 0 : this.velocity.x * dT,
            this.collidingY ? 0 : this.velocity.y * dT
        );

        if (this.collidingX)
            this.velocity.x = 0;

        if (this.collidingY)
            this.velocity.y = 0;

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