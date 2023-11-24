/*
  Rui Santos
  Complete project details at https://RandomNerdTutorials.com/esp32-web-bluetooth/
  
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files.
  
  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.
*/

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// Port indices for all buttons / LEDs
#define PIN_BUTTON_UP    3
#define PIN_BUTTON_LEFT  8
#define PIN_BUTTON_RIGHT 9
#define PIN_BUTTON_DOWN  46
#define PIN_BUTTON_A     12
#define PIN_BUTTON_B     11
#define PIN_BUTTON_OPT   10
#define PIN_LED          4

// Bit position definitions of all buttons
#define BUTTON_UP_BP    0
#define BUTTON_LEFT_BP  1
#define BUTTON_RIGHT_BP 2
#define BUTTON_DOWN_BP  3
#define BUTTON_A_BP     4
#define BUTTON_B_BP     5
#define BUTTON_OPT_BP   6

#define DEVICE_BT_NAME "ESP32 Controller"

BLEServer* pServer = NULL;
BLECharacteristic* pSensorCharacteristic = NULL;
// BLECharacteristic* pLedCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;
// uint32_t value = 0;

// See the following for generating UUIDs:
// https://www.uuidgenerator.net/

#define SERVICE_UUID        "73770700-a4e0-4ff2-bd68-47a5250d5ec2"
#define CHARACTERISTIC_UUID "544a3ce0-5ca6-411e-a0c2-17789dc0cec8"
// #define LED_CHARACTERISTIC_UUID "791ac637-4048-44c7-8ac9-bc1ae24aefc7"

class connectionCallback: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
    };

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
    }
};

/*class MyCharacteristicCallbacks : public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic* pLedCharacteristic) {
    String value = pLedCharacteristic->getValue();
    if (value) {
        Serial.printf("Characteristic event, written: %s\r\n", value);
        // Further processing with receivedValue...
    }
}

};
*/

char obtainPinReadouts(){

// 8bit binary: [ CONNECT | A BUTTON | B BUTTON | DPAD UP | DPAD DOWN | DPAD LEFT | DPAD RIGHT | OPTION BUTTON ]
char binary[] = "00000000"; // Placeholder
binary[7] = stoi(deviceConnected); // Connected? 1 / 0
binary[6] = digitalRead(PIN_BUTTON_A);
binary[5] = digitalRead(PIN_BUTTON_B);
binary[4] = digitalRead(PIN_BUTTON_UP);
binary[3] = digitalRead(PIN_BUTTON_DOWN);
binary[2] = digitalRead(PIN_BUTTON_LEFT);
binary[1] = digitalRead(PIN_BUTTON_RIGHT);
binary[0] = digitalRead(PIN_BUTTON_OPT);

return binary
/*
    return (digitalRead(PIN_BUTTON_A) << BUTTON_A_BP) |
           (digitalRead(PIN_BUTTON_B) << BUTTON_B_BP) |
           (digitalRead(PIN_BUTTON_UP) << BUTTON_UP_BP) |
           (digitalRead(PIN_BUTTON_LEFT) << BUTTON_LEFT_BP) |
           (digitalRead(PIN_BUTTON_RIGHT) << BUTTON_RIGHT_BP) |
           (digitalRead(PIN_BUTTON_DOWN) << BUTTON_DOWN_BP);
}
*/
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED, OUTPUT);

  // Create the BLE Device
  BLEDevice::init(DEVICE_BT_NAME);

  // Create the BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new connectionCallback());

  // Create the BLE Service
  BLEService *bleService = pServer->createService(SERVICE_UUID);

  // Create a BLE Characteristic
  pSensorCharacteristic = bleService->createCharacteristic(
                      CHARACTERISTIC_UUID,
                      BLECharacteristic::PROPERTY_READ   |
                      BLECharacteristic::PROPERTY_WRITE  |
                      BLECharacteristic::PROPERTY_NOTIFY |
                      BLECharacteristic::PROPERTY_INDICATE
                    );

  // Create the ON button Characteristic
  /*
  pLedCharacteristic = bleService->createCharacteristic(
                      LED_CHARACTERISTIC_UUID,
                      BLECharacteristic::PROPERTY_WRITE
                    );*/

  // Register the callback for the ON button characteristic
  // pLedCharacteristic->setCallbacks(new MyCharacteristicCallbacks());

  // https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.descriptor.gatt.client_characteristic_configuration.xml
  // Create a BLE Descriptor
  pSensorCharacteristic->addDescriptor(new BLE2902());
  // pLedCharacteristic->addDescriptor(new BLE2902());

  // Start the service
  bleService->start();

  // Start advertising
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(false);
  pAdvertising->setMinPreferred(0x0);  // set value to 0x00 to not advertise this parameter
  BLEDevice::startAdvertising();
  Serial.println("Waiting a client connection to notify...");
}

void loop() {
    // notify changed value
    if (deviceConnected) {
        digitalWrite(PIN_LED, HIGH);
        char data[] = obtainPinReadouts();
        pSensorCharacteristic->setValue(data);
        pSensorCharacteristic->notify();
        Serial.printf("Message sent: %d\n", data);

        delay(10); // bluetooth stack will go into congestion, if too many packets are sent, in 6 hours test i was able to go as low as 3ms
    }
    // disconnecting
    if (!deviceConnected && oldDeviceConnected) {
        digitalWrite(PIN_LED, LOW);
        Serial.println("Device disconnected.");
        delay(500); // give the bluetooth stack the chance to get things ready
        pServer->startAdvertising(); // restart advertising
        Serial.println("Start advertising");
        oldDeviceConnected = deviceConnected;
    }
    // connecting
    if (deviceConnected && !oldDeviceConnected) {
        // do stuff here on connecting
        oldDeviceConnected = deviceConnected;
        Serial.println("Device Connected");
        digitalWrite(PIN_LED, HIGH);
        delay(100);
        digitalWrite(PIN_LED, LOW);
    }
}