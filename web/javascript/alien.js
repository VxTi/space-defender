class Alien extends Entity {

    #size;

    static #SPRITE_INDEX = 2;
    static #MOVEMENT_SPEED = 10; // Pixels per second

    MINIMAP_SPRITE_INDEX = [1, 1]


    constructor(x, y, size = 50) {
        super(x, y, 1);
        this.#size = size;
    }


    update(dT) {
        if (!this.alive)
            return;
        resources['spritesheet'].animate(this.pos.x - this.#size/2, this.pos.y - this.#size/2, this.#size, this.#size, Alien.#SPRITE_INDEX);
        let [Dx, Dy] = [Math.sign(ship.pos.x - this.pos.x), Math.sign(ship.pos.y - this.pos.y)];
        this.vel.add(Dx * dT, Dy * dT);
        this.pos.add(this.vel.x, this.vel.y);

        let dSq = (this.pos.x - ship.pos.x) * (this.pos.x - ship.pos.x) + (this.pos.y - ship.pos.y) * (this.pos.y - ship.pos.y);
        if (dSq <= Rocket.ROCKET_REACH * Rocket.ROCKET_REACH)
            ship.damage(1);
    }

    damage(amount) {
        super.damage(amount);
        if (!this.alive)
            for (let i = 0; i < 20; i++)
                entities.push(new DeathParticle(this, 5, Math.random(), 1));
    }


}