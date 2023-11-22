const frictionConstant = 0.5;
const framerate = 60; // frames per second.
const movementSpeed = 200; // movement speed in pixels per second.

var player;

// Hashmap containing all the resoucres as images.
// These resources must be loaded in the preload function.
// Adding new resources can be done using 'resources.set('key', object)'
const resources = new Map();

// This function is called before the setup function.
// This can be used to load images for resources.
function preload() {
    resources.set("entityPlayer", loadImage("./assets/playerImage.png"));
}

// Setup function for loading in various
function setup() {

    createCanvas(window.innerWidth, window.innerHeight);

    player = new Entity(100, 100);
    for (let i = 0; i < 30; i++)
        Environment.introduce(new Entity(Math.random() * window.innerWidth, Math.random() * window.innerHeight));

}

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

    player.velocityX = -sgnX * movementSpeed;
    player.velocityY = -sgnY * movementSpeed * 1.5;
    player.update(dT);


}


function loadMap(mapImage) {
    if (!(mapImage instanceof p5.Image))
        throw new TypeError("Provided argument is not of type p5.Image");



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
    onGround;

    constructor(posX, posY) {
        super(posX, posY, 30, 50);
        this.posX = posX;
        this.posY = posY;
        this.velocityX = 0;
        this.velocityY = 0;
        this.onGround = false;
    }

    update(deltaT) {
        let collidesX = false;
        let collidesY = false;

        this.velocityY += Environment.gravitationalConstant * 15;

        for (let i = 0; i < Environment.boundingBoxes.length; i++) {
            let p = Environment.boundingBoxes[i];
            if (this === p)
                continue;

            let cpyX = this.copy().translate(
                this.posX + this.velocityX * deltaT,
                this.posY
            );

            let cpyY = this.copy().translate(
                this.posX,
                this.posY + this.velocityY * deltaT
            )

            if (!collidesX && cpyX.intersects(p))
                collidesX = true;

            if (!collidesY && cpyY.intersects(p))
                collidesY = true;

            if (collidesX && collidesY)
                break;
        }

        if (!collidesX) {
            this.posX += this.velocityX * deltaT;
        }

        if (!collidesY) {
            this.posY += this.velocityY * deltaT;
        }

        this.velocityX = (Math.floor(this.velocityX * 1000 - 1) / 1000);
        this.velocityY = (Math.floor(this.velocityY * 1000 - 1) / 1000);
        this.posY = Math.min(this.posY, window.innerHeight - this.height);
        this.translate(this.posX, this.posY);
        // This is to apply gravity. Collision detection follows.
    }
}

class Environment {
    static gravitationalConstant = 9.81;
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
