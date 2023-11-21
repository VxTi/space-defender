# Game Controller

Wanneer je denkt aan een Game Controller denk je misschien wel aan de controller van jouw favoriete game console. Deze controllers zijn vaak gemaakt van plastic en bevatten een aantal knoppen en joysticks. Onderdeel van deze opdracht is dat jullie zelf een game controller gaan maken, hoe deze echter eruit gaat zien bepalen jullie.

Om jullie een vlotte start te geven met het bouwen krijgen jullie van ons een moederbord waarop ruimte zit voor een aantal vaste componenten. Dit document geeft je alle details over het gebruik van dit moederbord en de componenten die erop zitten. Daarnaast vind je in dit document ook een aantal voorbeelden van hoe je de componenten kan gebruiken.

## Printed Circuit Board (PCB)

Het moederbord dat jullie krijgen is een Printed Circuit Board (PCB). Dit is een bord waarop een aantal componenten zijn geplaatst. Deze componenten zijn met elkaar verbonden door middel van koperen sporen. Deze sporen zorgen ervoor dat de componenten met elkaar kunnen communiceren. Dit zorgt ervoor dat je geen losse draden hoeft te gebruiken om de componenten met elkaar te verbinden, zoals je misschien wel gewend bent van de breadboard.

![3d model](/assets/game-controller-3d-model.png){: style="max-width: 100%;"}

## Ontwerp

Bij het ontwerp van de PCB is er rekening gehouden met vooral drukknoppen die op strategische wijze zijn geplaatst om ervoor te zorgen dat je veel voorkomende spellen zou kunnen aansturen. Voor elke drukknop is er ruimte voor een weerstand.

Dan heb je ook de mogelijkheid om een LED aan te sluiten, deze zouden jullie bijvoorbeeld kunnen gebruiken om een status door te geven. Om deze LED goed te kunnen gebruiken is er ook ruimte voor een voorschakelweerstand.

Dan is er aan één kant een rij van pin-headers opgenomen, deze staan in een hoek van 90 graden, zodat je hier een kabel kan aansluiten zonder dat deze in de weg komt te staan van de andere componenten.

Om ervoor te zorgen dat je het PCB ergens in vast kan monteren, of misschien wel om iets te bevestigen aan de PCB, vind je 2 schroefgaten aan de bovenkant van het PCB.

## Aansluitschema

In het aansluitschema is rekening gehouden met de volgende componenten:

| Naam | Omschrijving |
| --- | ----------- |
| SW1 | Drukknop #1 (pinheader B1) |
| SW2 | Drukknop #2 (pinheader B2) |
| SW3 | Drukknop #3 (pinheader B3) |
| SW4 | Drukknop #4 (pinheader B4) |
| SW5 | Drukknop #5 (pinheader B5) |
| SW6 | Drukknop #6 (pinheader B6) |
| SW7 | Drukknop #7 (pinheader B7) |
| D1 | LED (pinheader L1) |
| Pin-header | B1-7, L1, 3.3V, GND |
| H1 | Schroefgat #1 |
| H2 | Schroefgat #2 |

Het aansluitschema van het PCB is als volgt:

![schematic](/assets/game-controller-schematic.png){: style="max-width: 100%;"}

## PCB layout

De layout van het PCB is als volgt:

![pcb](/assets/game-controller-pcb.png){: style="max-width: 100%;"}



{{ mdocotion_header('/assets/headers/game_controller_pcbs2.jpg') }}