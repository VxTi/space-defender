#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

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
#define SERVICE_UUID         "a8a5a50f-12c1-4b83-bcd3-71ec79287967"
#define CHARACTERISTIC_UUID  "bb4843e0-d2fc-4b26-8fca-b99bd452acaa"

// Library settings
BLEServer *pServer;
BLECharacteristic *controllerCharacteristic;

// Global variables
bool deviceConnected = false;
bool oldDeviceConnected = false;
bool debugMode = false;

bool useBluetooth = false; // False = Serial communication, True = BLE communication.

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

// This function changes the displayname of the BLE device to match which playernumber the controller is using (1 or 2)
char * selectPlayer(){

  char * result = "ESP32 Controller P1"; // Placeholder / default
  const uint8_t idx = strlen(result) - 1;

  if (!digitalRead(PIN_BUTTON_OPT)) {
    Serial.printf("Device name: %s\r\n", result); 
      return result;
  }

  // Keep reading until the player releases the OPT button.
  while (digitalRead(PIN_BUTTON_OPT)) {
    if (digitalRead(PIN_BUTTON_LEFT)) // OPT + DPAD Left = player 1
      result[idx] = '1';
    else if (digitalRead(PIN_BUTTON_RIGHT)) // OPT + DPAD Right = player 2
      result[idx] = '2';
  }

  Serial.printf("Selected device: %s\r\n", result);

  return result;
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
  // Use bitshift operators to construct an 8bit integer containing controller data
}


void startBle(){
    // Create the BLE Device
  BLEDevice::init((const char *)selectPlayer()); // calls the selectPlayer function te determine which playerno the controller is using

  // Create the BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new connectionCallback()); // Add the callback for handling connection status

  // Create the BLE Service
  BLEService *bleService = pServer->createService(SERVICE_UUID);

  // Create a BLE Characteristic
  controllerCharacteristic = bleService->createCharacteristic(
      CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_NOTIFY | BLECharacteristic::PROPERTY_INDICATE);

  // Create a BLE Descriptor
  controllerCharacteristic->addDescriptor(new BLE2902());

  // Start the service
  bleService->start();

  // Start advertising (transmitting)
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(false);
  pAdvertising->setMinPreferred(0x06);
  // pAdvertising->setMinPreferred(0x0); // set value to 0x00 to not advertise this parameter
  BLEDevice::startAdvertising();
}


void bleLoop(){
    // notify changed value
  if (deviceConnected)
  {
    digitalWrite(PIN_LED, HIGH);
    uint8_t inputValue = readInput();
    controllerCharacteristic->setValue(&inputValue, 1);
    controllerCharacteristic->notify();
    delay(10); // bluetooth stack will go into congestion, if too many packets are sent, in 6 hours test i was able to go as low as 3ms
  }
  // disconnecting
  if (!deviceConnected && oldDeviceConnected)
  {
    digitalWrite(PIN_LED, LOW);
    delay(500);                  // give the bluetooth stack the chance to get things ready
    pServer->startAdvertising(); // restart advertising
    oldDeviceConnected = deviceConnected;
  }
  // connecting
  if (deviceConnected && !oldDeviceConnected)
  {
    // do stuff here on connecting
    oldDeviceConnected = deviceConnected;
    digitalWrite(PIN_LED, HIGH);
    delay(100);
    digitalWrite(PIN_LED, LOW);
  }
}

void serialLoop(){
  if (!deviceConnected){
    Serial.printf("%c", (char)readInput());
  }
}

void setup() {
  definePinModes(); // Set all pins to their desired mode
  Serial.begin(115200);
  startBle();
}

void loop() {
  serialLoop();
  bleLoop();
}