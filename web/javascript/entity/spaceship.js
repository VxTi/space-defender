


class Spaceship extends Entity {

    #facing = 1;
    #movingAnimation = 0;
    MINIMAP_SPRITE_INDEX = [0, 1];

    static SHIP_SIZE = 80; // The size of the entity, in pixels
    static MOVEMENT_SPEED = new Vec2(600, 600);
    static WEAPON_OFFSET = new Vec2(Spaceship.SHIP_SIZE * 0.275,0);  // Position of the weapon, in relative fractions
    static ACCELERATION_MULTIPLIER = 0.95;
    static VELOCITY_THRESHOLD = 0.2;
    static EDGE_SCROLL_OFFSET = 0.3;

    /**
     * Constructor for the spaceship.
     * @param {number} x The x coordinate of the spaceship.
     * @param {number} y The y coordinate of the spaceship.
     * @param {number} health The health of the spaceship.
     */
    constructor(x, y, health) {
        super(x, y, health, Spaceship.SHIP_SIZE);
        this.deathAnimations = true;
        this.damageColor = 0x405060;
        this.hurtInterval = 0.5;
    }

    /**
     * Method for updating the spaceship's properties and drawing it on the screen.
     * Also moves the screen once the player comes too close to it.
     * @param {number} dT The time passed since the last update, in seconds.
     */
    update(dT) {
        if (!this.alive)
            return;

        super.update(dT);
        sprite.drawSection(this.pos.x - this.size / 2, this.pos.y - this.size / 2, this.size, this.size, this.#facing < 0 ? 1  : 0, 0);

        this.#facing = this.dir.x !== 0 ? this.dir.x: this.#facing;
        this.#movingAnimation = (this.#movingAnimation + dT * 10) % 4;

        this.acceleration.translate(this.dir.x * Spaceship.MOVEMENT_SPEED.x, this.dir.y * Spaceship.MOVEMENT_SPEED.y);

        if (!audioFiles['spaceshipFlying'].isPlaying()) {
            if ((Math.abs(this.vel.x) >= Spaceship.VELOCITY_THRESHOLD || Math.abs(this.vel.y) >= Spaceship.VELOCITY_THRESHOLD))
                audioFiles['spaceshipFlying'].play();
        } else {
            audioFiles['spaceshipFlying'].setVolume(Math.max(0, Config.MASTER_VOLUME * 0.4 * (Math.abs(this.vel.x) + Math.abs(this.vel.y)) / Spaceship.MOVEMENT_SPEED.x));
        }
        if (Math.abs(this.acceleration.x) <= Spaceship.VELOCITY_THRESHOLD && this.dir.x.isZero()) {
            this.vel.x *= Spaceship.ACCELERATION_MULTIPLIER;
            this.acceleration.x *= Spaceship.ACCELERATION_MULTIPLIER;
        }
        if (Math.abs(this.acceleration.y) <= Spaceship.VELOCITY_THRESHOLD && this.dir.y.isZero()) {
            this.vel.y *= Spaceship.ACCELERATION_MULTIPLIER;
            this.acceleration.y *= Spaceship.ACCELERATION_MULTIPLIER;
        }

        // If we're moving, draw the fire animation behind the ship
        if (Math.abs(this.vel.x) > Spaceship.VELOCITY_THRESHOLD || Math.abs(this.vel.y) > Spaceship.VELOCITY_THRESHOLD)
            sprite.drawSection(this.pos.x - (this.#facing + 0.5) * this.size, this.pos.y - this.size / 2, this.size, this.size, Math.floor(this.#movingAnimation), this.#facing < 0 ? 4 : 3);

        // Make the screen move if the player comes too close to the edges
        if (this.pos.x + screenOffsetX <= window.innerWidth * Spaceship.EDGE_SCROLL_OFFSET)
            screenOffsetX = -this.pos.x + window.innerWidth * Spaceship.EDGE_SCROLL_OFFSET;
        else if (this.pos.x + screenOffsetX >= window.innerWidth * (1.0 - Spaceship.EDGE_SCROLL_OFFSET))
            screenOffsetX = -this.pos.x + window.innerWidth * (1.0 - Spaceship.EDGE_SCROLL_OFFSET);

    }

    /**
     * Method for handling the damage to the spaceship.
     * This happens when the spaceship is hit by another entity or rock.
     * Updates the statistics and plays a sound.
     * @param {number} amount The amount of damage dealt to the spaceship.
     */
    onDamage(amount) {
        Statistics.damageReceived.value += amount;
        playSound('hit');
    }

    /**
     * Method for handling the killing of another entity.
     * This happens when a rocket launched by this spaceship hits another entity.
     * @param {Entity} entity The entity that was killed.
     */
    onEntityKill(entity) {
        addScore(entity.ENTITY_KILL_SCORE);
        Statistics.entitiesKilled.value++; // Take measurements!!!
        Statistics.killDeathRatio.value = Statistics.entitiesKilled.value / Math.max(1, Statistics.timesDied.value);
        playSound('hit');
        if (entity instanceof Alien)
            Statistics.aliensKilled.value++;
        else if (entity instanceof EnemyShip)
            Statistics.enemyShipsKilled.value++;
        else if (entity instanceof EvolvedAlien)
            Statistics.evolvedAliensKilled.value++;
    }

    /**
     * Method for shooting a rocket.
     * This introduces a rocket into the game, updates the statistics and plays a sound.
     */
    shoot() {
        if (!this.alive)
            return;
        playSound('shoot');
        entities.push(new Rocket(this));
        Statistics.rocketsFired.value++;
    }

    /**
     * Getter for the facing direction of the spaceship.
     * @returns {number} The facing direction of the spaceship.
     */
    get facing() { return this.#facing; }

    /**
     * Method for handling the death of the spaceship.
     * This method plays a sound, updates the statistics, displays text and respawns the spaceship.
     */
    onDeath() {
        playSound('death');
        Statistics.timesDied.value++;
        broadcast('Game over!', 1000);
        broadcast('Respawning in 3...');
        broadcast('Respawning in 2...');
        broadcast('Respawning in 1...');
        setTimeout(spawn, 3000);
    }

}