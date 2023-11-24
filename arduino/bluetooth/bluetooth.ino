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
#define PIN_BUTTON_UP     3
#define PIN_BUTTON_LEFT   8
#define PIN_BUTTON_RIGHT  9
#define PIN_BUTTON_DOWN  46
#define PIN_BUTTON_A     12
#define PIN_BUTTON_B     11
#define PIN_BUTTON_OPT   10
#define PIN_LED           4
#define PIN_JOYSTICK_X   13
#define PIN_JOYSTICK_Y   14

// Bit position definitions of all buttons
#define BUTTON_UP_BP      0
#define BUTTON_LEFT_BP    1
#define BUTTON_RIGHT_BP   2
#define BUTTON_DOWN_BP    3
#define BUTTON_A_BP       4
#define BUTTON_B_BP       5
#define BUTTON_OPT_BP     6

#define DEVICE_BT_NAME "ESP32 Controller"

uint8_t * controller_data = (uint8_t *) malloc(4);

BLEServer *pServer = NULL;
BLECharacteristic *pSensorCharacteristic = NULL;
// BLECharacteristic* pLedCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;
bool debugMode = false;

// See the following for generating UUIDs:
// https://www.uuidgenerator.net/

#define SERVICE_UUID "73770700-a4e0-4ff2-bd68-47a5250d5ec2"
#define CHARACTERISTIC_UUID "544a3ce0-5ca6-411e-a0c2-17789dc0cec8"

class connectionCallback : public BLEServerCallbacks
{
  void onConnect(BLEServer *pServer)
  {
    deviceConnected = true;
  };

  void onDisconnect(BLEServer *pServer)
  {
    deviceConnected = false;
  }
};

void definePinModes()
{

  pinMode(PIN_LED, OUTPUT);
  pinMode(PIN_BUTTON_A, INPUT);
  pinMode(PIN_BUTTON_B, INPUT);
  pinMode(PIN_BUTTON_UP, INPUT);
  pinMode(PIN_BUTTON_LEFT, INPUT);
  pinMode(PIN_BUTTON_RIGHT, INPUT);
  pinMode(PIN_BUTTON_DOWN, INPUT);
  pinMode(PIN_BUTTON_OPT, INPUT);
  pinMode(PIN_JOYSTICK_X, INPUT);
  pinMode(PIN_JOYSTICK_Y, INPUT);
}

void toggleDebugMode(){
  delay(100);
  if(digitalRead(PIN_BUTTON_B) && digitalRead(PIN_BUTTON_LEFT)){
    debugMode = true;
    Serial.print("Debug mode enabled!");

    digitalWrite(PIN_LED, HIGH);
    delay(100);
    digitalWrite(PIN_LED, LOW);
    delay(100);
    digitalWrite(PIN_LED, HIGH);
    delay(100);
    digitalWrite(PIN_LED, LOW);
    delay(100);
    digitalWrite(PIN_LED, HIGH);
    delay(600);
    digitalWrite(PIN_LED, LOW);
  }
}

void debugPrint(String text){
  if (debugMode)
  {
    Serial.println(text);
  }
}

void readInput()
{
  controller_data[0] = (uint8_t)(
    (digitalRead(PIN_BUTTON_A) << BUTTON_A_BP) |
    (digitalRead(PIN_BUTTON_B) << BUTTON_B_BP) | 
    (digitalRead(PIN_BUTTON_UP) << BUTTON_UP_BP) |
    (digitalRead(PIN_BUTTON_LEFT) << BUTTON_LEFT_BP) | 
    (digitalRead(PIN_BUTTON_RIGHT) << BUTTON_RIGHT_BP) |
    (digitalRead(PIN_BUTTON_DOWN) << BUTTON_DOWN_BP)
    );
  
  uint16_t x = analogRead(PIN_JOYSTICK_X);
  uint16_t y = analogRead(PIN_JOYSTICK_Y);

//Serial.printf("x: %.1f, y: %.1f\r\n", (float) (x * 0.0879120879), (float) (y * 0.0879120879));

  controller_data[1] = (uint8_t) ((x >> 4) & 0xFF);
  controller_data[2] = (uint8_t) (((x & 0xF) << 4 | (y >> 8) & 0xF) & 0xFF);
  controller_data[3] = (uint8_t) (y & 0xFF);
}

void setup()
{
  Serial.begin(115200);
  definePinModes();
  //toggleDebugMode();
  analogReadResolution(12);

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
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_NOTIFY | BLECharacteristic::PROPERTY_INDICATE);

  // Create a BLE Descriptor
  pSensorCharacteristic->addDescriptor(new BLE2902());

  // Start the service
  bleService->start();

  // Start advertising
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(false);
  pAdvertising->setMinPreferred(0x0); // set value to 0x00 to not advertise this parameter
  BLEDevice::startAdvertising();
  debugPrint("Waiting a client connection to notify...");
}

void loop()
{
  // notify changed value
  if (deviceConnected)
  {
    digitalWrite(PIN_LED, HIGH);
    readInput();
    pSensorCharacteristic->setValue(controller_data, 4);
    pSensorCharacteristic->notify();

    //debugPrint("Message sent:");
    //debugPrint(String(data));

    delay(10); // bluetooth stack will go into congestion, if too many packets are sent, in 6 hours test i was able to go as low as 3ms
  }
  // disconnecting
  if (!deviceConnected && oldDeviceConnected)
  {
    digitalWrite(PIN_LED, LOW);
    debugPrint("Device disconnected.");
    delay(500);                  // give the bluetooth stack the chance to get things ready
    pServer->startAdvertising(); // restart advertising
    debugPrint("Start advertising");
    oldDeviceConnected = deviceConnected;
  }
  // connecting
  if (deviceConnected && !oldDeviceConnected)
  {
    // do stuff here on connecting
    oldDeviceConnected = deviceConnected;
    debugPrint("Device Connected");
    digitalWrite(PIN_LED, HIGH);
    delay(100);
    digitalWrite(PIN_LED, LOW);
  }
}