class EvolvedAlienBomb extends Entity {

    #source;
    #direction;

    static MOVEMENT_SPEED = 400;

    /**
     * Constructor for creating a bomb from an evolved alien
     * @param {EvolvedAlien} source
     */
    constructor(source) {
        super(source.pos.x, source.pos.y, 2, 20);
        this.#source = source;
        this.damageColor = 0x303030;
        this.#direction = new Vec2(player.pos.x - source.pos.x, player.pos.y - source.pos.y).normalize.mult(EvolvedAlienBomb.MOVEMENT_SPEED, EvolvedAlienBomb.MOVEMENT_SPEED)
        this.velocity = this.#direction;
        this.deathAnimations = true;
    }

    update(dT) {
        // Check whether the bomb has intersected with the player or whether it died
        if (this.pos.distSq(player.pos) <= Math.pow(player.size / 2 + this.size / 2 + 4, 2)) {
            player.damage(1);
            Statistics.timesBlownUp.value++;
            this.terminate();
        }
        this.health = Math.max(0, this.health - dT);
        if (!this.alive)
            showDeathAnimation(this);
        this.pos.add(this.velocity.x * dT, this.velocity.y * dT);
        this.velocity.y += 100 * dT;
        resources['spritesheet'].drawSection(this.pos.x - this.size / 2, this.pos.y - this.size / 2, this.size, this.size, 6, 0);
    }

}