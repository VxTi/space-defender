/**
 * Class representing a mathematical Quad Tree.
 * This data-structure is used to make 2-dimensional data more easily accessible.
 * @author Luca Warmenhoven
 */
class QuadTree {
    #depth;   // The depth of this particular tree instance. Represents a leaf when D = 0
    #nodes;   // The sub-nodes of this instance. Is null when D = 0
    #data;    // Possible data contained in this instance. Only contains data when D = 0 (leaf)
    #scale;   // The size of the coordinate-space. Defaults to 1 (0 <= x <= 1)

    /**
     * Method for creating a quad-tree with predefined depth.
     * Depth determines how many layers of trees there are below this one.
     * Depth = 0 means this tree contains the wanted data.
     * @param {number} depth The depth of the tree.
     * Defines how many children this tree instance has. When depth = 0,
     * this tree would be considered a leaf and will contain the necessary data.
     * @param {number} [size = 1] The scale of this tree.
     * This represents the coordinate space size of this tree.
     */
    constructor(depth, size = 1) {
        this.#depth = depth;
        this.#scale = size;
    }

    /**
     * Method for returning the next coordinates, one layer
     * below the current one.
     * @param {number} x x-coordinate to convert
     * @param {number} y y-coordinate to convert
     * @returns {number[]} an array containing the next coordinates.
     */
    #nextCoordinates(x, y) {
        return [
            (x - Math.round(x / this.#scale) * 0.5 * this.#scale) * 2,
            (y - Math.round(y / this.#scale) * 0.5 * this.#scale) * 2
        ];
    }

    next(x, y) { return this.#nextCoordinates(x, y); }

    /**
     * Method for checking whether the coordinates are within range of this tree
     * @param {number} x x-coordinate to check
     * @param {number} y y-coordinate to check
     * @returns {boolean} Whether or not the coordinates lie within this tree
     */
    #isWithinRange(x, y) { return x >= 0 && y >= 0 && x <= this.#scale && y <= this.#scale; }


    /**
     * Method for retrieving indices for next child node, based on this tree scale
     * @param {number} x x-coordinate [0 <= x <= scale]
     * @param {number} y y-coordinate [0 <= y <= scale]
     * @returns {number} index for next child node. [0 <= i <= 3]
     */
    #getIndices(x, y) {
        return Math.floor(x / this.#scale) * 2 + Math.floor(y / this.#scale);
    }

    /**
     * Method for inserting data in a given point. Data can be of any kind.
     * @param {number} x X coordinate to insert data at ( 0 <= x <= 1 )
     * @param {number} y Y coordinate to insert data at ( 0 <= y <= 1 )
     * @param {any} data The data to insert at the given location
     * @returns {boolean} Whether the insertion was successful or not.
     */
    insert(x, y, data) {
        let node = this, i, d;

        if (!this.#isWithinRange(x, y))
            return false

        for (d = this.#depth - 1; d >= 0; d--) {
            [x, y] = this.#nextCoordinates(x, y);
            i = this.#getIndices(x, y);

            if (node.#nodes == null) {
                node.#nodes = Array(4).fill(null);
                for (let k = 0; k < 4; k++)
                    node.#nodes = new QuadTree(node.#depth - 1);
            }

            // Generate a new branch if it doesn't exist.
            if (node.#nodes[i] == null)
                node.#nodes[i] = new QuadTree(node.#depth - 1);

            node = node.#nodes[i];
        }
        // If no data exists, add a new array with the data
        if (node.#data == null)
            node.#data = [data];
        else node.#data.push(data); // Otherwise, add it to the existing one
        return true;
    }

    /**
     * Method for retrieving data from a given point
     * @param {number} x The x-position from which to retrieve data from ( 0 <= x <= 1 )
     * @param {number} y The y-position from which to retrieve data from ( 0 <= y <= 1 )
     * @returns {any | null} Data from given point. Returns null when no data is present.
     */
    get(x, y) {
        // If the coordinates aren't within range of this tree, return null
        if (!this.#isWithinRange(x, y))
            return null;
        return this.getNode(x, y).#data ?? null; // Returns null when getNode(x, y) returns null.
    }

    /**
     * Method for retrieving node from a given point
     * @param {number} x The x-position from which to retrieve node from ( 0 <= x <= 1 )
     * @param {number} y The y-position from which to retrieve node from ( 0 <= y <= 1 )
     * @returns {QuadTree | null} Node from given point. Returns null when no node is present.
     */
    getNode(x, y) {
        let node = this, i, d;
        if (!this.#isWithinRange(x, y))
            return null;

        // Branch down to the lowest leaf
        for (d = this.#depth - 1; d >= 0; d--) {
            [x, y] = this.#nextCoordinates(x, y);
            i = this.#getIndices(x, y);

            // If the nodes are null or the child nodes are null,
            // it's clear that we don't have any data. stop. now.
            if (node.#nodes == null || node.#nodes[i] == null)
                return null;

            node = node.#nodes[i];
        }
        return node;
    }

    /**
     * Returns a Generator which can be iterated on using 'for (let x of quadTree.iterator()) ... '
     * @returns {Generator<*, void, *>}
     */
    *iterator() {
        // If this is a leaf node, and it contains data, return the data.
        if (this.isLeaf() && this.#data !== undefined) {
            for (let e of this.#data)
                yield e;
        } else {
            // Iterate over each possible sub node and attempt the same as above
            for (let i = 0; i < 4; i++) {
                if (this.#nodes && this.#nodes[i]) {
                    yield* this.#nodes[i].iterator();
                }
            }
        }
    }

    /**
     * Getter for the child nodes of this tree. Only returns valid data when
     * there's data contained in one of the child nodes.
     * @returns {QuadTree[] | null} Returns child nodes if there's data and D > 0.
     * Returns null when no data is present
     */
    get nodes() { return this.#nodes ?? null; }

    /**
     * Method for checking whether this QuadTree instance is a leaf (d == 0)
     * @returns {boolean} Whether or not this is a leaf
     */
    isLeaf() { return this.#depth === 0; }

    /**
     *
     * @returns {*}
     */
    get data() { return this.#data; }
}