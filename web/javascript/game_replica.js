
const apiKey = 'dcdc91a618b4c9830fcc2e20';

let windowSegments = 50;

let pixelPerCm;  // How many pixels a physical centimeter occupy.

let mapWidth;              // Size of the map in pixels
let mapHeight;             // Height of the map. This is mapTop - mapBottom(x)
let mapTop = 150; // Top of the map, in pixels.
let innerMapWidth = 600; // Width of the inner map in pixels
let innerMapTop = 50;    // Top of the inner map

// Configuration settings for the game.
const Config = {
    EXPLOSION_PARTICLE_COLOR: 0x00FF00,
    EXPLOSION_TIMER_DELAY: 5,           // Delay in seconds until the explosive effect can be used.
    EXPLOSION_RADIUS: 200,              // Explosion radius of the explosive effect in pixels.
    EXPLOSION_PARTICLE_COUNT: 50,
    STAR_COUNT: 200,
    SHOOT_FREQUENCY: 5,                // How many bullets the spaceship can shoot each second
    DEFAULT_HEALTH: 5,
    DEFAULT_PLAYER_NAME: 'Guest',
    API_URL: 'http://localhost:8081/api/',
}

/**
 * Object containing all the statistical properties of the spaceship.
 * These can be viewed in the 'statistics' tab in-game.
 */
const Statistics = {
    rocketsFired: {
        name: 'Rockets Fired',
        value: 0
    },
    damageDealt: {
        name: 'Damage Dealt',
        value: 0
    },
    damageReceived: {
        name: 'Damage Received',
        value: 0
    },
    entitiesKilled: {
        name: 'Overall Kills',
        value: 0
    },
    aliensKilled: {
        name: 'Aliens Slaughtered',
        value: 0
    },
    enemyShipsKilled: {
        name: 'Enemy Ships Destroyed',
        value: 0
    },
    evolvedAliensKilled: {
        name: 'Evolved Aliens Killed',
        value: 0
    },
    killDeathRatio: {
        name: 'Kill/Death Ratio',
        value: 0
    },
    timesDied: {
        name: 'Times Died',
        value: 0
    },
    timesBlownUp: {
        name: 'Times Blown Up',
        value: 0
    }
}

let playerName = Config.DEFAULT_PLAYER_NAME;
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

let screenOffsetX = 0;

let gameActive = false;

// Object where all resources are stored in at preload
let _resources = {};
let resources = {}; // Here are all images stored as Resource objects

// Array containing all the entities in the game
let entities = [];

let stars; // Array object containing all the stars

let shotsFired = 0; // How many shots are fired, this is used to determine whether the player can shoot or not.

let explosiveTimer = Config.EXPLOSION_TIMER_DELAY; // Time until the explosive effect can be used, in seconds.

let msElapsed = 0;

// Create a method for checking whether a number is between two other numbers.
Number.prototype.isBetween = function(a, b) {
    return this >= Math.min(a) && this <= Math.max(b);
}

// Create method for numbers named 'isZero', for checking whether a number is close to zero.
Number.prototype.isZero = function() {
    return Math.abs(this) <= 0.0001;
}

isOnScreen = (x, y) => x.isBetween(screenOffsetX, screenOffsetX + window.innerWidth) && y.isBetween(0, window.innerHeight);

// Noise function for the bottom of the screen
GNoise = (x) => noise(x / 3) * 200;

function preload() {
    _resources['spritesheet'] = loadImage('./assets/spritesheet.png');
    _resources['sky'] = loadImage('./assets/skyImage.png');
}

/**
 * Main setup method. Here we load resources and initialize variables.
 */
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
        switch (event.key) {
            case ' ':
                if (shotsFired + 1 < Config.SHOOT_FREQUENCY) {
                    player.shoot();
                    shotsFired++;
                }
            break;
            case 'f':
                performExplosion();
            break;
        }
    })

    /** -- FUNCTIONALITY -- BACKGROUND STARS -- **/
    stars = Array(Config.STAR_COUNT);
    for (let i = 0; i < Config.STAR_COUNT; i++) {
        stars[i] = {
            x: 0,
            y: mapTop + Math.round(Math.random() * (window.innerHeight - mapTop)),
            offset: Math.round(Math.random() * window.innerWidth),
            depth: Math.random() * 0.5,
            opacity: Math.random(),
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
    setInterval(checkEntitySpawning, 1000);
}

/**
 * Main Rendering loop
 */
function draw() {

    background(0);

    // If the game isn't active or the window isn't focussed, prevent the game from updating.
    if (!gameActive || !document.hasFocus())
        return;

    // Update which direction the player is going to
    player.dir.translate((-keyIsDown(65) + keyIsDown(68)), (-keyIsDown(87) + keyIsDown(83)));


    msElapsed += deltaTime;
    let dT = deltaTime / 1000;

    shotsFired = Math.max(0, shotsFired - Config.SHOOT_FREQUENCY * dT);
    explosiveTimer = Math.max(0, explosiveTimer - dT);

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
    for (let i = 0, s = 200 / Config.DEFAULT_HEALTH; i < player.health; i++)
        resources['spritesheet'].animate(midX - innerMapRadius - 215 + s * i, mapTop - 22 - s, s, s, 0);

    /** -- SECTION -- RENDERING SHOOT CHARGE -- **/
    drawRect(midX - innerMapRadius - 215, mapTop - 20, 205, 15, 0x404040);
    drawRect(midX - innerMapRadius - 213, mapTop - 16, 200 * (1.0 - shotsFired/Config.SHOOT_FREQUENCY), 8, 0xff);

    /** -- SECTION -- RENDERING EXPLOSIVE CHARGE -- **/
    drawRect(midX + innerMapRadius + 14, mapTop - 20, 205, 15, 0x404040);
    drawRect(midX + innerMapRadius + 16, mapTop - 16, 200 * (1.0 - explosiveTimer/Config.EXPLOSION_TIMER_DELAY), 8, 0xff0000);


    /** -- SECTION -- RENDERING HILLS BELOW -- **/
    for (let i = 0, frac = window.innerWidth / windowSegments; i < windowSegments; i++) {
        drawSegmentedLine(frac * i, window.innerHeight - Math.round(GNoise(i - screenOffsetX / frac)) ,
            frac * (i + 1), window.innerHeight - Math.round(GNoise(i + 1 - screenOffsetX / frac)),
            0xff0000, 3
        );
    }

    for (let i = 0, frac = window.innerWidth / windowSegments; i < windowSegments; i++) {
        drawSegmentedLine(frac * i, window.innerHeight - GNoise((i - screenOffsetX / frac) * 0.5) * 0.5,
            frac * (i + 1), window.innerHeight - GNoise((i + 1 - screenOffsetX / frac) * 0.5) * 0.5,
            0xA020F0,  3
        );
    }

    /** -- SECTION -- RENDERING STARS -- **/
    for (let star of stars) {
        drawRect(star.x, star.y, 2, 2, star.color, Math.max(1 - star.opacity, 0.1));
        star.x = Math.abs(star.offset + star.depth * player.pos.x + window.innerWidth * star.depth) % window.innerWidth;
        star.opacity = (star.opacity + dT / 10) % 1;
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
                    innerMapTop + Math.round((e.pos.y - mapTop) / (window.innerHeight - mapTop) * innerMapHeight), 30, 30,
                    e.MINIMAP_SPRITE_INDEX[0], e.MINIMAP_SPRITE_INDEX[1]
                );
        }
        e.update(dT)
    }
}

/**
 * Function for checking whether an entity can spawn or not
 * Occasionally introduces new entities.
 */
function checkEntitySpawning() {
    if (!gameActive || !document.hasFocus())
        return;

    let [x, y] = [-mapWidth / 2 + Math.random() * mapWidth, mapTop + Math.random() * mapHeight];
    if (Math.random() < 0.5) entities.push(new EvolvedAlien(x, y))
    for (let i = 0, probabilities = [0.2, 0.05, 0.3, 0.45]; i < probabilities.length; i++) {
        if (Math.random() < probabilities[i]) {
            switch (i) {
                case 0: entities.push(new EvolvedAlien(x, y)); break;
                case 1: entities.push(new HealthElement(x, y, 1)); break;
                case 2: entities.push(new EnemyShip(x, y)); break;
                case 3: entities.push(new Alien(x, y)); break;
            }
            break;
        }
    }
}

/**
 * Function for updating the score of the player.
 * This only works when the player has selected a name for themselves,
 * and one is connected to the internet.
 */
function scoreUpdater() {
    // Check if the player has selected a name, if not, don't update the score.
    if (playerName === Config.DEFAULT_PLAYER_NAME || !gameActive)
        return;

    // Send the score to the server
    requestApi('updatescore', {userId: PlayerData.PLAYER_ID, score: PlayerData.SCORE, wave: PlayerData.WAVE})
        .catch(e => console.error(e));
    let stats = Object.entries(Statistics).map(([key, value]) => ({field: key, value: value.value}));
    requestApi('updatestatistics', {userId: PlayerData.PLAYER_ID, userName: playerName, statistics: stats})
        .catch(e => console.error(e));
}

/**
 * Method for performing the explosion effect.
 */
function performExplosion() {
    if (explosiveTimer <= 0 && player.alive) {
        let [dX, dY] = [0, 0];
        let theta = 0;
        explosiveTimer = Config.EXPLOSION_TIMER_DELAY;

        // Add particles for special effect
        for (let i = 0; i < Config.EXPLOSION_PARTICLE_COUNT; i++) {
            [dX, dY] = randDir(0, Math.PI * 2, 100, 2 * Config.EXPLOSION_RADIUS);

            // Add explosion particle
            entities.push(
                new Particle(player.pos.x, player.pos.y, dX, dY, player, Math.random(), 1.0, Config.EXPLOSION_PARTICLE_COLOR));
        }

        // Check what entities are within range
        entities.forEach(e => {
            if (!e.canDamage || e instanceof Particle || !e.alive || e === player || e instanceof HealthElement)
                return;

            // Check whether the entity is within distance of the player
            if (e.pos.distSq(player.pos) <= Math.pow(Config.EXPLOSION_RADIUS, 2))  {
                theta = Math.atan2((e.pos.y - player.pos.y), (e.pos.x - player.pos.x));
                e.damage(1);
                if (!e.alive)
                    addScore(e.ENTITY_KILL_SCORE);
                e.vel.add(
                    Math.cos(theta) * 10,
                    Math.sin(theta) * 10
                )
            }
        })
        // Reset the timer
        explosiveTimer = Config.EXPLOSION_TIMER_DELAY;
    }
}


/**
 * Method for starting the game and configuring the right variables
 */
function startGame() {
    entities = [player];
    setScore(0);
    let nameInput = document.getElementById('menu-start-name-input');
    playerName = nameInput.value.length >= nameInput.minLength ? nameInput.value : Config.DEFAULT_PLAYER_NAME;
    console.log("Starting game as " + playerName);
    PlayerData.WAVE = 1;

    // If the player decided to use a name, then we'll check whether the user exists,
    if (playerName !== Config.DEFAULT_PLAYER_NAME) {
        (async () => {

            let exists = await requestApi('checkuser', {idorname: playerName}).then(res => res.exists);

            // If the user doesn't exist, request a new user to be created.
            if (!exists)
                await requestApi('createuser', {name: playerName}).then(res => PlayerData.PLAYER_ID = res.userId)
            else {
                await requestApi('getuser', {name: playerName}).then(res => {
                    console.log("Retrieved user data");
                    PlayerData.PLAYER_ID = res.userData.userId;
                    PlayerData.HIGH_SCORE = res.userData.maxScore;
                    PlayerData.SCORE = res.userData.lastScore;
                    if (res.userData.statistics)
                        res.userData.statistics.map(stat => {
                            if (typeof Statistics[stat.field] === 'object')
                                Statistics[stat.field].value = stat.value
                        });
                })
            }

            // Check whether the retrieved id is valid, if so, start the score updater.
            if (PlayerData.PLAYER_ID > -1)
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
    return fetch(`${Config.API_URL}${param}`, {
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
    player.health = Config.DEFAULT_HEALTH;
    player.pos.translate(window.innerWidth/2, window.innerHeight/2);
    player.vel.translate(0, 0);
    entities = [player];
    setScore(0, 1);
}

/**
 * Method for retrieving a random direction vector.
 * @param thetaMin Minimum angle (in radians)
 * @param thetaMax Maximum angle (in radians)
 * @param rMin Minimum radius (in pixels)
 * @param rMax Maximum radius (in pixels)
 * @returns {number[]} Direction vector in the form [x, y]
 */
function randDir(thetaMin, thetaMax, rMin, rMax) {
    let theta = thetaMin + Math.random() * (thetaMax - thetaMin);
    let r = rMin + Math.random() * (rMax - rMin);
    return [r * Math.cos(theta), r * Math.sin(theta)];
}

/**
 * Method for showing a death animation for given entity.
 * @param {Entity} entity The entity in question that's died.
 */
function showDeathAnimation(entity) {

    let [dX, dY] = [0, 0];
    for (let i = 0; i < entity.size * 2; i++)
    {
        [dX, dY] = randDir(0, 2 * Math.PI, 10, 200);
        entities.push(new Particle(entity.pos.x, entity.pos.y, dX, dY, entity, Math.random() * 0.5, 1.2, entity.damageColor));
    }
}

/**
 * Method for showing hurt animation.
 * This is the same as the method above, with as only difference that the
 * amount of released particles is less.
 * @param {Entity} entity The entity for which to show the hurt animation
 */
function showHurtAnimation(entity) {
    let [dX, dY] = [0, 0];
    for (let i = 0; i < 10; i++) {
        [dX, dY] = randDir(0, 2 * Math.PI, 10, 50);
        entities.push(new Particle(entity.pos.x, entity.pos.y, dX, dY, entity, Math.random() * 0.5, 1.2, entity.damageColor));
    }
}

/**
 * Function for setting the score of the user
 * Also updates the high score if the score is higher than the current high score
 * @param {number} score new score
 * @param {number} [wave] The wave the player is on
 */
function setScore(score, wave = PlayerData.WAVE) {
    PlayerData.WAVE  = wave;
    PlayerData.SCORE = score;
    if (PlayerData.SCORE > PlayerData.HIGH_SCORE)
        PlayerData.HIGH_SCORE = PlayerData.SCORE;

    document.querySelector('.game-score-wave-value').innerText = `${PlayerData.WAVE}`;
    document.querySelector('.game-score-points-value').innerText = `${PlayerData.SCORE}`;
    document.querySelector('.game-score-high-value').innerText = `${PlayerData.HIGH_SCORE}`;
}

/**
 * Function for adding score of the player
 * @param {number} score How much score to add
 * @param {Entity} [e] Source from which the score was added
 */
function addScore(score, e = null) {
    setScore(PlayerData.SCORE += Math.abs(score));
    if (e)
        console.log("Score received from entity ", e);
}

/**
 * Method for drawing a rectangle onto the screen with provided color values
 * @param {number} x screen x-coordinate
 * @param {number} y screen y-coordinate
 * @param {number} width width of the rectangle
 * @param {number} height height of the rectangle
 * @param {number} rgb Color value. Can be provided as '0xRRGGBB' where [R, G, B] are in base-16
 * @param {number} opacity Opacity of the rectangle
 */
function drawRect(x, y, width, height, rgb, opacity = 1) {
    fill((rgb >> 16) & 0xff, (rgb >> 8) & 0xff, rgb & 0xff, opacity * 255);
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
 * @param rgb Color to draw
 * @param thickness Size of each segments
 */
function drawSegmentedLine(x0, y0, x1, y1,  rgb, thickness) {
    noStroke();
    fill((rgb >> 16) & 0xFF, (rgb >> 8) & 0xFF, rgb & 0xFF);
    let segments = Math.max(Math.abs(x1 - x0) / 6, Math.abs(y1 - y0) / 6);
    let dx = (x1 - x0) / segments;
    let dy = (y1 - y0) / segments;

    for (let i = 0, x, y; i < segments; i++) {
        [x, y] = [x0 + dx * i, y0 + dy * i];
        [x, y] = [x - x % thickness, y - y % thickness];
        rect(x, y, thickness, thickness);
    }
}