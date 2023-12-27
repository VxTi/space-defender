
const apiKey = 'dcdc91a618b4c9830fcc2e20';

let windowSegments = 70;

let pixelPerCm;  // How many pixels a physical centimeter occupy.

let mapWidth;              // Size of the map in pixels
let mapHeight;             // Height of the map. This is mapTop - mapBottom(x)
let mapTop = 150; // Top of the map, in pixels.
let innerMapWidth = 600; // Width of the inner map in pixels
let innerMapTop = 50;    // Top of the inner map

const defaultPlayerName = 'Guest';
let playerName = defaultPlayerName;
let player;

/**
 * Object containing all the scores of the player.
 * @type {{WAVE: number, SCORE: number, HIGH_SCORE: number, PLAYER_ID: number}}
 */
const PlayerData = {
    HIGH_SCORE: 0,
    SCORE: 0,
    WAVE: 1,
    PLAYER_ID: -1
}

// Method for mapping a value from one range to another
const map = (x, min1, max1, min2, max2) => ((x - min1) / (max1 - min1) * (max2 - min2) + min2);

const DEFAULT_HEALTH = 5;

let screenOffsetX = 0;

let gameActive = false;

// Object where all resources are stored in at preload
let _resources = {};
let resources = {}; // Here are all images stored as Resource objects

let entities = [];

let stars;

let shotsFired = 0;
let shootFrequency = 5; // How many bullets the spaceship can shoot each second
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

    pixelPerCm = document.querySelector('.pixel-size').clientWidth;
    mapWidth = 200 * pixelPerCm; // 1 physical meter wide.
    mapHeight = window.innerHeight - mapTop;

    noSmooth(); // prevent pixel-smoothing (this makes images look wacky)
    pixelDensity(1);

    player = new Spaceship(100, window.innerHeight/2, 5);
    entities.push(player);

    document.addEventListener('keydown', (event) => {
        // Check if we've hit the space-bar (shoot) and if there's enough time elapsed
        if (event.key === ' ' && shotsFired + 1 < shootFrequency) {
            player.shoot();
            shotsFired++;
            lastMissileTime = msElapsed;
        }
    })

    /** -- FUNCTIONALITY -- BACKGROUND STARS -- **/
    let starCount = 100;
    stars = Array(starCount);
    for (let i = 0; i < starCount; i++) {
        stars[i] = {
            x: 0,
            y: Math.round(Math.random() * window.innerHeight),
            offset: Math.round(Math.random() * window.innerWidth),
            depth: Math.random(),
            color: Math.round(0xFFFFFF * Math.random())
        }
    }

    let scoreContainer = document.querySelector('.game-scores');
    let hueDeg = 0;

    /** -- FUNCTIONALITY -- CHANGE COLOR OF SCORE BAR -- **/
    setInterval(() => {
        scoreContainer.style.color = `hsl(${hueDeg}deg, 100%, 50%)`;
        hueDeg = (hueDeg + 50) % 360;
    }, 500);

    /** -- FUNCTIONALITY -- FILTER OUT DEAD ENTITIES. -- **/
    setInterval(() => {
        if (gameActive) {
            entities.push(new Alien(-mapWidth / 2 + Math.random() * mapWidth, Math.random() * mapHeight));
        }
    }, 1000);
}

function draw() {

    background(0);

    // If the game isn't active or the window isn't focussed, prevent the game from updating.
    if (!gameActive || !document.hasFocus())
        return;

    // Update which direction the player is going to
    player.dir.translate((-keyIsDown(65) + keyIsDown(68)), (-keyIsDown(87) + keyIsDown(83)));


    msElapsed += deltaTime;
    let dT = deltaTime / 1000;

    shotsFired = Math.max(0, shotsFired - shootFrequency * dT);

    /** -- SECTION -- RENDERING INNER MAP -- **/

    // middle screen line
    drawLine(0, mapTop, window.innerWidth, mapTop, 0xff, 4);

    let mapCoordinateFrac = innerMapWidth / mapWidth;
    let innerMapHeight = mapTop - innerMapTop;
    let midX = window.innerWidth/2;
    let innerMapRadius = innerMapWidth/2;

    // enclosing lines for inner map
    drawLine(midX - innerMapRadius, innerMapTop, midX + innerMapRadius, innerMapTop, 0xff, 4);
    drawLine(midX - innerMapRadius, innerMapTop, midX - innerMapRadius, mapTop, 0xff, 4);
    drawLine(midX + innerMapRadius, innerMapTop, midX + innerMapRadius, mapTop, 0xff, 4);

    resources['spritesheet'].drawSection(midX + (player.pos.x) * mapCoordinateFrac - innerMapHeight/2, innerMapTop - 1, innerMapHeight, innerMapHeight, 0, 2)

    /** -- SECTION -- RENDERING LIVES -- **/
    for (let i = 0, s = 200/DEFAULT_HEALTH; i < player.health; i++)
        resources['spritesheet'].animate(midX - innerMapRadius - 215 + s * i, mapTop - 22 - s, s, s, 0);


    drawRect(midX - innerMapRadius - 215, mapTop - 20, 204, 15, 0x404040);
    drawRect(midX - innerMapRadius - 213, mapTop - 18, 200 * (1.0 - shotsFired/shootFrequency), 11, 0xff);


    /** -- SECTION -- RENDERING HILLS BELOW -- **/
    for (let i = 0, frac = window.innerWidth / windowSegments; i < windowSegments; i++) {
        drawSegmentedLine(frac * i, window.innerHeight - GNoise(i - screenOffsetX / frac),
            frac * (i + 1), window.innerHeight - GNoise(i + 1 - screenOffsetX / frac),
            5, 0xff0000
        );
    }

    /** -- SECTION -- RENDERING STARS -- **/
    for (let star of stars) {
        drawRect(star.x, star.y, 5, 5, star.color);
        star.x = Math.abs(star.offset + star.depth * player.pos.x + window.innerWidth * star.depth) % window.innerWidth;
    }

    translate(screenOffsetX, 0);

    // Update all entity positions and remove ones that aren't alive.
    for (let i = entities.length - 1; i >= 0; i--) {
        let e = entities[i];
        if (!e.alive && e !== player)
            entities.splice(i, 1);
        else {
            if (e.MINIMAP_SPRITE_INDEX != null && typeof e.MINIMAP_SPRITE_INDEX === 'object')
                resources['spritesheet'].drawSection(
                    midX + e.pos.x * mapCoordinateFrac - screenOffsetX,
                    innerMapTop + (e.pos.y - mapTop) / (window.innerHeight - mapTop) * innerMapHeight, 30, 30,
                    e.MINIMAP_SPRITE_INDEX[0], e.MINIMAP_SPRITE_INDEX[1]
                );
        }
        e.update(dT)
    }
}

function scoreUpdater() {
    // Check if the player has selected a name, if not, don't update the score.
    if (playerName === defaultPlayerName || !gameActive)
        return;

    // Send the score to the server
    requestApi('updatescore', {userId: PlayerData.PLAYER_ID, score: PlayerData.SCORE, wave: PlayerData.WAVE})
        .catch(e => console.error(e));
}


/**
 * Method for starting the game and configuring the right variables
 */
function startGame() {
    entities = [player];
    let nameInput = document.getElementById('menu-start-name-input');
    playerName = nameInput.value.length >= nameInput.minLength ? nameInput.value : defaultPlayerName;
    console.log("Starting game as " + playerName);
    PlayerData.WAVE = 1;

    // If the player decided to use a name, then we'll check whether the user exists,
    if (playerName !== defaultPlayerName) {
        (async () => {

            let exists = await requestApi('checkuser', {idorname: playerName}).then(res => res.exists);

            // If the user doesn't exist, request a new user to be created.
            if (!exists)
                await requestApi('createuser', {name: playerName}).then(res => PlayerData.PLAYER_ID = res.userId)
            else
                await requestApi('getuser', {name: playerName}).then(res => {
                    PlayerData.PLAYER_ID = res.userData.userId;
                    PlayerData.HIGH_SCORE = res.userData.maxScore;
                    PlayerData.SCORE = res.userData.lastScore;
                })
            setScore(0);
            setInterval(scoreUpdater, 5000);

        })();
    }
}

/**
 * Method for making an API request to the server.
 * @param {string} param The appropriate URL parameter for the request
 * @param {object} content The content to send to the server
 * @returns {Promise<Object>}
 */
async function requestApi(param, content) {
    return fetch(`http://localhost:8081/api/${param}`, {
        method: 'POST',
        cors: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            key: apiKey,
            ...content
        })
    })
        .then(res => res.json())
        .catch(e => console.error(e));
}

/**
 * Method for respawning the player and resetting some variables.
 */
function respawn() {
    player.health = DEFAULT_HEALTH;
    player.pos.translate(window.innerWidth/2, window.innerHeight/2);
    player.vel.translate(0, 0);
    PlayerData.WAVE = 1;
    PlayerData.SCORE = 0;
    entities = [player];
    setScore(0);
}



/**
 * Method for showing a death animation for given entity.
 * @param {Entity} entity The entity in question that's died.
 */
function showDeathAnimation(entity) {

    for (let i = 0; i < entity.size * 2; i++)
        entities.push(new Particle(entity, entity.size/6, Math.random(), entity.size/20.0));
}

/**
 * Function for setting the score of the user
 * Also updates the high score if the score is higher than the current high score
 * @param {number} score new score
 */
function setScore(score) {
    PlayerData.SCORE = score;
    if (PlayerData.SCORE > PlayerData.HIGH_SCORE)
        PlayerData.HIGH_SCORE = PlayerData.SCORE;
    document.querySelector('.game-score-points-value').innerText = `${PlayerData.SCORE}`;
    document.querySelector('.game-score-high-value').innerText = `${PlayerData.HIGH_SCORE}`;
}

/**
 * Function for adding score of the player
 * @param {number} score How much score to add
 */
function addScore(score) {
    setScore(PlayerData.SCORE += Math.abs(score));
}

/**
 * Method for drawing a rectangle onto the screen with provided color values
 * @param {number} x screen x-coordinate
 * @param {number} y screen y-coordinate
 * @param {number} width width of the rectangle
 * @param {number} height height of the rectangle
 * @param {number} rgb Color value. Can be provided as '0xRRGGBB' where [R, G, B] are in base-16
 */
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