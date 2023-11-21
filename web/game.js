
const gravitationalConstant = 9.81;
const frictionConstant = 0.5;
const framerate = 60; // frames per second.

var player;

// Hashmap containing all the resoucres as images.
// These resources must be loaded in the preload function.
// Adding new resources can be done using 'resources.set('key', object)'
const resources = new Map();

// This function is called before the setup function.
// This can be used to load images for resources.
function preload() {
    resources.set("player", loadImage("./assets/player.png"));
}

let aabb;

function setup() {

    createCanvas(window.innerWidth, window.innerHeight);
    player = new Player(100, 100);
    aabb = new AABB(500, 500, 30, 30);

}

function draw() {
    background(0);
    fill(255, 0, 0);

    let sgnX = 0;
    let sgnY = 0;

    if (keyIsDown(LEFT_ARROW)) sgnX++;
    if (keyIsDown(RIGHT_ARROW)) sgnX--;
    if (keyIsDown(UP_ARROW)) sgnY++;
    if (keyIsDown(DOWN_ARROW)) sgnY--;

    image(resources.get('player'), player.posX, player.posY, player.width, player.height);

    let is = aabb.intersects(player);


    fill(is ? 255 : 0, 50, 0);

    rect(aabb.left, aabb.top, aabb.width, aabb.height);

    let dT = deltaTime / 500;

    player.velocityX = -sgnX * 2000 * dT;
    player.velocityY = -sgnY * 2000 * dT;
    player.update(dT);


}

function generateTerrain(image) {



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

    updateBoundaries(newX, newY) {
        this.left = newX;
        this.top = newY;
        this.right = newX + this.width;
        this.bottom = newY + this.height;
    }

    // Function for checking whether a point lies within the specified boundaries
    intersectsPoint(x, y) {
        return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom;
    }

    intersects(boundingBox) {

        // Check whether our input is of type BoundingBox
        // If not, return false.
        if (!(boundingBox instanceof AABB))
            return false;

        const horizontalCollision = this.right >= boundingBox.left && this.left <= boundingBox.right;

        // Check for vertical overlap
        const verticalCollision = this.bottom >= boundingBox.top && this.top <= boundingBox.bottom;

        // Collision occurs if both horizontal and vertical overlap
        return horizontalCollision && verticalCollision;
    }
}

class Environment {
    static players = [];
    static collides(boundingBox) {
        for (let other in this.players) {
            if (boundingBox.collides(other))
                return true;
        }
        return false;
    }

    static introduce(player) {
        if (!(player instanceof Player))
            return;

        this.players.add(player);
    }

    static update(deltaT) {
        this.players.forEach(player => player.update(deltaT));
    }
}

class Player extends AABB {

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
        this.posX += this.velocityX * deltaT;
        this.posY += this.velocityY * deltaT;
        this.velocityX = (Math.floor(this.velocityX * 100 - 1) / 100);
        this.velocityY = (Math.floor(this.velocityY * 100 - 1) / 100);
        this.updateBoundaries(this.posX, this.posY);
        // This is to apply gravity. Collision detection follows.
    }

}