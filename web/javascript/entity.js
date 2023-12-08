class Entity extends AABB {

    direction;       // The vector pointing to the direction in which the entity is going
    position;        // position of the entity
    velocity;        // velocity of the entity
    colliding;       // colliding states, containing the direction of collision (x, y)
    fallingDistance; // Distance how long the entity has fallen for.
    health;          // Health of the entity
    maxHealth;       // Max health of the entity
    isAlive;         // Liveliness of the entity
    onGround;        // Whether the entity is on ground or not
    againstWall;     // Whether the entity is colliding with a wall
    shouldDespawn = false;

    #movementSpeed;

    static regenerationInterval = 5; // how many seconds need to pass for one heart to regenerate

    static collisionThreshold = 0.05; // Detection threshold in meters

    constructor(posX, posY, maxHealth, width, height, movementSpeed) {
        super(posX, posY, width, height);
        this.#movementSpeed = movementSpeed;
        this.direction = new Vec2(0, 0);
        this.position  = new Vec2(posX, posY);
        this.velocity  = new Vec2(0, 0);
        this.colliding = new Vec2(0, 0);
        this.fallingDistance = 0;
        this.isAlive = true;
        this.health = maxHealth;
        this.maxHealth = maxHealth;
        this.onGround = false;
    }

    // Function that allows the entity to move based on the input vector.
    // The provided vector must be normalized, e.g. -1 <= x & y <= 1
    // If this isn't the case, the player will move faster than necessary.
    move(movementVector = new Vec2(0, 0)) {
        if (!(movementVector instanceof Vec2))
            return;

        this.velocity.translate(
            movementVector.x * horizontalSpeed * this.#movementSpeed,
            movementVector.y * verticalSpeed * this.#movementSpeed
        );
    }

    update(dT) {

        this.velocity.add(
            !this.againstWall ? this.direction.x * horizontalSpeed * 0.25 * this.#movementSpeed : 0,
            this.onGround || (allowDoubleJump && this.againstWall && this.velocity.y < 0)
                ? this.direction.y * verticalSpeed * this.#movementSpeed : 0);
        //this.direction.translate(0, 0);

        // Set it to an unrealistic number, just before testing for collision.
        // Makes it easier to test whether collision detection has finished, without allocating more memory.
        this.colliding.translate(0, 0);

        // Natural regeneration, every ten seconds
        this.health = Math.min(this.health + dT / Entity.regenerationInterval, this.maxHealth);

        // Check if the next position of the entity is colliding with another
        for (let i = 0; i < Environment.boundingBoxes.length; i++) {
            let target = Environment.boundingBoxes[i];

            // Collision detection with self is always going to be true so let's just skip that shall we...
            if (!(target instanceof Block))
                continue;

            // If another class extends this class and defines the function 'onCollisionCheck',
            // this then calls the function with the current target as parameter.
            // If this function returns false, collision detection should skip this target
            if (typeof(this['onCollisionCheck']) === 'function' && !this['onCollisionCheck'](target))
                continue;

            /**
             * SECTION: X AXIS COLLISION DETECTION
             **/

            // perform calculations for x-axis collision detection
            if (this.colliding.x === 0 && Math.abs(this.velocity.x) >= Entity.collisionThreshold) {
                for (let j = 0; j <= Math.abs(this.velocity.x * dT) + Entity.collisionThreshold * 2; j += Entity.collisionThreshold) {
                    if (this.copy.translateX(this.position.x + j * Math.sign(this.velocity.x)).intersects(target)) {
                        this.colliding.x = Math.sign(this.velocity.x);
                        if (typeof(this['onCollisionX']) === 'function')
                            this['onCollisionX'](target);
                        this.velocity.x = 0;
                        break;
                    }
                }
            }

            /**
             * SECTION: Y AXIS COLLISION DETECTION
             **/

            // Perform calculations for y-axis collision detection
            if (this.colliding.y === 0 && Math.abs(this.velocity.y) >= Entity.collisionThreshold) {
                for (let j = 0; j <= Math.abs(this.velocity.y * dT) + Entity.collisionThreshold * 2; j += Entity.collisionThreshold) {
                    if (this.copy.translateY(this.position.y + j * Math.sign(this.velocity.y)).intersects(target)) {

                        this.colliding.y = Math.sign(this.velocity.y);

                        if (typeof(this['onCollisionY']) === 'function')
                            this['onCollisionY'](target);

                        this.velocity.y = 0;
                        break;
                    }
                }
            }

            // If we're colliding on both axis, stop further checks
            if (this.colliding.x !== 0 && this.colliding.y !== 0)
                break;
        }

        // Add velocity to position
        this.position.add(this.velocity.x * dT, this.velocity.y * dT);

        this.isAlive = this.health !== 0;
        this.onGround = this.colliding.y < 0;
        this.againstWall = this.colliding.x !== 0;

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
            this.velocity.addY(-Environment.G * dT);
        }



        // Reduce x-axis motion gradually (if there is any)
        this.velocity.x *= 0.8;

        // Limit falling to bottom screen so the player doesn't randomly disappear.
        this.position.y = Math.max(this.position.y, 0);

        // Update the AABB position
        this.translate(this.position.x, this.position.y);
    }

    /**
     * Method for inducing damage to the entity.
     * @param source
     * @param amount How many hearts of damage to induce
     */
    damage(amount, source = 'unknown') {
        this.health = Math.max(0, this.health - amount);
        console.log(`Damage received [${this}], ${amount}hp from ${source}`);
    }

    /**
     * Method for rendering the entity onto the screen
     * @param dt difference in time from last rendering.
     */
    draw(dt) {

    }
}
