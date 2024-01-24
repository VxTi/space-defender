#include "USB.h"
#include "USBHIDKeyboard.h"

#define PIN_BUTTON_UP 21
#define PIN_BUTTON_LEFT 38
#define PIN_BUTTON_RIGHT 45
#define PIN_BUTTON_DOWN 42
#define PIN_BUTTON_A 6
#define PIN_BUTTON_B 7
#define PIN_BUTTON_OPT 4
#define PIN_LED 4
#define PIN_BATTERY 5

#define PIN_LED_RED 35
#define PIN_LED_GREEN 36
#define PIN_LED_BLUE 37

#define BUTTON_UP_KEY ((uint8_t)'w')
#define BUTTON_LEFT_KEY ((uint8_t)'a')
#define BUTTON_RIGHT_KEY ((uint8_t)'d')
#define BUTTON_DOWN_KEY ((uint8_t)'s')
#define BUTTON_A_KEY ((uint8_t)' ')
#define BUTTON_B_KEY ((uint8_t)'f')
#define BUTTON_OPT_KEY ((uint8_t)'r')

#define BUTTON_COUNT 7

const uint8_t button_keys[BUTTON_COUNT] = {BUTTON_A_KEY, BUTTON_B_KEY, BUTTON_LEFT_KEY, BUTTON_UP_KEY, BUTTON_RIGHT_KEY, BUTTON_DOWN_KEY, BUTTON_OPT_KEY};
const uint8_t button_pins[BUTTON_COUNT] = {PIN_BUTTON_A, PIN_BUTTON_B, PIN_BUTTON_LEFT, PIN_BUTTON_UP, PIN_BUTTON_RIGHT, PIN_BUTTON_DOWN, PIN_BUTTON_OPT};
const uint8_t led_pins[3] = {PIN_LED_RED, PIN_LED_GREEN, PIN_LED_BLUE};

void setRGB(uint32_t argb);

USBHIDKeyboard keyboard;

uint8_t key_states = 0;

void setup() {

  // set LED pins to output
  for (uint8_t i = 0; i < 3; i++)
    pinMode(led_pins[i], OUTPUT);

  // Set all button pins to input
  for (uint8_t i = 0; i < BUTTON_COUNT; i++) 
    pinMode(button_pins[i], INPUT);

  // initialize control over the keyboard:
  keyboard.begin();
  USB.begin();
  
  setRGB(0x4000FF00); // Set RGB light to green
}

/** 
 * Method for changing the rgb values of the LED on the controller. 
 * Argument can be provided in the following format: AARRGGBB (hexadecimal)
 */
void setRGB(uint32_t argb) {
  for (uint8_t i = 0; i < 3; i++) 
    analogWrite(led_pins[i], (uint8_t) (((argb >> ((2 - i) * 8)) & 0xFF) * (((argb >> 24) & 0xFF) / 255.0f)));
}

// Main loop
void loop() {

  // Whenever a button is pressed or released, we want to check the difference between the last state and its current state
  // If these differ, we send a 'release' or 'press' report.
  uint8_t previous = key_states, diff, i = 0, state = 0;
  key_states = 0;
  for (; i < BUTTON_COUNT; i++) {

    state = digitalRead(button_pins[i]);
    key_states |= state << i;
    diff = (state - ((previous >> (BUTTON_COUNT - i - 1)) & 1));

    // If there is a change in button state, press or release it.
    if (diff) {
      keyboard.press((uint8_t) button_keys[i]);
    } else { 
      keyboard.release((uint8_t) button_keys[i]);  
    }
  }
}