class Quadtree {
    constructor(x, y, size, depth = 0) {
        this.depth = depth;
        this.x = x;
        this.y = y;
        this.size = size;
        // this.subdivided = false;
        this.points = [];
        this.quads = [];
    }

    checkBoundary(point) {
        const { x: px, y: py } = point;
        const { x, y, size } = this;

        return px >= x && px <= x + size && py >= y && py <= y + size;
    }

    insert(point) {
        // Out of bounds
        if (!this.checkBoundary(point)) {
            return;
        }

        // Still has capacity
        if (this.points.length < opts.capacity) {
            this.points.push(point);
            return;
        }

        // At capacity
        // 1. Create subtrees if we haven't
        // 2. Pass pint to child trees
        if (this.quads.length === 0) {
            this.subdivide();
        }
        // Send to all child trees, they have boundary checks so the point
        // will only get added to the appropriate one.
        this.quads.forEach((quad) => {
            quad.insert(point);
        });
    }

    subdivide() {
        const { x, y, size } = this;
        const half = size / 2;
        const depth = this.depth + 1;

        this.quads.push(
            new Quadtree(x, y, half, depth), // NW
            new Quadtree(x + half, y, half, depth), // NE
            new Quadtree(x, y + half, half, depth), // SW
            new Quadtree(x + half, y + half, half, depth) // SW
        );
    }
}