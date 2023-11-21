/*
 * Class for bounding box collision detection.
 * 'Environment', meaning 'Axis Aligned Bounding Box', used for 2-dimensional collision detection.
 */
import {Entity} from "./entity";

export class  AABB {
    left;
    top;
    right;
    bottom;
    width;
    height;

    // Constructor for defining a bounding box with specified dimensions.
    constructor(x, y, width, height) {
        this.left = x;
        this.top = y;
        this.right = x + width;
        this.bottom = y + height;
        this.width = width;
        this.height = height;
    }

    // Returns a copy of this Environment
    copy() {
        return new AABB(this.left, this.top, this.width, this.height);
    }

    // Function for translating the X coordinate of the Environment
    translateX(newX) {
        this.left = newX;
        this.right = newX + this.width;
        return this;
    }

    // Function for translating the Y coordinate of the Environment
    translateY(newY) {
        this.top = newY;
        this.bottom = newY + this.height;
        return this;
    }

    // Function for translating the XY position of the Environment.
    translate(newX, newY) {
        this.left = newX;
        this.top = newY;
        this.right = newX + this.width;
        this.bottom = newY + this.height;
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
}

export class Environment {
    static gravitationalConstant = 9.81;
    static boundingBoxes = [];
    static collides(boundingBox) {
        for (let other in this.boundingBoxes) {
            if (boundingBox.collides(other))
                return true;
        }
        return false;
    }

    static introduce(aabb) {
        if (!(aabb instanceof Entity))
            return;

        this.boundingBoxes.push(aabb);
    }

    static update(deltaT) {
        this.boundingBoxes.forEach(player => player.update(deltaT));
    }
}