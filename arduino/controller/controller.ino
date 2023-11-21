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

void setup()
{
  setPins();
  Serial.begin(115200);
  while (!Serial)
  {
  }
  if (Serial){
    digitalWrite(ledPin, HIGH);
  }
}

void loop()
{
}

void setPins()
{
  pinMode(aButton, INPUT);
  pinMode(bButton, INPUT);
  pinMode(dpadUp, INPUT);
  pinMode(dpadDown, INPUT);
  pinMode(dpadLeft, INPUT);
  pinMode(dpadRight, INPUT);
  pinMode(optionButton, INPUT);
  pinMode(ledPin, OUTPUT);
}

void readPins()
{
  if (digitalRead(aButton) == 0x1)
  {
    aButtonPressed = true;
  } else {
    aButtonPressed = false;
  }
}

void sendData()
{
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