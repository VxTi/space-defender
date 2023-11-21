
const gravitationalConstant = 9.81;
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
    resources.set("player", loadImage("./assets/player.png"));
}

function setup() {

    createCanvas(window.innerWidth, window.innerHeight);
    player = new Player(100, 100);
    for (let i = 0; i < 10; i++)
        Environment.introduce(new Player(Math.random() * 1000, Math.random() * 800));
}

function draw() {
    background(0);
    fill(255, 0, 0);

    let sgnX = 0;
    let sgnY = 0;

    if (keyIsDown(65)) sgnX++;
    if (keyIsDown(68)) sgnX--;
    if (keyIsDown(87)) sgnY++;
    if (keyIsDown(83)) sgnY--;

    image(resources.get('player'), player.posX, player.posY, player.width, player.height);


    for (var i = 0; i < Environment.players.length; i++) {
        let other = Environment.players[i];
        let intersects = other.intersects(player);
        fill(intersects ? 255 : 0, 50, 0);
        rect(other.left, other.top, other.width, other.height);
    }

    let dT = deltaTime / 1000;

    player.velocityX = -sgnX * movementSpeed;
    player.velocityY = -sgnY * movementSpeed;
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

    intersectsX(boundingBox) {
        if (!(boundingBox instanceof AABB))
            return false;
        return this.right >= boundingBox.left && this.left <= boundingBox.right;
    }

    // Function for checking Y collisions with `boundingBox`
    intersectsY(boundingBox) {
        if (!(boundingBox instanceof AABB))
            return false;
        return this.bottom >= boundingBox.top && this.top <= boundingBox.bottom;
    }

    // Function for checking X and Y collisions with `boundingBox`
    intersects(boundingBox) {

        // Check whether our input is of type BoundingBox
        // If not, return false.
        if (!(boundingBox instanceof AABB))
            return false;

        return this.intersectsX(boundingBox) && this.intersectsY(boundingBox);
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

        this.players.push(player);
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
        let { colX, colY }  = false;
        for (let i = 0; i < Environment.players.length; i++) {
            let p = Environment.players[i];
            if (this === p)
                continue;

            if (this.intersectsX(p) && !colX)
                colX = true;

            if (this.intersectsY(p) && !colY)
                colY = true;


        }
        this.posX += this.velocityX * deltaT;
        this.posY += this.velocityY * deltaT;
        this.velocityX = (Math.floor(this.velocityX * 1000 - 1) / 1000);
        this.velocityY = (Math.floor(this.velocityY * 1000 - 1) / 1000);
        this.updateBoundaries(this.posX, this.posY);
        // This is to apply gravity. Collision detection follows.
    }

}