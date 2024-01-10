


class Spaceship extends Entity {

    #facing = 1;
    #movingAnimation = 0;
    MINIMAP_SPRITE_INDEX = [0, 1];

    // The size of the entity, in pixels
    static SHIP_SIZE = 80;
    static MOVEMENT_SPEED = new Vec2(600, 600);
    static WEAPON_OFFSET = new Vec2(Spaceship.SHIP_SIZE * 0.275,0);  // Position of the weapon, in relative fractions
    static ACCELERATION_MULTIPLIER = 0.95;
    static VELOCITY_THRESHOLD = 0.2;
    static EDGE_SCROLL_OFFSET = 0.3;


    /**
     * Object containing all the statistical properties of this spaceship.
     * These can be viewed in the 'statistics' tab in-game.
     */
    statistics = {
        rocketsFired:     ['Rockets Fired', 0],
        damageDealt:      ['Damage Dealt', 0],
        damageReceived:   ['Damage Received', 0],
        entitiesKilled:   ['Overall Kills', 0],
        aliensKilled:     ['Aliens Slaughtered', 0],
        enemyShipsKilled: ['Enemy Ships Destroyed', 0]
    }

    constructor(x, y, health) {
        super(x, y, health, Spaceship.SHIP_SIZE);
        this.deathAnimations = true;
        this.damageColor = 0x405060;
    }

    update(dT) {
        if (!this.alive)
            return;

        super.update(dT);
        resources['spritesheet'].drawSection(this.pos.x - this.size / 2, this.pos.y - this.size / 2, this.size, this.size, this.#facing < 0 ? 1  : 0, 0);

        this.#facing = this.dir.x !== 0 ? this.dir.x: this.#facing;
        this.#movingAnimation = (this.#movingAnimation + dT * 10) % 4;

        this.acceleration.translate(this.dir.x * Spaceship.MOVEMENT_SPEED.x, this.dir.y * Spaceship.MOVEMENT_SPEED.y);

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
            resources['spritesheet'].drawSection(this.pos.x - (this.#facing + 0.5) * this.size, this.pos.y - this.size / 2, this.size, this.size, Math.floor(this.#movingAnimation), this.#facing < 0 ? 4 : 3);

        // Make the screen move if the player comes too close to the edges
        if (this.pos.x + screenOffsetX <= window.innerWidth * Spaceship.EDGE_SCROLL_OFFSET)
            screenOffsetX = -this.pos.x + window.innerWidth * Spaceship.EDGE_SCROLL_OFFSET;
        else if (this.pos.x + screenOffsetX >= window.innerWidth * (1.0 - Spaceship.EDGE_SCROLL_OFFSET))
            screenOffsetX = -this.pos.x + window.innerWidth * (1.0 - Spaceship.EDGE_SCROLL_OFFSET);

    }

    // Nothing too interesting, just update some statistics.
    onDamage(amount) {
        this.statistics.damageReceived[1] += amount;
    }

    shoot() {
        if (!this.alive)
            return;

        entities.push(new Rocket(this));
        this.statistics.rocketsFired[1]++;
    }

    get facing() { return this.#facing; }

    onDeath() {
        let element = document.querySelector('.game-event-indicator');
        element.innerHTML = 'Game over<br>';
        setTimeout(() => {
            element.innerHTML += 'Respawning...<br>'
            setTimeout(() => {
                element.innerHTML = '';
                respawn();
            }, 1000);
        }, 1000);
    }

}