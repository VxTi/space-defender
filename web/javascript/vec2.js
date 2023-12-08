
// Quick class for a 2-dimensional vector
class Vec2 {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    get copy() { return new Vec2(this.x, this.y); }
    translateX(x) { this.x = x; return this; }
    translateY(y) { this.y = y; return this; }
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
    add(x, y) {
        this.x += x;
        this.y += y;
        return this;
    }
    addX(x) {
        this.x += x;
        return this;
    }
    addY(y) {
        this.y += y;
        return this;
    }

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

    multX(x) {
        this.x *= x;
        return this;
    }

    multY(y) {
        this.y *= y;
        return this;
    }

    magnitude() {
        return Math.sqrt(this.magSq);
    }

    get magSq() {
        return this.x * this.x + this.y * this.y;
    }

    get normalize() {
        let mag = this.magnitude();
        return new Vec2(this.x / mag, this.y / mag);
    }
}
