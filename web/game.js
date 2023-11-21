import { Environment } from 'modules/environment'
import {Entity} from 'modules/entity'

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
    player = new Entity(100, 100);
    for (let i = 0; i < 30; i++)
        Environment.introduce(new Entity(Math.random() * 1000, Math.random() * 800));

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

    image(resources.get('player'), player.posX, player.posY, player.width, player.height);


    for (var i = 0; i < Environment.boundingBoxes.length; i++) {
        let other = Environment.boundingBoxes[i];
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

