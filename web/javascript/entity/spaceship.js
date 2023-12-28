


class Spaceship extends Entity {

    #facing = 1;
    #movingAnimation = 0;
    MINIMAP_SPRITE_INDEX = [0, 1];

    // The size of the entity, in pixels
    static SHIP_SIZE = 80;
    static MOVEMENT_SPEED = new Vec2(400, 200);
    static WEAPON_OFFSET = new Vec2(Spaceship.SHIP_SIZE * 0.55, Spaceship.SHIP_SIZE*0.57);  // Position of the weapon, in relative fractions

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
        super.update(dT);
        if (!this.alive)
            return;
        resources['spritesheet'].drawSection(this.pos.x, this.pos.y, this.size, this.size, this.#facing < 0 ? 1  : 0, 0);

        this.#facing = this.dir.x !== 0 ? this.dir.x: this.#facing;
        this.#movingAnimation = (this.#movingAnimation + dT * 10) % 4;

        this.acceleration.translate(this.dir.x * Spaceship.MOVEMENT_SPEED.x, this.dir.y * Spaceship.MOVEMENT_SPEED.y);

        // If we're moving, draw the moving animation
        if (Math.abs(this.vel.x) > 0.1 || Math.abs(this.vel.y) > 0.1)
            resources['spritesheet'].drawSection(this.pos.x - this.#facing * this.size, this.pos.y, this.size, this.size, Math.floor(this.#movingAnimation), this.#facing < 0 ? 4 : 3);

        if (this.pos.x + screenOffsetX <= window.innerWidth * 0.1)
            screenOffsetX = -this.pos.x + window.innerWidth * 0.1;
        else if (this.pos.x + screenOffsetX >= window.innerWidth * 0.9)
            screenOffsetX = -this.pos.x + window.innerWidth * 0.9;
    }

    onDamage(amount) {
        this.statistics.damageReceived[1] += amount;
    }

    shoot() {
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