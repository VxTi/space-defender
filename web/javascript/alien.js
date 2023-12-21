class Alien extends Entity {

    #size;

    static #SPRITE_INDEX = 2;
    static #MOVEMENT_SPEED = 200; // Pixels per second

    constructor(x, y, size = 50) {
        super(x, y);
        this.#size = size;
    }


    update(dT) {
        resources['spritesheet'].animate(this.pos.x - this.#size/2, this.pos.y - this.#size/2, this.#size, this.#size, Alien.#SPRITE_INDEX);
        let [Sx, Sy] = [Math.sign(ship.pos.x - this.pos.x), Math.sign(ship.pos.y - this.pos.y)];
        this.vel.translate(Sx * Alien.#MOVEMENT_SPEED * dT, Sy * Alien.#MOVEMENT_SPEED * dT);
        this.pos.add(this.vel.x, this.vel.y);



    }



}