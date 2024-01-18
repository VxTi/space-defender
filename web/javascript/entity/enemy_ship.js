/**
 * @fileoverview This file contains the EnemyShip class, which is a subclass of Entity.
 */
class EnemyShip extends Entity {


    static #SPRITE_INDEX = 3;
    static #DAMAGE_REACH = 1;


    MINIMAP_SPRITE_INDEX = [2, 1]


    /**
     * Constructor for the enemy ship
     * @param {number} x X position of the enemy ship
     * @param {number} y Y position of the enemy ship
     * @param {number} size Size of the enemy ship (in pixels), defaults to 70
     */
    constructor(x, y, size = 70) {
        super(x, y, 2, size);
        this.deathAnimations = true;
        this.ENTITY_KILL_SCORE = 400
        this.damageColor = 0x405060;
    }


    /**
     * Overridden update method for the enemy ship.
     * @param {number} dT Time difference since last frame, in seconds
     */
    update(dT) {
        super.update(dT);
        sprite.animate(this.pos.x - this.size/2, this.pos.y - this.size/2, this.size, this.size, EnemyShip.#SPRITE_INDEX);

        this.#doPathfinding(dT);

        let [Dx, Dy] = [Math.sign(player.pos.x - this.pos.x), Math.sign(player.pos.y - this.pos.y)];

        if (this.pos.distSq(player.pos) <= Math.pow(player.size / 2 + this.size / 2 + EnemyShip.#DAMAGE_REACH, 2) && player.alive && player.canDamage) {
            player.damage(1);
            player.acceleration.add(Dx * 10, Dy * 10);
        }

        this.vel.add(Dx * dT, Dy * dT);
        this.pos.add(this.vel.x, this.vel.y);
    }

    /**
     * Method for performing pathfinding to the spaceship (oh no)
     * All this function does is update the acceleration of the enemy ship
     * @param {number} dT Time difference since last frame, in seconds
     */
    #doPathfinding(dT) {

    }

}