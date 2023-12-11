

/**
 * Class used for environmental cases
 * Main functions of this class are
 * - Initializing all elements in the world
 * - Updating the states of all these elements
 * - Rendering them onto the screen
 **/
class Environment {
    static G = 16; // gravitational constant in meters/second
    static boundingBoxes = [];
    static entities = [];


    // Method for introducing a new AABB into the world
    static introduce(aabb) {
        if (!(aabb instanceof AABB))
            return;

        if (aabb instanceof Entity) {
            this.entities.push(aabb);
        }
        this.boundingBoxes.push(aabb);
    }

    // Method for updating all entities in the entities array
    static update(deltaT) {
        // kijk naar een ECS.
        this.entities.forEach(object => object.update(deltaT));
    }

    static regenerate() {
        Environment.boundingBoxes = [];
        Environment.boundingBoxes.push(Environment.entities);
        Environment.generate();
    }

    /**
     *  Method for generating terrain
     *  This terrain generation uses perlin-noise for
     *  pseudo-random terrain. This differs every time the
     *  user refreshes the website, or calls 'Environment.regenerate()'
     **/
    static generate() {

        // generate ground (temp)
        let n = 500;
        let fnY = (x) => noise(x) * 0.75 + noise(x / 2) * 0.25 + noise(x / 4) * 0.25;

        for (let x = 0; x < n; x++) {
            let posY = Math.floor(fnY(x * terrainRandomness) * terrainHeight);
            for (let y = 0; y < posY; y++) {

                let blockType =
                    y === posY - 1 ? BlockType.grass_block :
                        y >= posY - 3 ? BlockType.dirt : BlockType.stone;
                Environment.introduce(new Block(x, y, blockType));
            }
        }
    }

    // Method for drawing all objects in the world.
    // This includes entities and blocks (currently)
    static draw(dT) {
        this.boundingBoxes.forEach(element => {

            // Check whether the object is on-screen. If not, we skip rendering.
            if ((element.right + screenOffsetX) * pixelsPerMeter < 0 ||
                (element.left + screenOffsetX) * pixelsPerMeter > window.innerWidth ||
                (element.bottom + screenOffsetY) < 0 ||
                (element.top + screenOffsetY) > window.innerHeight)
                return;

            if (element instanceof Block) {
                element.blockType.draw(
                    element.left * pixelsPerMeter, window.innerHeight - (element.top + element.height) * pixelsPerMeter,
                    element.width * pixelsPerMeter, element.height * pixelsPerMeter);
            } else if (element instanceof Entity) {
                element.draw(dT);
            }
        });
    }

    static remove(aabb) {
        for (let i = 0, l = Environment.boundingBoxes.length; i < l; i++) {
            if (Environment.boundingBoxes[i] === aabb || Environment.boundingBoxes[i] === aabb.__proto__) {
                Environment.boundingBoxes.splice(i, 1);
                return;
            }
        }
    }
}