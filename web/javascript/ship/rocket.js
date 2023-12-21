class Rocket extends Entity {

    // Private fields that represent this rocket.
    #originX;
    #source;
    #alive = true;
    #facing;

    static ROCKET_SPEED = 600;
    static ROCKET_TRAIL_DISTANCE = 300;

    /**
     * Constructor for creating a new rocket.
     * Rocket must be coming from a spaceship (obviously)
     * @param {Spaceship} source The spaceship that shoots the rocket
     */
    constructor(source) {
        super(source.pos.x + Spaceship.WEAPON_OFFSET.x, source.pos.y + Spaceship.WEAPON_OFFSET.y);
        this.#originX = this.pos.x
        this.#facing = source.facing;
        this.#source = source;
    }

    update(dT) {
        if (!this.#alive)
            return;

        this.pos.addX(Rocket.ROCKET_SPEED * dT * this.#facing);
        this.#originX += Rocket.ROCKET_SPEED * dT * 0.8 * this.#facing;

        stroke(0x61, 0x35, 0x83); // purple
        strokeWeight(2);
        line(this.#originX, this.pos.y, this.pos.x, this.pos.y);
        stroke(255);
        line(this.pos.x - this.#facing * 5, this.pos.y, this.pos.x, this.pos.y);

        this.#alive = (this.#originX + screenOffsetX < window.innerWidth);
    }

}