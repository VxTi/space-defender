class Alien extends Entity {

    static #SPRITE_INDEX = 2;
    static #DAMAGE_REACH = 1;


    MINIMAP_SPRITE_INDEX = [1, 1]


    constructor(x, y, size = 50) {
        super(x, y, 1, size);
        this.deathAnimations = true;
    }


    update(dT) {
        super.update(dT);
        resources['spritesheet'].animate(this.pos.x - this.size/2, this.pos.y - this.size/2, this.size, this.size, Alien.#SPRITE_INDEX);
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