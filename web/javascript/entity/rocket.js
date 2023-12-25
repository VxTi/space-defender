class Rocket extends Entity {

    // Private fields that represent this rocket.
    #trailX;
    #source;
    #facing;

    static ROCKET_SPEED = 1000;
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
        this.health = (this.#trailX >= -mapWidth/2 && this.#trailX <= mapWidth / 2) && this.alive ? 1 : 0;

        for (let i = 0; i < 6; i++)
        {
            let len = (1 + (i + this.pos.x) % 4) * 5;
            drawLine(this.pos.x - i * len * this.#facing, this.pos.y, this.pos.x - (i + 1) * len * this.#facing, this.pos.y, 0x613583, 4);
        }
       // drawLine(this.#trailX, this.pos.y, this.pos.x, this.pos.y, 0x613583, 4);
        drawLine(this.pos.x - this.#facing * 5, this.pos.y, this.pos.x, this.pos.y, -1, 4);

        for (let e of entities) {
            // Check if it's a hit-able entity. If not, continue to the next.
            if (e instanceof Spaceship || e instanceof Rocket || !e.alive)
                continue;

            // Check if the rocket collides with the entity in its path
            if (
                this.pos.y >= e.pos.y - e.size / 2 - 1 &&
                this.pos.y <= e.pos.y + e.size / 2 + 1 &&
                this.pos.x + Rocket.ROCKET_SPEED * dT / 2 >= e.pos.x - e.size / 2 &&
                this.pos.x - Rocket.ROCKET_SPEED * dT / 2 <= e.pos.x + e.size / 2
            ) {
                e.damage(1);
                this.health = 0;
                addScore(e.ENTITY_SCORE);
                return;
            }
        }
        this.pos.x += (Rocket.ROCKET_SPEED * dT * this.#facing);
        this.#trailX += Rocket.ROCKET_SPEED * dT * 0.8 * this.#facing;
    }
}