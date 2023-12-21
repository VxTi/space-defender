class Entity {

    #position;
    #velocity;
    #acceleration;
    #health;
    #size;

    MINIMAP_SPRITE_INDEX = null;

    #doDeathAnimation = false;

    constructor(x, y, health, size = 20) {
        this.#position = new Vec2(x, y);
        this.#velocity = new Vec2();
        this.#acceleration = new Vec2();
        this.#health = health;
        this.#size = size;
    }
    update(dT) {
        this.#velocity.add(this.#acceleration.x, this.#acceleration.y);
        this.#position.add(this.#velocity.x, this.#velocity.y);
        this.#velocity.translate(0, 0);
    }



    /**
     * Getter functions for private fields in this class.
     */
    get pos() { return this.#position; }
    get vel() { return this.#velocity; }
    get health() { return this.#health; }
    get size() { return this.#size; }
    get acceleration() { return this.#acceleration; }

    get alive() { return this.#health > 0; }

    set deathAnimations(state) { this.#doDeathAnimation = state; }

    /**
     * Function for damaging this
     */
    damage(amount) {
        // If already dead, stop
        if (!this.alive)
            return;

        // do the harm >:)
        this.#health = Math.max(0, this.#health - amount);

        // then check if it's dead and animations are present
        if (!this.alive && this.#doDeathAnimation) {
            console.log("Death: ", this);
            for (let i = 0; i < this.#size * 2; i++)
                entities.push(new Particle(this, this.#size/2, Math.random(), this.#size/10));
        }

        if (typeof this['onDamage'] === 'function')
            this['onDamage']();
    }

}