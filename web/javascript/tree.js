

class QTree {
    #depth;          // The depth of this particular tree instance. Represents a leaf when D = 0
    #nodes;          // The sub-nodes of this instance. Is null when D = 0
    #data = {};  // Possible data contained in this instance. Only contains data when D = 0 (leaf)

    /**
     * Method for creating a quad-tree with predefined depth.
     * Depth determines how many layers of trees there are below this one.
     * Depth = 0 means this tree contains the wanted data.
     * @param depth
     */
    constructor(depth) {
        this.#depth = depth;
    }


    /**
     * Method for inserting data in a given point. Data can be of any kind.
     * @param {number} x X coordinate to insert data at ( 0 <= x <= 1 )
     * @param {number} y Y coordinate to insert data at ( 0 <= y <= 1 )
     * @param {any} data The data to insert at the given location
     */
    insert(x, y, data) {
        let node = this, i, d;

        for (d = this.#depth - 1; d >= 0; d--) {
            x = 2 * x - Math.round(x) * 0.5;
            y = 2 * y - Math.round(y) * 0.5;
            i = Math.round(x) * 2 + Math.round(y);
            if (node.#nodes == null) {
                node.#nodes = Array(4);
                for (let k = 0; k < 4; k++) node.#nodes = new QTree(node.#depth - 1);
            }

            if (d >= 0) {
                if (node.#nodes[i] == null)
                    node.#nodes[i] = new QTree(node.#depth - 1);

                node = node.#nodes[i];
            }
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
        let node = this.getNode(x, y);
        return node == null ? null : node.#data;
    }

    /**
     * Method for retrieving node from a given point
     * @param {number} x The x-position from which to retrieve node from ( 0 <= x <= 1 )
     * @param {number} y The y-position from which to retrieve node from ( 0 <= y <= 1 )
     * @returns {QTree | null} Node from given point. Returns null when no node is present.
     */
    getNode(x, y) {
        let node = this, i, d;

        for (d = this.#depth - 1; d >= 0; d--) {
            x = 2 * x - Math.round(x) * 0.5;
            y = 2 * y - Math.round(y) * 0.5;
            i = Math.round(x) * 2 + Math.round(y);
            if (node.#nodes == null || (node.#nodes[i] == null && d > 0))
                return null;

            node = node.#nodes[i];
        }
        return node;
    }
}