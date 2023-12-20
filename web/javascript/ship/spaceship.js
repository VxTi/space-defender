


class Spaceship extends GameObject {

    #velocity;
    #lives;

    static ROCKET_SIZE = 50;
    static WEAPON_OFFSET = new Vec2(Spaceship.ROCKET_SIZE * 0.6, Spaceship.ROCKET_SIZE*0.61);

    constructor(x, y, lives) {
        super(x, y);
        this.#velocity = new Vec2(0, 0);
        this.#lives = lives;
    }

    move(x, y) {
        this.#velocity.translate(x * horizontalSpeed, y * verticalSpeed);
    }

    update(dT) {
        resources['spritesheet'].animate(this.pos.x, this.pos.y, Spaceship.ROCKET_SIZE, Spaceship.ROCKET_SIZE, 0);
        this.pos.add(this.#velocity.x, this.#velocity.y);
        this.#velocity.translate(0, 0);

        if (this.pos.x + screenOffsetX <= window.innerWidth * 0.1)
            screenOffsetX = -this.pos.x + window.innerWidth * 0.1;
        else if (this.pos.x + screenOffsetX >= window.innerWidth * 0.9)
            screenOffsetX = -this.pos.x + window.innerWidth * 0.9;


    }

    shoot() {

    }

    get lives() { return this.#lives; }

}