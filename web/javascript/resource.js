
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


    // Loads an image from the provided location.
    // Is possible to load multiple at the same time by providing a horizontalCount and verticalCount.
    // These numbers represent how many images are present on those two axis.
    // Initialization of this class MUST be done in the 'preload' function, otherwise it will NOT work.
    constructor(image, horizontalCount = 1, verticalCount = 1) {
        this.#image = image
        this.#width = image.width;
        this.#height = image.height;
        this.#horizontal = horizontalCount;
        this.#vertical = verticalCount;
        this.#partWidth = image.width / horizontalCount;
        this.#partHeight = image.height / verticalCount;
    }

    // Renders a section of the provided image.
    // If one wants to render the image normally, just provide the first four arguments.
    // dx = start X, dy = start Y
    // dw = partial width, dh = partial height
    draw(x, y, width, height, dx = 0, dy = 0, dw = this.#partWidth, dh = this.#partHeight) {
        image(this.#image, x, y, width, height, dx, dy, dw, dh);
    }

    // Function that allows the user to animate different sections of a provided resource.
    // If a provided resource has multiple horizontal and vertical sections and the user provided these in the
    // constructor with 'horizontalCount' and 'verticalCount' (h, v) > 0
    animate(x, y, width, height, animationIndex = 0) {
        animationIndex %= (this.#horizontal + this.#vertical + 1); // Make sure the animation index is within bounds
        this.draw(x, y, width, height,
            this.#partWidth * (animationIndex % this.#horizontal),
            this.#partHeight * Math.floor(animationIndex / this.#horizontal));
    }

}