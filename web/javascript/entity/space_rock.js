class Rock extends Entity {

    #source;
    #direction;

    static MOVEMENT_SPEED = 600;

    /**
     * Constructor for creating a bomb from an evolved alien
     * @param {EvolvedAlien} source
     */
    constructor(source) {
        super(source.pos.x, source.pos.y, 2, 20);
        this.#source = source;
        this.damageColor = 0x303030;
        this.#direction = new Vec2(player.pos.x - source.pos.x, player.pos.y - source.pos.y).normalized.mult(Rock.MOVEMENT_SPEED, Rock.MOVEMENT_SPEED)
        this.velocity = this.#direction;
        this.deathAnimations = true;
    }

    /**
     * Override method for updating the properties of this entity class.
     * Checks whether the rock
     * @param dT
     */
    update(dT) {
        // Check whether the bomb has intersected with the player or whether it died
        if (this.pos.distSq(player.pos) <= Math.pow(player.size / 2 + this.size / 2 + 4, 2)) {
            player.damage(1);
            Statistics.rocksCollided.value++;
            this.terminate();
        } else if (this.pos.y > window.innerHeight + this.size / 2) {
            this.terminate();
        }
        this.health = Math.max(0, this.health - dT);

        this.pos.add(this.velocity.x * dT, this.velocity.y * dT);
        this.velocity.y += 0.25 * Rock.MOVEMENT_SPEED * dT;
        sprite.drawSection(this.pos.x - this.size / 2, this.pos.y - this.size / 2, this.size, this.size, 6, 0);
    }

}