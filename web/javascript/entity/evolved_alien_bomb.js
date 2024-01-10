class EvolvedAlienBomb extends Entity {

    #source;
    #direction;

    static MOVEMENT_SPEED = 300;

    /**
     * Constructor for creating a bomb from an evolved alien
     * @param {EvolvedAlien} source
     */
    constructor(source) {
        super(source.pos.x, source.pos.y, window.innerHeight / EvolvedAlienBomb.MOVEMENT_SPEED, 20);
        this.#source = source;
        this.damageColor = -1;
        this.#direction = new Vec2(player.pos.x - source.pos.x, player.pos.y - source.pos.y).normalize.mult(EvolvedAlienBomb.MOVEMENT_SPEED, EvolvedAlienBomb.MOVEMENT_SPEED)
        this.velocity = this.#direction;
    }

    update(dT) {
        this.health = Math.max(0, this.health - dT);
        drawRect(this.pos.x, this.pos.y, this.size, this.size, -1);
        this.pos.add(this.velocity.x * dT, this.velocity.y * dT);
        //resources['spritesheet'].drawSection(this.pos.x - this.size / 2, this.pos.y - this.size / 2, this.size, this.size, 2, 0);
    }

}