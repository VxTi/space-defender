
/** Player related variables */
// Variables defining how fast the player moves per second in game meters.
var horizontalSpeed = 3.5; // Movement speed horizontally in game meters/s
var verticalSpeed = 6.5;   // Movement speed vertically in game meters/s
var allowDoubleJump = true;  // Whether the player can double jump against walls
var player;                       // Variable containing all information of the player.

const entityTick = 1000; // How many milliseconds delay between every entity update
// Whether to draw outlines around the player(s)
var showBoundingBox = false;

/** Dimension related variables (sizes) */
var windowWidthInMeters;            // Size in game meters
var windowHeightInMeters;
var screenEdgeMargin = 5; // If the player gets close to the edge of the screen (in game meters), the screen moves.
var screenOffsetX = 0;
var screenOffsetY = 0;
// How many on-screen pixels represent an in-game meter
var pixelsPerMeter;

const cmPerBlock = 1; // size of each 'meter' on screen.

/** Terrain related variables */
const seed = null; // if null, terrain will generate random
const terrainHeight = 10;
const terrainRandomness = 0.01; // Higher number makes the terrain more erratic

// Object containing all loaded images.
// If one wants to add images to the resources variable, you can do
// 'resources['something'] = ...' or 'let a = resources.something'
var resources = {};

// Object containing all moving resources (animations)
var animations = {}

let timePhase = 0; // used for timed animations.

var gameActive = false;

const Difficulties = ['Easy', 'Normal', 'Hard', 'Extreme'];
let difficulty = 0;

setDifficulty = function(diff) {
    difficulty = diff % Difficulties.length;
    let textElement = document.querySelector(".difficulty-title");
    textElement.innerText =
        Difficulties[difficulty]; // Rotate around all texts.
    textElement.style.color = `hsl(${(1 - (difficulty + 1) / Difficulties.length) * 130}, 100%, 50%)`;
}

clamp = function(x, a, b) { return x < a ? a : x > b ? b : x; }

/** This function is called before the setup function.
 *  This can be used to load images for resources.
 */
function preload() {

    // All filenames.
    // If one wants to add a new resource to the resources array,
    // one must simply add the name in the 'fileNames' array, as long as the file ends
    // with the same extension type as defined below.
    // If one wants to access the resource afterward, simply do 'resources['rs name']'
    const extension = 'png';
    const fileNames = ['player_animation_wielding', 'dirt', 'stone', 'grass_block',
                        'deepslate_bricks', 'cracked_deepslate_bricks', 'moon_phases', 'skyImage', 'wizard', 'health'];

    for (let element of fileNames)
        resources[element] = loadImage(`./assets/${element}.${extension}`);

    // How many pixels represent a 'meter' ingame. This uses an invisible div element that's one cm large.
    pixelsPerMeter = document.querySelector(".pixel-size").clientWidth * cmPerBlock;
    windowWidthInMeters = window.innerWidth / pixelsPerMeter;
    windowHeightInMeters = window.innerHeight / pixelsPerMeter;
}


/**
 * Method for setting up variables, after pre-initialization.
 * Here we can add event listeners, register preloaded images as resource
 * and create the canvas.
 */
function setup() {

    // Create a canvas to render onto
    createCanvas(window.innerWidth, window.innerHeight);
    setDifficulty(0);

    // Load all block resources
    for (const [key, value] of Object.entries(resources))
        if (typeof BlockType[key] !== null)  BlockType[key] = new Resource(value);

    animations['moonAnimation'] = new Resource(resources['moon_phases'], 4, 2);
    animations['skyBackground'] = new Resource(resources['skyImage']);
    animations['playerAnimation'] = new Resource(resources['player_animation_wielding'], 4, 1);
    animations['health'] = new Resource(resources['health'], 3, 1);


    // Whenever the screen resizes, adapt the canvas size with it.
    window.addEventListener('resize', () => resizeCanvas(window.innerWidth, window.innerHeight));

    // Create an instance of the first player, for when the user decides to play single-player.
    player = new Player(5, terrainHeight + 5);

    noiseSeed(seed === null ? Math.floor((1 << 10) * Math.random()) : seed);

    Environment.generate();            // generate environment
    Environment.introduce(player); // add player to the environment
    Environment.introduce(new EntityWizard(10, 30, 4));
    noSmooth(); // prevent pixel-smoothing (this makes images look wacky)

    // Add periodic updates for entities
    // For example, hostile entity damage, only once per second.
    setInterval(() => {
        if (!gameActive)
            return;
        Environment.entities.forEach(e => {
            if (typeof e['onPeriodicUpdate'] === 'function')
                e['onPeriodicUpdate']();
        });
    }, entityTick);
}

// Draw function is called every 1/60th a second.
// This means it waits 16.6ms before getting called again.
function draw() {

    // NOTE: Dit is heelgoed!!! - Nick Burgmijer, Student UVA 
    if (!document.hasFocus())
        return;

    background(0);

    // Filthy javascript coding ...
    player.move((-keyIsDown(65) + keyIsDown(68)) * (1 - 0.5 * keyIsDown(16)), keyIsDown(32) * 1);

    // Saves current matrix and pushes it on top of the stack
    push();
    { // does nothing, just nice.

        // Rotate the matrix (sky)
        rotate(timePhase * 0.005);
        // translate sky to the middle so it rotates from the middle
        translate(window.innerWidth / 2, window.innerHeight / 2);

        // Render the stars
        animations['skyBackground'].draw(-window.innerWidth / 2, -window.innerWidth / 2, window.innerWidth, window.innerWidth);
    }
    pop(); // Pops the top matrix and goes to the previous one.


    // Draw the moon animation in the top right of the screen
    animations['moonAnimation'].animate(window.innerWidth - 200, 50, 100, 100, Math.floor(timePhase));

    // Offset the screen by the scrolling position
    translate(screenOffsetX * pixelsPerMeter, -screenOffsetY * pixelsPerMeter);

    // If the game isn't active, prevent updates.
    if (!gameActive)
        return;

    let dT = deltaTime / 1000;

    timePhase += dT;
    Environment.update(dT);
    Environment.draw(dT);

}

/**
 * Method for rendering a health-bar above an entity.
 * @param x The game x-coordinate at which to render the health-bar at
 * @param y The game y-coordinate at which to render the health-bar at
 * @param health The current health of the entity
 * @param maxHealth The maximum amount of health of the entity
 * @param scale The scale at which to render the health-bar. Default is 1.0
 */
function drawHealthBar(x, y, health, maxHealth, scale = 1) {
    stroke(255);
    text(`${health}/${maxHealth} HP`, x, y);
    for (let i = 1, w = pixelsPerMeter * scale; i <= maxHealth / 2; i++) {
        animations['health'].animate(
            x + (-maxHealth / 4 + i) * w,
            y , w, w, (i * 2) <= health ? 0 : (i * 2) - 1 <= health ? 1 : 2);

    }
}
