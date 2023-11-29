# Gebruiksaanwijzing
## ESP32 Game Controller
### Inhoud
- Inhoud
- Pinout
- Functies

### Pinout
De ESP32 controller is gemaakt met een PCB (Printed Circuit Board) en is aangesloten met jumperwires naar een breadboard waar een ESP32 op zit. De PCB ziet er zo uit: ![PCB](https://cdn.discordapp.com/attachments/1152210205300502610/1179433522910478509/20231129_152242.jpg?ex=6579c410&is=65674f10&hm=487d624c67cb26b40d3da9b3e71ae7e3f586247cbe0e219cd58ccf039fe1b08c&)

De kabels zijn als het volgende aangesloten op de ESP32:

- (PIN) -> (ESP Header)
- B5 -> 8
- B4 -> 3
- B6 -> 46
- B7 -> 9
- B1 -> 10
- B2 -> 11
- B3 -> 12
- GND -> GND
- 3.3V -> 3V3
- L1 -> 4

Deze pinouts wordt zo gebruikt omdat het dan makkelijk is om de controller er uit te pluggen als we deze opbergen. Het uiteindelijke idee is om de controller zo te ontwikkelen dat alles gesoldeerd zit en je geen jumperwires meer hoeft te gebruiken. De controller is momenteel nog een prototype.

### Functies

Met de ESP32 controller kun je de meegeleverde game besturen. 

De controller verbind met de game via Bluetooth Low Energy. Afgekort, BLE werkt anders dan normale Bluetooth. BLE hoeft niet te pairen met een apparaat en gebruikt bij het verbinden met een apparaat enkel de naam van het apparaat. De naam van de controller is altijd ESP Controller P1 als je speler 1 bent, en ESP Controller P2 als je speler 2 bent.

Op de controller zit een DPAD waarmee je naar links en rechts kunt bewegen. Ook zit er een DPAD naar beneden en omhoog op om te bukken of op te staan.
Op de ESP32 zitten ook twee knoppen om in het menu opties te selecteren. Dit zijn knoppen A en B. Knop A wordt gebruikt om in het spel te springen en om in menus items te selecteren. Knop B wordt in het spel gebruikt om te rennen en in het menu om terug te gaan.
Ten slotte is er in het midden een Optie knop. Met deze knop kun je het spel pauzeren en daarmee ook het menu openen. Hieronder een overzicht van alle knoppen:

![Overzicht](https://cdn.discordapp.com/attachments/1152210205300502610/1179437678568161280/20231129_152242_-_Copy.jpg?ex=6579c7ef&is=656752ef&hm=657e938af68f1b674aaa27b4bca1efea3e39fd328445c655d774a32b94961f4b&)

Je kunt met de ESP32 controller dus ook kiezen welke van de twee spelers jij bent. Dit kun je doen met de volgende combinaties:

- OPT + DPAD Left = Speler 1
- OPT + DPAD Right = Speler 2

Speler 1:

![Speler 1](https://cdn.discordapp.com/attachments/1152210205300502610/1179439100886011924/speler1.png?ex=6579c942&is=65675442&hm=04cd7c80f46fae221c802a6631f8e91f74d9d3819d54ed5d0f425fe06f99b872&)

Speler 2:

![Speler 2](https://cdn.discordapp.com/attachments/1152210205300502610/1179439258306613332/speler2.png?ex=6579c968&is=65675468&hm=0e115f499312087a6e93b89a2c700b109253e7e61cee8bd2ee01dfca72b436f6&)

Als je alleen speler 1 bent hoef je deze combinatie niet in te drukken. Wanneer er geen invoer wordt gedetecteerd selecteerd de controller automatisch speler 1.

Aangezien de ESP Controller nog een prototype is, hebben wij een debug mode geïmplementeerd om realtime in een seriële monitor uit te lezen wat de controller doet, waarmee hij verbonden is en wat hij verstuurd via BLE. Om debug mode in te schakelen moet je tijdens het opstarten de combinatie OPT + B ingedrukt houden:

![Debug mode](https://cdn.discordapp.com/attachments/1152210205300502610/1179439972911153242/debugmode.png?ex=6579ca12&is=65675512&hm=f0ca21441e7f216435b438172a0b2cd68d30c3abc39ee56b8fc6eb58ace45919&)

