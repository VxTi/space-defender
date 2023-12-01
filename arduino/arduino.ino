#include <BleKeyboard.h>

// Port indices for all buttons / LEDs
#define PIN_BUTTON_UP    3
#define PIN_BUTTON_LEFT  8
#define PIN_BUTTON_RIGHT 9
#define PIN_BUTTON_DOWN 46
#define PIN_BUTTON_A    12
#define PIN_BUTTON_B    11
#define PIN_BUTTON_OPT  10
#define PIN_LED          4

#define BUTTON_UP_KEY       KEY_UP_ARROW
#define BUTTON_LEFT_KEY     KEY_LEFT_ARROW
#define BUTTON_RIGHT_KEY    KEY_RIGHT_ARROW
#define BUTTON_DOWN_KEY     KEY_DOWN_ARROW
#define BUTTON_A_KEY        ' '
#define BUTTON_B_KEY        KEY_LEFT_SHIFT

BleKeyboard keyboard;

const uint8_t pinData[6][2] = {
            {PIN_BUTTON_UP, BUTTON_UP_KEY}, {PIN_BUTTON_LEFT, BUTTON_LEFT_KEY},
            {PIN_BUTTON_RIGHT, BUTTON_RIGHT_KEY}, {PIN_BUTTON_DOWN, BUTTON_DOWN_KEY},
            {PIN_BUTTON_A, BUTTON_A_KEY}, {PIN_BUTTON_B, BUTTON_B_KEY}
};

bool useBluetooth = false; // False = Serial communication, True = BLE communication.
bool debugMode = false;

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
void readInput() {

  for (uint8_t i = 0; i < 8; i++) {
    if (digitalRead(pinData[i][0])) {
      keyboard.press(pinData[i][1]);
    } else {
      keyboard.release(pinData[i][1]);
    }
  }
}

void setup() {
  definePinModes(); // Set all pins to their desired mode
  Serial.begin(115200);


  keyboard = BleKeyboard("Game Controller");
  keyboard.begin();
}

void loop() {
  if (keyboard.isConnected()) {
    readInput();
    delay(1);
  }
}