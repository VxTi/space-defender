class Rocket extends Entity {

    // Private fields that represent this rocket.
    #trailX;
    #source;
    #velocity;
    #facing;
    #damage;


    static ROCKET_SPEED = 1100;

    /**
     * Constructor for creating a new rocket.
     * Rocket must be coming from a spaceship (obviously)
     * @param {Spaceship} source The spaceship that shoots the rocket
     * @param {number?} damage The amount of damage the rocket deals
     */
    constructor(source, damage = 1) {
        super(source.pos.x + Spaceship.WEAPON_OFFSET.x, source.pos.y + Spaceship.WEAPON_OFFSET.y, (window.innerWidth / Rocket.ROCKET_SPEED) + 1);
        this.#trailX = this.pos.x
        this.#velocity = /*source.vel.x + */Rocket.ROCKET_SPEED * source.facing;
        this.#damage = damage;
        this.#facing = source.facing;
        this.#source = source;
    }

    update(dT) {
        //this.health = (this.#trailX >= -mapWidth/2 && this.#trailX <= mapWidth / 2) ? 1 : 0;
        this.health = Math.max(0, this.health - dT);
        let dw = Math.abs(this.pos.x - this.#trailX);
        resources['spritesheet'].drawSection(Math.min(this.#trailX, this.pos.x), this.pos.y, dw, 4, this.#facing < 0 ? 2 : 1, 2);
        drawRect(this.pos.x + 4, this.pos.y - 2, 4, 4, -1, Math.min(1, this.health));

        // Check for collision with entities.
        for (let e of entities) {
            // Check if it's a hit-able entity. If not, continue to the next.
            if (!this.#canHit(e))
                continue;

            // Check if the rocket collides with the entity in its path
            if (this.#collidesWith(e, dT)) {
                e.damage(this.#damage);
                Statistics.damageDealt.value += this.#damage; // Take measurements !!!
                if (!e.alive) {
                    addScore(e.ENTITY_KILL_SCORE);
                    Statistics.entitiesKilled.value++; // Take measurements!!!
                    Statistics.killDeathRatio.value = Statistics.entitiesKilled.value / Math.max(1, Statistics.timesDied.value);

                    if (e instanceof Alien)
                        Statistics.aliensKilled.value++;
                    else if (e instanceof EnemyShip)
                        Statistics.enemyShipsKilled.value++;
                    else if (e instanceof EvolvedAlien)
                        Statistics.evolvedAliensKilled.value++;
                }
                this.health = 0;
                return;
            }
        }
        // Update the position of the rocket and its trail.
        this.pos.x += this.#velocity * dT;
        this.#trailX += this.#velocity * dT * 0.5;
    }

    /**
     * Method for checking whether the rocket collides with an entity
     * @param {Entity} entity The entity to check collision with
     * @param {number} dT The time passed since last frame, in seconds
     * @returns {boolean} Whether it successfully collides with the entity
     */
    #collidesWith(entity, dT) {
        return (
            this.pos.y >= entity.pos.y - entity.size / 2 - 1 &&
            this.pos.y <= entity.pos.y + entity.size / 2 + 1 &&
            this.pos.x + Rocket.ROCKET_SPEED * dT / 2 >= entity.pos.x - entity.size / 2 &&
            this.pos.x - Rocket.ROCKET_SPEED * dT / 2 <= entity.pos.x + entity.size / 2
        );
    }

    /**
     * Method for checking whether the rocket can actually damage
     * the entity in question
     * @param {Entity} entity The entity to check
     * @returns {boolean} Whether the entity can be hit or not
     */
    #canHit(entity){
        return !(entity instanceof Particle || entity instanceof Rocket || entity instanceof Spaceship)//(entity instanceof Alien || entity instanceof EnemyShip || entity instanceof EvolvedAlien);
    }
}