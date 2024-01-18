class HealthElement extends Entity {


    #amount;
    static #SPRITE_INDEX = 4;

    /**
     * Constructor for Health Element
     */
    constructor(x, y, amount) {
        super(x, y, 1, 50);
        this.#amount = amount
    }

    update(dT) {
        sprite.animate(this.pos.x - this.size/2, this.pos.y - this.size/2, this.size, this.size, HealthElement.#SPRITE_INDEX);
        if (this.withinRange(player)) {
            this.health = 0;
            player.health = Math.min(player.health + this.#amount, Config.DEFAULT_HEALTH);
        }
    }
}