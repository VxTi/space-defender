class Particle extends Entity {

    #weight;
    #lifetime;
    #color;
    #source;

    constructor(source, intensity = 100, weight = 1, lifetime = 5, color = 0xFFFFFF) {
        super(source.pos.x, source.pos.y, lifetime);
        this.#weight = weight;
        this.#source = source;
        this.#lifetime = lifetime;

        let range = 0.7;
        let offset = Math.random() * range;

        this.#color =
            Math.min(((color >> 16) & 0xFF) * (1 - 0.5 * range + offset), 0xFF) << 16 |
            Math.min(((color >>  8) & 0xFF) * (1 - 0.5 * range + offset), 0xFF) <<  8 |
            Math.min((color & 0xFF) * (1 - 0.5 * range + offset), 0xFF);
        this.vel.translate(
            intensity * Math.sin(2 * Math.PI * Math.random()) * Math.random(),
            intensity * Math.sin(2 * Math.PI * Math.random()) * Math.random()
        );
    }

    update(dT) {
        this.health -= dT;
        this.pos.add(this.vel.x, this.vel.y);
        this.vel.y += this.#weight * pixelPerCm * dT;
        drawRect(this.pos.x, this.pos.y, 10 * this.#weight, 10 * this.#weight, this.#color);
    }
}