# Taken voor komende periode

---

> ### Schrijf een testplan 
> 
> Hiermee moeten wij kwalitatief met zo min mogelijk invloed feedback verkrijgen van gebruikers 
> om deze non-biased te maken. Dit moeten wij doen door middel van telkens
> dezelfde vragen te stellen.
> - [x] Afgerond

> ### Verkrijg meer feedback 
> 
> Dit spreekt voor zich, we moeten meer mensen benaderen om feedback
> van te verkrijgen.
> 
> ![50%](https://progress-bar.dev/50)

> ### Database uitbreiden 
> 
> Meer tabellen toevoegen, deze aan elkaar linken. <br>
> Ook moeten de tabellen aangemaakt worden als de server start, indien
> deze nog niet aanwezig zijn.
> - [X] Afgerond

> ### Documentatie uitbreiden 
> 
> Ook redelijk vanzelfsprekend, meer documentatie schrijven over de
> code en game functionaliteit.
> - [ ] Afgerond

> ### UML bestanden beter weergeven 
> 
> Deze bestanden moeten we in de documentatie plaatsen.
> - [X] Afgerond (denk ik)

> ### Eigen User-Stories aanmaken 
> 
> We moeten afhankelijk van feedback user-stories creëren
> 
> ![2/3](https://progress-bar.dev/33)

> ### PCB Design documenteren
>
> PCB design documenteren en uitleggen etc..
> - [ ] Afgerond

> ### UML diagrammen in markdown zetten
>
> UML diagrammen in markdown zetten zodat deze op de pages staan.
> - [ ] Afgerond

> ### Nieuwe game ontwerp documenteren
>
> Nieuwe game ontwerp documenteren met gebruiksaanwijzing enz
> - [ ] Afgerond

> ### Bronvermelding maken
>
> Alle bronnen die we gebruikt hebben in de documentatie zetten. Check knowledgebase hoe dat moet.
> - [ ] Afgerond

Ik ben mij bewust van de invloed die wij uitoefenen met ons product. Ons product zal getoond worden op de open dag en zal daarmee gepresenteerd worden aan studiekiezers. Afhankelijk van hoe goed en toegankelijk ons product zal zijn kan dit invloed hebben op de studiekeuze die deze kiezers maken. Stel dat iemand bijvoorbeeld heel enthousiast wordt over ons product zou hij of zij positief beinvloed kunnen worden om voor de opleiding HBO-ICT te kiezen.

Ik ben naar mening dat wij op het moment niet veel invloed hebben met ons huidige project. We maken een spel die op de open dag getoond gaat worden. De enige invloed die wij zouden kunnen hebben is om iemand te inspireren om deze studie ook te gaan verrichten. Dit zou wel een doel zijn die ik als teamlid zou willen bereiken, om iemand te kunnen overtuigen om ook onze opleiding te gaan doen. Daarnaast denk ik niet dat er een andere impact is die ik momenteel als programmeur kan maken. Mogelijk in de toekomst zou ik bezig kunnen gaan met applicaties bouwen die dagelijks gebruikt kan worden door een ieder. Denk aan social media platforms, of als TI-er medische apparatuur om mensen-levens te redden.


Ons project is geschreven m.b.v. OOP. We maken gebruik van klassen, instances, inheritance en encapsulation. Bijvoorbeeld de Player class inherit Entity en Entity inherit AABB. Daarnaast zijn vrijwel alle fields class-private, al wilt de gebruiker deze data verkrijgen zijn er voor het meerendeel getter / setter functies.
> Instances (ex): let player: Player
> Inheritance (ex): Player: ((Player extends Entity) extends AABB)
> Encapsulation (ex): class Entity { #position (private), #velocity (private) ... }


Wij werken met een database en kunnen hieruit data opslaan en uit terug halen via de website door middel van een NodeJS server met MySQL2 library. Hiermee maken we een connectie met de HvA OEGE server om onze data in op te slaan. Deze kunnen we vervolgens ook tonen via phpMyAdmin. Database requests zijn ook behoorlijk makkelijk te maken, enkel door middel van een JSON-object als post data te versturen met de juiste parameters, afhankelijk van wat voor data je wilt krijgen. Hierop gebaseerd stuurt de database een response terug. API docs: https://riiqaazaaxaa71-propedeuse-hbo-ict-onderwijs-2023-4b56b2f8b7e804.dev.hihva.nl/project/apidocs/
