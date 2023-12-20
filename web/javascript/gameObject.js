class GameObject {

    #position;

    constructor(x, y) {
        this.#position = new Vec2(x, y);
    }
    update(dT) {}

    get pos() { return this.#position; }
}