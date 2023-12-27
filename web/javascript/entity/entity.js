class Entity {

    // Private fields that represent this entity.
    #position;
    #velocity;
    #acceleration;
    #health;
    #size;
    #damage_cooldown;
    #direction;

    MINIMAP_SPRITE_INDEX = null;
    ENTITY_KILL_SCORE = 200;
    #doDeathAnimation = false;

    constructor(x, y, health, size = 20) {
        this.#position = new Vec2(x, y);
        this.#velocity = new Vec2();
        this.#acceleration = new Vec2();
        this.#direction = new Vec2();
        this.#health = health;
        this.#size = size;
        this.#damage_cooldown = 0;
    }
    update(dT) {
        this.#damage_cooldown = Math.max(0, this.#damage_cooldown - dT);
        this.pos.x = Math.max(Math.min(this.pos.x, mapWidth / 2), -mapWidth / 2);
        this.pos.y = Math.max(Math.min(this.pos.y, window.innerHeight - this.size/2), mapTop);

        // Add the velocity to the position of the player
        this.pos.add(this.vel.x * dT, this.vel.y * dT);
        this.vel.add(this.acceleration.x * dT, this.acceleration.y * dT);
        //this.acceleration.translate(-this.acceleration.x * dT, -this.acceleration.y * dT);
    }

    /**
     * Getter functions for private fields in this class.
     */
    get pos() { return this.#position; }
    get vel() { return this.#velocity; }
    get dir() { return this.#direction; }
    get health() { return this.#health; }
    get size() { return this.#size; }
    set health(a) { this.#health = a; }
    get acceleration() { return this.#acceleration; }

    get alive() { return this.#health > 0; }

    set deathAnimations(state) { this.#doDeathAnimation = state; }

    get damageCooldown() { return this.#damage_cooldown; }

    get canDamage() { return this.#damage_cooldown <= 0; }

    /**
     * Function for damaging this entity
     */
    damage(amount) {
        // If already dead, stop
        if (!this.alive || !this.canDamage)
            return;

        // do the harm >:)
        this.#health = Math.max(0, this.#health - amount);
        this.#damage_cooldown = 0.5;

        // For when the entity is hurt and is still alive,
        // call the 'onDamage' method (if present)
        if (typeof this['onDamage'] === 'function')
            this['onDamage'](amount);

        // If the entity has died from the damage, do some other checks
        if (!this.alive) {

            // Check if an 'onDeath' function exists, if so, call it.
            if (typeof this['onDeath'] === 'function')
                this['onDeath']();

            // then check if it's dead and animations are present
            if (this.#doDeathAnimation)
                showDeathAnimation(this);
        }
    }
}