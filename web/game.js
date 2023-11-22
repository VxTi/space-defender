const frictionConstant = 0.5;
const framerate = 60; // frames per second.
var pixelsPerMeter;
const movementSpeedMetersPerSecond = 5.5;
var movementSpeedPixelsPerSecond; // movement speed in pixels per second.

var player;

// Hashmap containing all the resoucres as images.
// These resources must be loaded in the preload function.
// Adding new resources can be done using 'resources.set('key', object)'
const resources = new Map();

// This function is called before the setup function.
// This can be used to load images for resources.
function preload() {
    resources.set("entityPlayer", loadImage("./assets/playerImage.png"));
    pixelsPerMeter = document.querySelector(".pixel-size").clientWidth;
    movementSpeedPixelsPerSecond = pixelsPerMeter * movementSpeedMetersPerSecond;
    console.log(`Movement speed: ${movementSpeedMetersPerSecond} m/s at ${movementSpeedPixelsPerSecond} p/s`);
}

// Setup function for loading in various
function setup() {

    document.querySelector(".controller-connect")
        .addEventListener("click", () => {
        checkBluetoothConnections();
    })

    createCanvas(window.innerWidth, window.innerHeight);

    player = new Entity(100, 100);
    for (let i = 0; i < 30; i++)
        Environment.introduce(new Entity(Math.random() * window.innerWidth, Math.random() * window.innerHeight));

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

    image(resources.get('entityPlayer'), player.posX, player.posY, player.width, player.height);


    for (var i = 0; i < Environment.boundingBoxes.length; i++) {
        let other = Environment.boundingBoxes[i];
        let intersects = other.intersects(player);
        fill(intersects ? 255 : 0, 50, 0);
        rect(other.left, other.top, other.width, other.height);
    }

    let dT = deltaTime / 1000;

    player.accelerate(-sgnX * movementSpeedPixelsPerSecond, player.collidingY ? -sgnY * movementSpeedPixelsPerSecond * 3 : 0);
    player.update(dT);

}

// Function for loading a map, based on a provided image.
// This image must be decoded into map elements and then placed
// into the Environment class's objects
function loadMap(mapImage) {
    if (!(mapImage instanceof p5.Image))
        throw new TypeError("Provided argument is not of type p5.Image");



}


function checkBluetoothConnections() {
    if (!(navigator.bluetooth))
        throw new Error("Bluetooth not supported on this browser!");

    navigator.bluetooth.requestDevice({
        acceptAllDevices: 'true'
    }/*{ filters: [{ services: ['battery_service'] }] }*/)
        .then(device => {
            // do something with it.
            console.log("Connected with device:");
            console.log(device);
        })
        .catch(error => console.error(error));
}


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

    posX;
    posY;
    velocityX;
    velocityY;
    accelerationX;
    accelerationY;
    collidingX;
    collidingY;

    constructor(posX, posY) {
        super(posX, posY, 30, 50);
        this.posX = posX;
        this.posY = posY;
        this.velocityX = 0;
        this.velocityY = 0;
        this.onGround = false;
    }

    // Set the acceleration with parameters x and y
    accelerate(x, y) {
        this.accelerationX = x;
        this.accelerationY = y;
    }

    // Set the velocity with parameters x and y
    velocity(x, y) {
        this.velocityX = x;
        this.velocityY = y;
    }

    #nextX(dT) {
        return this.posX + dT * (this.velocityX + this.accelerationX);
    }

    #nextY(dT) {
        return this.posY + dT * (this.velocityY + this.accelerationY);
    }

    update(dT) {
        if (!this.collidingY)
            this.accelerationY += Environment.G;
        this.collidingX = this.collidingY = false;

        // Check if the next position of the entity is colliding with another
        for (let i = 0; i < Environment.boundingBoxes.length; i++) {
            let p = Environment.boundingBoxes[i];
            if (this === p)
                continue;

            // Check for X collisions
            if (!this.collidingX && this.copy().translate(this.#nextX(dT), this.posY)
                .intersects(p))
                this.collidingX = true;

            // Check for Y collisions
            if (!this.collidingY &&
                this.copy().translate(this.posX, this.#nextY(dT))
                    .intersects(p))
                this.collidingY = true;

            // If we're colliding on both axis, stop further checks
            if (this.collidingX && this.collidingY)
                break;
        }

        // Check if either axes collide
        // If they do, prevent further movement.
        if (!this.collidingX)
            this.posX = this.#nextX(dT);

        if (!this.collidingY)
            this.posY = this.#nextY(dT);

        // Reduce acceleration with a predefined friction coefficient
        this.velocityX += this.accelerationX * dT;
        this.velocityY += this.accelerationY * dT;
        this.accelerationX = this.collidingX ? 0 : 0.9 * this.accelerationX;
        this.accelerationY = this.collidingY ? 0 : 0.9 * this.accelerationY;

        // Limit falling to bottom screen so the player doesn't randomly disappear.
        this.posY = Math.min(this.posY, window.innerHeight - this.height);

        // Update
        this.translate(this.posX, this.posY);
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
