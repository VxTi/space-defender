
// Quick class for a 2-dimensional vector

class Vec2 {
    // Private fields for x and y coordinates
    #x;
    #y;

    // Constructor to initialize the vector with x and y coordinates
    constructor(x, y) {
        this.x = x; // Setting the x coordinate
        this.y = y; // Setting the y coordinate
    }

    // Getter for creating a copy of the vector
    get copy() { return new Vec2(this.x, this.y); }

    // Methods to translate the vector along the x and y axes
    translateX(x) { this.x = x; return this; }
    translateY(y) { this.y = y; return this; }

    // Method to translate the vector by specific x and y values or by another Vec2
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

    // Methods to add values to the vector's x and y coordinates
    add(x, y) {
        this.x += x;
        this.y += y;
        return this;
    }
    addX(x) { this.x += x; return this; }
    addY(y) { this.y += y; return this; }

    // Method to multiply the vector by specific x and y values or by another Vec2
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

    // Setter for the x coordinate
    set x(x) { this.#x = x; }

    // Setter for the y coordinate
    set y(y) { this.#y = y; }

    // Getter for the x coordinate
    get x() { return this.#x; }

    // Getter for the y coordinate
    get y() { return this.#y; }

    // Methods to multiply the vector's x and y coordinates
    multX(x) { this.x *= x; return this; }
    multY(y) { this.y *= y; return this; }

    // Getter for the magnitude of the vector
    get magnitude() {
        return Math.sqrt(this.magSq); // Using Pythagorean theorem to calculate magnitude
    }

    // Getter for the squared magnitude of the vector (faster than computing actual magnitude)
    get magSq() {
        return this.x * this.x + this.y * this.y;
    }

    // Getter for a normalized (unit-length) version of the vector
    get normalize() {
        let mag = this.magnitude;
        return new Vec2(this.x / mag, this.y / mag); // Returning a normalized vector
    }

    //  measures distance squared to the other vector
    distSq(other) {
        if (!(other instanceof Vec2))
            return 0;
        return (this.x - other.x) * (this.x - other.x) + (this.y - other.y) * (this.y - other.y);
    }

    // measures distance to the other vector
    dist(other) {
        return Math.sqrt(this.distSq(other));
    }
}

