#include <ArduinoJson.h>

const byte aButton = 0;
bool aButtonPressed;
const byte bButton = 0;
bool bButtonPressed;
const byte dpadUp = 0;
bool dpadUpPressed;
const byte dpadDown = 0;
bool dpadDownPressed;
const byte dpadLeft = 0;
bool dpadLeftPressed;
const byte dpadRight = 0;
bool dpadRightPressed;
const byte optionButton = 0;
bool optionButtonPressed;

const byte ledPin = 0;

void setup() {
    // Pins are by default set to INPUT
    pinMode(ledPin, OUTPUT);
    Serial.begin(115200);

    if (Serial){
        digitalWrite(ledPin, HIGH);
    }
}

void loop() {
    // TODO: Read input from controller.
}

void readPins() {

  // Can be simplified to:
  aButtonPressed = digitalRead(aButton);
  /* if (digitalRead(aButton) == 0x1)
  {
    aButtonPressed = true;
  } else {
    aButtonPressed = false;
  } */
}

void sendData()
{

    // NOTE:
    // Possibility to send only one byte of data, where each bit
    // represents the state of the button.
    // buttonData |= state ? 1 << buttonPosition : 0;

  // Open a Json document
  StaticJsonDocument<400> buttonData;
  // Add data and serialize
  buttonData["a"] = aButtonPressed; // A button
  buttonData["b"] = bButtonPressed; // B button
  buttonData["u"] = dpadUpPressed; // Dpad up button
  buttonData["d"] = dpadDownPressed; // Dpad down button
  buttonData["l"] = dpadLeftPressed; // Dpad left button
  buttonData["r"] = dpadRightPressed; // Dpad right button
  buttonData["o"] = optionButtonPressed; // Option button
  serializeJson(buttonData, Serial); // Serialize into Json string and send via Serial
}