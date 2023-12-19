
class Block extends AABB {
    blockType;

    constructor(x, y, blockType) {
        super(x, y, 1, 1);
        this.blockType = blockType;
    }
    
    draw(dT) {
        this.blockType.draw(
            this.left * ppm, window.innerHeight - (this.top + this.height) * ppm,
            this.width * ppm, this.height * ppm);
    }
}
