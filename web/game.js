const frictionConstant = 0.5;
const framerate = 60; // frames per second.
var pixelsPerMeter;
const movementSpeedMetersPerSecond = 5.5;

var player;

// Hashmap containing all the resoucres as images.
// These resources must be loaded in the preload function.
// Adding new resources can be done using 'resources.set('key', object)'
const resources = new Map();

// This function is called before the setup function.
// This can be used to load images for resources.
function preload() {
    resources.set("entityPlayer", loadImage("./assets/playerImage.png"));
    pixelsPerMeter = document.querySelector(".pixel-size").clientWidth;
}

// Setup function for loading in various
function setup() {

    document.querySelector(".controller-connect")
        .addEventListener("click", () => {
        checkBluetoothConnections();
    })

    createCanvas(window.innerWidth, window.innerHeight);

    player = new Entity(100, 100);
    for (let i = 0; i < 10; i++)
        Environment.introduce(new Entity(Math.random() * window.innerWidth, Math.random() * window.innerHeight));


    loadMap();
}

// Draw function is called every 1/60th a second.
// This means it has a 16.6ms interval.
function draw() {
    background(0);
    fill(255, 0, 0);

    let sgnX = 0;
    let sgnY = 0;

    if (keyIsDown(65)) sgnX++;
    if (keyIsDown(68)) sgnX--;
    if (keyIsDown(32)) sgnY++;
    if (keyIsDown(83)) sgnY--;

    image(resources.get('entityPlayer'), player.position.x * pixelsPerMeter, window.innerHeight - (player.height - player.position.y) * pixelsPerMeter, player.width * pixelsPerMeter, player.height * pixelsPerMeter);


    for (var i = 0; i < Environment.boundingBoxes.length; i++) {
        let other = Environment.boundingBoxes[i];
        let intersects = other.intersects(player);
        fill(intersects ? 255 : 0, 50, 0);
        rect(other.left, window.innerHeight - other.top - other.height, other.width, other.height);
    }

    let dT = deltaTime / 1000;
    player.acceleration.add(-sgnX * movementSpeedMetersPerSecond, sgnY * movementSpeedMetersPerSecond * 3);
    player.update(dT);

}

// Function for loading a map, based on a provided image.
// This image must be decoded into map elements and then placed
// into the Environment class's objects
function loadMap(mapImage) {
    /*if (!(mapImage instanceof p5.Image))
        throw new TypeError("Provided argument is not of type p5.Image");*/

    let n = 50;
    let s = window.innerWidth / n;
    for (let i = 0; i < n; i++) {
        Environment.introduce(new AABB(s * i, noise(i / n * 10) * 100, s, s));
    }

}


function checkBluetoothConnections() {
    if (!(navigator.bluetooth))
        throw new Error("Bluetooth not supported on this browser!");

    let bleServiceUUID = '73770700-a4e0-4ff2-bd68-47a5250d5ec2';
    let bleCharacteristicsUUID = '544a3ce0-5ca6-411e-a0c2-17789dc0cec8'

}


class AABB {
    left;
    top;
    right;
    bottom;
    width;
    height;
    static collisionDetectionPrecision = 1; // Lower number means higher precision.

    // Constructor for defining a bounding box with specified dimensions.
    constructor(x, y, width, height) {
        this.left = x;
        this.top = y;
        this.right = x + width;
        this.bottom = y + height;
        this.width = width;
        this.height = height;
    }

    // Returns a copy of this Environment
    copy() {
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
class Entity extends AABB {

    position;
    velocity;
    acceleration;
    collidingX;
    collidingY;

    constructor(posX, posY) {
        super(posX, posY, 30, 50);
        this.position = new Vec2(posX, posY);
        this.velocity = new Vec2(0, 0);
        this.acceleration = new Vec2(0, 0);
    }

    update(dT) {
        if (!this.collidingY)
            this.acceleration.addY(-Environment.G * pixelsPerMeter);
        this.collidingX = this.collidingY = false;
        let cpy;
        // Check if the next position of the entity is colliding with another
        for (let i = 0; i < Environment.boundingBoxes.length; i++) {
            let p = Environment.boundingBoxes[i];
            if (this === p)
                continue;


            // Check for X collisions
            if (!this.collidingX) {
                cpy = this.copy();
                // Velocity is measured in pixels, so let's check for every n pixels for collision
                for (let i = 0; i < Math.round(Math.abs(this.velocityX * dT) / AABB.collisionDetectionPrecision); i++) {
                    if (cpy.translate(this.posX + (i * AABB.collisionDetectionPrecision) * Math.sign(this.velocityX * dT), this.posY).intersects(p)) {
                        this.collidingX = true;
                        break;
                    }
                }
            }

            // Check for Y collisions
            if (!this.collidingY) {
                cpy = this.copy();
                // Velocity is measured in pixels, so let's check for every n pixels for collision
                for (let i = 0; i < Math.round(Math.abs(this.velocityY * dT) / AABB.collisionDetectionPrecision); i++) {
                    if (cpy.translate(this.posX, this.posY + (i * AABB.collisionDetectionPrecision) * Math.sign(this.velocityY * dT)).intersects(p)) {
                        this.collidingY = true;
                        break;
                    }
                }
            }

            // If we're colliding on both axis, stop further checks
            if (this.collidingX && this.collidingY)
                break;
        }

        // Add velocity to position
        this.position.add(
            this.collidingX ? 0 : this.velocity.x * dT,
            this.collidingY ? 0 : this.velocity.y * dT
        );

        // Add acceleration to velocity
        this.velocity.add(this.acceleration.x * dT, this.acceleration.y * dT);

        // Reduce acceleration with a predefined friction coefficient
        this.acceleration.mult(this.collidingX ? 0 : 0.9, this.collidingY ? 0 : 0.9);

        // Limit falling to bottom screen so the player doesn't randomly disappear.
        this.position.y = Math.max(this.position.y, 0);


        document.querySelector(".data")
            .innerText = `Cx: ${this.collidingX}, Cy: ${this.collidingY}, Vx: ${this.velocity.x}, Vy: ${this.velocity.y}, Ax: ${this.acceleration.x}, Ay: ${this.acceleration.y}`;

        // Update
        this.translate(this.position.x, this.position.y);
    }
}

class Environment {
    static G = 9.81; // gravitational constant in meters/second
    static boundingBoxes = [];
    static collides(boundingBox) {
        for (let other in this.boundingBoxes) {
            if (boundingBox.collides(other))
                return true;
        }
        return false;
    }

    // Method for introducing a new AABB into the world
    static introduce(aabb) {
        if (!(aabb instanceof AABB))
            return;

        this.boundingBoxes.push(aabb);
    }

    // Method for updating all entities in the boundingBoxes array.
    // Skips non-entities
    static update(deltaT) {
        this.boundingBoxes.forEach(aabb => {
            if (aabb instanceof Entity)
                aabb.update(deltaT);
        });
    }
}

class BluetoothConnection {
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

    constructor(serviceId, characteristicUuid, onConnect, onReceive, onDisconnect) {
        this.serviceUuid = serviceId;
        this.characteristicsUuid = characteristicUuid;
        this.onConnectFn = onConnect;
        this.onReceiveFn = onReceive;
        this.onDisconnectFn = onDisconnect;
    }

    static get available() { return (navigator.bluetooth); }

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

    connect() {
        if (BluetoothConnection.available) {
            navigator.bluetooth.requestDevice({
                filters: [{
                    services: [this.serviceUuid]
                }]
            })
                .then(device => {
                    this.device = device;

                    // If we have an onConnect function, call it!
                    if (this.onConnectFn)
                        this.onConnectFn(this.device);

                    this.device.addEventListener('gattservicedisconnected', this.onDisconnectFn);
                    this.deviceName = device.name;
                    // attempt to connect to the device.
                    this.server = device.gatt.connect();
                    // Get GATT Service
                    this.service = this.server.getPrimaryService(this.serviceUuid);
                    // Get the specified characteristic by uuid
                    this.characteristics = this.service.getCharacteristic(this.characteristicsUuid);
                    this.characteristics.startNotifications();
                    // Add event listener for when the website receives data from the GATT BT Device
                    this.characteristics.addEventListener('characteristicvaluechanged', (event) => {

                        // Check if we have an onReceive function, if we do, call it.
                        if (this.onReceiveFn) {
                            this.onReceiveFn(this.characteristics, new TextDecoder().decode(event.target.value));
                        }
                    });
                    this.characteristics.readValue();
                });
        }
    }

    isConnected() {
        return this.server && this.server.connected;
    }

    disconnect() {
        if (this.isConnected() && this.characteristics) {
            this.characteristics.stopNotifications()
                .then(() => this.server.disconnect())
                .error(error => console.error("An error occurred whilst disconnecting bluetooth device", error));
        }
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

    copy() { return new Vec2(this.x, this.y); }
    translateX(x) { this.x = x; return this; }
    translateY(y) { this.y = y; return this; }
    translate(x, y) {
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
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        let mag = this.magnitude();
        return new Vec2(this.x / mag, this.y / mag);
    }
}