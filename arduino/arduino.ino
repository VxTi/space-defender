
#define US_KEYBOARD 1

#include <Arduino.h>
#include "BLEDevice.h"
#include "BLEHIDDevice.h"
#include "HIDTypes.h"
#include "HIDKeyboardTypes.h"

// Port indices for all buttons / LEDs
#define PIN_BUTTON_UP    3
#define PIN_BUTTON_LEFT  8
#define PIN_BUTTON_RIGHT 9
#define PIN_BUTTON_DOWN 46
#define PIN_BUTTON_A    12
#define PIN_BUTTON_B    11
#define PIN_BUTTON_OPT  10
#define PIN_LED          4
#define PIN_BATTERY     13

#define BUTTON_UP_KEY       ((uint8_t) 'w')
#define BUTTON_LEFT_KEY     ((uint8_t) 'a')
#define BUTTON_RIGHT_KEY    ((uint8_t) 'd')
#define BUTTON_DOWN_KEY     ((uint8_t) 's')
#define BUTTON_A_KEY        ((uint8_t) ' ')
#define BUTTON_B_KEY        ((uint8_t) 'f')
#define BUTTON_OPT_KEY      ((uint8_t) 'r')

#define DEVICE_NAME "Game Controller"

#define BUTTON_COUNT 6

char * buffer = (char *) malloc(BUTTON_COUNT * sizeof(char));

const uint8_t pinData[BUTTON_COUNT][2] = {
            {PIN_BUTTON_UP, BUTTON_UP_KEY}, {PIN_BUTTON_LEFT, BUTTON_LEFT_KEY},
            {PIN_BUTTON_RIGHT, BUTTON_RIGHT_KEY}, {PIN_BUTTON_DOWN, BUTTON_DOWN_KEY},
            {PIN_BUTTON_A, BUTTON_A_KEY}, {PIN_BUTTON_B, BUTTON_B_KEY}
};

struct ButtonData {
    char character;
    uint8_t pin;
};

BLEHIDDevice* hid;
BLECharacteristic* input;
BLECharacteristic* output;

// Message (report) sent when a key is pressed or released
struct InputReport {
    uint8_t modifiers;	     // bitmask: CTRL = 1, SHIFT = 2, ALT = 4
    uint8_t reserved;        // must be 0
    uint8_t pressedKeys[6];  // up to six concurrenlty pressed keys
};


InputReport reportMap = {};

bool useBluetooth = false; // False = Serial communication, True = BLE communication.

// Set all used pins to their used mode
void configurePins()
{
  pinMode(PIN_LED, OUTPUT);
  pinMode(PIN_BUTTON_A, INPUT);
  pinMode(PIN_BUTTON_B, INPUT);
  pinMode(PIN_BUTTON_UP, INPUT);
  pinMode(PIN_BUTTON_LEFT, INPUT);
  pinMode(PIN_BUTTON_RIGHT, INPUT);
  pinMode(PIN_BUTTON_DOWN, INPUT);
  pinMode(PIN_BUTTON_OPT, INPUT);
  pinMode(PIN_BATTERY, INPUT);
}

// Forward declarations
void bluetoothTask(void*);
void write(const char* text);


bool isBleConnected = false;


void setup() {
    Serial.begin(115200);
    
    pinMode(PIN_LED, OUTPUT);
    pinMode(PIN_BUTTON_A, INPUT);
    pinMode(PIN_BUTTON_B, INPUT);
    pinMode(PIN_BUTTON_UP, INPUT);
    pinMode(PIN_BUTTON_LEFT, INPUT);
    pinMode(PIN_BUTTON_RIGHT, INPUT);
    pinMode(PIN_BUTTON_DOWN, INPUT);
    pinMode(PIN_BUTTON_OPT, INPUT);
    pinMode(PIN_BATTERY, INPUT);

    // start Bluetooth task
    xTaskCreate(bluetoothTask, "bluetooth", 20000, NULL, 5, NULL);
}


void loop() {  
    if (isBleConnected) {

      /*
      for (uint16_t i = 0, j = 0; i < BUTTON_COUNT; i++) {
        j = analogRead(pinData[i][0]);
        if (j >= 4095)
          Serial.printf("Button '%s' is pressed\r\n", (char) pinData[0][1]);
        reportMap.pressedKeys[i] = j >= 4095 ? keymap[(uint8_t) pinData[i][1]].modifier : 0; // Set the pressed key at index i to the key at pindata index i when the button is pressed.
      }
      */

     for (int i = 0; i < BUTTON_COUNT; i++) {
        int j = analogRead(pinData[i][0])
        if (j >= 4095){
            reportMap.pressedKeys[i] = keymap[(uint8_t) pinData[i][1]].modifier;
        }
        
      
      readBatteryLevel();
      input->setValue((uint8_t*)&reportMap, sizeof(reportMap));
      input->notify();
      delay(25);
    }
}
}


// The report map describes the HID device (a keyboard in this case) and
// the messages (reports in HID terms) sent and received.
static const uint8_t REPORT_MAP[] = {
    USAGE_PAGE(1),      0x01,       // Generic Desktop Controls
    USAGE(1),           0x06,       // Keyboard
    COLLECTION(1),      0x01,       // Application
    REPORT_ID(1),       0x01,       //   Report ID (1)
    USAGE_PAGE(1),      0x07,       //   Keyboard/Keypad
    USAGE_MINIMUM(1),   0xE0,       //   Keyboard Left Control
    USAGE_MAXIMUM(1),   0xE7,       //   Keyboard Right Control
    LOGICAL_MINIMUM(1), 0x00,       //   Each bit is either 0 or 1
    LOGICAL_MAXIMUM(1), 0x01,
    REPORT_COUNT(1),    0x08,       //   8 bits for the modifier keys
    REPORT_SIZE(1),     0x01,
    HIDINPUT(1),        0x02,       //   Data, Var, Abs
    REPORT_COUNT(1),    0x01,       //   1 byte (unused)
    REPORT_SIZE(1),     0x08,
    HIDINPUT(1),        0x01,       //   Const, Array, Abs
    REPORT_COUNT(1),    0x06,       //   6 bytes (for up to 6 concurrently pressed keys)
    REPORT_SIZE(1),     0x08,
    LOGICAL_MINIMUM(1), 0x00,
    LOGICAL_MAXIMUM(1), 0x65,       //   101 keys
    USAGE_MINIMUM(1),   0x00,
    USAGE_MAXIMUM(1),   0x65,
    HIDINPUT(1),        0x00,       //   Data, Array, Abs
    REPORT_COUNT(1),    0x05,       //   5 bits (Num lock, Caps lock, Scroll lock, Compose, Kana)
    REPORT_SIZE(1),     0x01,
    USAGE_PAGE(1),      0x08,       //   LEDs
    USAGE_MINIMUM(1),   0x01,       //   Num Lock
    USAGE_MAXIMUM(1),   0x05,       //   Kana
    LOGICAL_MINIMUM(1), 0x00,
    LOGICAL_MAXIMUM(1), 0x01,
    HIDOUTPUT(1),       0x02,       //   Data, Var, Abs
    REPORT_COUNT(1),    0x01,       //   3 bits (Padding)
    REPORT_SIZE(1),     0x03,
    HIDOUTPUT(1),       0x01,       //   Const, Array, Abs
    END_COLLECTION(0)               // End application collection
};

const InputReport NO_KEY_PRESSED = { };


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
void readBatteryLevel(){
    // Set battery level, read from battery pin. Input value is converted from 0-4095 to 0-100 range
    hid->setBatteryLevel((uint8_t) ((float) analogRead(PIN_BATTERY) * 100.0 / 4095.0));
}

// The task containing the initialization code for the BLE Keyboard.
void bluetoothTask(void*) {

    // initialize the device
    BLEDevice::init(DEVICE_NAME);
    BLEServer* server = BLEDevice::createServer();
    server->setCallbacks(new BleKeyboardCallbacks());

    // create an HID device
    hid = new BLEHIDDevice(server);
    input = hid->inputReport(1); // report ID
    output = hid->outputReport(1); // report ID

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

    // set battery level to 100%
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