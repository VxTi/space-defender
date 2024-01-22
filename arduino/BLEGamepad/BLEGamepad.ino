/*
 * This code programs a number of pins on an ESP32 as buttons on a BLE gamepad
 *
 * It uses arrays to cut down on code
 *
 * Before using, adjust the numOfButtons, buttonPins and physicalButtons to suit your senario
 *
 */

#include <Arduino.h>
#include <BleGamepad.h> // https://github.com/lemmingDev/ESP32-BLE-Gamepad

BleGamepad bleGamepad;

#define numOfButtons 10

#define PIN_BUTTON_UP 21
#define PIN_BUTTON_LEFT 38
#define PIN_BUTTON_RIGHT 45
#define PIN_BUTTON_DOWN 42
#define PIN_BUTTON_A 7
#define PIN_BUTTON_B 6
#define PIN_BUTTON_OPT 4
#define PIN_LED 4
#define PIN_BATTERY 5
#define PIN_LED_RED 35
#define PIN_LED_GREEN 36
#define PIN_LED_BLUE 37

byte previousButtonStates[numOfButtons];
byte currentButtonStates[numOfButtons];
byte buttonPins[numOfButtons] = {PIN_BUTTON_A, PIN_BUTTON_B, PIN_BUTTON_UP, PIN_BUTTON_DOWN, PIN_BUTTON_LEFT, PIN_BUTTON_RIGHT, PIN_BUTTON_OPT};
byte physicalButtons[numOfButtons] = {1, 2, 3, 4, 5, 6, 7};

void setup()
{
    for (byte currentPinIndex = 0; currentPinIndex < numOfButtons; currentPinIndex++)
    {
        pinMode(buttonPins[currentPinIndex], INPUT_PULLUP);
        previousButtonStates[currentPinIndex] = HIGH;
        currentButtonStates[currentPinIndex] = HIGH;
    }

    BleGamepadConfiguration bleGamepadConfig;
    bleGamepadConfig.setAutoReport(false);
    bleGamepadConfig.setButtonCount(numOfButtons);
    bleGamepad.begin(&bleGamepadConfig);

    // changing bleGamepadConfig after the begin function has no effect, unless you call the begin function again
}

void loop()
{
    if (bleGamepad.isConnected())
    {
        for (byte currentIndex = 0; currentIndex < numOfButtons; currentIndex++)
        {
            currentButtonStates[currentIndex] = digitalRead(buttonPins[currentIndex]);

            if (currentButtonStates[currentIndex] != previousButtonStates[currentIndex])
            {
                if (currentButtonStates[currentIndex] == LOW)
                {
                    bleGamepad.press(physicalButtons[currentIndex]);
                }
                else
                {
                    bleGamepad.release(physicalButtons[currentIndex]);
                }
            }
        }

        if (currentButtonStates != previousButtonStates)
        {
            for (byte currentIndex = 0; currentIndex < numOfButtons; currentIndex++)
            {
                previousButtonStates[currentIndex] = currentButtonStates[currentIndex];
            }

            bleGamepad.sendReport();
        }

        delay(20);
    }
}