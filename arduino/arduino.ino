#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <UUID.h>

// Port indices for all buttons / LEDs
#define PIN_BUTTON_UP    3
#define PIN_BUTTON_LEFT  8
#define PIN_BUTTON_RIGHT 9
#define PIN_BUTTON_DOWN 46
#define PIN_BUTTON_A    12
#define PIN_BUTTON_B    11
#define PIN_BUTTON_OPT  10
#define PIN_LED          4

// Bit position definitions of all buttons
#define BUTTON_UP_BP    0
#define BUTTON_LEFT_BP  1
#define BUTTON_RIGHT_BP 2
#define BUTTON_DOWN_BP  3
#define BUTTON_A_BP     4
#define BUTTON_B_BP     5
#define BUTTON_OPT_BP   6

// UUID's for service and input characteristics
// These will be read by other devices
#define UUID_SERVICE_BASE         "a8a5a50f-12c1-4b83-bcd3-71ec79287967"
#define UUID_CHARACTERISTIC_INPUT "bb4843e0-d2fc-4b26-8fca-b99bd452acaa"

// Library settings
BLEServer *pServer;
BLECharacteristic *controllerCharacteristic;

// Global variables
bool deviceConnected = false;
bool oldDeviceConnected = false;
bool debugMode = false;

// Callback for changing the boolean indicating whether a device is connected
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

// Set all used pins to their used mode
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
}

// Checks if both buttons B and OPT are pressed on startup, if so debug mode will be toggled
void toggleDebugMode()
{
  if (digitalRead(PIN_BUTTON_B) && digitalRead(PIN_BUTTON_OPT))
  {
    debugMode = true;
    Serial.println("Debug mode enabled!");
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

char * selectPlayer(){
  int playerNumber = 0;
  debugPrint("Selecting player");
  while(!playerNumber){
    debugPrint("Waiting for input..");
    if (digitalRead(PIN_BUTTON_LEFT)){
      playerNumber = 1;
      debugPrint("Player 1 selected");
      digitalWrite(PIN_LED, HIGH);
      delay(100);
      digitalWrite(PIN_LED, LOW);
      break;
    }
    if (digitalRead(PIN_BUTTON_RIGHT)){
      playerNumber = 2;
      debugPrint("Player 2 selected");
      digitalWrite(PIN_LED, HIGH);
      delay(100);
      digitalWrite(PIN_LED, LOW);
      break;
    }
  }
  char * output = "ESP32 Controller P0";
  output[strlen(output) - 1] = '0' + playerNumber;
  return output;
}

// Checks if debug mode is toggled, and if so sends the input to serial
void debugPrint(String text)
{
  if (debugMode)
  {
    Serial.println(text);
  }
}

// Reads all digital pins and builds it into a binary value
uint8_t readInput() {
  // Read all buttons
  return (uint8_t)((digitalRead(PIN_BUTTON_A)     << BUTTON_A_BP)     |
                   (digitalRead(PIN_BUTTON_B)     << BUTTON_B_BP)     |
                   (digitalRead(PIN_BUTTON_UP)    << BUTTON_UP_BP)    |
                   (digitalRead(PIN_BUTTON_LEFT)  << BUTTON_LEFT_BP)  |
                   (digitalRead(PIN_BUTTON_RIGHT) << BUTTON_RIGHT_BP) |
                   (digitalRead(PIN_BUTTON_DOWN)  << BUTTON_DOWN_BP));
}

void setup()
{
  Serial.begin(115200);
  definePinModes();
  toggleDebugMode();
  analogReadResolution(12); // For reading from 0 to 4095

  /*debugPrint("Service UUID: " + serviceUUID);
  debugPrint("Characteristic UUID: " + characteristicUUID);
  */

  // Create the BLE Device
  BLEDevice::init((std::__cxx11::string)selectPlayer());

  // Create the BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new connectionCallback()); // Add the callback for handling connection status

  // Create the BLE Service
  BLEService *bleService = pServer->createService(UUID_SERVICE_BASE);

  // Create a BLE Characteristic
  controllerCharacteristic = bleService->createCharacteristic(
      UUID_CHARACTERISTIC_INPUT,
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_NOTIFY | BLECharacteristic::PROPERTY_INDICATE);

  // Create a BLE Descriptor
  controllerCharacteristic->addDescriptor(new BLE2902());

  // Start the service
  bleService->start();

  // Start advertising (transmitting)
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(UUID_SERVICE_BASE);
  pAdvertising->setScanResponse(false);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x0); // set value to 0x00 to not advertise this parameter
  BLEDevice::startAdvertising();
  debugPrint("Waiting a client connection to notify...");
}

void loop()
{
  // notify changed value
  if (deviceConnected)
  {
    uint8_t inputData = readInput();
    digitalWrite(PIN_LED, HIGH);
    controllerCharacteristic->setValue(inputData);
    controllerCharacteristic->notify();
    debugPrint("Packet sent");
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