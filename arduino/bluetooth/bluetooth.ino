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
#include <ArduinoJson.h>

#define aButtonPin 12
#define bButtonPin 11
#define dpadUpPin 3
#define dpadDownPin 46
#define dpadLeftPin 8
#define dpadRightPin 9
#define optButtonPin 10
#define ledPin 4

BLEServer* pServer = NULL;
BLECharacteristic* pSensorCharacteristic = NULL;
BLECharacteristic* pLedCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;
uint32_t value = 0;

// See the following for generating UUIDs:
// https://www.uuidgenerator.net/

#define SERVICE_UUID        "73770700-a4e0-4ff2-bd68-47a5250d5ec2"
#define SENSOR_CHARACTERISTIC_UUID "544a3ce0-5ca6-411e-a0c2-17789dc0cec8"
#define LED_CHARACTERISTIC_UUID "791ac637-4048-44c7-8ac9-bc1ae24aefc7"

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
    };

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
    }
};

class MyCharacteristicCallbacks : public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic* pLedCharacteristic) {
        std::string value = pLedCharacteristic->getValue();
        if (value.length() > 0) {
            Serial.print("Characteristic event, written: ");
            Serial.println(static_cast<int>(value[0])); // Print the integer value

            int receivedValue = static_cast<int>(value[0]);
        }
    }
};


String obtainPinReadouts(){
  String jsonString = "";
  StaticJsonDocument<400> pinData;
  // Add data and serialize
  pinData["A"] = digitalRead(aButtonPin);
  pinData["B"] = digitalRead(bButtonPin);
  pinData["U"] = digitalRead(dpadUpPin);
  pinData["D"] = digitalRead(dpadDownPin);
  pinData["L"] = digitalRead(dpadLeftPin);
  pinData["R"] = digitalRead(dpadRightPin);
  pinData["O"] = digitalRead(optButtonPin);
  serializeJson(pinData, jsonString);
  return jsonString;
}

void setup() {
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT);

  // Create the BLE Device
  BLEDevice::init("ESP32 Controller");

  // Create the BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create the BLE Service
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Create a BLE Characteristic
  pSensorCharacteristic = pService->createCharacteristic(
                      SENSOR_CHARACTERISTIC_UUID,
                      BLECharacteristic::PROPERTY_READ   |
                      BLECharacteristic::PROPERTY_WRITE  |
                      BLECharacteristic::PROPERTY_NOTIFY |
                      BLECharacteristic::PROPERTY_INDICATE
                    );

  // Create the ON button Characteristic
  pLedCharacteristic = pService->createCharacteristic(
                      LED_CHARACTERISTIC_UUID,
                      BLECharacteristic::PROPERTY_WRITE
                    );

  // Register the callback for the ON button characteristic
  pLedCharacteristic->setCallbacks(new MyCharacteristicCallbacks());

  // https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.descriptor.gatt.client_characteristic_configuration.xml
  // Create a BLE Descriptor
  pSensorCharacteristic->addDescriptor(new BLE2902());
  pLedCharacteristic->addDescriptor(new BLE2902());

  // Start the service
  pService->start();

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
        digitalWrite(ledPin, HIGH);
        String message = obtainPinReadouts();
        pSensorCharacteristic->setValue(message.c_str());
        pSensorCharacteristic->notify();
        Serial.print("Message sent: ");
        Serial.println(message);
        delay(10); // bluetooth stack will go into congestion, if too many packets are sent, in 6 hours test i was able to go as low as 3ms
    }
    // disconnecting
    if (!deviceConnected && oldDeviceConnected) {
        digitalWrite(ledPin, LOW);
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
        digitalWrite(ledPin, HIGH);
        delay(100);
        digitalWrite(ledPin, LOW);
    }
}