# Elektrische schakeling Game controller

Hieronder is de elektrische schakeling van de game controller te zien. Ook deze hebben wij gemaakt met behulp van het gratis CAD programma KiCad. KiCad heeft zelf al heel veel elektrische componenten ingebouwd waarmee je kunt werken. Helaas konden wij nergens van KiCad zelf de ESP32 vinden. De schematics en blueprints voor alle Espressif (Fabrikant van onder andere de ESP32) zijn te vinden op de GitHub van Espressif. De download link hebben we [hier voor je](https://github.com/espressif/kicad-libraries/releases/download/2.0.6/espressif-kicad-addon.zip).

!!! note "Circuit" 
    ![Game controller](https://cdn.discordapp.com/attachments/1152210205300502610/1199295101231431740/image.png?ex=65c20599&is=65af9099&hm=9cc2ba6622b5acb499b66a322e4167d01604f799436e0e7d8e2d86b4d67ef15c&)

### Pin Schema
| ESP32 Pin   | Doel                                                     |
| :---------- | :------------------------------------------------------- |
| `21`        | :material-gesture-tap-button: DPAD UP Knop               |
| `38`        | :material-gesture-tap-button: DPAD LEFT Knop             |
| `45`        | :material-gesture-tap-button: DPAD RIGHT Knop            |
| `42`        | :material-gesture-tap-button: DPAD DOWN Knop             |
| `7`         | :material-gesture-tap-button: Primary A Knop             |
| `6`         | :material-gesture-tap-button: Secondary B Knop           |
| `5`         | :material-battery-unknown-bluetooth: Accu spanningsmeter |
| `35`        | :material-led-on: RGB LED - Rood PWM Signaal             |
| `36`        | :material-led-on: RGB LED - Groen PWM Signaal            |
| `37`        | :material-led-on: RGB LED - Blauw PWM Signaal            |



Op dit schema zit alles er wellicht een beetje ongeorganiseerd uit, en dat kan in die zin ook kloppen. Echter heeft dit een reden. Bij het ontwerpen van een PCB moet je altijd eerst een schematic maken zodat het programma weet wat met wat is verbonden. De reden dat wij soms pins op de schematic hebben gekozen die totaal aan de andere kant liggen komt omdat deze dan op de PCB vaak wel recht naast de knopjes bijvoorbeeld liggen. Zo zijn de tracks in de pcb zo kort mogelijk, want lange tracks hebben vaker last van noise en een hoge weerstand.

Het ontwerp in deze schematic is dus ook letterlijk schematisch gemaakt en niet praktisch zoals het PCB ontwerp. De Espressif library maakt hun blueprints dus op deze manier om bepaalde pins met enigzins dezelfde functionaliteit bij elkaar weer te geven zodat het makkelijk is om deze te onderscheiden. Wij maken hier in dit geval geen gebruik van aangezien wij alleen Input en Output pins nodig hebben, en dit ondersteunen alle GPIO Pins op de ESP32 wel.



