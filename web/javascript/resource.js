
// Class for loading resources into the game.
// This class allows the user to render animations or just draw regular images.
class Resource {

    // Private fields containing all the data from the image
    // provided in the constructor.
    #image;         // The p5.Image object
    #width;         // Width of the image
    #height;        // Height of the image
    #partWidth;     // Width of each sub-image
    #partHeight;    // Height of each sub-image
    #horizontal;    // How many horizontal sub-images the provided image contains
    #vertical;      // How many vertical sub-images the provided image contains


    /**
     * Constructor for creating a custom resource.
     * This constructor asks for a p5.Image as input, which has to be retrieved in the 'preload' function
     * with 'loadImage(...)'. This can then be converted to a resource after loading was successful.
     * @param {p5.Image } image The image object
     * @param {number} [horizontalCount = 1] The amount of sub-images the p5.Image object contains.
     * These are abstract sub images, meaning this object can draw them more easily by dividing the image
     * into multiple subsections.
     * @param {number} [verticalCount = 1] See horizontalCount. This defines how many sub-images this
     * p5.Image has, vertically.
     */
    constructor(image, horizontalCount = 1, verticalCount = 1) {
        this.#image = image
        this.#width = image.width;
        this.#height = image.height;
        this.#horizontal = horizontalCount;
        this.#vertical = verticalCount;
        this.#partWidth = image.width / horizontalCount;
        this.#partHeight = image.height / verticalCount;
    }

    /**
     * Method for drawing the p5 Image onto the screen with some additional parameters.
     * Allows the user to draw only a section of the provided image, or the full image
     * if no additional parameters are provided.
     * @param x screen x-coordinate to draw the image at
     * @param y screen y-coordinate to draw the image at
     * @param width horizontal size of the image
     * @param height vertical size of the image
     * @param dx x offset of the image to draw in image-pixels. Default = 0
     * @param dy y offset of the image to draw in image-pixels. Default = 0
     * @param dw width of the sub-image to draw, in image-pixels.
     * @param dh height of the sub-image to draw, in image-pixels
     */
    draw(x, y, width, height, dx = 0, dy = 0, dw = this.#partWidth, dh = this.#partHeight) {
        image(this.#image, x, y, width, height, dx, dy, dw, dh);
    }

    /**
     * Method for drawing a subsection of the image.
     * This method only works if this resouce has a Horizontal or Vertical sub image count > 1
     * @param x Screen x-coordinate to draw at
     * @param y Screen y-coordinate to draw at
     * @param width Width of the image to draw
     * @param height Height of the image to draw
     * @param horizontalIndex Horizontal index of the sub-image to draw
     * @param verticalIndex Vertical index of the sub-image to draw
     */
    drawSection(x, y, width, height, horizontalIndex = 0, verticalIndex = 0) {
        image(this.#image, x, y, width, height, this.#partWidth * horizontalIndex, this.#partHeight * verticalIndex, this.#partWidth, this.#partHeight);
    }

    /**
     * Method for allowing users to render an animation onto the screen.
     * This is done by dividing the image in subsections, and displaying these after one another.
     * This can be done by calling the constructor with 'horizontalCount' and 'verticalCount' > 1
     * If one then wants to render the animation, you simply have to call 'animate(x, y, w, h, index)' where
     * index = the index of the sub-image in the main image. Order of this is left to right, then top to bottom
     * @param x screen x-coordinate to draw the image at
     * @param y screen y-coordinate to draw the image at
     * @param width width of the image
     * @param height height of the image
     * @param animationIndex The index of which sub-image to draw.
     */
    animate(x, y, width, height, animationIndex = 0) {
        animationIndex %= (this.#horizontal + this.#vertical + 1); // Make sure the animation index is within bounds
        this.draw(x, y, width, height,
            this.#partWidth * (animationIndex % this.#horizontal),
            this.#partHeight * Math.floor(animationIndex / this.#horizontal));
    }

    get image() { return this.#image; }

}