#include <BleKeyboard.h>
#define USE_NIMBLE

/*
| PINS | PCB SW# | DESC   | CHAR |
|------|---------|--------|------|
| 7    | 1       | A      | ' '  |
| 6    | 2       | B      | F    |
| 5    | 3       | DPAD U | W    |
| 4    | 4       | DPAD D | S    |
| 3    | 5       | DPAD L | A    |
| 2    | 6       | DPAD R | D    |
| 1    | 7       | OPT    | R    |
*/

BleKeyboard bleKeyboard;

const int pinData[] =         {   7,    6,    5,    4,    3,    2,    1};
const int buttonNumbers[] =   {   1,    2,    3,    4,    5,    6,    7};
const uint8_t buttonChars[] = { ' ',  'F',  'W',  'S',  'A',  'D',  'R'};
const uint8_t buttonAscii[] = {0x2c, 0x09, 0x1a, 0x16, 0x04, 0x07, 0x15};


int buttonData[7] = {0, 0, 0, 0, 0, 0, 0};

void setPinModes() {
  for (int i = 0; i < 7; i++) {
    pinMode(pinData[i], INPUT);
  }
}

void readButtonStates() {
    for (int i = 0; i < 7; i++) {
        buttonData[i] = digitalRead(pinData[i]);
    }
}

uint8_t getButtonCharacter(int buttonNumber) {
    return buttonAscii[buttonNumber];
}

void setup() {
  Serial.begin(115200);
  Serial.println("Running BLE Gamepad");
  setPinModes();
  bleKeyboard.begin();
}

void loop(){
    readButtonStates();
    for (int i = 0; i < 7; i++) {
        if (buttonData[i] == 1) {
        bleKeyboard.press(getButtonCharacter(i));
        Serial.println("Pressed: " + String(getButtonCharacter(i)));
        } else {
        bleKeyboard.release(getButtonCharacter(i));
        Serial.println("Released: " + String(getButtonCharacter(i)));
        }
    }
    delay(2);
}
/*
void loop() {
  if(bleKeyboard.isConnected()) {
    Serial.println("Sending 'Hello world'...");
    bleKeyboard.print("Hello world");

    delay(1000);

    Serial.println("Sending Enter key...");
    bleKeyboard.write(KEY_RETURN);

    delay(1000);

    Serial.println("Sending Play/Pause media key...");
    bleKeyboard.write(KEY_MEDIA_PLAY_PAUSE);

    delay(1000);
    
   //
   // Below is an example of pressing multiple keyboard modifiers 
   // which by default is commented out. 
   // 
    Serial.println("Sending Ctrl+Alt+Delete...");
    bleKeyboard.press(KEY_LEFT_CTRL);
    bleKeyboard.press(KEY_LEFT_ALT);
    bleKeyboard.press(KEY_DELETE);
    delay(100);
    bleKeyboard.releaseAll();

  }
  Serial.println("Waiting 5 seconds...");
  delay(5000);
}
*/

#define SHIFT 0x80
const uint8_t asciimap[] =
{
	0x2a,			// BS	Backspace
	0x2b,			// TAB	Tab
	0x28,			// LF	Enter
	0x2c,		   //  ' '
	0x1e|SHIFT,	   // !
	0x34|SHIFT,	   // "
	0x20|SHIFT,    // #
	0x21|SHIFT,    // $
	0x22|SHIFT,    // %
	0x24|SHIFT,    // &
	0x34,          // '
	0x26|SHIFT,    // (
	0x27|SHIFT,    // )
	0x25|SHIFT,    // *
	0x2e|SHIFT,    // +
	0x36,          // ,
	0x2d,          // -
	0x37,          // .
	0x38,          // /
	0x27,          // 0
	0x1e,          // 1
	0x1f,          // 2
	0x20,          // 3
	0x21,          // 4
	0x22,          // 5
	0x23,          // 6
	0x24,          // 7
	0x25,          // 8
	0x26,          // 9
	0x33|SHIFT,      // :
	0x33,          // ;
	0x36|SHIFT,      // <
	0x2e,          // =
	0x37|SHIFT,      // >
	0x38|SHIFT,      // ?
	0x1f|SHIFT,      // @
	0x04|SHIFT,      // A
	0x05|SHIFT,      // B
	0x06|SHIFT,      // C
	0x07|SHIFT,      // D
	0x08|SHIFT,      // E
	0x09|SHIFT,      // F
	0x0a|SHIFT,      // G
	0x0b|SHIFT,      // H
	0x0c|SHIFT,      // I
	0x0d|SHIFT,      // J
	0x0e|SHIFT,      // K
	0x0f|SHIFT,      // L
	0x10|SHIFT,      // M
	0x11|SHIFT,      // N
	0x12|SHIFT,      // O
	0x13|SHIFT,      // P
	0x14|SHIFT,      // Q
	0x15|SHIFT,      // R
	0x16|SHIFT,      // S
	0x17|SHIFT,      // T
	0x18|SHIFT,      // U
	0x19|SHIFT,      // V
	0x1a|SHIFT,      // W
	0x1b|SHIFT,      // X
	0x1c|SHIFT,      // Y
	0x1d|SHIFT,      // Z
	0x2f,          // [
	0x31,          // bslash
	0x30,          // ]
	0x23|SHIFT,    // ^
	0x2d|SHIFT,    // _
	0x35,          // `
	0x04,          // a
	0x05,          // b
	0x06,          // c
	0x07,          // d
	0x08,          // e
	0x09,          // f
	0x0a,          // g
	0x0b,          // h
	0x0c,          // i
	0x0d,          // j
	0x0e,          // k
	0x0f,          // l
	0x10,          // m
	0x11,          // n
	0x12,          // o
	0x13,          // p
	0x14,          // q
	0x15,          // r
	0x16,          // s
	0x17,          // t
	0x18,          // u
	0x19,          // v
	0x1a,          // w
	0x1b,          // x
	0x1c,          // y
	0x1d,          // z
	0x2f|SHIFT,    // {
	0x31|SHIFT,    // |
	0x30|SHIFT,    // }
	0x35|SHIFT,    // ~
	0				// DEL
};