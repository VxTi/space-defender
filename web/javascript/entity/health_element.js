/**
 * Class representing a health element.
 * This element can be picked up by the player to increase their health.
 */
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

    /**
     * Method for updating the health element's properties and drawing it on the screen.
     * This checks whether the player is close enough, if this is the case, it will be picked up.
     * Picking it up increases the player's health by the amount specified in the constructor.
     * @param {number} dT The time passed since the last update, in seconds.
     */
    update(dT) {
        sprite.animate(this.pos.x - this.size/2, this.pos.y - this.size/2, this.size, this.size, HealthElement.#SPRITE_INDEX);
        if (this.withinRange(player)) {
            this.terminate();
            playSound('health_element_pickup');
            player.health = Math.min(player.health + this.#amount, Config.DEFAULT_HEALTH);
        }
    }
}