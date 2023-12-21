class DeathParticle extends Entity {

    #weight;
    #lifetime;
    constructor(source, intensity = 300, weight = 1, lifetime = 5) {
        super(source.pos.x, source.pos.y, lifetime);
        this.#weight = weight;
        this.#lifetime = lifetime;
        this.vel.translate(
            intensity * Math.sin(2 * Math.PI * Math.random()) * Math.random(),
            intensity * Math.sin(2 * Math.PI * Math.random()) * Math.random()
        );
    }

    update(dT) {
        this.damage(dT);
        this.pos.add(this.vel.x, this.vel.y);
        this.vel.y += this.#weight * pixelPerCm * dT;
        drawRect(this.pos.x, this.pos.y, 10 * this.#weight, 10 * this.#weight, 0xFFFFFF);
    }
}