# API Documentatie

# Hoe gebruik je de API?

De API is te gebruiken door een request naar webadres: `http://oege.ie.hva.nl:8080/api`. De API verwacht altijd postData dat er als volgt uit kan zien:

```postData
key=value&name=iets&score=100&coins=100
```

!!! tip "Probeer de API"
    Wij hebben tijdens het ontwikkelen van de API het programma Postman gebruikt. Hierin kun je heel gemakkelijk requests sturen naar de API, en de response bekijken. Dit is heel handig om de API te testen. Je kunt Postman downloaden op de volgende website: [https://www.postman.com/downloads/](https://www.postman.com/downloads/)

!!! note "Niet bestaande URL"
    Als je een niet bestaande URL probeert te gebruiken, zal de API HTTP status 404 (Not Found) terugsturen, en een JSON object waarin staat dat de URL niet bestaat.

# Beveiliging

## API key

De API is beveiligd met een API key. Deze API key is te verkrijgen door een GET request te sturen naar de volgende URL `http://oege.ie.hva.nl:8080/api/createkey`. Om een key te creëren heb je het Oege wachtwoord nodig, en een al bestaande API key. Het wachtwoord is niet openbaar, en is alleen te verkrijgen via ons. De API verwacht postData waarin het wachtwoord en een key staan. Het postData ziet er als volgt uit:

```postData
key=APIKEY&password=PASSWORD
```

Als dit succesvol is, zal de API HTTP status 201 (Created) terugsturen, en een JSON object waarin staat dat de key succesvol is aangemaakt. Het JSON object ziet er als volgt uit:

```json
[
    {
        "message": "API key created", "key": "APIKEY" 
    }
]
```
Als de key en/of het wachtwoord niet overeenkomt, zal de API HTTP status 401 (Unauthorized) terugsturen, en een JSON object waarin staat dat je niet geautoriseerd bent.

## Rate limit

Naast een unieke API key, heeft de API ook een rate limit. Dit betekent dat je maar een bepaald aantal requests per seconde mag sturen. Als je meer requests stuurt dan het aantal dat is toegestaan, zal de API HTTP status 429 (Too Many Requests) terugsturen, en een JSON object waarin staat dat je te veel requests hebt gestuurd. Het aantal requests dat je mag sturen per seconde is tien. Als je meer dan 600 requests per minuut stuurt, zal de API HTTP status 429 (Too Many Requests) terugsturen, en een JSON object waarin staat dat je te veel requests hebt gestuurd. De rate limit is gebonden aan jouw API key, en is dus niet te omzeilen tenzij je nog een key aanvraagt.

De rate limit is laag genoeg dat de game er geen last van zal hebben. De game stuurt namelijk maar één request per keer. De game stuurt alleen een request als de gebruiker een nieuw record heeft gezet. Dit zal niet vaak gebeuren, en dus zal de game niet snel de rate limit bereiken. Het is puur en alleen ter beveiliging dat iemand niet zomaar de hele API kan flooden met requests.

Als je ge-rate-limited bent krijg je een JSON object terug met de volgende informatie:

```json
[
    {
        "message": "Too many requests"
    }
]
```

# HTTP status codes

De API zal HTTP status codes terugsturen. Deze status codes geven aan als de request succesvol is, of als er een error is opgetreden. De volgende HTTP status codes kunnen terug gestuurd worden:

!!! info "Status 200: OK"
    De request is succesvol uitgevoerd. De API zal de data terugsturen die je hebt opgevraagd.

!!! success "Status 201: Created"
    De request is succesvol uitgevoerd. De API heeft de data succesvol toegevoegd aan de database.

!!! success "Status 202: Accepted"
    De request is succesvol uitgevoerd. De API heeft de data succesvol verwijderd uit de database.

!!! warning "Status 401: Unauthorized"
    De request is niet succesvol uitgevoerd. De API heeft geen toegang tot de database. De API zal een JSON object terugsturen met de error.

!!! warning "Status 404: Not Found"
    De request is niet succesvol uitgevoerd. De URL die je hebt gebruikt bestaat niet.

!!! warning "Status 429: Too Many Requests"
    De request is niet succesvol uitgevoerd. De API heeft te veel requests ontvangen. De API zal een JSON object terugsturen met de error.

!!! danger "Status 500: Internal Server Error"
    De request is niet succesvol uitgevoerd. Er is een error opgetreden in de database. De API zal een JSON object terugsturen met de error.

# Alle API GET requests

## Verkrijg de data van alle gebruikers

Om de data van alle gebruikers te verkrijgen, stuur je een GET request naar de volgende URL: `http://oege.ie.hva.nl:8080/api/getalluserdata`. De API verwacht een API key in de postData. Het postData ziet er als volgt uit:

```postData
key=APIKEY
```

Als de API key geaccepteerd wordt, krijg je een JSON array terug met alle data van alle gebruikers. Dit ziet er als volgt uit:

```json
[
    {
        "name": "VOORBEELD",
        "time": "12:00:00",
        "date": "1970-01-01T23:00:00.000Z",
        "score": 100,
        "coins": 100
    },
    {
        "name": "VOORBEELD2",
        "time": "12:00:00",
        "date": "1970-01-01T23:00:00.000Z",
        "score": 100,
        "coins": 100
    }
]
```

!!! note "Errors"
    Als er een fout is opgetreden, zal de API HTTP status 500 (Internal Server Error) terugsturen, en een JSON object met de error.

## Verkrijg de data van een specifieke gebruiker

Om de data van een specifieke gebruiker te verkrijgen, stuur je een GET request naar de volgende URL: `http://oege.ie.hva.nl:8080/api/getuserdata`. De API verwacht postData met jouw API key, en de naam van de gebruiker van wie je de data wilt ontvangen, dat er als volgt uit ziet:

```postData
key=APIKEY&name=NAAM
```

De API zal een HTTP status 200 (OK) terugsturen, en een JSON object met alle data van de specifieke gebruiker. Het JSON object ziet er als volgt uit:

```json
[
    {
        "name": "VOORBEELD",
        "time": "12:00:00",
        "date": "1970-01-01T23:00:00.000Z",
        "score": 100,
        "coins": 100
    }
]
```

!!! note "Errors"
    Als er een fout is opgetreden, zal de API HTTP status 500 (Internal Server Error) terugsturen, en een JSON object met de error.

## Formatteer en voer een specifieke query uit op de database

# LUCA DIT IS JOUW SHIT

## Test de API

Om de API te testen, stuur je een GET request naar de volgende URL: '127.0.0.1:8080/api/test'. De API verwacht geen postData. De API zal HTTP status 200 (OK) terugsturen, en een JSON object met de status van de request. Het JSON object ziet er als volgt uit:

```json
[
    {
        "message": "API Success"
    }
]
```

!!! tip "Test de API"
    Het is verstandig om deze functie te gebruiken als je even snel wilt weten als de verbinding met de API wel werkt.

# Alle API POST requests

## Creeër data voor een gebruiker

Om data voor een gebruiker te creeëren, stuur je een POST request naar de volgende URL: `http://oege.ie.hva.nl/api/insert`. De API verwacht postData met jouw API key en alle gegevens die je wilt opsturen naar de database dat er als volgt uit ziet:

```postData
name=NAAM&score=100&coins=100&key=APIKEY
```

De API zal HTTP status 202 (Accepted) terugsturen, en een JSON object met de status van de request. Het JSON object ziet er als volgt uit:

```json
[
    {
        "message": "Data inserted"
    }
]
```

!!! note "Errors"
    Als er een fout is opgetreden, zal de API HTTP status 500 (Internal Server Error) terugsturen, en een JSON object met de error.

# Alle API DELETE requests

## Verwijder een gebruiker

Om een gebruiker te verwijderen, stuur je een DELETE request naar de volgende URL: `http://oege.ie.hva.nl/api/deleteuser`. De API verwacht postData met de gebruiker die jij wilt verwijderen, en jouw API key, dat er als volgt uit ziet:

```postData
name=VOORBEELD&key=APIKEY
```

De API zal HTTP status 202 (Accepted) terugsturen, en een JSON object met de status van de request. Het JSON object ziet er als volgt uit:

```json
[
    [
        {
            "message": "User data deleted for user: NAAM"
        }
    ]
]
```

!!! note "Errors"
    Als er een fout is opgetreden, zal de API HTTP status 500 (Internal Server Error) terugsturen, en een JSON object met de error.

!!! danger "Waarschuwing"
    Met deze actie zal alle data van de gebruiker verwijderd worden. Deze actie kan niet ongedaan gemaakt worden. Wees hier dus voorzichtig mee.