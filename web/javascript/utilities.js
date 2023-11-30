
/*
 * Bluetooth service class.
 * With this class you're able to make a bluetooth connection with multiple devices at the same time.
 * To start, one must call "BluetoothService.search(optional filters)" to receive a Bluetooth device.
 *
 * Once one has selected a device successfully, you can then do 'BluetoothService.search(...).then(device => ...)'
 * To further connect, you can create an instance of the class in the 'then(device => ...)' call by doing
 * 'then(device => new BluetoothService(device))'
 * A short example would look like the following:
 *  - - - - -
 * BluetoothService.search(filters).then(device => new BluetoothService(device);
 * bluetoothDevice.onConnect = (device) => console.log("Connected to device", device);
 * bluetoothDevice.onReceive = (event, content) => console.log("Received content from device: " + content, device);
 * bluetoothDevice.connect();
 * - - - - -
 */
class BluetoothService {
    deviceName;
    device;
    serviceUuid;
    characteristicsUuid;
    server;
    service;
    characteristics;
    onReceiveFn;
    onDisconnectFn;
    onConnectFn;

    // Method for
    static async search(filters) {
        if (!BluetoothService.available)
            return new Promise(null);

        return await navigator.bluetooth.requestDevice(filters || {acceptAllDevices: 'true'})

    }

    constructor(device) {
        this.device = device;
    }

    set onConnect(func) {
        this.onConnectFn = func;
    }

    set onReceive(func) {
        this.onReceiveFn = func;
    }

    set onDisconnect(func) {
        this.onDisconnectFn = func;
    }
    set primaryCharacteristicUuid(uuid) {
        this.characteristicsUuid = uuid;
    }

    set primaryServiceId(id) {
        this.serviceUuid = id;
    }

    // Method for checking whether bluetooth is available on this device.
    static get available() { return (navigator.bluetooth); }

    // Method for writing data to a either predefined or specified characteristic on the Bluetooth GATT device.
    write(data, characteristicId) {
        // Check whether we're connected to the device first.
        if (this.isConnected()) {

            // If connected, send data to the either provided or pre-defined characteristic
            this.service.getCharacteristic(characteristicId || this.characteristicsUuid)
                .then(characteristic => {
                    return characteristic.writeValue(new Uint8Array([data]));
                })
                .catch(error => {
                    console.error("An error occurred whilst trying to send Bluetooth data", error);
                });
        }
    }

    // Attempts to connect
    connect() {
        if (BluetoothService.available) {
            if (typeof this.device !== "undefined" && this.device) {

                // Run it async so that you can wait for certain functions to run
                (async () => {
                    this.device.addEventListener('gattservicedisconnected', this.onDisconnectFn);
                    this.deviceName = this.device.name;
                    // attempt to connect to the device.
                    this.server = await this.device.gatt.connect();
                    // If we have an onConnect function, call it!
                    if (this.onConnectFn)
                        this.onConnectFn(this.device);
                    // Get GATT Service
                    this.service = await this.server.getPrimaryService(this.serviceUuid);
                    // Get the specified characteristic by uuid
                    this.characteristics = await this.service.getCharacteristic(this.characteristicsUuid);
                    this.characteristics.startNotifications();
                    // Add event listener for when the website receives data from the GATT BT Device
                    this.characteristics.addEventListener('characteristicvaluechanged', (event) => {
                        // Check if we have an onReceive function, if we do, call it.
                        if (this.onReceiveFn) {
                            this.onReceiveFn(event, new TextDecoder().decode(event.target.value));
                        }
                    });
                })
                ();

            }
        }
    }

    // Method for checking whether the Bluetooth device is connected
    isConnected() {
        return this.server && this.server.connected;
    }

    // Method for disconnecting the currently connected Bluetooth device
    disconnect() {
        if (this.isConnected() && this.characteristics) {
            this.characteristics.stopNotifications()
                .then(() => this.server.disconnect())
                .error(error => console.error("An error occurred whilst disconnecting bluetooth device", error));
        }
    }
}

/*
 * Class for representing an Axis Aligned Bounding Box (AABB).
 * An AABB Class contains a few variables, the top left coordinates (left, top)
 * the bottom right coordinates (bottom, right) and the dimensions (width, height).
 * These parameters can be changed after initialization with helper functions
 *
 * */
class AABB {
    left;
    top;
    right;
    bottom;
    width;
    height;

    // Constructor for defining a bounding box with specified dimensions.
    constructor(x, y, width, height) {
        this.left = x;
        this.top = y;
        this.right = x + width;
        this.bottom = y + height;
        this.width = width;
        this.height = height;
    }

    // Method of setting the width of this AABB
    // Automatically updates the 'right' variable as well
    set width(w) {
        this.width = w;
        this.right = this.left + w;
    }

    // Method for setting the height of this AABB
    // Automatically updates the 'bottom' variable as well
    set height(h) {
        this.height = h;
        this.bottom = this.top + h;
    }

    // Returns a copy of this Environment
    get copy() {
        return new AABB(this.left, this.top, this.width, this.height);
    }

    // Function for translating the X coordinate of the Environment
    translateX(newX) {
        this.left = newX;
        this.right = newX + this.width;
        return this;
    }

    // Function for translating the Y coordinate of the Environment
    translateY(newY) {
        this.top = newY;
        this.bottom = newY + this.height;
        return this;
    }

    // Function for translating the XY position of the Environment.
    translate(newX, newY) {
        this.left = newX;
        this.top = newY;
        this.right = newX + this.width;
        this.bottom = newY + this.height;
        return this;
    }

    // Function for checking whether a point lies within the specified boundaries
    intersectsPoint(x, y) {
        return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom;
    }

    // Function for checking X and Y collisions with `boundingBox`
    intersects(boundingBox) {

        // Check whether our input is of type BoundingBox
        // If not, return false.
        if (!(boundingBox instanceof AABB))
            return false;

        return this.bottom >= boundingBox.top && this.top <= boundingBox.bottom
            && this.right >= boundingBox.left && this.left <= boundingBox.right;
    }
}

// Class for loading resources into the game.
// This class allows the user to render animations or just draw regular images.
class Resource {

    image;
    width;
    height;
    partWidth;
    partHeight;
    horizontal;
    vertical;


    // Loads an image from the provided location.
    // Is possible to load multiple at the same time by providing a horizontalCount and verticalCount.
    // These numbers represent how many images are present on those two axis.
    // Initialization of this class MUST be done in the 'preload' function, otherwise it will NOT work.
    constructor(image, horizontalCount = 1, verticalCount = 1) {
        this.image = image
        this.width = image.width;
        this.height = image.height;
        this.horizontal = horizontalCount;
        this.vertical = verticalCount;
        this.partWidth = image.width / horizontalCount;
        this.partHeight = image.height / verticalCount;
    }

    // Renders a section of the provided image.
    // If one wants to render the image normally, just provide the first four arguments.
    // dx = start X, dy = start Y
    // dw = partial width, dh = partial height
    draw(x, y, width, height, dx = 0, dy = 0, dw = this.partWidth, dh = this.partHeight) {
        image(this.image, x, y, width, height, dx, dy, dw, dh);
    }

    // Function that allows the user to animate different sections of a provided resource.
    // If a provided resource has multiple horizontal and vertical sections and the user provided these in the
    // constructor with 'horizontalCount' and 'verticalCount' (h, v) > 0
    animate(x, y, width, height, animationIndex = 0) {
        animationIndex %= (this.horizontal + this.vertical); // Make sure the animation index is within bounds
        this.draw(x, y, width, height,
            this.partWidth * (animationIndex % this.horizontal),
            this.partHeight * Math.floor(animationIndex / this.horizontal));
    }

}

class BlockType {
    static bricks;
    static stone;
    static dirt;
    static grass;
    static deepslate;
    static deepslate_cracked;
}

class Block extends AABB {
    blockType;

    constructor(x, y, blockType) {
        super(x, y, 1, 1);
        this.blockType = blockType;
    }
}

// Quick class for a 2-dimensional vector
class Vec2 {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    get copy() { return new Vec2(this.x, this.y); }
    translateX(x) { this.x = x; return this; }
    translateY(y) { this.y = y; return this; }
    translate(x, y) {
        if (x instanceof Vec2) {
            this.x = x.x;
            this.y = x.y;
            return this;
        }
        this.x = x;
        this.y = y;
        return this;
    }
    add(x, y) {
        this.x += x;
        this.y += y;
        return this;
    }
    addX(x) {
        this.x += x;
        return this;
    }
    addY(y) {
        this.y += y;
        return this;
    }

    mult(x, y) {
        if (x instanceof Vec2) {
            this.x *= x.x;
            this.y *= x.y;
            return this;
        } else {
            this.x *= x;
            this.y *= y;
            return this;
        }
    }

    multX(x) {
        this.x *= x;
        return this;
    }

    multY(y) {
        this.y *= y;
        return this;
    }

    magnitude() {
        return Math.sqrt(this.magSq());
    }

    magSq() {
        return this.x * this.x + this.y * this.y;
    }

    normalize() {
        let mag = this.magnitude();
        return new Vec2(this.x / mag, this.y / mag);
    }
}


