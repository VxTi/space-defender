class EvolvedAlien extends Entity {

    static #SPRITE_INDEX = 2;
    static #DAMAGE_REACH = 300;
    static #SHOOT_DELAY = 1;


    MINIMAP_SPRITE_INDEX = [1, 1]

    #shootDelay = 0;

    constructor(x, y) {
        super(x, y, 1, 40);
        this.deathAnimations = true;
        this.damageColor = -1;
    }


    update(dT) {
        super.update(dT);
        this.#shootDelay = Math.max(0, this.#shootDelay - dT);
        drawRect(this.pos.x, this.pos.y, this.size, this.size, -1);
        //resources['spritesheet'].animate(this.pos.x - this.size/2, this.pos.y - this.size/2, this.size, this.size, Alien.#SPRITE_INDEX);
        let [Dx, Dy] = [Math.sign(player.pos.x - this.pos.x), Math.sign(player.pos.y - this.pos.y)];

        if (this.pos.distSq(player.pos) <= Math.pow(player.size / 2 + this.size / 2 + EvolvedAlien.#DAMAGE_REACH, 2) && player.alive && player.canDamage && this.#shootDelay <= 0)
        {
            entities.push(new EvolvedAlienBomb(this));
            this.#shootDelay = EvolvedAlien.#SHOOT_DELAY;
        }

        this.vel.add(Dx * dT, Dy * dT);
        this.pos.add(this.vel.x, this.vel.y);
    }

}