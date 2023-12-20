class Entity extends AABB {

    #direction;       // The vector pointing to the direction in which the entity is going
    #movementSpeed;  // Movement speed factor. This is multiplied by movement speeds defined in game.js
    #position;        // position of the entity
    #velocity;        // velocity of the entity
    #colliding;       // colliding states, containing the direction of collision (x, y)
    #health;          // Health of the entity
    #maxHealth;       // Max health of the entity
    fallingDistance; // Distance how long the entity has fallen for.
    isAlive;         // Liveliness of the entity
    onGround;        // Whether the entity is on ground or not
    againstWall;     // Whether the entity is colliding with a wall

    static regenerationInterval = 5; // how many seconds need to pass for one heart to regenerate

    static collisionThreshold = 0.05; // Detection threshold in meters

    constructor(posX, posY, maxHealth, movementSpeed) {
        super(posX, posY, 0.9, 1.8);
        this.#movementSpeed = movementSpeed;
        this.#direction = new Vec2(0, 0);
        this.#position  = new Vec2(posX, posY);
        this.#velocity  = new Vec2(0, 0);
        this.#colliding = new Vec2(0, 0);
        this.fallingDistance = 0;
        this.isAlive = true;
        this.#health = maxHealth;
        this.#maxHealth = maxHealth;
        this.onGround = false;
    }

    // Method for setting the direction of the entity based on the provided signs of x and y.
    // Normal movement requires x and y to be -1 <= [x, y] <= 1
    move(x, y) { this.#direction.translate(x, y); }

    update(dT) {

        this.#velocity.add(
            !this.againstWall ? this.#direction.x * horizontalSpeed * 0.25 * this.#movementSpeed : 0,
            this.onGround || (allowDoubleJump && this.againstWall && this.#velocity.y < 0)
                ? this.#direction.y * verticalSpeed * this.#movementSpeed : 0);
        //this.direction.translate(0, 0);

        // Set it to an unrealistic number, just before testing for collision.
        // Makes it easier to test whether collision detection has finished, without allocating more memory.
        this.#colliding.translate(0, 0);

        // Natural regeneration, every ten seconds
        this.health = Math.min(this.health + dT / Entity.regenerationInterval, this.#maxHealth);

        this.#checkCollision(dT);
/*
        // Check if the next position of the entity is colliding with another
        for (let i = 0; i < Terrain.boundingBoxes.length; i++) {
            let target = Terrain.boundingBoxes[i];

            // Collision detection with self is always going to be true so let's just skip that shall we...
            if (!(target instanceof Block))
                continue;

            // If another class extends this class and defines the function 'onCollisionCheck',
            // this then calls the function with the current target as parameter.
            // If this function returns false, collision detection should skip this target
            /!*if (this.position.distSq(target) > this.#velocity.magSq * 2)
                continue;*!/
/!*
            /!**
             * SECTION: X AXIS COLLISION DETECTION
             **!/

            // perform calculations for x-axis collision detection
            if (!this.collidingHorizontally && Math.abs(this.#velocity.x) >= Entity.collisionThreshold) {

                for (let j = Math.abs(this.#velocity.x * dT); j >= 0; j -= Entity.collisionThreshold) {
                    if (this.copy.translateX(this.position.x + j * Math.sign(this.velocity.x)).intersects(target)) {

                        this.#colliding.x = Math.sign(this.#velocity.x);
                        if (typeof(this['onCollisionX']) === 'function')
                            this['onCollisionX'](target);
                        this.#velocity.x = 0;
                        break;
                    }
                }
            }

            /!**
             * SECTION: Y AXIS COLLISION DETECTION
             **!/

            // Perform calculations for y-axis collision detection
            if (!this.collidingVertically && Math.abs(this.velocity.y) >= Entity.collisionThreshold) {
                for (let j = Math.abs(this.velocity.y * dT); j >= 0; j -= Entity.collisionThreshold) {
                    if (this.copy.translateY(this.position.y + j * Math.sign(this.velocity.y)).intersects(target)) {

                        this.#colliding.y = Math.sign(this.velocity.y);

                        if (typeof(this['onCollisionY']) === 'function')
                            this['onCollisionY'](target);

                        this.#velocity.y = 0;
                        break;
                    }
                }
            }*!/



            if (this.#colliding.x === 0 && this.#checkCollision('x', this, dT, target)) {
                this.#colliding.x = Math.sign(this.#velocity.x);
                this.#velocity.x = 0;
            }

            if (this.#colliding.y === 0 && this.#checkAxialCollision('y', this, dT, target)) {
                this.#colliding.y = Math.sign(this.#velocity.y);
                this.#velocity.y = 0;
            }

            // If we're colliding on both axis, stop further checks
            if (this.#colliding.x !== 0 && this.#colliding.y !== 0)
                break;
        }*/

        // Add velocity to position
        this.position.add(this.velocity.x * dT, this.velocity.y * dT);

        this.isAlive = this.health !== 0;
        this.onGround = this.#colliding.y < 0;
        this.againstWall = this.#colliding.x !== 0;

        // If we're falling, add fall distance
        if (this.velocity.y < 0 && !this.onGround)
            this.fallingDistance += Math.abs(this.velocity.y * dT);

        /**
         *  SECTION: FALL DAMAGE
         **/

        // Check if we've fallen down
        if (this.onGround) {
            // If fallen from a large enough area, induce fall damage
            if (this.fallingDistance > verticalSpeed * 0.7)  {
                this.damage(this.fallingDistance * 0.3);
            }
            this.fallingDistance = 0;
        } else {
            this.velocity.addY(-Terrain.G * dT);
        }



        // Reduce x-axis motion gradually (if there is any)
        this.velocity.x *= 0.8;

        // Limit falling to bottom screen so the player doesn't randomly disappear.
        this.position.y = Math.max(this.position.y, 0);

        // Update the AABB position
        this.translate(this.position.x, this.position.y);
    }

    /**
     * Method for checking whether the entity is going to collide in the next frame
     * @param {number} dT Time difference. The next position is axis + velocity[axis] * dT
     * @returns {boolean} Whether we collided or not
     */
    #checkCollision(dT) {
        let [dx, dy] = [this.#velocity.x, this.#velocity.y];
        let [Sx, Sy] = [Math.sign(dx), Math.sign(dy)];

        // x-axis checks
        if (terrain.getBlock(this.x + Sx * this.width * 0.5 + dx, this.y) != null) {
            dx = 0;//Math.sign(this.#velocity.x) * (1 - Math.abs(this.#velocity.x * dT));
            this.#colliding.x = Sx;
        }

        // y-axis checks
        if (terrain.getBlock(this.x, this.y + Sy * this.height * 0.5 + dy) != null) {
            dy = 0;//Math.sign(this.#velocity.y) * (1 - Math.abs(this.#velocity.y * dT));
            this.#colliding.y = Sy;
        }

        this.velocity.translate(dx, dy);
    }

    /**
     * Method for inducing damage to the entity.
     * @param amount How many hearts of damage to induce
     */
    damage(amount) {
        this.health = Math.max(0, this.health - amount);
    }

    /**
     * Method for rendering the entity onto the screen
     * @param dt difference in time from last rendering.
     */
    draw(dt) {

    }

    // Getter method for checking whether the entity is colliding horizontally or vertically
    get collidingHorizontally() { return this.#colliding.x !== 0; }
    get collidingVertically() { return this.#colliding.y !== 0; }

    get maxHealth() { return this.#maxHealth; }
    get health() { return this.#health; }
    set health(newHealth) { this.#health = Math.min(this.#maxHealth, newHealth); }

    get velocity() { return this.#velocity; }
    get position() { return this.#position; }
}
