/**
 * @fileoverview Contains the EvolvedAlien class
 * This class is used for the evolved alien enemy.
 * The evolved alien is a more advanced version of the alien.
 */
class EvolvedAlien extends Entity {

    static #SPRITE_INDEX = 5;
    static #DAMAGE_REACH = 300;
    static #SHOOT_DELAY = 1;


    MINIMAP_SPRITE_INDEX = [3, 1]

    #shootDelay = 0;

    /**
     * Constructor for the EvolvedAlien class.
     * @param {number} x The x position of the evolved alien.
     * @param {number} y The y position of the evolved alien.
     */
    constructor(x, y) {
        super(x, y, 1, 50);
        this.deathAnimations = true;
        this.damageColor = 0x601010;
        this.ENTITY_KILL_SCORE = 400;
    }


    /**
     * Overridden update method for updating the properties of this entity.
     * @param {number} dT The time passed since the last update.
     */
    update(dT) {
        super.update(dT);
        this.#shootDelay = Math.max(0, this.#shootDelay - dT);
        //drawRect(this.pos.x - this.size/2, this.pos.y - this.size/2, this.size, this.size, -1);
        push();
        translate(this.pos.x, this.pos.y);
        rotate(msElapsed / 500);
        sprite.animate(- this.size/2, - this.size/2, this.size, this.size, EvolvedAlien.#SPRITE_INDEX);

        pop();
        let [Dx, Dy] = [Math.sign(player.pos.x - this.pos.x), Math.sign(player.pos.y - this.pos.y)];

        if (this.pos.distSq(player.pos) <= Math.pow(player.size / 2 + this.size / 2 + EvolvedAlien.#DAMAGE_REACH, 2) && player.alive && player.canDamage && this.#shootDelay <= 0) {
            entities.push(new Rock(this));
            this.#shootDelay = EvolvedAlien.#SHOOT_DELAY;
        }

        this.vel.add(Dx * dT * 2, Dy * dT * 2);
        this.pos.add(this.vel.x, this.vel.y);
    }

}