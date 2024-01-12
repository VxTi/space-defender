class Entity {

    // Private fields that represent this entity.
    #position;
    #velocity;
    #acceleration;
    #health;
    #size;
    #damageCooldown;
    #direction;
    #damageColor;
    #doDeathAnimation = false;
    #doHurtAnimation = false;
    #hurtInterval = 0.5;

    MINIMAP_SPRITE_INDEX = null;
    ENTITY_KILL_SCORE = 200;

    constructor(x, y, health, size = 20) {
        this.#position = new Vec2(x, y);
        this.#velocity = new Vec2();
        this.#acceleration = new Vec2();
        this.#direction = new Vec2();
        this.#health = health;
        this.#size = size;
        this.#damageColor = -1;
        this.#damageCooldown = 0;
    }
    update(dT) {
        this.#damageCooldown = Math.max(0, this.#damageCooldown - dT);
        if (this.pos.x < -mapWidth / 2 || this.pos.x > mapWidth / 2) {
            this.pos.x = Math.max(Math.min(this.pos.x, mapWidth / 2), -mapWidth / 2);
            this.vel.x = this.acceleration.x = 0;
        }
        if (this.pos.y < mapTop || this.pos.y > window.innerHeight - this.size/2) {
            this.pos.y = Math.max(Math.min(this.pos.y, window.innerHeight - this.size/2), mapTop);
            this.vel.y = this.acceleration.y = 0;
        }

        // Add the velocity to the position of the player
        this.pos.add(this.vel.x * dT, this.vel.y * dT);
        this.vel.add(this.acceleration.x * dT, this.acceleration.y * dT);
    }

    /**
     * Getter functions for private fields in this class.
     */
    get pos() { return this.#position; }
    get vel() { return this.#velocity; }
    get dir() { return this.#direction; }
    get health() { return this.#health; }
    get size() { return this.#size; }
    get acceleration() { return this.#acceleration; }
    get alive() { return this.#health > 0; }

    get damageCooldown() { return this.#damageCooldown; }

    get damageColor() { return this.#damageColor; }
    set damageColor(newValue) { this.#damageColor = newValue; }

    get canDamage() { return this.#damageCooldown <= 0; }

    set hurtInterval(a) { this.#hurtInterval = a; }

    set deathAnimations(state) { this.#doDeathAnimation = state; }
    set hurtAnimations(state) { this.#doHurtAnimation = state; }

    set health(a) { this.#health = a; }

    /**
     * Method for killing this entity.
     */
    terminate() {
        this.#health = 0;

        // Check if an 'onDeath' function exists, if so, call it.
        if (typeof this['onDeath'] === 'function')
            this['onDeath']();

        // Check whether death animations are enabled, if so, show them.
        if (this.#doDeathAnimation)
            showDeathAnimation(this);
    }

    /**
     * Function for damaging this entity
     * @param {number} amount How much to damage to deal to this entity
     */
    damage(amount) {
        // If already dead, stop
        if (!this.alive || !this.canDamage)
            return;

        // do the harm >:)
        this.#health = Math.max(0, this.#health - amount);
        this.#damageCooldown = this.#hurtInterval

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
        } else {
            // Same check as above, though this one is for hurt animations
            if (this.#doHurtAnimation)
                showHurtAnimation(this);
        }
    }

    /**
     * Method for checking whether another entity is within reach (for interaction)
     * @param {Entity} other The entity to check the distance for
     * @param {number} [offset] The offset added to the distance check. This is for when
     * one wants to implement additional reach for certain entities.
     */
    withinRange(other, offset = 0) {
        // Check whether D(a, b) <= Ra + Rb + delta
        return this.pos.distSq(player.pos) <= Math.pow(other.size / 2 + this.size / 2 + offset, 2)
    }
}