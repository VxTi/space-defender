/**
 * Class representing the abstraction of the player.
 * The player is an extension of the Entity class,
 * therefore one doesn't need to add special functionality to it.
 * One can overwrite certain functions in the entity class to make
 * edits to the player's behaviour / rendering.
 */
class Player extends Entity {

    static #playerHealth = 20;

    #coins = 0; // Coins the player has gathered
    #score = 0; // Points the player received

    constructor(x, y) {
        super(x, y, Player.#playerHealth, 0.9, 1.8, 1);
    }

    // Updates player-related variables, such as screen position
    update(dT) {
        super.update(dT);
        if (this !== player)
            return;

        // If you come too close to the corner of the screen horizontally, move the camera accordingly.
        if (this.position.x + screenOffsetX < screenEdgeMargin) // left side of the screen
            screenOffsetX = -this.position.x + screenEdgeMargin;
        else if (this.position.x + screenOffsetX > windowWidthInMeters - screenEdgeMargin) // right side
            screenOffsetX = -this.position.x + windowWidthInMeters - screenEdgeMargin;

        // Perform the same translation on the Y axis
        if (this.position.y + screenOffsetY < screenEdgeMargin) // bottom side of the screen
            screenOffsetY = -this.position.y + screenEdgeMargin;
        else if (this.position.y + screenOffsetY > windowHeightInMeters - screenEdgeMargin) // top side
            screenOffsetY = -this.position.y + windowHeightInMeters - screenEdgeMargin;
    }


    /**
     * Function for rendering all player-related elements.
     * This currently includes:
     * - Rendering the character's animation     (when moving)
     * - Rendering the healthbar above the player (if enabled)
     * - Rendering the hitbox of the player       (if enabled)
     */
    draw(dt) {

        push();
        {
            // Translate draw location to player's screen position
            translate((this.position.x) * pixelsPerMeter,
                window.innerHeight - (this.height + this.position.y) * pixelsPerMeter);

            // Render the player image (animate when walking)
            animations['playerAnimation'].animate(
                -10, 0, // since we translated, the player's screen pos is at 0, 0 in the current matrix.
                this.width * pixelsPerMeter * 2,
                this.height * pixelsPerMeter,
                Math.abs(this.velocity.x) > horizontalSpeed * 0.5 ?
                    Math.floor(timePhase * 5) % 4 : 0);

            drawHealthBar(this.position.x, this.position.y + this.height, this.health, this.maxHealth);
            // And shortly, the outline of the player (AABB)
            if (showBoundingBox) {
                stroke(255, 0, 0);
                fill(0, 0, 0, 0);
                rect(0, 0, this.width * pixelsPerMeter, this.height * pixelsPerMeter);
            }
        }
        pop();
    }

}