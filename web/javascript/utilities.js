
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
 * let bluetoothDevice = BluetoothService.search().then(device => new BluetoothService(device);
 * bluetoothDevice.onConnect = (device) => console.log("Connected to device", device);
 * bluetoothDevice.onReceive = (device, content) => console.log("Received content from device: " + content, device);
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
                            this.onReceiveFn(this.characteristics, new TextDecoder().decode(event.target.value));
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