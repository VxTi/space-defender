/**
 * Class used for environmental cases
 * Main functions of this class are
 * - Initializing all elements in the world
 * - Updating the states of all these elements
 * - Rendering them onto the screen
 **/
class Terrain {
    static G = 5; // gravitational constant in meters/second
    static boundingBoxes = [];
    static entities = [];

    // Representing how many children the terrain quad tree has
    static #TREE_DEPTH = 5;

    #terrainSize; // Size of the terrain. This will be used in the quad tree containing terrain data.
    #terrain;     // Quad-tree containing all the blocks of the terrain.

    // List of entities in the world. Since entities are less than blocks we don't need quadtrees
    #entities = [];

    #seed;        // Seed of the terrain
    #randomness = 0.05;
    #terrainHeight = 15;

    /**
     * Constructor for creating an arbitrary terrain
     * @param {number} seed The seed to generate the terrain with. When null, it uses a randomly-generated one.
     * @param {number} terrainSize Size of the terrain, Terrain size must be [1 <= St <= 2^20]
     */
    constructor(seed, terrainSize) {
        this.#seed = seed | Math.floor((1 << 10) * Math.random());
        this.#terrainSize = Math.max(Math.min(terrainSize, 1 << 20), 1); // make sure [1 <= St <= 2^20]
        this.#terrain = new QuadTree(Terrain.#TREE_DEPTH, this.#terrainSize);        // Create tree with depth 6 and appropriate size
    }

    /**
     * Method for adding a block to the world
     * @param {number} x x-coordinate to introduce the block at
     * @param {number} y y-coordinate to introduce the block at
     * @param {BlockType} blockType The type of block to introduce
     * @returns {boolean} Whether the adding was successful or not.
     */
    addBlock(x, y, blockType) {
        /*if (!(blockType instanceof BlockType))
            return false;*/

        // Make sure they're integer coordinates
        [x, y] = [Math.round(x), Math.round(y)]

        // Attempt to get the node at the given location
        let node = this.#terrain.getNode(x, y);
        // If there's no node at the given location yet, add a new array with one block
        if (node == null)
            this.#terrain.insert(x, y, [new Block(x, y, blockType)]);
        else // Otherwise, retrieve the array and add the block to it.
            this.#terrain.get(x, y).push(new Block(x, y, blockType));
        return true;
    }

    /**
     * Method for retrieving a block at a given coordinate
     * @param {number} x x-coordinate to retrieve block at
     * @param {number} y y-coordinate to retrieve block at
     * @returns {BlockType} Block type at given coordinate. Returns null when no block is present.
     */
    getBlock(x, y) {
        let node = this.#terrain.getNode(x, y);

        // If no collection of data exists at point [x, y], return null
        if (node == null || node.getData() == null)
            return null;

        // Iterate over all blocks in the data structure and check whether there exists a block at [x, y]
        // If getData doesn't contain an array, it will automatically skip to return null.
        for (let block of node.getData()) {
            if (Math.abs(block.x - x) <= 0.01  && Math.abs(block.y - y) <= 0.01)
                return block;
        }
        return null;
    }

    /**
     * Method for adding an entity into the world
     * @param {Entity} entity The entity to introduce.
     * The Entity constructor already has coordinates as parameters, so these
     * are redundant here.
     * @returns {boolean} Whether adding the entity to the world was successful.
     */
    addEntity(entity) {
        if (!(entity instanceof Entity))
            return false;
        this.#entities.push(entity);
    }

    /**
     *  Method for generating terrain
     *  This terrain generation uses perlin-noise for pseudo-random terrain.
     *  If one wants to keep the same terrain, one must provide the same seed and
     *  generation parameters.
     **/

    generate() {
        let F = (x) => noise(x) * 0.75 + noise(x / 2) * 0.25 + noise(x / 4) * 0.25;

        for (let x = 0; x < this.#terrainSize; x++) {
            let posY = Math.floor(F(x * this.#randomness) * this.#terrainHeight);
            for (let y = 0; y < posY; y++) {

                let blockType =
                    y === posY - 1 ? BlockType.grass_block :
                        y >= posY - 3 ? BlockType.dirt : BlockType.stone;
                this.addBlock(x ,y, blockType);
            }
        }
    }

    /**
     * Method for updating all the entities in the world.
     * This means, updating their location and checking for collision.
     * @param {number} deltaT Difference in time passed since last update, in seconds.
     */
    update(deltaT) {
        // kijk naar een ECS.
        this.#entities.forEach(object => object.update(deltaT));
    }


    /**
     * Method for rendering the world.
     * This renders both entities and blocks
     * @param dT Difference in time since last render call, in seconds
     */
    draw(dT) {
        for (let element of this.#terrain.iterator())
            element.draw(dT);
        this.#entities.forEach(e => e.draw(dT));
    }

    get terrain() { return this.#terrain; }

    static remove(aabb) {
        for (let i = 0, l = Terrain.boundingBoxes.length; i < l; i++) {
            if (Terrain.boundingBoxes[i] === aabb || Terrain.boundingBoxes[i] === aabb.__proto__) {
                Terrain.boundingBoxes.splice(i, 1);
                return;
            }
        }
    }
}