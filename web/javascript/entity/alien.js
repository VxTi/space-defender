/**
 * @fileoverview Alien class.
 * Class represents an enemy Entity that will follow the player and
 * damage it when it gets too close.
 */
class Alien extends Entity {

    static #SPRITE_INDEX = 2;
    static #DAMAGE_REACH = 1;


    MINIMAP_SPRITE_INDEX = [1, 1]


    /**
     * Constructor for the Alien class.
     * @param {number} x The x-coordinate of the Alien
     * @param {number} y The y-coordinate of the Alien
     * @param {number} size The size of the Alien
     */
    constructor(x, y, size = 50) {
        super(x, y, 1, size);
        this.deathAnimations = true;
        this.damageColor = 0x800000;
    }


    /**
     * Overwrite of the update method in the Entity class.
     * This will allow the Alien to follow the spaceship and attack it if it gets too close.
     * @param {number} dT Time since last frame in seconds
     */
    update(dT) {
        super.update(dT);
        sprite.animate(this.pos.x - this.size/2, this.pos.y - this.size/2, this.size, this.size, Alien.#SPRITE_INDEX);
        let [Dx, Dy] = [Math.sign(player.pos.x - this.pos.x), Math.sign(player.pos.y - this.pos.y)];

        if (this.pos.distSq(player.pos) <= Math.pow(player.size / 2 + this.size / 2 + Alien.#DAMAGE_REACH, 2) && player.alive && player.canDamage)
        {
            player.damage(1);
            player.acceleration.add(Dx * 10, Dy * 10);
        }

        this.vel.add(Dx * dT, Dy * dT);
        this.pos.add(this.vel.x, this.vel.y);
    }


}