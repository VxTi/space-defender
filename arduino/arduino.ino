
#define US_KEYBOARD 1

#include <Arduino.h>
#include "BLEDevice.h"
#include "BLEHIDDevice.h"
#include "HIDTypes.h"
#include "HIDKeyboardTypes.h"

// Port indices for all buttons / LEDs
#define PIN_BUTTON_UP 3
#define PIN_BUTTON_LEFT 8
#define PIN_BUTTON_RIGHT 9
#define PIN_BUTTON_DOWN 46
#define PIN_BUTTON_A 12
#define PIN_BUTTON_B 11
#define PIN_BUTTON_OPT 10
#define PIN_LED 4
#define PIN_BATTERY 13

#define BUTTON_UP_KEY ((uint8_t)'w')
#define BUTTON_LEFT_KEY ((uint8_t)'a')
#define BUTTON_RIGHT_KEY ((uint8_t)'d')
#define BUTTON_DOWN_KEY ((uint8_t)'s')
#define BUTTON_A_KEY ((uint8_t)' ')
#define BUTTON_B_KEY ((uint8_t)'f')
#define BUTTON_OPT_KEY ((uint8_t)'r')

#define DEVICE_NAME "Game Controller"

#define BUTTON_COUNT 7

// Message (report) sent when a key is pressed or released
struct InputReport {
  uint8_t modifiers;       // bitmask: CTRL = 1, SHIFT = 2, ALT = 4
  uint8_t reserved;        // must be 0
  uint8_t pressedKeys[6];  // up to six concurrenlty pressed keys
};

struct ButtonData {
  char character;
  uint8_t pin;
  uint8_t pressed;
};

#define BDATA(bChar, bPin) \
  (ButtonData) { \
    .character = (uint8_t)bChar, .pin = (uint8_t)bPin \
  }

struct ButtonData buttonData[BUTTON_COUNT] = {
  BDATA(BUTTON_UP_KEY, PIN_BUTTON_UP),
  BDATA(BUTTON_LEFT_KEY, PIN_BUTTON_LEFT),
  BDATA(BUTTON_DOWN_KEY, PIN_BUTTON_DOWN),
  BDATA(BUTTON_RIGHT_KEY, PIN_BUTTON_RIGHT),
  BDATA(BUTTON_A_KEY, PIN_BUTTON_A),
  BDATA(BUTTON_B_KEY, PIN_BUTTON_B),
  BDATA(BUTTON_OPT_KEY, PIN_BUTTON_OPT)
};


BLEHIDDevice* hid;
BLECharacteristic* input;
BLECharacteristic* output;

InputReport reportMap = {};
const InputReport NO_KEY_PRESSED = {};

bool useBluetooth = false;  // False = Serial communication, True = BLE communication.

// Forward declarations
void bluetoothTask(void*);
void write(const char* text);


bool isBleConnected = false;

/**
 * Setup method.
 * Sets the pins to the right I/O state and initializes the bluetooth task.
 */
void setup() {
  Serial.begin(115200);

  pinMode(PIN_LED, OUTPUT);

  // Set all button pins to INPUT
  for (uint8_t i = 0; i < BUTTON_COUNT; i++)
    pinMode(buttonData[i].pin, INPUT);

  // start Bluetooth task
  xTaskCreate(bluetoothTask, "bluetooth", 20000, NULL, 5, NULL);
}

/**
 * Main loop.
 * Method checks whether buttons are pressed or not.
 * If this is the case, it sends the updates via bluetooth to the connected device.
 */
void loop() {
  if (isBleConnected) {
    for (int i = 0; i < BUTTON_COUNT; i++) {

      // Set the 'pressed' state to true when the pin is at HIGH (4095 is max value)
      buttonData[i].pressed = analogRead(buttonData[i].pin) >= 4095;

      // Check if the current button is pressed
      if (buttonData[i].pressed) {  // Check if the pin is high
        // Set first pressed key to currently pressed button
        reportMap.pressedKeys[0] = keymap[(uint8_t)buttonData[i].character].usage;

        // Update report map and send it
        input->setValue((uint8_t*)&reportMap, sizeof(reportMap));
        input->notify();
        delay(25);
      }

      // Clear pressed keys from report map
      reportMap.pressedKeys[0] = (uint8_t)0;

      // Update unpressed key and send it
      input->setValue((uint8_t*)&NO_KEY_PRESSED, sizeof(NO_KEY_PRESSED));
      input->notify();
    }

    readBatteryLevel();
    delay(25);
  }
}


// The report map describes the HID device (a keyboard in this case) and
// the messages (reports in HID terms) sent and received.
static const uint8_t REPORT_MAP[] = {
  USAGE_PAGE(1), 0x01,       // Generic Desktop Controls
  USAGE(1), 0x06,            // Keyboard
  COLLECTION(1), 0x01,       // Application
  REPORT_ID(1), 0x01,        //   Report ID (1)
  USAGE_PAGE(1), 0x07,       //   Keyboard/Keypad
  USAGE_MINIMUM(1), 0xE0,    //   Keyboard Left Control
  USAGE_MAXIMUM(1), 0xE7,    //   Keyboard Right Control
  LOGICAL_MINIMUM(1), 0x00,  //   Each bit is either 0 or 1
  LOGICAL_MAXIMUM(1), 0x01,
  REPORT_COUNT(1), 0x08,  //   8 bits for the modifier keys
  REPORT_SIZE(1), 0x01,
  HIDINPUT(1), 0x02,      //   Data, Var, Abs
  REPORT_COUNT(1), 0x01,  //   1 byte (unused)
  REPORT_SIZE(1), 0x08,
  HIDINPUT(1), 0x01,      //   Const, Array, Abs
  REPORT_COUNT(1), 0x06,  //   6 bytes (for up to 6 concurrently pressed keys)
  REPORT_SIZE(1), 0x08,
  LOGICAL_MINIMUM(1), 0x00,
  LOGICAL_MAXIMUM(1), 0x65,  //   101 keys
  USAGE_MINIMUM(1), 0x00,
  USAGE_MAXIMUM(1), 0x65,
  HIDINPUT(1), 0x00,      //   Data, Array, Abs
  REPORT_COUNT(1), 0x05,  //   5 bits (Num lock, Caps lock, Scroll lock, Compose, Kana)
  REPORT_SIZE(1), 0x01,
  USAGE_PAGE(1), 0x08,     //   LEDs
  USAGE_MINIMUM(1), 0x01,  //   Num Lock
  USAGE_MAXIMUM(1), 0x05,  //   Kana
  LOGICAL_MINIMUM(1), 0x00,
  LOGICAL_MAXIMUM(1), 0x01,
  HIDOUTPUT(1), 0x02,     //   Data, Var, Abs
  REPORT_COUNT(1), 0x01,  //   3 bits (Padding)
  REPORT_SIZE(1), 0x03,
  HIDOUTPUT(1), 0x01,  //   Const, Array, Abs
  END_COLLECTION(0)    // End application collection
};


/*
 * Callbacks related to BLE connection
 */
class BleKeyboardCallbacks : public BLEServerCallbacks {

  void onConnect(BLEServer* server) {
    isBleConnected = true;

    // Allow notifications for characteristics
    BLE2902* cccDesc = (BLE2902*)input->getDescriptorByUUID(BLEUUID((uint16_t)0x2902));
    cccDesc->setNotifications(true);

    Serial.println("Client has connected");
  }

  void onDisconnect(BLEServer* server) {
    isBleConnected = false;

    // Disallow notifications for characteristics
    BLE2902* cccDesc = (BLE2902*)input->getDescriptorByUUID(BLEUUID((uint16_t)0x2902));
    cccDesc->setNotifications(false);

    Serial.println("Client has disconnected");
  }
};

// Function for reading battery level via the selected PIN
void readBatteryLevel() {
  // Set battery level, read from battery pin. Input value is converted from 0-4095 to 0-100 range
  hid->setBatteryLevel((uint8_t)((float)analogRead(PIN_BATTERY) * 100.0 / 4095.0));
}

// The task containing the initialization code for the BLE Keyboard.
void bluetoothTask(void*) {

  // initialize the device
  BLEDevice::init(DEVICE_NAME);
  BLEServer* server = BLEDevice::createServer();
  server->setCallbacks(new BleKeyboardCallbacks());

  // create an HID device
  hid = new BLEHIDDevice(server);
  input = hid->inputReport(1);    // report ID
  output = hid->outputReport(1);  // report ID

  // set manufacturer name
  hid->manufacturer()->setValue("HBO-ICT");
  // set USB vendor and product ID
  hid->pnp(0x02, 0xe502, 0xa111, 0x0210);
  // information about HID device: device is not localized, device can be connected
  hid->hidInfo(0x00, 0x02);

  // Security: device requires bonding
  BLESecurity* security = new BLESecurity();
  security->setAuthenticationMode(ESP_LE_AUTH_BOND);

  // set report map
  hid->reportMap((uint8_t*)REPORT_MAP, sizeof(REPORT_MAP));
  hid->startServices();

  // Read the battery level and set the characteristic accordingly
  readBatteryLevel();

  // advertise the services
  BLEAdvertising* advertising = server->getAdvertising();
  advertising->setAppearance(HID_KEYBOARD);
  advertising->addServiceUUID(hid->hidService()->getUUID());
  advertising->addServiceUUID(hid->deviceInfo()->getUUID());
  advertising->addServiceUUID(hid->batteryService()->getUUID());
  advertising->start();

  Serial.println("Bluetooth device is ready to be connected");
  delay(portMAX_DELAY);
};