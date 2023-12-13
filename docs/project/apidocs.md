# API Documentatie

## Hoe gebruik je de API?

Om de API te gebruiken, moet je eerst de API starten. Dit doe je door het volgende commando uit te voeren in de terminal:

```terminal
node api.js
```

De API zal nu draaien op localhost:8080. De API is nu klaar voor gebruik. De API is te gebruiken door een request te sturen naar de volgende URL: `127.0.0.1:8080`. De API verwacht meestal postData dat er als volgt uit kan zien:

```postData
field1=value1&field2=value2
```

!!! note "Niet bestaande URL"
    Als je een niet bestaande URL probeert te gebruiken, zal de API HTTP status 404 (Not Found) terugsturen, en een JSON object waarin staat dat de URL niet bestaat.

## Voorbeeld van een POST request

Hier een simpel voorbeeld hoe je met JavaScript een test request kunt maken naar de API:

!!! example "Voorbeeld van een POST request naar de API met JavaScript"
    ```js
    const apiUrl = 'http://localhost:8080/api/test';

                    try {
                        const response = await fetch(apiUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json', // Sending a JSON object
                            },
                            body: JSON.stringify({ name: 'VOORBEELD' }), // Sending the JSON object as JSON
                        });

                        if (response.ok) {
                            console.log('JSON sent successfully');
                        } else {
                            console.error('Error sending JSON to the API');
                        }
                    } catch (error) {
                        console.error('Error:', error);
                    }
    ```

!!! info "Methode"
    Dit voorbeeld gebruikt fetch om een POST request te sturen naar de API. Je kunt met andere methodes verbinding maken met de API, maar dit is de manier die de game zal gebruiken om met de API te communiceren.

## Beveiliging

De API is niet beveiligd met een API key. Dit is geen probleem, omdat de API alleen gebruikt wordt door de game zelf. De game is niet openbaar, en de URL is niet openbaar. De API is dus alleen te gebruiken door de game zelf. De API is tevens wel beveiligd tegen SQL injecties. Dit betekent dat de API niet te gebruiken is om de database te hacken. Dit is eigenlijk ook niet nodig, omdat we zeker weten dat de API alleen gebruikt wordt door de game zelf, maar we vonden het 'good practice' om de API te beveiligen tegen SQL injecties. Daarnaast was het ook een leuk onderwerp om te leren.

## Alle API GET requests

### Verkrijg de data van alle gebruikers

Om de data van alle gebruikers te verkrijgen, stuur je een GET request naar de volgende URL: `127.0.0.1:8080/api/get/allusers`. De API verwacht geen postData. De API zal HTTP status 200 (OK) terugsturen, en een JSON object met alle data van alle gebruikers. Het JSON object ziet er als volgt uit:

```json
[
    [
        {
            "name": "VOORBEELD",
            "time": "12:00:00",
            "date": "1970-01-01T23:00:00.000Z",
            "highscore": 100,
            "coins": 100
        }
    ]
]
```

!!! note "Errors"
    Als er een fout is opgetreden, zal de API HTTP status 500 (Internal Server Error) terugsturen, en een JSON object met de error.

### Verkrijg de data van een specifieke gebruiker

Om de data van een specifieke gebruiker te verkrijgen, stuur je een GET request naar de volgende URL: `127.0.0.1:8080/api/get/user`. De API verwacht postData dat er als volgt uit ziet:

```postData
name=VOORBEELD
```

De API zal een HTTP status 200 (OK) terugsturen, en een JSON object met alle data van de specifieke gebruiker. Het JSON object ziet er als volgt uit:

```json
[
    [
        {
            "name": "VOORBEELD",
            "time": "12:00:00",
            "date": "1970-01-01T23:00:00.000Z",
            "highscore": 100,
            "coins": 100
        }
    ]
]
```

!!! note "Errors"
    Als er een fout is opgetreden, zal de API HTTP status 500 (Internal Server Error) terugsturen, en een JSON object met de error.

### Test de API

Om de API te testen, stuur je een GET request naar de volgende URL: '127.0.0.1:8080/api/test'. De API verwacht geen postData. De API zal HTTP status 200 (OK) terugsturen, en een JSON object met de status van de request. Het JSON object ziet er als volgt uit:

```json
[
    [
        {
            "message": "API Success"
        }
    ]
]
```

!!! tip "Test de API"
    Het is verstandig om deze functie te gebruiken als je even snel wilt weten als de verbinding met de API wel werkt.

## Alle API POST requests

### Creeër een nieuwe tabel in de database

Om een nieuwe tabel in de database te creeëren, stuur je een POST request naar de volgende URL: `127.0.0.1:8080/api/post/newtable`. De API verwacht postData dat er als volgt uit ziet:

```postData
name=VOORBEELD
```

De API zal HTTP status 201 (Created) terugsturen, en een JSON object met de status van de request. Het JSON object ziet er als volgt uit:

```json
[
    [
        {
            "message": "Table created"
        }
    ]
]
```

!!! note "Errors"
    Als er een fout is opgetreden, zal de API HTTP status 500 (Internal Server Error) terugsturen, en een JSON object met de error.

!!! warning "Let op"
    Houdt er rekening mee dat de tabelnaam niet mag beginnen met een cijfer, en dat de tabelnaam niet langer mag zijn dan 64 karakters. Deze functie zit er alleen in voor het geval dat er een nieuwe tabel nodig is. Verwacht niet dat deze functie vaak gebruikt zal worden.

### Creeër data voor een gebruiker

Om data voor een gebruiker te creeëren, stuur je een POST request naar de volgende URL: `127.0.0.1:8080/api/post/insert`. De API verwacht postData dat er als volgt uit ziet:

```postData
name=VOORBEELD&time=12:00:00&date=1970-01-01T23:00:00.000Z&highscore=100&coins=100
```

De API zal HTTP status 202 (Accepted) terugsturen, en een JSON object met de status van de request. Het JSON object ziet er als volgt uit:

```json
[
    [
        {
            "message": "Data inserted"
        }
    ]
]
```

!!! note "Errors"
    Als er een fout is opgetreden, zal de API HTTP status 500 (Internal Server Error) terugsturen, en een JSON object met de error.

## Alle API DELETE requests

### Leeg de tabel 'userdata'

Om de tabel 'userdata' leeg te maken, stuur je een DELETE request naar de volgende URL: `127.0.0.1:8080/api/delete/flush`. De API verwacht geen postData. De API zal HTTP status 202 (Accepted) terugsturen, en een JSON object met de status van de request. Het JSON object ziet er als volgt uit:

```json
[
    [
        {
            "message": "Table flushed"
        }
    ]
]
```

!!! note "Errors"
    Als er een fout is opgetreden, zal de API HTTP status 500 (Internal Server Error) terugsturen, en een JSON object met de error.

!!! danger "Waarschuwing"
    Met deze actie zal alle data in de tabel 'userdata' verwijderd worden. Deze actie kan niet ongedaan gemaakt worden. Wees hier dus voorzichtig mee.
