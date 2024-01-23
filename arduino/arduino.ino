/*
  Keyboard Message test

  For the Arduino Leonardo and Micro.

  Sends a text string when a button is pressed.

  The circuit:
  - pushbutton attached from pin 0 to ground
  - 10 kilohm resistor attached from pin 0 to +5V

  created 24 Oct 2011
  modified 27 Mar 2012
  by Tom Igoe
  modified 11 Nov 2013
  by Scott Fitzgerald

  This example code is in the public domain.

  http://www.arduino.cc/en/Tutorial/KeyboardMessage
*/

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

#define BUTTON_A_IDX 0
#define BUTTON_B_IDX 1
#define BUTTON_LEFT_IDX 2
#define BUTTON_UP_IDX 3
#define BUTTON_RIGHT_IDX 4
#define BUTTON_DOWN_IDX 5
#define BUTTON_OPT_IDX 6

#define DEVICE_NAME "Game Controller"

#define BUTTON_COUNT 7

const uint8_t button_keys[BUTTON_COUNT] = {BUTTON_A_KEY, BUTTON_B_KEY, BUTTON_LEFT_KEY, BUTTON_UP_KEY, BUTTON_RIGHT_KEY, BUTTON_DOWN_KEY, BUTTON_OPT_KEY};
const uint8_t button_pins[BUTTON_COUNT] = {PIN_BUTTON_A, PIN_BUTTON_B, PIN_BUTTON_LEFT, PIN_BUTTON_UP, PIN_BUTTON_RIGHT, PIN_BUTTON_DOWN, PIN_BUTTON_OPT};
const uint8_t led_pins[3] = {PIN_LED_RED, PIN_LED_GREEN, PIN_LED_BLUE};

void setRGB(uint8_t r, uint8_t g, uint8_t b, float a);


#include "USB.h"
#include "USBHIDKeyboard.h"
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
  setRGB(0, 255, 0, 0.3f);
}

/** 
 * Method for changing the rgb values of the LED on the controller.
 */
void setRGB(uint8_t r, uint8_t g, uint8_t b, float a = 1.0f) {
  analogWrite(led_pins[0], (uint8_t) (r * a));
  analogWrite(led_pins[1], (uint8_t) (g * a));
  analogWrite(led_pins[2], (uint8_t) (b * a));
}

// Main loop
void loop() {
  
  uint8_t previous_key_states = key_states;

  // Whenever a button is pressed or released, we want to check the difference between the last state and its current state
  // If these differ, we send a 'release' or 'press' report.
  for (uint8_t i = 0, state = 0, diff, key_states = 0; i < BUTTON_COUNT; i++) {

    state = digitalRead(button_pins[i]);
    key_states |= state << i;
    diff = (state - ((previous_key_states >> (BUTTON_COUNT - i - 1)) & 1));

    // If there is a change in button state, press or release it.
    if (diff) 
      keyboard.press((uint8_t) button_keys[i]);
    else 
      keyboard.release((uint8_t) button_keys[i]);
    
  }
}
