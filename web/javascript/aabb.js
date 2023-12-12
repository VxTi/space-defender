/**
 * Represents an Axis Aligned Bounding Box (AABB).
 *
 * An AABB contains parameters such as top-left coordinates (left, top),
 * bottom-right coordinates (right, bottom), and dimensions (width, height).
 * These parameters can be modified after initialization using helper functions.
 */
class AABB {

    // Private fields defining the bounding box
    #left;
    #top;
    #right;
    #bottom;
    #width;
    #height;

    /**
     * Creates an AABB with specified dimensions.
     * @param {number} x - X-coordinate of the top-left corner.
     * @param {number} y - Y-coordinate of the top-left corner.
     * @param {number} width - Width of the AABB.
     * @param {number} height - Height of the AABB.
     */
    constructor(x, y, width, height) {
        this.#left = x;
        this.#top = y;
        this.#right = x + width;
        this.#bottom = y + height;
        this.#width = width;
        this.#height = height;
    }

    // Getter and setter methods for width and height
    set width(w) {
        this.#width = w;
        this.#right = this.#left + w;
    }

    set height(h) {
        this.#height = h;
        this.#bottom = this.#top + h;
    }

    get width() { return this.#width; }
    get height() { return this.#height; }

    // Returns a copy of this Environment
    get copy() {
        return new AABB(this.#left, this.#top, this.#width, this.#height);
    }

    // Function for translating the X coordinate of the Environment
    translateX(newX) {
        this.#left = newX;
        this.#right = newX + this.#width;
        return this;
    }

    // Function for translating the Y coordinate of the Environment
    translateY(newY) {
        this.#top = newY;
        this.#bottom = newY + this.#height;
        return this;
    }

    // Function for translating the XY position of the Environment.
    translate(newX, newY) {
        this.#left = newX;
        this.#top = newY;
        this.#right = newX + this.#width;
        this.#bottom = newY + this.#height;
        return this;
    }

    // Function for checking whether a point lies within the specified boundaries
    intersectsPoint(x, y) {
        return x >= this.#left && x <= this.#right && y >= this.#top && y <= this.#bottom;
    }

    // Function for checking X and Y collisions with `boundingBox`
    intersects(boundingBox) {

        // Check whether our input is of type BoundingBox
        // If not, return false.
        if (!(boundingBox instanceof AABB))
            return false;

        return this.#bottom >= boundingBox.#top && this.#top <= boundingBox.#bottom
            && this.#right >= boundingBox.#left && this.#left <= boundingBox.#right;
    }


    // Getters and setters for left and top properties
    get left() { return this.#left; }
    set left(value) { this.#left = value; }
    get top() { return this.#top; }
    set top(value) { this.#top = value; }
}