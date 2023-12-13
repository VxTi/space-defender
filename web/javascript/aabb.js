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
    #x;
    #y;

    /**
     * Creates an AABB with specified dimensions.
     * @param {number} x - X-coordinate of the top-left corner.
     * @param {number} y - Y-coordinate of the top-left corner.
     * @param {number} width - Width of the AABB.
     * @param {number} height - Height of the AABB.
     * The AABB is lined up like the following:
     *    .---.
     *    |   |
     *    '.|.'
     */
    constructor(x, y, width, height) {
        this.#x = x;
        this.#y = y;
        this.#left = x - width / 2;
        this.#top = y + height;
        this.#right = x + width / 2;
        this.#bottom = y;
        this.#width = width;
        this.#height = height;
    }



    // Returns a copy of this Environment
    get copy() {
        return new AABB(this.#left, this.#top, this.#width, this.#height);
    }

    /**
     * Function for translating the X coordinate of the Environment
     * @param {number} newX: The X position to translate to
     */
    translateX(newX) {
        this.#x = newX;
        this.#left = newX - this.#width / 2;
        this.#right = newX + this.#width / 2;
        return this;
    }

    // Function for translating the Y coordinate of the Environment
    translateY(newY) {
        this.#y = newY;
        this.#top = newY + this.#height;
        this.#bottom = newY;
        return this;
    }

    // Function for translating the XY position of the Environment.
    translate(newX, newY) {
        this.#x = newX;
        this.#y = newY;
        this.#left = newX - this.#width / 2;
        this.#top = newY + this.#height;
        this.#right = newX + this.#width / 2;
        this.#bottom = newY;
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

    get position() {
        return new Vec2(this.#x, this.#y);
    }

    // Getters and setters for edge properties
    get left() { return this.#left; }
    set left(value) { this.#left = value; }
    get top() { return this.#top; }
    set top(value) { this.#top = value; }
    get right() { return this.#right; }
    set right(value) { this.#right = value; }
    get bottom() { return this.#bottom; }
    set bottom(value) { this.#bottom = value; }
    get x() { return this.#x; }
    get y() { return this.#y; }


    // Getter and setter methods for width and height
    set width(w) {
        this.#width = w;
        this.#left = this.#x - w / 2;
        this.#right = this.#x + w / 2;
    }

    set height(h) {
        this.#height = h;
        this.#top = this.#y + h;
        this.#bottom = h;
    }

    get width() { return this.#width; }
    get height() { return this.#height; }
}