
let playerScore = 0;

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

let stars;

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
    mapWidth = 200 * pixelPerCm; // 1 physical meter wide.
    mapHeight = window.innerHeight - mapTop;

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

    let starCount = 100;
    stars = Array(starCount);
    for (let i = 0; i < starCount; i++) {
        stars[i] = [0, Math.random() * window.innerWidth, Math.random() * window.innerHeight, Math.floor(Math.random() * 0xFFFFFF)];
    }

    let scoreText = document.querySelector('.game-scores-element');
    let hueDeg = 0;

    /** -- FUNCTIONALITY -- CHANGE COLOR OF SCORE BAR -- **/
    setInterval(() => {
        scoreText.style.color = `hsl(${hueDeg}deg, 100%, 50%)`;
        hueDeg = (hueDeg + 50) % 360;
    }, 500);

    /** -- FUNCTIONALITY -- FILTER OUT DEAD ENTITIES. -- **/
    setInterval(() => {
        if (gameActive) {
            if (entities.length < 100)
                entities.push(new Alien(-mapWidth / 2 + Math.random() * mapWidth, Math.random() * mapHeight));
            entities = entities.filter(e => e.alive || e === ship);
        }
    }, 1000);
}

function draw() {

    background(0);

    if (!gameActive || !document.hasFocus())
        return;

    ship.move((-keyIsDown(65) + keyIsDown(68)), (-keyIsDown(87) + keyIsDown(83)));


    msElapsed += deltaTime;
    let dT = deltaTime / 1000;


    /** -- SECTION -- RENDERING INNER MAP -- **/

    // middle screen line
    drawLine(0, mapTop, window.innerWidth, mapTop, 0xff, 4);

    let mapCoordinateFrac = innerMapWidth / mapWidth;
    let innerSize = mapTop - innerMapTop;
    let midX = window.innerWidth/2;
    let innerMapRad = innerMapWidth/2;

    // enclosing lines for inner map
    drawLine(midX - innerMapRad, innerMapTop, midX + innerMapRad, innerMapTop, 0xff, 4);
    drawLine(midX - innerMapRad, innerMapTop, midX - innerMapRad, mapTop, 0xff, 4);
    drawLine(midX + innerMapRad, innerMapTop, midX + innerMapRad, mapTop, 0xff, 4);

    resources['spritesheet'].drawSection(midX + (ship.pos.x) * mapCoordinateFrac - innerSize/2, innerMapTop - 1, innerSize, innerSize, 0, 2)

    /** -- SECTION -- RENDERING LIVES -- **/
    for (let i = 0; i < ship.health; i++)
        resources['spritesheet'].animate(mapTop + 50 * i, 5, 50, 50, 0);

    /** -- SECTION -- RENDERING HILLS BELOW -- **/
    for (let i = 0, frac = window.innerWidth / windowSegments; i < windowSegments; i++) {
        drawSegmentedLine(frac * i, window.innerHeight - GNoise(i - screenOffsetX / frac),
            frac * (i + 1), window.innerHeight - GNoise(i + 1 - screenOffsetX / frac),
            5, 0xff0000
        );
    }

    for (let star of stars) {
        drawRect(star[0], star[2], 5, 5, star[3]);
        star[0] = (star[1] * 4 + ship.pos.x * 0.5 + window.innerWidth) % window.innerWidth;
    }

    translate(screenOffsetX, 0);

    entities.forEach(e => {
        if (!e.alive)
            return;
        if (e.MINIMAP_SPRITE_INDEX != null && typeof e.MINIMAP_SPRITE_INDEX === 'object')
            resources['spritesheet'].drawSection(
                midX + e.pos.x * mapCoordinateFrac - screenOffsetX,
                innerMapTop + e.pos.y / (window.innerHeight - mapTop) * innerSize, 30, 30,
                e.MINIMAP_SPRITE_INDEX[0], e.MINIMAP_SPRITE_INDEX[1]);
        e.update(dT)
    });
}

/**
 * Function for setting the score of the user
 * @param {number} score new score
 */
function setScore(score) {
    playerScore = score;
}

/**
 * Function for adding score of the player
 * @param {number} score How much score to add
 */
function addScore(score) {
    playerScore += Math.abs(score);
    document.querySelector('.game-score-value').innerText = `${playerScore}`;
}

function drawRect(x, y, width, height, rgb) {
    fill((rgb >> 16) & 0xff, (rgb >> 8) & 0xff, rgb & 0xff);
    noStroke();
    rect(x, y, width, height);
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