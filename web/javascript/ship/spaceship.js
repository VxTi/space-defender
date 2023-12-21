


class Spaceship extends Entity {

    #lives;
    #facing = 1;
    #acceleration = new Vec2(0, 0);

    // The size of the ship, in pixels
    static SHIP_SIZE = 80;

    // Position of the weapon, in relative fractions
    static WEAPON_OFFSET = new Vec2(Spaceship.SHIP_SIZE * 0.55, Spaceship.SHIP_SIZE*0.57);

    constructor(x, y, lives) {
        super(x, y);
        this.#lives = lives;
    }

    move(x, y) {
        this.#acceleration.x = Math.min(Math.abs(x) * this.#acceleration.x + 0.05, 1);
        this.#acceleration.y = Math.min(Math.abs(y) * this.#acceleration.y + 0.05, 1);
        this.vel.translate(x * horizontalSpeed * this.#acceleration.x, y * verticalSpeed * this.#acceleration.y);
        this.#facing = Math.sign(x !== 0 ? x : this.#facing);
    }

    update(dT) {
        resources['spritesheet'].animate(this.pos.x, this.pos.y, Spaceship.SHIP_SIZE, Spaceship.SHIP_SIZE, this.#facing < 0 ? 1  : 0);

        this.pos.add(this.vel.x, this.vel.y);
        this.vel.translate(0, 0);

        if (this.pos.x + screenOffsetX <= window.innerWidth * 0.1)
            screenOffsetX = -this.pos.x + window.innerWidth * 0.1;
        else if (this.pos.x + screenOffsetX >= window.innerWidth * 0.9)
            screenOffsetX = -this.pos.x + window.innerWidth * 0.9;

        this.pos.x = Math.min(Math.max(-mapWidth / 2, this.pos.x), mapWidth / 2);

    }

    shoot() {
        let rocket = new Rocket(this);
        entities.push(rocket);
    }

    get lives() { return this.#lives; }

    get facing() { return this.#facing; }

}