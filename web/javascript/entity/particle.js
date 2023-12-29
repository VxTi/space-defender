class Particle extends Entity {

    #weight;
    #lifetime;
    #color;
    #source;

    /**
     * Constructor for creating a particle
     * @param x
     * @param y
     * @param {number} dirX x direction in which the particle is going to
     * @param {number} dirY y direction in which the particle is going to
     * @param {Entity} source The entity source of the particle
     * @param {number} weight How big the particle should be
     * @param {number} lifetime How long the particle should exist for
     * @param {number} color The color of the particle. This will vary. Argument can be provided in '0xRRGGBB' format
     */
    constructor(x, y, dirX, dirY, source, weight = 1, lifetime = 5, color = 0xFFFFFF) {
        super(source.pos.x, source.pos.y, lifetime);
        this.#weight = weight;
        this.#source = source;
        this.#lifetime = lifetime;

        let range = 0.7;
        let offset = Math.random() * range;

        this.vel.translate(dirX, dirY);

        this.#color =
            Math.min(((color >> 16) & 0xFF) * (1 - 0.5 * range + offset), 0xFF) << 16 |
            Math.min(((color >>  8) & 0xFF) * (1 - 0.5 * range + offset), 0xFF) <<  8 |
            Math.min((color & 0xFF) * (1 - 0.5 * range + offset), 0xFF);
    }

    update(dT) {
        this.health -= dT;
        this.pos.add(this.vel.x, this.vel.y);
        this.vel.y += this.#weight * pixelPerCm * dT;
        drawRect(this.pos.x, this.pos.y, 10 * this.#weight, 10 * this.#weight, this.#color);
    }
}