#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;
bool deviceConnected = false;

#define SERVICE_UUID        "9051282e-893f-11ee-b9d1-0242ac120002"
#define CHARACTERISTIC_UUID "a73e2e56-893f-11ee-b9d1-0242ac120002"

class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
  }

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
  }
};

void setup() {
  Serial.begin(115200);

  // Create the BLE Device
  BLEDevice::init("ESP32S3");

  // Create the BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create the BLE Service
  BLEService *pService = pServer->createService(BLEUUID(SERVICE_UUID), 1); // use different value if necessary

  // Create a BLE Characteristic
  pCharacteristic = pService->createCharacteristic(
                      BLEUUID(CHARACTERISTIC_UUID),
                      BLECharacteristic::PROPERTY_READ |
                      BLECharacteristic::PROPERTY_WRITE
                    );

  // Add descriptor to the characteristic for notifications
  pCharacteristic->addDescriptor(new BLE2902());

  // Start the service
  pService->start();

  // Start advertising
  pServer->getAdvertising()->addServiceUUID(BLEUUID(SERVICE_UUID));
  pServer->getAdvertising()->start();
  Serial.println("Waiting for connections...");
}

void loop() {
  if (deviceConnected) {
    if (Serial.available()) {
      String data = Serial.readStringUntil('\n');
      pCharacteristic->setValue(data.c_str());
      pCharacteristic->notify();
      Serial.println("Data sent over BLE: " + data);
    }
  }

  delay(100);
}
