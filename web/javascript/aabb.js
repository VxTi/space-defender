/**
 * Represents an Axis Aligned Bounding Box (AABB).
 *
 * An AABB contains parameters such as top-left coordinates (left, top),
 * bottom-right coordinates (right, bottom), and dimensions (width, height).
 * These parameters can be modified after initialization using helper functions.
 */
class AABB {

    // Private fields defining the bounding box
    #width;
    #height;
    #x;
    #y;

    /**
     * Creates an AABB with specified dimensions.
     * @param {number} x - X-coordinate of the top-left corner.
     * @param {number} y - Y-coordinate of the top-left corner.
     * @param {number} width - Width of the AABB.
     * @param {number} height - Height of the AABB.
     */
    constructor(x, y, width, height) {
        this.#width = width;
        this.#height = height;
        this.translate(x, y);
    }



    // Returns a copy of this Environment
    get copy() {
        return new AABB(this.#x, this.#y, this.#width, this.#height);
    }

    /**
     * Function for translating the X coordinate of the Environment
     * @param {number} newX: The X position to translate to
     */
    translateX(newX) {
        this.#x = newX;
        return this;
    }

    // Function for translating the Y coordinate of the Environment
    translateY(newY) {
        this.#y = newY;
        return this;
    }

    // Function for translating the XY position of the Environment.
    translate(newX, newY) {
        this.translateX(newX);
        this.translateY(newY);
        return this;
    }

    // Function for checking whether a point lies within the specified boundaries
    intersectsPoint(x, y) {
        return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom;
    }

    // Function for checking X and Y collisions with `boundingBox`
    intersects(boundingBox) {

        // Check whether our input is of type BoundingBox
        // If not, return false.
        if (!(boundingBox instanceof AABB))
            return false;

        return this.bottom >= boundingBox.top && this.top <= boundingBox.bottom
            && this.right >= boundingBox.left && this.left <= boundingBox.right;
    }

    get position() {
        return new Vec2(this.#x, this.#y);
    }

    // Getters and setters for edge properties
    get left() { return this.#x - this.#width * 0.5; }
    get top() { return this.#y + this.#height * 0.5; }
    get right() { return this.#x + this.#width * 0.5; }
    get bottom() { return this.#y - this.#height * 0.5; }
    get x() { return this.#x; }
    get y() { return this.#y; }


    // Getter and setter methods for width and height
    set width(w) {
        this.#width = w;
    }

    set height(h) {
        this.#height = h;
    }

    get dimensions() { return new Vec2(this.#width, this.#height); }
    get width() { return this.#width; }
    get height() { return this.#height; }
}