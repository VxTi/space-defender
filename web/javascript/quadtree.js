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
     * @param {number} [scale = 1] The scale of this tree.
     * This represents the coordinate space size of this tree.
     */
    constructor(depth, scale = 1) {
        this.#depth = depth;
        this.#scale = scale;
    }

    /**
     * Method for returning the next coordinates, one layer
     * below the current one.
     * @param {number} x x-coordinate to convert
     * @param {number} y y-coordinate to convert
     * @returns {number[]} an array containing the next coordinates.
     */
    #nextCoordinates(x, y) { return [2 * x - Math.round(x) * 0.5, 2 * y - Math.round(y) * 0.5]; }

    /**
     * Method for converting coordinates to appropriate coordinate space.
     * Input parameters are of default size
     * @param {number} x x-coordinate to convert
     * @param {number} y y-coordinate to convert
     * @returns {number[]} Array object containing converted x and y coordinates in appropriate sizes.
     */
    #toCoordinateSpace(x, y) { return [x / this.#scale, y / this.#scale]; }

    /**
     * Method for inserting data in a given point. Data can be of any kind.
     * @param {number} x X coordinate to insert data at ( 0 <= x <= 1 )
     * @param {number} y Y coordinate to insert data at ( 0 <= y <= 1 )
     * @param {any} data The data to insert at the given location
     */
    insert(x, y, data) {
        let node = this, i, d;

        [x, y] = this.#toCoordinateSpace(x, y);

        for (d = this.#depth - 1; d >= 0; d--) {
            [x, y] = this.#nextCoordinates(x, y);
            i = Math.round(x) * 2 + Math.round(y);
            if (node.#nodes == null) {
                node.#nodes = Array(4);
                for (let k = 0; k < 4; k++) node.#nodes = new QuadTree(node.#depth - 1);
            }

            // Generate a new branch if it doesn't exist.
            if (node.#nodes[i] == null)
                node.#nodes[i] = new QuadTree(node.#depth - 1);

            node = node.#nodes[i];
        }
        node.#data = data;
    }

    /**
     * Method for retrieving data from a given point
     * @param {number} x The x-position from which to retrieve data from ( 0 <= x <= 1 )
     * @param {number} y The y-position from which to retrieve data from ( 0 <= y <= 1 )
     * @returns {any | null} Data from given point. Returns null when no data is present.
     */
    get(x, y) {
        [x, y] = this.#toCoordinateSpace(x, y);  // Convert to appropriate coordinates
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
        [x, y] = this.#toCoordinateSpace(x, y);

        // Branch down to the lowest leaf
        for (d = this.#depth - 1; d >= 0; d--) {
            [x, y] = this.#nextCoordinates(x, y);
            i = Math.round(x) * 2 + Math.round(y);

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

    isLeaf() { return this.#depth === 0; }
    getData() { return this.#data; }

}