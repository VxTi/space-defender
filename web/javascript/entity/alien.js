class Alien extends Entity {

    #size;

    static #SPRITE_INDEX = 2;
    static #MOVEMENT_SPEED = 10; // Pixels per second
    static #DAMAGE_REACH = 1;


    MINIMAP_SPRITE_INDEX = [1, 1]


    constructor(x, y, size = 50) {
        super(x, y, 1);
        this.#size = size;
        this.deathAnimations = true;
    }


    update(dT) {
        super.update(dT);
        resources['spritesheet'].animate(this.pos.x - this.#size/2, this.pos.y - this.#size/2, this.#size, this.#size, Alien.#SPRITE_INDEX);
        let [Dx, Dy] = [Math.sign(ship.pos.x - this.pos.x), Math.sign(ship.pos.y - this.pos.y)];

        if (this.pos.distSq(ship.pos) <= Math.pow(ship.size / 2 + this.size / 2 + Alien.#DAMAGE_REACH, 2) && ship.alive && ship.canDamage)
            ship.damage(1);

        this.vel.add(Dx * dT, Dy * dT);
        this.pos.add(this.vel.x, this.vel.y);
    }


}