
let score = 0;
let kills = 0;

const horizontalSpeed = 20;
const verticalSpeed = 10;

let windowSegments = 70;

let pixelPerCm;  // How many pixels a physical centimeter occupy.

let mapWidth;              // Size of the map in pixels
let mapHeight;             // Height of the map. This is mapTop - mapBottom(x)
let mapTop = 150; // Top of the map, in pixels.
let innerMapWidth = 600; // Width of the inner map in pixels
let innerMapTop = 50;    // Top of the inner map

let ship;

let screenOffsetX = 0;

let gameActive = false;

// Object where all resources are stored in at preload
let _resources = {};
let resources = {}; // Here are all images stored as Resource objects

let entities = [];

let shootFrequency = 10; // How many bullets the spaceship can shoot each second
let lastMissileTime = 0;

let msElapsed = 0;

// Noise function for the bottom of the screen
GNoise = (x) => noise(x / 3) * 200;

function preload() {
    _resources['spritesheet'] = loadImage('./assets/spritesheet.png');
    _resources['sky'] = loadImage('./assets/skyImage.png');
}

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    window.addEventListener('resize', () => resizeCanvas(window.innerWidth, window.innerHeight));

    resources['spritesheet'] = new Resource(_resources['spritesheet'], 10, 10);
    resources['sky'] = new Resource(_resources['sky']);

    pixelPerCm = document.querySelector('.pixel-size').clientWidth;
    mapWidth = 100 * pixelPerCm; // 1 physical meter wide.

    noSmooth(); // prevent pixel-smoothing (this makes images look wacky)

    ship = new Spaceship(100, window.innerHeight/2, 5);
    entities.push(ship);

    document.addEventListener('keydown', (event) => {
        // Check if we've hit the space-bar (shoot) and if there's enough time elapsed
        if (event.key === ' ' && msElapsed - lastMissileTime >= 1000 / shootFrequency) {
            ship.shoot();
            lastMissileTime = msElapsed;
        }
    })

    /*setInterval(() => {
        if (gameActive)
            entities.push(new Alien(Math.random() * 1000, Math.random() * 100 + window.innerHeight / 2))
    }, 1000);*/
}

function draw() {

    background(0);

    resources['sky'].draw(0, 0, window.innerWidth, window.innerHeight);
    if (!gameActive || !document.hasFocus())
        return;

    ship.move((-keyIsDown(65) + keyIsDown(68)), (-keyIsDown(87) + keyIsDown(83)));


    msElapsed += deltaTime;
    let dT = deltaTime / 1000;

    /** -- SECTION -- RENDERING LIVES -- **/

    for (let i = 0; i < ship.lives; i++)
        resources['spritesheet'].animate(mapTop + 50 * i, 5, 60, 60, 0);


    /** -- SECTION -- RENDERING INNER MAP -- **/
    let innerSize = mapTop - innerMapTop;

    // middle screen line
    drawLine(0, mapTop, window.innerWidth, mapTop, 0xff, 4);

    // enclosing lines for inner map
    drawLine(window.innerWidth/2 - innerMapWidth/2, innerMapTop, window.innerWidth/2 + innerMapWidth/2, innerMapTop, 0xff, 4);
    drawLine(window.innerWidth/2 - innerMapWidth/2, innerMapTop, window.innerWidth/2 - innerMapWidth/2, mapTop, 0xff, 4);
    drawLine(window.innerWidth/2 + innerMapWidth/2, innerMapTop, window.innerWidth/2 + innerMapWidth/2, mapTop, 0xff, 4);

    resources['spritesheet'].drawSection(window.innerWidth/2 + (ship.pos.x) * innerMapWidth / mapWidth - innerSize/2, innerMapTop - 1, innerSize, innerSize, 0, 2)

    let frac = window.innerWidth / windowSegments;

    /** -- SECTION -- RENDERING HILLS BELOW -- **/
    for (let i = 0; i < windowSegments; i++) {
        drawSegmentedLine(frac * i, window.innerHeight - GNoise(i - screenOffsetX / frac),
            frac * (i + 1), window.innerHeight - GNoise(i + 1 - screenOffsetX / frac),
            5, 0xff0000
        );
    }

    translate(screenOffsetX, 0);

    entities.forEach(e => e.update(dT));
}

/**
 * Method for drawing a line with multiple parameters.
 * @param {number} x0 starting x-position
 * @param {number} y0 starting y-position
 * @param {number} x1 second x-position
 * @param {number} y1 second y-position
 * @param {number} [rgb] Color of the line, given as a number.
 * Parameter can be provided as '0xRRGGBB', where the letters denote hexadecimal values for RGB
 * @param {number} [thickness] Thickness of the line
 */
function drawLine(x0, y0, x1, y1, rgb = 0xFFFFFF, thickness = 1) {
    stroke((rgb >> 16) & 0xff, (rgb >> 8) & 0xff, rgb & 0xff);
    strokeWeight(thickness);
    line(x0, y0, x1, y1);
}

/**
 * Method for drawing a dotted line, old-school style
 * @param x0 first x-coordinate
 * @param y0 first y-coordinate
 * @param x1 second x-coordinate
 * @param y1 second y-coordinate
 * @param segmentSize Size of each segments
 * @param rgb Color to draw
 */
function drawSegmentedLine(x0, y0, x1, y1, segmentSize, rgb) {
    noStroke();
    fill((rgb >> 16) & 0xFF, (rgb >> 8) & 0xFF, rgb & 0xFF);
    let segments = Math.max(Math.abs(x1 - x0) / 6, Math.abs(y1 - y0) / 6);
    let dx = (x1 - x0) / segments;
    let dy = (y1 - y0) / segments;

    for (let i = 0, x, y; i < segments; i++) {
        [x, y] = [x0 + dx * i, y0 + dy * i];
        [x, y] = [x - x % segmentSize, y - y % segmentSize];
        rect(x, y, segmentSize, segmentSize);
    }
}