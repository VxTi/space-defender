let apiKey = 'dcdc91a618b4c9830fcc2e20';
let windowSegments = 50;

let pixelPerCm;  // How many pixels a physical centimeter occupy.

let mapWidth;                   // Size of the map in pixels
let mapHeight;                  // Height of the map. This is mapTop - mapBottom(x)
let mapTop = 150;               // Top of the map, in pixels.
let innerMapWidth = 600;        // Width of the inner map in pixels
let innerMapTop = 50;           // Top of the inner map

// Configuration settings for the game.
const Config = {
    EXPLOSION_PARTICLE_COLOR: 0x00FF00,     // Color of the explosion effect particles
    EXPLOSION_TIMER_DELAY: 5,               // Delay in seconds until the explosive effect can be used.
    EXPLOSION_RADIUS: 200,                  // Explosion radius of the explosive effect in pixels.
    EXPLOSION_PARTICLE_COUNT: 50,           // How many particles to spawn when the explosive effect is used.
    STAR_COUNT: 200,                        // How many stars to spawn in the background
    SHOOT_FREQUENCY: 5,                     // How many bullets the spaceship can shoot each second
    DEFAULT_HEALTH: 5,                      // Default health of the player
    DEFAULT_PLAYER_NAME: 'Guest',           // Default name of the player if they haven't chosen one
    API_URL: 'http://localhost:8081/api/',  // URL of the API
    WAVE_MAX_ENTITIES: 200,                 // Maximum amount of entities that can spawn in a wave
    WAVE_MIN_ENTITIES: 5,                   // Minimum amount of entities that can spawn in a wave
    WAVE_INCREMENT_FACTOR: 1.5,             // Factor by which the amount of entities increases per wave
    DEFAULT_WAVE: 1,                        // Default wave the player starts on
    MASTER_VOLUME: 0.2,                     // Master volume of the game
    OFFLINE_MODE: false                     // Whether the game is in offline mode or not
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
    // How many times the ship has been hit by a rock
    rocksCollided: {
        name: 'Rocks Collided With',
        value: 0
    },
    explosionsUsed: {
        name: 'Explosions Used',
        value: 0
    },
    entitiesBlownUp: {
        name: 'Entities Blown Up',
        value: 0
    },
    minutesPlayed: {
        name: 'Minutes Played',
        value: 0
    }
}

let player; // The player object

/**
 * Object containing all the scores of the player.
 * @type {{WAVE: number, SCORE: number, HIGH_SCORE: number, PLAYER_ID: number, NAME: string}}
 */
const PlayerData = {
    HIGH_SCORE: 0,                      // High score of the player
    SCORE: 0,                           // Current score of the player
    WAVE: 1,                            // Current wave the player is on
    PLAYER_ID: -1,                      // ID of the player. This is used for API calls.
    NAME: Config.DEFAULT_PLAYER_NAME    // Name of the player
}

let waveEntitiesRemaining = 0;

let screenOffsetX = 0;

// Whether the game is currently active
let gameActive = false;

// Object where all resources are stored in at preload
let resources = {}; // Here are all images stored as Resource objects
let audioFiles = {};     // Here are all audio files stored as p5 SoundFile objects
let sprite;

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

/**
 * Method for setting the master volume of the game.
 * @param {number} volume The volume to set the game to. This is a value between 0 and 1.
 */
function setVolume(volume)  {
    Config.MASTER_VOLUME = volume;
    Object.values(audioFiles).forEach(sound => sound.setVolume(volume));
}

isOnScreen = (x, y) => x.isBetween(screenOffsetX, screenOffsetX + window.innerWidth) && y.isBetween(0, window.innerHeight);

// Noise function for the bottom of the screen
GNoise = (x) => noise(x / 3) * 200;

function preload() {
    loadImage('./assets/spritesheet.png', (img) => {
        sprite = new Resource(img, 10, 10);
    });

    // Load all audio
    const audioFileNames = [
        'death', 'explosion', 'hit',
        'navigate1', 'navigate2',
        'shoot', 'spaceshipFlying', 'scary',
        'health_element_pickup', 'entity_kill',
        'wave_complete'
    ];
    for (let file of audioFileNames)
        audioFiles[file] = loadSound(`./assets/soundpack/${file}.wav`);

    setVolume(Config.MASTER_VOLUME);
}

/**
 * Main setup method. Here we load resources and initialize variables.
 */
function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    window.addEventListener('resize', () => resizeCanvas(window.innerWidth, window.innerHeight));
    
    pixelPerCm = document.querySelector('.pixel-size').clientWidth;
    mapWidth = 200 * pixelPerCm; // 1 physical meter wide.
    mapHeight = window.innerHeight - mapTop;

    noSmooth(); // prevent pixel-smoothing (this makes images look wacky)
    pixelDensity(1);
    frameRate(120);

    player = new Spaceship(100, window.innerHeight/2, 5);
    entities.push(player);

    document.onkeydown = (event) => {
        // Check if we've hit the space-bar (shoot) and if there's enough time elapsed
        if (!gameActive)
            return;
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
    };

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

    let hueElements = document.querySelectorAll('.hue-element');
    let hueDeg = 0;

    /** -- FUNCTIONALITY -- CHANGE COLOR OF SCORE BAR -- **/
    setInterval(() => {
        hueElements.forEach(e => e.style.color = `hsl(${hueDeg}deg, 100%, 50%)`)
        hueDeg = (hueDeg + 50) % 360;
    }, 500);

    let scary = () => {
        if (gameActive) {
            playSound('scary', 0.5);
            clearInterval(scary);
            setInterval(scary, 10000 + Math.random() * 10000);
            console.log('playing scary sound')
        }
    }
    setInterval(scary, 10000 + Math.random() * 10000);
}

/**
 * Main Rendering loop.
 * Here we draw all objects in the game and update their properties.
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

    sprite.drawSection(midX + (player.pos.x) * mapCoordinateFrac - innerMapHeight/2, innerMapTop - 1, innerMapHeight, innerMapHeight, 0, 2)

    /** -- SECTION -- RENDERING LIVES -- **/
    for (let i = 0, s = 200 / Config.DEFAULT_HEALTH; i < player.health; i++)
        sprite.animate(midX - innerMapRadius - 215 + s * i, mapTop - 22 - s, s, s, 0);

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

    /** -- SECTION -- UPDATING ENTITIES AND RENDERING MAP -- **/
    for (let i = entities.length - 1; i >= 0; i--) {
        let e = entities[i];

        // If the entity is dead, remove it from the game
        if (!e.alive && e !== player)
            entities.splice(i, 1);
        else {
            // If the entity has a minimap sprite image, draw it on the minimap
            if (e.MINIMAP_SPRITE_INDEX != null && typeof e.MINIMAP_SPRITE_INDEX === 'object')
                sprite.drawSection(
                    midX + e.pos.x * mapCoordinateFrac - screenOffsetX - 15,
                    innerMapTop + Math.round((e.pos.y - mapTop - 30) / (window.innerHeight - mapTop) * innerMapHeight) - 15, 30, 30,
                    e.MINIMAP_SPRITE_INDEX[0], e.MINIMAP_SPRITE_INDEX[1]
                );
        }
        e.update(dT)
    }
}

/**
 * Method for introducing a new entity wave into the game.
 * This method is called when the player has killed all entities in the current wave.
 * Whenever this function is called, it introduces a specified amount of entities, depending
 * on the coefficients defined in the Config object.
 */
function commenceWave() {
    // Amount of entities that spawn per wave is linearly increasing.
    // This follows the equation ax + b, where a = Config.WAVE_INCREMENT_FACTOR and b = Config.WAVE_MIN_ENTITIES
    // The maximum amount of entities is capped at Config.WAVE_MAX_ENTITIES
    let entityCount = Math.round(Math.min(PlayerData.WAVE * Config.WAVE_INCREMENT_FACTOR + Config.WAVE_MIN_ENTITIES, Config.WAVE_MAX_ENTITIES));

    // Remove all previous power-ups from the game, only leave the player behind.
    entities = [player];

    waveEntitiesRemaining = 0;

    console.log(`Commencing wave, spawning ${entityCount} entities`)

    broadcast(`Wave ${PlayerData.WAVE} incoming!`, 2000);

    // Array containing the factors which determine how many of which entities spawn.
    // The order of the entities is as followed:
    // 0: Alien, 1: EnemyShip, 2: EvolvedAlien, 3: HealthElement
    // Sum of the elements must be equal to 1
    let factors = [0.4, 0.3, 0.2, 0.1];

    // Array containing the amount of entities to spawn per entity type
    let entitiesToSpawn = Array(4).fill(0).map((_, i) => Math.round(entityCount * factors[i]));

    // Iterate over all elements in the entitiesToSpawn array and introduce them into the game.
    for (let i = 0; i < entitiesToSpawn.length; i++) {
        for (let j = 0; j < entitiesToSpawn[i]; j++) {
            if (i < 3) waveEntitiesRemaining++;
            let [x, y] = [-mapWidth / 2 + Math.random() * mapWidth, mapTop + Math.random() * mapHeight];

            let entity;
            switch (i) {
                case 0: entities.push(entity = new Alien(x, y)); break;
                case 1: entities.push(entity = new EnemyShip(x, y)); break;
                case 2: entities.push(entity = new EvolvedAlien(x, y)); break;
                case 3: entities.push(new HealthElement(x, y, 1)); break;
            }
            // If it's a health element, we don't want to add it to the waveEntitiesRemaining counter.
            if (entity !== undefined) {
                entity.onDeath = () => {
                    if (!player.alive)
                        return;
                    waveEntitiesRemaining--;
                    broadcast(`Entities Remaining: ${waveEntitiesRemaining}`, 300);
                    if (waveEntitiesRemaining <= 0) {
                        messageQueue = [];
                        broadcast('Wave completed!', 1700);
                        playSound('wave_complete');
                        setTimeout(() => {
                            setScore(PlayerData.SCORE, ++PlayerData.WAVE);
                            player.health = Config.DEFAULT_HEALTH;
                            commenceWave();
                        }, 2000);
                    }
                }
            }
        }
    }
}

/**
 * Function for updating the score of the player.
 * This only works when the player has selected a name for themselves,
 * and one is connected to the internet.
 */
function scoreUpdater() {

    Statistics.minutesPlayed = Math.round(msElapsed / 60000);

    // Check if the player has selected a name, if not, don't update the score.
    if (PlayerData.NAME === Config.DEFAULT_PLAYER_NAME || !gameActive || Config.OFFLINE_MODE)
        return;

    // Send the score to the server
    requestApi('updatescore', {userId: PlayerData.PLAYER_ID, score: PlayerData.SCORE, wave: PlayerData.WAVE})
        .catch(e => console.error(e));
    let stats = Object.entries(Statistics).map(([key, value]) => ({field: key, value: value.value}));
    requestApi('updatestatistics', {userId: PlayerData.PLAYER_ID, userName: PlayerData.NAME, statistics: stats})
        .catch(e => console.error(e));
}

/**
 * Method for performing the explosion effect once the explosion progress has reached 100%
 * This method checks which entities are within range of the explosion, and damages them accordingly.
 * Also introduces particles into space.
 */
function performExplosion() {
    if (explosiveTimer <= 0 && player.alive) {

        playSound('explosion');
        Statistics.explosionsUsed.value++;
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
            if (e instanceof Particle || !e.alive || e === player || e instanceof HealthElement)
                return;

            // Check whether the entity is within distance of the player
            let dist = e.pos.dist(player.pos);
            if (dist <= Config.EXPLOSION_RADIUS)  {
                theta = Math.atan2((e.pos.y - player.pos.y), (e.pos.x - player.pos.x));
                e.damage(1);
                if (!e.alive && typeof player['onEntityKill'] === 'function') {
                    player['onEntityKill'](e);
                    Statistics.entitiesBlownUp.value++;
                }
                e.vel.add(Math.cos(theta) * (Config.EXPLOSION_RADIUS - dist) * 0.2, Math.sin(theta) * (Config.EXPLOSION_RADIUS - dist) * 0.2);
            }
        })
        // Reset the timer
        explosiveTimer = Config.EXPLOSION_TIMER_DELAY;
    }
}


/**
 * Method for starting the game and configuring the right variables.
 * This method attempts to retrieve data from the database. If there is any data present
 * of the provided player name, it will retrieve that player and set the statistics accordingly.
 */
function startGame() {
    let nameInput = document.getElementById('menu-start-name-input');

    // Check whether the user has provided a name, if not, use the default name.
    // If the user did provide a name, capitalize the first letter and make the rest lowercase.
    PlayerData.NAME = nameInput.value.length > 0 ?
        (nameInput.value.charAt(0).toUpperCase().concat(nameInput.value.toLowerCase().substring(1)))
        : Config.DEFAULT_PLAYER_NAME;

    broadcast(`Welcome, ${PlayerData.NAME}!`, 1000);

    // Hide the custom keyboard
    hideKeyboard();
    // reset statistics
    Object.entries(Statistics).forEach(([key, value]) => value.value = 0);

    // If the player decided to use a name, then we'll check whether the user exists,
    if (PlayerData.NAME !== Config.DEFAULT_PLAYER_NAME) {
        (async () => {

            await requestApi('checkuser', {idorname: PlayerData.NAME})
                .then(exists => {
                if (exists) {

                } else {
                    requestApi('createuser', {name: PlayerData.NAME})
                        .then(res => PlayerData.PLAYER_ID = res.userId)
                        .catch(e => console.error(e));
                }
            }).catch(e => {
                console.warn("Failed to fetch check user request.");
            })

            let exists = await requestApi('checkuser', {idorname: PlayerData.NAME}).then(res => res.exists).catch(e => false) || false;

            // If the user doesn't exist, request a new user to be created.
            if (!exists)
                await requestApi('createuser', {name: PlayerData.NAME}).then(res => PlayerData.PLAYER_ID = res.userId).catch(e => console.error(e));
            else {
                await requestApi('getuser', {name: PlayerData.NAME}).then(res => {
                    console.log("Retrieved user data");
                    PlayerData.PLAYER_ID = res.userData.userId;
                    PlayerData.HIGH_SCORE = res.userData.maxScore;
                    if (res.userData.statistics)
                        res.userData.statistics.map(stat => {
                            if (typeof Statistics[stat.field] === 'object')
                                Statistics[stat.field].value = stat.value
                        });
                }).catch(e => {
                    console.error(e);
                    PlayerData.PLAYER_ID = -1;
                })
            }

            // Check whether the retrieved id is valid, if so, start the score updater.
            if (PlayerData.PLAYER_ID > -1)
                setInterval(scoreUpdater, 5000);
        })();
    }
    spawn(); // spawn the player
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: apiKey,  ...content })
    })
        .then(res => res.json())
        .catch(e => console.error(e));
}

/**
 * Method for respawning the player and resetting some variables.
 * This also sets the player score to 0 and updates the text on screen,
 * resets the player health and sets the player position to the center of the screen.
 */
function spawn() {
    player.health = Config.DEFAULT_HEALTH;
    player.pos.translate(window.innerWidth/2, window.innerHeight/2);
    player.vel.translate(0, 0);
    player.acceleration.translate(0, 0);
    entities = [player];
    PlayerData.HIGH_SCORE = 0; // Reset high-score
    setScore(0, Config.DEFAULT_WAVE);
    commenceWave()
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
 */
function addScore(score) {
    setScore(PlayerData.SCORE += Math.abs(score));
}

/**
 * Method for playing a sound effect. An intensity can be provided to change how loud the sound plays
 * relative to the master volume.
 * @param {string} sound Name of the sound effect to play
 * @param {number} [intensity] Intensity of the sound effect. Ranges between 0 and 1
 */
function playSound(sound, intensity = 1) {
    if (typeof audioFiles[sound] === 'undefined'){
        console.error(`Sound file '${sound}' doesn't exist`);
    } else {
        audioFiles[sound].setVolume(intensity * Config.MASTER_VOLUME);
        audioFiles[sound].play();
    }
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