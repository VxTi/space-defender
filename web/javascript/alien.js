class Alien extends GameObject {

    #size;

    static #SPRITE_INDEX = 1;

    constructor(x, y, size) {
        super(x, y);
        this.#size = size;
    }


    update(dT) {
        resources['spritesheet'].animate(this.pos.x - this.#size/2, this.pos.y - this.#size/2, this.#size, this.#size, Alien.#SPRITE_INDEX);
    }
}