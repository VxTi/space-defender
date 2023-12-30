/**
 * @file particle.js
 * This file contains the class for an abstract particle.
 */
class Particle extends Entity {

    #weight;
    #lifetime;
    #color;
    #source;
    #gravitationallyAffected;

    /**
     * Constructor for creating a particle
     * @param {number} x The x position of the particle
     * @param {number} y The y position of the particle
     * @param {number} dirX x direction in which the particle is going to
     * @param {number} dirY y direction in which the particle is going to
     * @param {Entity} source The entity source of the particle
     * @param {number} weight How big the particle should be
     * @param {number} lifetime How long the particle should exist for
     * @param {number} color The color of the particle. This will vary. Argument can be provided in '0xRRGGBB' format
     * @param {boolean} [gravitationallyAffected] Whether or not the particle should be affected by gravity
     */
    constructor(x, y, dirX, dirY, source, weight = 1, lifetime = 5, color = 0xFFFFFF, gravitationallyAffected = true) {
        super(source.pos.x, source.pos.y, lifetime);
        this.#weight = weight;
        this.#source = source;
        this.#lifetime = lifetime;
        this.#gravitationallyAffected = gravitationallyAffected;

        this.vel.translate(dirX, dirY);

        let range = 0.7;
        let offset = Math.random() * range;

        // Adjust the color by a little bit
        this.#color =
            Math.min(((color >> 16) & 0xFF) * (1 - 0.5 * range + offset), 0xFF) << 16 |
            Math.min(((color >>  8) & 0xFF) * (1 - 0.5 * range + offset), 0xFF) <<  8 |
            Math.min((color & 0xFF) * (1 - 0.5 * range + offset), 0xFF);
    }

    /**
     * Update the states of the particle, and slowly make it age.
     * Also updates the position it, affects it with gravity (optional) and draws it.
     * @param {number} dT Time difference since last frame, in seconds
     */
    update(dT) {
        // Decrease health. The health is the lifetime of the particle. Once at 0, it disappears.
        this.health -= dT;
        this.pos.add(this.vel.x * dT, this.vel.y * dT);
        // Add gravity functionality
        if (this.#gravitationallyAffected) this.vel.y += this.#weight * pixelPerCm * dT;
        drawRect(this.pos.x, this.pos.y, 10 * this.#weight, 10 * this.#weight, this.#color, Math.min(1, this.health / this.#lifetime));
    }
}