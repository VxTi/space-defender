class EntityWizard extends Entity {

    strength;
    target = null;
    fireballCooldown = 0;

    static fireballDelay = 3;
    static wizardHealth = 30;
    static maxReachableDistance = 20;
    static damageReach = 3;
    static movementSpeed = 0.6;
    constructor(x, y, strength) {
        super(x, y, EntityWizard.wizardHealth, 1.5, 2.6, EntityWizard.movementSpeed);
        this.strength = strength;
    }

    draw(dt) {
        push();
        translate((this.position.x) * pixelsPerMeter,
            window.innerHeight - (this.height + this.position.y) * pixelsPerMeter);

        // Render the player image (animate when walking)
        image(resources['wizard'],
            -10, 0, // since we translated, the player's screen pos is at 0, 0 in the current matrix.
            this.width * pixelsPerMeter,
            this.height * pixelsPerMeter);

        // Rendering of the hearts above the player
        for (let i = 1, w = pixelsPerMeter * 0.4; i <= this.maxHealth / 2; i++) {
            image(resources[this.health >= i * 2 ? "heart" : Math.round(this.health )=== i * 2 ? "heart_half" : "heart_background"],
                - (this.maxHealth / 4) * w + (i + 1) * (w - 2),
                -10, w, w);
        }
        pop();
    }

    update(dT) {
        super.update(dT);
        if (this.target != null) { // make an attempt for pathfinding...
            this.direction.translate(
                Math.sign(this.target.position.x - this.position.x), Math.sign(Math.abs(this.target.position.y - this.position.y)));
        }
    }

    #isTargetValid(target) {
        return target != null &&
            target !== this &&
            target instanceof Player &&
            Math.pow(target.position.x - this.position.x, 2) +
            Math.pow(target.position.y - this.position.y, 2) <= Math.pow(EntityWizard.maxReachableDistance, 2)
    }

    onPeriodicUpdate() {

        // Check whether our target is still valid or not
        if (this.target != null) {
            if (!this.#isTargetValid(this.target))
                this.target = null;
            else if (Math.pow(this.target.position.x - this.position.x, 2) +
                    Math.pow(this.target.position.y - this.position.y, 2) <= Math.pow(EntityWizard.damageReach, 2)) {

                // Entity is close enough to do damage
                // NOTE: bad practice omditzo te doen. Ik zou een global damage controler maken die dit doet voor je.
                this.target.damage(this.strength * 0.5, 'entityWizardAttack');
            }
        }

        // NOTE: if statement of dit nodig is. Dit maakt onPeriodicUpdate O(#entitys) tijds complex.
        Environment.entities.forEach(e => {
            if (this.#isTargetValid(e) && this.target == null) // Select the target if the entity hasn't focused yet
                this.target = e;
        });
    }
}