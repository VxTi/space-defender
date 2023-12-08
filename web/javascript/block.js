
class Block extends AABB {
    blockType;

    constructor(x, y, blockType) {
        super(x, y, 1, 1);
        this.blockType = blockType;
    }
}
