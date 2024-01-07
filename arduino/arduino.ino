
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

#define BATTERY_MAX_VOLTAGE 4.2
#define BATTERY_MIN_VOLTAGE 3.7

char *buffer = (char *)malloc(BUTTON_COUNT * sizeof(char));

const uint8_t pinData[BUTTON_COUNT][2] = {
    {PIN_BUTTON_UP, BUTTON_UP_KEY}, {PIN_BUTTON_LEFT, BUTTON_LEFT_KEY}, {PIN_BUTTON_RIGHT, BUTTON_RIGHT_KEY}, {PIN_BUTTON_DOWN, BUTTON_DOWN_KEY}, {PIN_BUTTON_A, BUTTON_A_KEY}, {PIN_BUTTON_B, BUTTON_B_KEY}, {PIN_BUTTON_OPT, BUTTON_OPT_KEY}};

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
void bluetoothTask(void *);
void write(const char *text);

bool isBleConnected = false;

void setup()
{
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

void loop()
{
    if (isBleConnected)
    {
        memset(buffer, 0, BUTTON_COUNT);

        for (uint8_t i = 0, j = 0; i < BUTTON_COUNT; i++)
        {
            if (digitalRead(pinData[i][0]))
                buffer[j++] = pinData[i][1];
        }
        write(buffer);
        delay(25);
        readBatteryLevel();
    }
}

// Message (report) sent when a key is pressed or released
struct InputReport
{
    uint8_t modifiers;      // bitmask: CTRL = 1, SHIFT = 2, ALT = 4
    uint8_t reserved;       // must be 0
    uint8_t pressedKeys[7]; // up to seven concurrenlty pressed keys
};

// Message (report) received when an LED's state changed
struct OutputReport
{
    uint8_t leds; // bitmask: num lock = 1, caps lock = 2, scroll lock = 4, compose = 8, kana = 16
};

// The report map describes the HID device (a keyboard in this case) and
// the messages (reports in HID terms) sent and received.
static const uint8_t REPORT_MAP[] = {
    USAGE_PAGE(1), 0x01,      // Generic Desktop Controls
    USAGE(1), 0x06,           // Keyboard
    COLLECTION(1), 0x01,      // Application
    REPORT_ID(1), 0x01,       //   Report ID (1)
    USAGE_PAGE(1), 0x07,      //   Keyboard/Keypad
    USAGE_MINIMUM(1), 0xE0,   //   Keyboard Left Control
    USAGE_MAXIMUM(1), 0xE7,   //   Keyboard Right Control
    LOGICAL_MINIMUM(1), 0x00, //   Each bit is either 0 or 1
    LOGICAL_MAXIMUM(1), 0x01,
    REPORT_COUNT(1), 0x08, //   8 bits for the modifier keys
    REPORT_SIZE(1), 0x01,
    HIDINPUT(1), 0x02,     //   Data, Var, Abs
    REPORT_COUNT(1), 0x01, //   1 byte (unused)
    REPORT_SIZE(1), 0x08,
    HIDINPUT(1), 0x01,     //   Const, Array, Abs
    REPORT_COUNT(1), 0x06, //   6 bytes (for up to 6 concurrently pressed keys)
    REPORT_SIZE(1), 0x08,
    LOGICAL_MINIMUM(1), 0x00,
    LOGICAL_MAXIMUM(1), 0x65, //   101 keys
    USAGE_MINIMUM(1), 0x00,
    USAGE_MAXIMUM(1), 0x65,
    HIDINPUT(1), 0x00,     //   Data, Array, Abs
    REPORT_COUNT(1), 0x05, //   5 bits (Num lock, Caps lock, Scroll lock, Compose, Kana)
    REPORT_SIZE(1), 0x01,
    USAGE_PAGE(1), 0x08,    //   LEDs
    USAGE_MINIMUM(1), 0x01, //   Num Lock
    USAGE_MAXIMUM(1), 0x05, //   Kana
    LOGICAL_MINIMUM(1), 0x00,
    LOGICAL_MAXIMUM(1), 0x01,
    HIDOUTPUT(1), 0x02,    //   Data, Var, Abs
    REPORT_COUNT(1), 0x01, //   3 bits (Padding)
    REPORT_SIZE(1), 0x03,
    HIDOUTPUT(1), 0x01, //   Const, Array, Abs
    END_COLLECTION(0)   // End application collection
};

BLEHIDDevice *hid;
BLECharacteristic *input;
BLECharacteristic *output;

const InputReport NO_KEY_PRESSED = {};

/*
 * Callbacks related to BLE connection
 */
class BleKeyboardCallbacks : public BLEServerCallbacks
{

    void onConnect(BLEServer *server)
    {
        isBleConnected = true;

        // Allow notifications for characteristics
        BLE2902 *cccDesc = (BLE2902 *)input->getDescriptorByUUID(BLEUUID((uint16_t)0x2902));
        cccDesc->setNotifications(true);

        Serial.println("Client has connected");
    }

    void onDisconnect(BLEServer *server)
    {
        isBleConnected = false;

        // Disallow notifications for characteristics
        BLE2902 *cccDesc = (BLE2902 *)input->getDescriptorByUUID(BLEUUID((uint16_t)0x2902));
        cccDesc->setNotifications(false);

        Serial.println("Client has disconnected");
    }
};

/*
 * Called when the client (computer, smart phone) wants to turn on or off
 * the LEDs in the keyboard.
 *
 * bit 0 - NUM LOCK
 * bit 1 - CAPS LOCK
 * bit 2 - SCROLL LOCK
 */
class OutputCallbacks : public BLECharacteristicCallbacks
{
    void onWrite(BLECharacteristic *characteristic)
    {
        OutputReport *report = (OutputReport *)characteristic->getData();
    }
};

// Function for reading battery level via the selected PIN
void readBatteryLevel()
{
    /*
    |-------------------------------------------------|
    |           LiPo Discharge table                  |
    |-------------------------------------------------|
    |  Voltage   |   Percentage  | analogRead() value |
    |------------|---------------|--------------------|
    | 4.20V      | 100%          | 3475               |
    | 4.15V      | 95%           | 3433               |
    | 4.11V      | 90%           | 3400               |
    | 4.08V      | 85%           | 3375               |
    | 4.02V      | 80%           | 3325               |
    | 3.98V      | 75%           | 3292               |
    | 3.95V      | 70%           | 3268               |
    | 3.91V      | 65%           | 3235               |
    | 3.87V      | 60%           | 3202               |
    | 3.85V      | 55%           | 3185               |
    | 3.84V      | 50%           | 3177               |
    | 3.82V      | 45%           | 3160               |
    | 3.80V      | 40%           | 3144               |
    | 3.79V      | 35%           | 3135               |
    | 3.77V      | 30%           | 3119               |
    | 3.75V      | 25%           | 3102               |
    | 3.73V      | 20%           | 3086               |
    | 3.71V      | 15%           | 3069               |
    | 3.69V      | 10%           | 3053               |
    | 3.61V      | 5%            | 2986               |
    | 3.27V      | 0%            | 2705               |
    |-------------------------------------------------|

    Source: https://blog.ampow.com/lipo-voltage-chart/
    */

    int batteryPercentage = calculateBatteryPercentage(analogRead(PIN_BATTERY));
    Serial.println("Battery percentage: " + String(batteryPercentage) + "%, Reading: " + String(analogRead(PIN_BATTERY)));

    // Set the battery level
    // hid->setBatteryLevel((uint8_t)floor(batteryPercentage));
}

int calculateBatteryPercentage(int reading)
{
    // Define the battery discharge table
    const int voltageReadings[] = {3475, 3433, 3400, 3375, 3325, 3292, 3268, 3235, 3202, 3185, 3177, 3160, 3144, 3135, 3119, 3102, 3086, 3069, 3053, 2986, 2705};
    const int percentages[] = {100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5, 0};
    const int tableSize = sizeof(voltageReadings) / sizeof(voltageReadings[0]);

    // Find the two points in the table that the reading is between
    for (int i = 0; i < tableSize - 1; i++)
    {
        if (reading >= voltageReadings[i + 1] && reading <= voltageReadings[i])
        {
            // Perform linear interpolation
            float slope = (percentages[i] - percentages[i + 1]) / (float)(voltageReadings[i] - voltageReadings[i + 1]);
            return percentages[i] + slope * (reading - voltageReadings[i]);
        }
    }

    // If the reading is outside the range of the table, return the closest percentage
    return (reading > voltageReadings[0]) ? 100 : 0;
}

void bluetoothTask(void *)
{

    // initialize the device
    BLEDevice::init(DEVICE_NAME);
    BLEServer *server = BLEDevice::createServer();
    server->setCallbacks(new BleKeyboardCallbacks());

    // create an HID device
    hid = new BLEHIDDevice(server);
    input = hid->inputReport(1);   // report ID
    output = hid->outputReport(1); // report ID
    output->setCallbacks(new OutputCallbacks());

    // set manufacturer name
    hid->manufacturer()->setValue("HBO-ICT");
    // set USB vendor and product ID
    hid->pnp(0x02, 0xe502, 0xa111, 0x0210);
    // information about HID device: device is not localized, device can be connected
    hid->hidInfo(0x00, 0x02);

    // Security: device requires bonding
    BLESecurity *security = new BLESecurity();
    security->setAuthenticationMode(ESP_LE_AUTH_BOND);

    // set report map
    hid->reportMap((uint8_t *)REPORT_MAP, sizeof(REPORT_MAP));
    hid->startServices();

    // set battery level to 100%
    readBatteryLevel();

    // advertise the services
    BLEAdvertising *advertising = server->getAdvertising();
    advertising->setAppearance(HID_KEYBOARD);
    advertising->addServiceUUID(hid->hidService()->getUUID());
    advertising->addServiceUUID(hid->deviceInfo()->getUUID());
    advertising->addServiceUUID(hid->batteryService()->getUUID());
    advertising->start();

    Serial.println("Bluetooth device is ready to be connected");
    delay(portMAX_DELAY);
};

void write(const char *text)
{
    int len = strlen(text);
    for (int i = 0; i < len; i++)
    {

        // translate character to key combination
        uint8_t val = (uint8_t)text[i];
        if (val > KEYMAP_SIZE)
            continue; // character not available on keyboard - skip
        KEYMAP map = keymap[val];

        // create input report
        InputReport report = {
            .modifiers = map.modifier,
            .reserved = 0,
            .pressedKeys = {
                map.usage,
                0, 0, 0, 0, 0}};

        // send the input report
        input->setValue((uint8_t *)&report, sizeof(report));
        input->notify();

        delay(5);

        // release all keys between two characters; otherwise two identical
        // consecutive characters are treated as just one key press
        input->setValue((uint8_t *)&NO_KEY_PRESSED, sizeof(NO_KEY_PRESSED));
        input->notify();

        delay(5);
    }
}