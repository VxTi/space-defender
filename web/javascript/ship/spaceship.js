


class Spaceship extends Entity {

    #facing = 1;
    #movingAnimation = 0;

    MINIMAP_SPRITE_INDEX = [0, 1];

    // The size of the ship, in pixels
    static SHIP_SIZE = 80;

    // Position of the weapon, in relative fractions
    static WEAPON_OFFSET = new Vec2(Spaceship.SHIP_SIZE * 0.55, Spaceship.SHIP_SIZE*0.57);


    constructor(x, y, health) {
        super(x, y, health, Spaceship.SHIP_SIZE);
        this.deathAnimations = true;
    }

    move(x, y) {
        this.acceleration.x = Math.min(Math.abs(x) * this.acceleration.x + 0.05, 1);
        this.acceleration.y = Math.min(Math.abs(y) * this.acceleration.y + 0.05, 1);
        this.vel.translate(x * horizontalSpeed * this.acceleration.x, y * verticalSpeed * this.acceleration.y);
        this.#facing = Math.sign(x !== 0 ? x : this.#facing);
    }

    update(dT) {

        resources['spritesheet'].drawSection(this.pos.x, this.pos.y, this.size, this.size, this.#facing < 0 ? 1  : 0, 0);

        this.#movingAnimation = (this.#movingAnimation + dT * 10) % 4;
        if (this.vel.x !== 0 || this.vel.y !== 0)
            resources['spritesheet'].drawSection(this.pos.x - this.#facing * this.size, this.pos.y, this.size, this.size, Math.floor(this.#movingAnimation), this.#facing < 0 ? 4 : 3);
        this.pos.add(this.vel.x, this.vel.y);
        this.vel.translate(0, 0);

        if (this.pos.x + screenOffsetX <= window.innerWidth * 0.1)
            screenOffsetX = -this.pos.x + window.innerWidth * 0.1;
        else if (this.pos.x + screenOffsetX >= window.innerWidth * 0.9)
            screenOffsetX = -this.pos.x + window.innerWidth * 0.9;

        this.pos.x = Math.min(Math.max(-mapWidth / 2, this.pos.x), mapWidth / 2);
        this.pos.y = Math.max(this.pos.y, mapTop);

    }


    shoot() {
        let rocket = new Rocket(this);
        entities.push(rocket);
    }

    get facing() { return this.#facing; }

}