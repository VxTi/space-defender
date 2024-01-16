
/**
 * Vec2 class
 * Represents a 2D vector with x and y coordinates
 */
class Vec2 {
    // Private fields for x and y coordinates
    #x;
    #y;

    static ZERO = new Vec2();

    /**
     * Constructor for initializing this vector.
     * @param {number} x The x coordinate. Defaults to 0 if not specified
     * @param {number} y The y coordinate. Defaults to 0 if not specified
     */
    constructor(x = 0, y = 0) {
        this.x = x; // Setting the x coordinate
        this.y = y; // Setting the y coordinate
    }

    /**
     * Getter for retrieving a copy of this vector.
     * @returns {Vec2} A copy of this vector
     */
    get copy() { return new Vec2(this.x, this.y); }

    /**
     * Method for translating the x coordinate by another scalar.
     * @param {number} x The value to translate the x coordinate by.
     * @returns {Vec2} The current vector instance, after translating
     */
    translateX(x) { this.x = x; return this; }

    /**
     * Method for translating the y coordinate by another scalar.
     * @param {number} y The value to translate the y coordinate by.
     * @returns {Vec2} The current vector instance, after translating
     */
    translateY(y) { this.y = y; return this; }

    /**
     * Method for translating this vector to another position.
     * @param {Vec2 | number} x If x is a Vec2, this vector is translated to the position of x.
     *                          If x is a number, this vector is translated to [x, y]
     * @param {number | undefined} y If x is a Vec2, this parameter is ignored. Otherwise, it is used as the y coordinate
     * @returns {Vec2} The current vector instance, after translating
     */
    translate(x, y) {
        if (x instanceof Vec2) {
            this.x = x.x;
            this.y = x.y;
            return this;
        }
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * Method for adding a vector or a scalar to the vector
     * @param {Vec2 | number} x The vector or scalar to add to the vector
     * @param {number} y If x is a scalar, this parameter is used as the y value
     * @returns {Vec2} The current vector instance, after adding
     */
    add(x, y) {
        if (x instanceof Vec2) {
            this.x += x.x;
            this.y += x.y;
            return this;
        }
        this.x += x;
        this.y += y;
        return this;
    }

    /**
     * Method for adding to the x coordinate
     * @param {number} x The value to add to the x coordinate
     * @returns {Vec2} The current vector instance, after adding
     */
    addX(x) { this.x += x; return this; }

    /**
     * Method for adding to the y coordinate
     * @param {number} y The value to add to the y coordinate
     * @returns {Vec2} The current vector instance, after adding
     */
    addY(y) { this.y += y; return this; }

    /**
     * Method for multiplying the vector by another vector or by a scalar
     * @param {number | Vec2} x The value to multiply the x coordinate by or a Vec2 to multiply with
     * @param {number | undefined} y If x is a Vec2, this parameter is ignored
     * @returns {Vec2} The current vector instance, after multiplying
     */
    mult(x, y) {
        if (x instanceof Vec2) {
            this.x *= x.x;
            this.y *= x.y;
            return this;
        } else {
            this.x *= x;
            this.y *= y;
            return this;
        }
    }

    /**
     * Setter for the x coordinate
     * @param {number} x The x coordinate
     */
    set x(x) { this.#x = x; }

    /**
     * Setter for the y coordinate
     * @param {number} y The y coordinate
     */
    set y(y) { this.#y = y; }

    /**
     * Getter for the x coordinate
     * @returns {number} The x coordinate
     */
    get x() { return this.#x; }


    /**
     * Getter for the y coordinate
     * @returns {number} The y coordinate
     */
    get y() { return this.#y; }

    /**
     * Method to multiply the vector's x coordinate
     * @param {number} x The value to multiply the x coordinate by
     * @returns {Vec2} The current vector instance
     */
    multX(x) { this.x *= x; return this; }

    /**
     * Method to multiply the vector's y coordinate
     * @param {number} y The value to multiply the y coordinate by
     * @returns {Vec2} The current vector instance
     */
    multY(y) { this.y *= y; return this; }

    /**
     * Getter for retrieving the magnitude of this vector. This is the same
     * as getting the distance from V[0, 0] to this vector.
     */
    get magnitude() {
        return Math.sqrt(this.magSq); // Using Pythagorean theorem to calculate magnitude
    }

    /**
     * Getter for retrieving the squared magnitude of the vector.
     * This is the same as getting the squared distance from V[0, 0] to this vector.
     * @returns {number} The squared magnitude of the vector.
     */
    get magSq() {
        return this.x * this.x + this.y * this.y;
    }

    /**
     * Getter for converting this vector to a normalized one.
     * This converts the coordinate space from range [-infinity to +infinity] to range [-1 to +1]
     * @returns {Vec2} The normalized vector
     */
    get normalized() {
        let mag = this.magnitude;
        return new Vec2(this.x / mag, this.y / mag); // Returning a normalized vector
    }

    /**
     * Measures the squared distance between two vectors.
     * This is faster than performing square root operations.
     * @param {Vec2} other The other vector to measure the distance to
     * @returns {number} The squared distance between the two vectors.
     */
    distSq(other) {
        if (!(other instanceof Vec2))
            return 0;
        return Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2);
    }

    /**
     * Measures distance to the other vector
     * @param {Vec2} other The vector to measure the distance to
     * @returns {number} The distance between the two vectors.
     */
    dist(other) {
        return Math.sqrt(this.distSq(other));
    }
}

