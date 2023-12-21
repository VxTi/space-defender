class Entity {

    #position;
    #velocity;
    #acceleration;
    #health;
    #size;

    MINIMAP_SPRITE_INDEX = null;

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

    /**
     * Function for damaging this
     */
    damage(amount) {
        this.#health = Math.max(0, this.#health - amount);

        if (typeof this['onDamage'] === 'function')
            this['onDamage']();
    }

}