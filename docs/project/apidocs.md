# Hoe gebruik je de API?

De API dient als tussenlaag tussen de game en de database. De game stuurt een request naar de API, en de API stuurt een request naar de database. De API stuurt de response van de database terug naar de game. De game kan dus niet direct communiceren met de database, maar moet altijd via de API. Dit is gedaan omdat het niet veilig is om de database direct te laten communiceren met de game. De code van de game kan namelijk door iedereen worden bekeken, en als de game direct communiceert met de database, kan iedereen dus ook de database zien. Dit is niet veilig, en daarom is de API ertussen gezet. De game communiceert met de API, en de API communiceert met de database. De code van de API is niet openbaar, en dus kan niemand de database zien.

### Gebruikswijze
De API is te gebruiken door een request te maken naar het adres: `http://oege.ie.hva.nl:8081/api`. Voor een lijst met URLs moet je een stukje verder lezen.

### Probeer de API
Wij hebben tijdens het ontwikkelen van de API het programma Postman gebruikt. Hierin kun je heel gemakkelijk requests sturen naar de API, en de response bekijken. Dit is heel handig om de API te testen. Je kunt Postman downloaden op de volgende website: [https://www.postman.com/downloads/](https://www.postman.com/downloads/)

### Niet bestaande URL
Als je een niet bestaande URL probeert te gebruiken, zal de API HTTP status 404 (Not Found) terugsturen, en een JSON-object waarin staat dat de URL niet bestaat.

# Beveiliging

## Beveiliging d.m.v. een API key

De API is beveiligd met een API key. Deze API key is te verkrijgen door een request naar de API te sturen, de specifieke request kun je in de documentatie vinden onder het kopje 'Alle API URLs'. Om deze aan te maken heb je het Oege wachtwoord nodig van de admin. De API key is een unieke string die je moet meesturen in elke request die je naar de API stuurt.

!!! failure "API key"
        Als je geen API key meestuurt, of een verkeerde API key, zal de API HTTP status 401 (Unauthorized) terugsturen, en een JSON-object waarin staat dat je niet geautoriseerd bent.

## Beveiliging d.m.v. een rate limit

Naast een unieke API key, heeft de API ook een rate limit. Dit betekent dat je maar een bepaald aantal requests per seconde mag sturen. Als je meer requests stuurt dan het aantal dat is toegestaan, zal de API HTTP status 429 (Too Many Requests) terugsturen, en een JSON-object waarin staat dat je te veel requests hebt gestuurd. 
Het aantal requests dat je mag sturen per seconde is momenteel tien. 
Als je meer dan 600 requests per minuut stuurt, zal de API HTTP status 429 (Too Many Requests) terugsturen, en een JSON-object waarin staat dat je te veel requests hebt gestuurd.

!!! warning "Rate limit"
    De rate limit is gebonden aan jouw IP adres. Als je dus met meerdere mensen op hetzelfde netwerk zit, en je stuurt allemaal requests naar de API, dan kan het zijn dat je rate limited wordt.

De rate limit is laag genoeg dat de game er geen last van zal hebben. De game stuurt namelijk maar één request per keer. De game stuurt alleen een request als de gebruiker een nieuw record heeft gezet. Dit zal niet vaak gebeuren, en dus zal de game niet snel de rate limit bereiken. Het is puur en alleen ter beveiliging dat iemand niet zomaar de hele API kan flooden met requests.

Als je ge-rate-limited bent krijg je een JSON-object terug waarin staat dat je te veel requests stuurt.

## Beveiliging tegen SQL injection

De API is beveiligd tegen SQL injection. Dit betekent dat je geen SQL code kunt uitvoeren door middel van de API. Dit is gedaan door middel van prepared statements. Dit betekent dat de SQL code die wordt uitgevoerd, niet wordt uitgevoerd met de data die je meestuurt in de request. De data wordt eerst gecontroleerd, en daarna pas wordt de SQL code uitgevoerd. Hierdoor is het niet mogelijk om SQL code uit te voeren door middel van de API.

!!! failure "SQL injection"
    Doormiddel van prepared statements is het niet mogelijk om SQL code uit te voeren door middel van de API. SQL commando's die je meestuurt in de request zullen niet worden uitgevoerd, omdat deze eerst worden gecontroleerd.

# Alle API URLs

Hieronder staan alle URLs die je kunt gebruiken om data op te vragen of te wijzigen in de database. Alle requests moet je sturen als POST request, omdat je in een POST request veel meer data kan stoppen dan in een GET request. Daarnaast is het ook veiliger om een POST request te sturen, omdat je dan de data in de body van de request kan stoppen, en niet in de URL. Alle API calls zijn als volgt:

!!! note "Creëer een API key"
    ## Creëer een API key

    Deze URL is bedoeld om een API key te creëren. Je moet een JSON-object sturen met het wachtwoord. De API zal een JSON-object terugsturen met de status van de request. De URL is als volgt: `http://oege.ie.hva.nl:8081/api/createkey`. De API verwacht de volgende header: `Content-Type: application/json` en de volgende data als JSON object:

    ```json
    {
        "password": "WACHTWOORD"
    }
    ```
    Als de key en/of het wachtwoord niet overeenkomt, zal de API HTTP status 401 (Unauthorized) terugsturen, en een JSON-object waarin staat dat je niet geautoriseerd bent.
    Als je wel de juiste data stuurt, zal de API HTTP status 201 (Created) terugsturen, en een JSON-object waarin staat dat de key succesvol is aangemaakt. Deze ziet er als volgt uit:

    ```json
    {
        "message": "New API key created",
        "key": "NIEUWE APIKEY"
    }
    ```

!!! note "Verwijder een API key"
    ## Verwijder een API key

    Deze URL is bedoeld om een API key te verwijderen. Je moet een JSON-object sturen met de key en het wachtwoord. De API zal een JSON-object terugsturen met de status van de request. De URL is als volgt: `http://oege.ie.hva.nl:8081/api/deletekey`. De API verwacht de volgende header: `Content-Type: application/json` en de volgende data als JSON object:

    ```json
    {
        "key": "APIKEY"
    }
    ```

    Als de key niet overeenkomt, zal de API HTTP status 401 (Unauthorized) terugsturen, en een JSON-object waarin staat dat je niet geautoriseerd bent.
    Als de key wel overeenkomt, zal de API HTTP status 202 (Accepted) terugsturen, en een JSON-object waarin staat dat de ingevulde key succesvol is verwijderd. Deze ziet er als volgt uit:

    ```json
    {
        "message": "API key deleted"
    }
    ```

!!! note "Pas de laatste score van een gebruiker aan"
    ## Pas de laatste score van een gebruiker aan

    Deze URL is bedoeld om de score van een gebruiker te updaten naar de meegeleverde waarde. Je moet een JSON-object sturen met de key, de userId van wie je de score gaat aanpassen, de nieuwe score en de nieuwe coins. De API zal een JSON-object terugsturen met de status van de request. De URL is als volgt: `http://oege.ie.hva.nl:8081/api/updatescore`. De API verwacht de volgende header: `Content-Type: application/json` en de volgende data als JSON object:

    ```json
    {
        "key": "APIKEY",
        "userId": "USERID",
        "score": "SCORE",
        "wave": "WAVE"
    }
    ```

    Als de key niet overeenkomt, zal de API HTTP status 401 (Unauthorized) terugsturen, en een JSON-object waarin staat dat je niet geautoriseerd bent.
    Als de key wel overeenkomt, zal de API HTTP status 201 (Created) terugsturen, en een JSON-object waarin staat dat de ingevulde key succesvol is verwijderd. Deze ziet er als volgt uit:

    ```json
    {
        "message": "Last score updated"
    }
    ```

    Daarnaast zal de backend server na het updaten van de laatste score meteen checken als deze hoger is dan de highscore van de gegeven speler. Als deze nieuwe score hoger is dan de vorige score zal deze automatisch aangepast worden in de database.

!!! note "Creëer een nieuwe gebruiker"
    ## Creëer een nieuwe gebruiker

    Deze URL is bedoeld om een nieuwe gebruiker aan te maken in de database. Je moet een JSON-object sturen met de key, de naam en het emailadres van de nieuwe gebruiker. De API zal een JSON-object terugsturen met de status van de request. De URL is als volgt: `http://oege.ie.hva.nl:8081/api/createuser`. De API verwacht de volgende header: `Content-Type: application/json` en de volgende data als JSON object:
    
    ```json
    {
        "key": "APIKEY",
        "name": "NAAM",
        "email": "EMAIL"
    }
    ```

    Als de key niet overeenkomt, zal de API HTTP status 401 (Unauthorized) terugsturen, en een JSON-object waarin staat dat je niet geautoriseerd bent.
    Als de key wel overeenkomt, zal de API HTTP status 201 (Created) terugsturen, en een JSON-object waarin staat dat de ingevulde key succesvol is verwijderd. Deze ziet er als volgt uit:

    ```json
    {
        "message": "New user created",
        "userId": "USERID"
    }
    ```
    Als de gebruiker al bestaat, zal de API HTTP status 400 (Bad request) terugsturen, en een JSON-object waarin staat dat de gebruiker al bestaat. Deze ziet er als volgt uit:

    ```json
    {
        "message": "User already exists"
    }
    ```

!!! note "Verkrijg alle data van een gebruiker"
    ##  Verkrijg alle data van een gebruiker
    
    Om snel en gemakkelijk alle data van een gebruiker te verkrijgen dient de API gebruiker
    simpelweg een verzoek te sturen naar `http://oege.ie.hva.nl:8081/api/getuser` met de
    een header 'Content-Type: application/json' en een JSON object met de key en de userId.
    Dit object ziet er als volgend uit:
    ```json
    {
        "key": "APIKEY",
        "userId": "USERID",  - of -  "name": "NAAM",
    }
    ```
    De gebruiker kan zowel 'name' als 'userId' gebruiken om de gebruiker te identificeren.
    Als de gebruiker niet bestaat zal de API HTTP status 400 (Bad request) terugsturen, en een JSON-object waarin staat dat de gebruiker niet bestaat. Deze ziet er als volgt uit:
    ```json
    {
        "message": "User does not exist"
    }
    ```
    Indien de gebruiker wel bestaat zal de API HTTP status 200 (OK) terugsturen, en een JSON-object waarin staat dat de gebruiker succesvol is opgehaald. Deze ziet er als volgt uit:
    ```json
    {
        "message": "User retrieved",
        "user": {
            "userId": "USERID",
            "userName": "NAAM",
            "lastScore": "LAATSTE SCORE",
            "lastCoins": "LAATSTE COINS",
            "maxScore": "HIGHSCORE",
            "maxCoins": "HIGHCOINS"
        }
    }
    ```

!!! note "Verwijder een gebruiker"
    ## Verwijder een gebruiker

    Deze URL is bedoeld om een bestaande gebruiker te verwijderen. Je moet een JSON-object sturen met de userId van de gebruiker die je wilt verwijderen, en jouw API key. De API zal een JSON-object terugsturen met de statys van de request. De URL is als volgt: `http://oege.ie.hva.nl:8081/api/deleteuser`. De API verwacht de volgende header: `Content-Type: application/json` en de volgende data als JSON object:
    
    ```json
    {
        "key": "APIKEY",
        "userId": "USERID"
    }
    ```

    Als de key niet overeenkomt, zal de API HTTP status 401 (Unauthorized) terugsturen, en een JSON-object waarin staat dat je niet geautoriseerd bent.
    Als de key wel overeenkomt, zal de API HTTP status 202 (Accepted) terugsturen, en een JSON-object waarin staat dat de ingevulde key succesvol is verwijderd. Deze ziet er als volgt uit:

    ```json
    {
        "message": "User deleted"
    }
    ```

!!! note "Check als een gebruiker bestaat"
    ## Check als een gebruiker bestaat

    Deze URL is bedoeld om te checken als een gebruiker al bestaat in de database. Je moet een JSON-object sturen met de key en een naam of userId. De API zal een JSON-object terugsturen met de status van de request. De URL is als volgt: `http://oege.ie.hva.nl:8081/api/deletekey`. De API verwacht de volgende header: `Content-Type: application/json` en de volgende data als JSON object:
    
    ```json
    {
        "key": "APIKEY",
        "idOrName": "USERID of NAAM"
    }
    ```

    Als de key niet overeenkomt, zal de API HTTP status 401 (Unauthorized) terugsturen, en een JSON-object waarin staat dat je niet geautoriseerd bent.
    Als de key wel overeenkomt, zal de API HTTP status 200 (OK) terugsturen, en een JSON-object waarin staat dat de ingevulde key succesvol is verwijderd. Deze ziet er als volgt uit:

    ```json
    {
        "message": "User exists",
        "exists": true || false
    }
    ```

!!! note "Krijg de laatste score van een gebruiker"
    ## Krijg de laatste score van een gebruiker

    Deze URL is bedoeld om de laatste score van een gebruiker op te vragen. Je moet een JSON-object sturen met de key en de userId van wie je de laatste score wilt krijgen. De API zal een JSON-object terugsturen met de status van de request. De URL is als volgt: `http://oege.ie.hva.nl:8081/api/getlastscore`. De API verwacht de volgende header: `Content-Type: application/json` en de volgende data als JSON object:
    
    ```json
    {
        "key": "APIKEY",
        "userId": "USERID"
    }
    ```

    Als de key niet overeenkomt, zal de API HTTP status 401 (Unauthorized) terugsturen, en een JSON-object waarin staat dat je niet geautoriseerd bent.
    Als de key wel overeenkomt, zal de API HTTP status 200 (OK) terugsturen, en een JSON-object waarin staat dat de ingevulde key succesvol is verwijderd. Deze ziet er als volgt uit:

    ```json
    {
        "message": "Last score retrieved",
        "lastScore": {
            "userId": "USERID",
            "userName": "NAAM",
            "lastScore": "LAATSTE SCORE",
            "lastWave": "LAATSTE WAVE"
        } 
    }
    ```

    Als de gebruiker niet bestaat zal de geneste JSON `lastScore` leeg zijn.

!!! note "Krijg de hoogste score van een gebruiker"
    ## Krijg de hoogste score van een gebruiker

    Deze URL is bedoeld om de highscore van een gebruiker op te vragen. Je moet een JSON-object sturen met de key en de userId van wie je de highscore wilt krijgen. De API zal een JSON-object terugsturen met de status van de request. De URL is als volgt: `http://oege.ie.hva.nl:8081/api/gethighscore`. De API verwacht de volgende header: `Content-Type: application/json` en de volgende data als JSON object:
    
    ```json
    {
        "key": "APIKEY",
        "userId": "USERID"
    }
    ```

    Als de key niet overeenkomt, zal de API HTTP status 401 (Unauthorized) terugsturen, en een JSON-object waarin staat dat je niet geautoriseerd bent.
    Als de key wel overeenkomt, zal de API HTTP status 200 (OK) terugsturen, en een JSON-object waarin staat dat de ingevulde key succesvol is verwijderd. Deze ziet er als volgt uit:

    ```json
    {
        "message": "High score retrieved",
        "highScore": {
            "userId": "USERID",
            "userName": "NAAM",
            "maxScore": "HIGHSCORE",
            "maxWave": "HOOGSTE WAVE"
        } 
    }
    ```

    Als de gebruiker niet bestaat zal de geneste JSON `highScore` leeg zijn.

!!! note "Verkrijg de leaderboards"
    ## Verkrijg de leaderboards aan de hand van een sortBy en een maxResults
    Deze URL is bedoeld om de leaderboards op te vragen. Je moet een JSON-object sturen met de key, het gene waar je op wilt sorteren, en  het maximaal aantal resultaten. De API zal een JSON-object terugsturen met de status van de request. De URL is als volgt: `http://oege.ie.hva.nl:8081/api/getleaderboards`. De API verwacht de volgende header: `Content-Type: application/json` en de volgende data als JSON object:
    
    ```json
    {
        "key": "APIKEY",
        "sortBy": "maxScore || maxWave",
        "maxResults": "AANTAL"
    }
    ```

    Als de key niet overeenkomt, zal de API HTTP status 401 (Unauthorized) terugsturen, en een JSON-object waarin staat dat je niet geautoriseerd bent.
    Als de key wel overeenkomt, zal de API HTTP status 200 (OK) terugsturen, en een JSON-object waarin staat dat de ingevulde key succesvol is verwijderd. Deze ziet er als volgt uit:

    ```json
    {
        "message": "Leaderboards retrieved",
        "leaderboards": [
            {
                "userId": "USERID",
                "userName": "NAAM",
                "maxScore": "HIGHSCORE",
                "maxWave": "MAX WAVE"
            },
            {
                "userId": "USERID",
                "userName": "NAAM",
                "maxScore": "HIGHSCORE",
                "maxWave": "MAX WAVE"
            },
            ...
        ]
    }
    ```

    Als er geen gebruikers zijn zal de geneste JSON `leaderboards` leeg zijn.