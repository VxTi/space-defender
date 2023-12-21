class Rocket extends Entity {

    // Private fields that represent this rocket.
    #trailX;
    #source;
    #alive = true;
    #targetHit = false;
    #facing;

    static ROCKET_SPEED = 800;
    static ROCKET_TRAIL_DISTANCE = 300;
    static ROCKET_REACH = 15;

    /**
     * Constructor for creating a new rocket.
     * Rocket must be coming from a spaceship (obviously)
     * @param {Spaceship} source The spaceship that shoots the rocket
     */
    constructor(source) {
        super(source.pos.x + Spaceship.WEAPON_OFFSET.x, source.pos.y + Spaceship.WEAPON_OFFSET.y, 1);
        this.#trailX = this.pos.x
        this.#facing = source.facing;
        this.#source = source;
    }

    update(dT) {
        if (!this.#alive)
            return;
        this.#alive = (this.#trailX >= -mapWidth/2 && this.#trailX <= mapWidth / 2 && !this.#targetHit);

        this.pos.addX(Rocket.ROCKET_SPEED * dT * this.#facing);
        this.#trailX += Rocket.ROCKET_SPEED * dT * 0.8 * this.#facing;

        stroke(0x61, 0x35, 0x83); // purple
        strokeWeight(3);
        line(this.#trailX, this.pos.y, this.pos.x, this.pos.y);
        stroke(255);
        line(this.pos.x - this.#facing * 5, this.pos.y, this.pos.x, this.pos.y);

        for (let e of entities) {
            if (e instanceof Spaceship || e instanceof Rocket)
                continue;

            let dSq = (this.pos.x - e.pos.x) * (this.pos.x - e.pos.x) + (this.pos.y - e.pos.y) * (this.pos.y - e.pos.y);
            if (dSq <= Rocket.ROCKET_REACH * Rocket.ROCKET_REACH) {
                e.damage(e.health);
                this.#alive = false;
                addScore(250);
                break;
            }
        }

    }

    get alive() { return this.#alive; }

}