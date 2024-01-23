# Custom PCB design

## Inleiding
Voor dit project hebben wij onszelf uitgedaagd om zelf een PCB te ontwerpen voor de game controller. Dit hebben we gedaan met het programma KiCad. Dit is een gratis CAD programma waarmee je PCBs kunt ontwerpen. Het is een open source programma en wordt veel gebruikt door hobbyisten. Het is een erg uitgebreid programma en heeft veel mogelijkheden. Het is een erg goed programma om mee te beginnen als je nog nooit een PCB hebt ontworpen.

## PCB ontwerp
Wij hebben twee ontwerpen gemaakt. De allereerste was best wel mislukt en inefficient. Daarnaast was deze ook veels te groot aangezien we niet goed wisten hoe we het moesten aanpakken. De tweede versie was een stuk beter en efficienter. Deze hebben we ook daadwerkelijk op school laten printen. De eerste versie hebben we niet laten printen omdat deze niet goed was. Hieronder zie je de eerste versie van het PCB ontwerp.

## Designs

!!! note "Versie 1"
    ![Schematic 1](https://cdn.discordapp.com/attachments/1152210205300502610/1198747612606636174/Screenshot_2024-01-21_225229.png?ex=65c007b6&is=65ad92b6&hm=cb50ddd39449419919133d1c0102599f8908b506af5705e723f72f337574dec3&) ![PCB 1](https://cdn.discordapp.com/attachments/1152210205300502610/1198747612153663549/Screenshot_2024-01-21_225155.png?ex=65c007b6&is=65ad92b6&hm=fbdf98bd1676144468f3f3767e7c4e5a628bab1f37b4a3205c2a2138f64c603f&)

!!! note "Versie 2"
    ![Schematic 2](https://cdn.discordapp.com/attachments/1152210205300502610/1198747613114155062/Screenshot_2024-01-21_225315.png?ex=65c007b6&is=65ad92b6&hm=087016560255757fe091124a10b7023f7c2b98631fbec5ea09defd8ba918a997&) ![PCB 2](https://cdn.discordapp.com/attachments/1152210205300502610/1198747613437120512/Screenshot_2024-01-21_225353.png?ex=65c007b6&is=65ad92b6&hm=09ca77374d13c8b267088411e4f52ef6a03b958ab0356ca70575b07c336f69f2&)

## PCB laten printen
In eerste instantie wilden we de PCB bestellen bij Jlcpcb. Dit is een bedrijf dat PCBs print en ze naar je opstuurt. Het enige nadeel was dat deze uit China moesten komen en dat het dus erg lang zou duren voordat we ze binnen zouden krijgen, daarnaast kost het ook geld. We hebben toen besloten om de PCB te laten printen op school. Dit was gratis en we konden het binnen twee dagen al ophalen. Het enige nadeel aan de PCB die we op school hebben laten printen is dat de kwaliteit niet zo goed is. De koperbanen zijn bloodgesteld en de PCB is niet gelamineerd. Daarnaast zijn de pads niet doorverbonden van de voorkant naar de achterkant, dus als je iets aan de achterkant zou solderen zou de voorkant niet werken. Om deze reden kunnen we helaas niet een werkende draadloze controller laten zien op de product review.

## Onderdelen
Hier een lijst met onderdelen:

| Aantal | Onderdeel                                                            |
| :----- | :------------------------------------------------------------------- |
| 2x     | :material-fence-electric: Female headers 24x1                        |
| 1x     | :material-chip: ESP32S3 Dev Module                                   |
| 1x     | :material-integrated-circuit-chip: TP4056 battery management module  |
| 1x     | :material-battery: 1250mAh 3.7V LiPo batterij                        |
| 1x     | :material-toggle-switch: On/Off Switch                               |
| 7x     | :material-gesture-tap-button: Non-Latching Push Button               |
| 1x     | :material-led-on: RGB LED                                            |
| 1x     | :material-resistor: 100 kOhm weerstand                               |
| 1x     | :material-resistor: 27 kOhm weerstand                                |
| 3x     | :material-resistor: 47 Ohm weerstand                                 |
| 7x     | :material-resistor: 500 Ohm weerstand                                |

  

## Resultaat
Hieronder zie je het resultaat van de PCB die we op school hebben laten printen. De PCB ziet er niet uit zoals je gewend bent, hij is niet standaard groen en de koperbanen zijn blootgesteld. We hebben alle componenten erop gesoldeerd. Sommige knoppen waarvan de tracks aan de achterkant lopen doen het wel, maar de knoppen waarvan de tracks aan de voorkant lopen doen het niet. Dit komt omdat de pads niet doorverbonden zijn. We hebben de PCB getest met een ESP32S3 Dev Module en de meeste functies werken. Stel dat we een PCB hadden die wel doorverbonden pads had weten we zeker dat dit design een succes was geweest.

![Resultaat](https://cdn.discordapp.com/attachments/1152210205300502610/1199065978575790140/20240121_222201.jpg?ex=65c13036&is=65aebb36&hm=a450b57e151ee18286a068134f5536691f9fcd6993f0c9ff76e69350e373969a&)
