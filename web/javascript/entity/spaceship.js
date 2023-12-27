


class Spaceship extends Entity {

    #facing = 1;
    #movingAnimation = 0;

    MINIMAP_SPRITE_INDEX = [0, 1];

    // The size of the entity, in pixels
    static SHIP_SIZE = 80;
    static MOVEMENT_SPEED = new Vec2(20, 10);
    static WEAPON_OFFSET = new Vec2(Spaceship.SHIP_SIZE * 0.55, Spaceship.SHIP_SIZE*0.57);  // Position of the weapon, in relative fractions

    constructor(x, y, health) {
        super(x, y, health, Spaceship.SHIP_SIZE);
        this.deathAnimations = true;
    }

    move(x, y) {
        this.acceleration.x += Math.sign(x) * Math.min(Math.abs(x) + Spaceship.MOVEMENT_SPEED.x * 0.5, Spaceship.MOVEMENT_SPEED.x);
        this.acceleration.y += Math.sign(y) * Math.min(Math.abs(y) + Spaceship.MOVEMENT_SPEED.y * 0.5, Spaceship.MOVEMENT_SPEED.y);
        //this.vel.translate(x * Spaceship.MOVEMENT_SPEED * this.acceleration.x, y * verticalSpeed * this.acceleration.y);
        this.#facing = Math.sign(x !== 0 ? x : this.#facing);
    }

    update(dT) {
        super.update(dT);
        if (!this.alive)
            return;
        resources['spritesheet'].drawSection(this.pos.x, this.pos.y, this.size, this.size, this.#facing < 0 ? 1  : 0, 0);

        this.#movingAnimation = (this.#movingAnimation + dT * 10) % 4;

        // If we're moving, draw the moving animation
        if (Math.abs(this.vel.x) > 0.1 || Math.abs(this.vel.y) > 0.1)
            resources['spritesheet'].drawSection(this.pos.x - this.#facing * this.size, this.pos.y, this.size, this.size, Math.floor(this.#movingAnimation), this.#facing < 0 ? 4 : 3);

        this.pos.add(this.vel.x, this.vel.y);
        this.vel.translate(this.acceleration);
        this.acceleration.translate(-this.acceleration.x * dT, -this.acceleration.y * dT);

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

    onDeath() {
        let element = document.querySelector('.game-event-indicator');
        element.innerHTML = 'Game over<br>';
        setTimeout(() => {
            element.innerHTML += 'Respawning...<br>'
            setTimeout(() => {
                element.innerHTML = '';
                respawn();
            }, 3000);
        }, 1000);
    }

}