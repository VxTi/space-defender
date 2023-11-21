
const gravitationalConstant = 9.81;
const frictionConstant = 0.5;
const framerate = 60; // frames per second.

var player;

function setup() {

    createCanvas(window.innerWidth, window.innerHeight);
    player = new Player(100, 100);

}

function draw() {
    background(0);
    fill(255, 0, 0);
    rect(player.posX, player.posY, player.width, player.height);

    let sgnX = 0;
    let sgnY = 0;

    if (keyIsDown(LEFT_ARROW)) sgnX++;
    if (keyIsDown(RIGHT_ARROW)) sgnX--;
    if (keyIsDown(UP_ARROW)) sgnY++;
    if (keyIsDown(DOWN_ARROW)) sgnY--;

    player.accelerationX -= sgnX * 0.1;
    player.accelerationY -= sgnY * 0.1;
    player.update(deltaTime);


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

        return Math.max(boundingBox.right, this.right) >= Math.min(boundingBox.left, this.left)
            && Math.max(boundingBox.bottom, this.bottom) >= Math.min(boundingBox.top, this.top);
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

    constructor(posX, posY) {
        super(posX, posY, 30, 50);
        this.posX = posX;
        this.posY = posY;
        this.velocityX = 0;
        this.velocityY = 0;
        this.accelerationX = 0;
        this.accelerationY = 0;
    }

    update(deltaT) {
        this.posX += this.velocityX * deltaT;
        this.posY += this.velocityY * deltaT;
        this.velocityX += this.accelerationX * deltaT;
        this.velocityY += this.accelerationY * deltaT;
        this.accelerationX = 0;
        this.accelerationY = 0;
        this.updateBoundaries(this.posX, this.posY);
        console.log(this.posX + ", " + this.posY);
        // This is to apply gravity. Collision detection follows.
    }

}