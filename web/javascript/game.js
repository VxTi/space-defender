const frictionConstant = 0.5;
const framerate = 60; // frames per second.
var pixelsPerMeter;
const movementSpeedMetersPerSecond = 5.5;

// Window dimensions in arbitrary game 'meters'
var windowWidthInMeters;
var windowHeightInMeters;

var player;

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
    player.acceleration.add(-sgnX * movementSpeedMetersPerSecond, sgnY * movementSpeedMetersPerSecond * 3);
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
            connection.onConnectFn = (device) => console.log(device);
            connection.onReceive = (device, content) => console.log("Received content: " + content, device);
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
    acceleration;
    collidingX;
    collidingY;

    constructor(posX, posY) {
        super(posX, posY, 1, 2);
        this.position = new Vec2(posX, posY);
        this.velocity = new Vec2(0, 0);
        this.acceleration = new Vec2(0, 0);
    }

    update(dT) {
        if (!this.collidingY)
            this.acceleration.addY(-Environment.G * pixelsPerMeter);
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
                for (let i = 0; i < Math.round(Math.abs(this.velocityX * dT) / AABB.collisionDetectionPrecision); i++) {
                    if (cpy.translate(this.posX + (i * AABB.collisionDetectionPrecision) * Math.sign(this.velocityX * dT), this.posY).intersects(p)) {
                        this.collidingX = true;
                        break;
                    }
                }
            }

            // Check for Y collisions
            if (!this.collidingY) {
                cpy = this.copy();
                // Velocity is measured in pixels, so let's check for every n pixels for collision
                for (let i = 0; i < Math.round(Math.abs(this.velocityY * dT) / AABB.collisionDetectionPrecision); i++) {
                    if (cpy.translate(this.posX, this.posY + (i * AABB.collisionDetectionPrecision) * Math.sign(this.velocityY * dT)).intersects(p)) {
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

        // Add acceleration to velocity
        this.velocity.add(this.acceleration.x * dT, this.acceleration.y * dT);

        // Reduce acceleration with a predefined friction coefficient
        this.acceleration.mult(this.collidingX ? 0 : 0.9, this.collidingY ? 0 : 0.75);

        // Limit falling to bottom screen so the player doesn't randomly disappear.
        this.position.y = Math.max(this.position.y, 0);
        this.position.x = clamp(this.position.x, 0, windowWidthInMeters - this.width);


        document.querySelector(".data")
            .innerText = `Cx: ${this.collidingX}, Cy: ${this.collidingY}, Vx: ${this.velocity.x}, Vy: ${this.velocity.y}, Ax: ${this.acceleration.x}, Ay: ${this.acceleration.y}`;

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
            if (aabb instanceof Entity)
                aabb.update(deltaT);
        });
    }
}