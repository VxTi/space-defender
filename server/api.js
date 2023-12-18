/*========================*\
|Global variables, settings|
\*========================*/


// Libraries
const express = require('express');
const app = express();
const mysql = require("mysql2/promise");
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const crypto = require("crypto");

/*
 * Which port to host the server on.
 * Since we're using two servers, one for API calls and one for
 * generic web calls, we must host them on two separate ports.
 */
const port = 8081;

// Maximum amount of requests allowed per time-frame (window size is 1000ms / 1s)
const rateLimit = 10;

// Add rate limiting to every request made from Client to Server.
app.use(require('express-rate-limit')({
    windowMs: 1000, // Milliseconds per window. (1 second)
    max: rateLimit,
    message: '[{"message": "You have exceeded your API rate limit. Please slow down."}]'
}));

// Parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));

// how many results will be returned by the GET query from the database
const maxResults = 100;

// The types of tables that are available when users send a GET api request.
// If the request
const tables = ['name', 'coins', 'time', 'score', 'date'];

// Kinds of accepted request types in a POST request, for retrieving data
const RequestType = {
    ALL: "all-data", // Accepts all data from tables
    USER: "user-data" // Accepts data from one user
}

// Database connection:
const credentials = {
    user: 'koopenj',
    password: 'pSmwQExG/1rux.',
    host: 'oege.ie.hva.nl',
    port: 3306,
    database: 'zkoopenj',
    insecureAuth: false,
    ssl: { rejectUnauthorized: false }, // Necessary to connect to the database!!!
    connectionLimit: 10
};

const pool = mysql.createPool(credentials);
const oegePassword = credentials.password // Password for creating a new API key

/* - - - - - - - - - - - - *
 |        Functions        |
 * - - - - - - - - - - - - */

// Function for retrieving the right year-month-day format
getDateString = () => new Date().toLocaleDateString("fr-CA");

// Function for retrieving the right time format
getTimeString = () => new Date().toLocaleTimeString("nl-NL");

// Log requests with formatting:
consoleLog = (message, ... parameters) => console.log(`[${getDateString()} ${getTimeString()}]: ${message}`, parameters);

// Check if the given API key is valid:
isApiKeyInvalid = (apiKey) => {
    let fileData = fs.readFileSync(`${__dirname}/keys.json`); // Read the keys from the JSON file
    let json = JSON.parse(fileData); // Parse the keys
    const keys = json.key; // Get the valid keys
    return keys.includes(apiKey);
}


/* - - - - - - - - - - - - *
 |        API Calls        |
 * - - - - - - - - - - - - */

// Insert user data
app.post('/api/insert', async (req, res) => {

    // Get the data from the request:
    let postData = JSON.stringify(req.body);
    let parsedData = JSON.parse(postData);
    let data;

    // Get the data from the parsed data:
    let name = parsedData.name;
    let time =  getTimeString()
    let date = getDateString();
    let score = parsedData.score;
    let coins = parsedData.coins;
    let key = parsedData.key;

    consoleLog("POST", `inserting user data for: ${name}`); // Log the request

    // Check if the API key is correct:
    if (isApiKeyInvalid(key)) {
        res.status(401).json([{ message: 'Unauthorized' }]); // Send the response, Status 401: Unauthorized
        return;
    }

    // Check if the data is valid:
    if (name == null || score == null || coins == null) {
        res.status(400); // HTTP Status 400: Bad Request
        data = [{ message: 'Bad Request' }];
        res.json(data); // Send the response
        return;
    }

    // Continue with the request:
    try {
        // Make a connection to the database:
        const conn = await pool.getConnection(); // Get a connection from the pool
        let sql = `INSERT INTO userdata (name, time, date, score, coins) VALUES (?, ?, ?, ?, ?);`; // SQL query
        let inserts = [name, time, date, score, coins]; // Using the ? to prevent SQL injection
        sql = mysql.format(sql, inserts); // Format the SQL query
        await conn.query(sql); // Execute the query
        conn.release(); // Release the connection

        // Send a response:
        res.status(201); // HTTP Status 201: Created
        data = [{ message: 'Data inserted' }];
    } catch (err) {
        res.status(500); // HTTP Status 500: Internal Server Error
        data = [{ message: 'Error' }, { error: err }];
    }
    res.json(data); // Send the response
});



// Delete user data of a specific user
app.delete('/api/deleteuser', async (req, res) => {

    // Get the data from the request:
    let postData = JSON.stringify(req.body);
    let parsedData = JSON.parse(postData);

    // Get the data from the parsed data:
    let name = parsedData.name;
    let key = parsedData.key;

    consoleLog("DELETE", `deleting user data for: ${name}`); // Log the request

    // Check if the API key is correct:
    if (isApiKeyInvalid(key)) {
        res.status(401); // HTTP Status 401: Unauthorized
        const data = [{ message: 'Unauthorized' }];
        res.json(data); // Send the response
        return;
    }


    // Continue with the request:
    try {
        const conn = await pool.getConnection(); // Get a connection from the pool
        let sql = `DELETE FROM \`userdata\` WHERE name = ?;`; // SQL query
        let inserts = [name]; // Using the ? to prevent SQL injection
        sql = mysql.format(sql, inserts); // Format the SQL query
        await conn.query(sql); // Execute the query

        result = [{ message: `User data deleted for user: ${name}` }]
        conn.release(); // Release the connection
        res.status(202); // // HTTP Status 202: Accepted
    } catch (err) {
        res.status(500); // HTTP Status 500: Internal Server Error
        result = [{ message: 'Error' }, { error: err }];
    }
    res.json(result); // Send the response
});



// Test the API
app.get('/api/test', (req, res) => {

    consoleLog("GET", "test"); // Log the request

    // Get the data from the request:
    let postData = JSON.stringify(req.body);
    let parsedData = JSON.parse(postData);
    let key = parsedData.key;

    // Check if the API key is correct:
    if (isApiKeyInvalid(key)) {
        res.status(401); // HTTP Status 401: Unauthorized
        const data = [{ message: 'Unauthorized' }];
        res.json(data); // Send the response
        return;
    }

    // Authorized, continue with the request:
    const data = [{ message: 'API Success' }];
    res.status(200); // HTTP Status 200: OK
    res.json(data); // Send the response
});



// Create a new API key
app.get('/api/createkey', (req, res) => {

    consoleLog("Creating a new API key", "GET"); // Log the request

    // Get the data from the request:
    let postData = JSON.stringify(req.body);
    let parsedData = JSON.parse(postData);
    let key = parsedData.key;
    let password = parsedData.password;

    // Check if the API key is correct:
    if (isApiKeyInvalid(key)) {
        res.status(401); // HTTP Status 401: Unauthorized
        const data = [{ message: 'Unauthorized' }];
        res.json(data); // Send the response
        return;
    }

    // Check if the password is correct:
    if (password != oegePassword) {
        res.status(401); // HTTP Status 401: Unauthorized
        const data = [{ message: 'Unauthorized' }];
        res.json(data); // Send the response
        return;
    }


    // Authorized, continue with the request:
    // Generate a new API key:
    let newKey = crypto.randomBytes(12).toString('hex'); // Generate a new API key
    let rawKeys = fs.readFileSync(`${__dirname}/keys.json`); // Read the keys from the JSON file

    // Insert the new key in the JSON file:
    let keys = JSON.parse(rawKeys); // Parse the keys
    keys.key.push(newKey); // Add the new key to the list of keys
    let newKeys = JSON.stringify(keys); // Stringify the new keys
    fs.writeFileSync(`${__dirname}/keys.json`, newKeys); // Write the new keys to the JSON file

    // Send the response:
    res.status(201); // HTTP Status 201: Created
    const data = [{ message: 'API key created', key: key }];
    res.json(data); // Send the response
});



// Delete an API key
app.delete('/api/deletekey', (req, res) => {

    consoleLog("DELETE", "removing an API key"); // Log the request

    // Get the data from the request:
    let postData = JSON.stringify(req.body);
    let parsedData = JSON.parse(postData);
    let password = parsedData.password;
    let key = parsedData.key;

    // Check if the password and API key are correct:
    if ((password != oegePassword) && (!validkeys.includes(key))) {
        res.status(401); // HTTP Status 401: Unauthorized
        const data = [{ message: 'Unauthorized' }];
        res.json(data); // Send the response
        return;
    }

    // Authorized, continue with the request:
    // Delete the API key:
    let rawKeys = fs.readFileSync(`${__dirname}/keys.json`);
    let keys = JSON.parse(rawKeys);
    let index = keys.key.indexOf(key);
    if (index > -1) {
        keys.key.splice(index, 1);
    }
    let newKeys = JSON.stringify(keys);
    fs.writeFileSync(`${__dirname}/keys.json`, newKeys);

    // Send the response:
    res.status(202); // HTTP Status 202: Accepted
    const data = [{ message: 'API key deleted' }];
    res.json(data); // Send the response
});


// Default (wrong URL(GET))



/**
 *  Get request, for users to request specific kinds of data
 *  One can provide a body containing request parameters, such as how many objects one wants to retrieve
 *  A JSON request body will look like the following, when requesting all kind of data:
 *  {
 *      "requestType": "all-data",              What kind of data the user wants to retrieve
 *      "apiKey": "key",                        What
 *      "results": 100,                         How many results will be returned
 *      "orderBy": "coins",                     Which table to filter by
 *      "tables": ["name", "coins", "score"],   Which table to select, can also be '*' to be any
 *  }
 * If the user wants to retrieve user-specific data, one must send a request like the following:
 *  {
 *      "requestType": "user-data",
 *      "apiKey": "key",
 *      "user": "name"
 *  }
 */
app.post('/api/get', (req, res) => {

    // Check whether the JSON body has a 'method' parameter. If it doesn't, we'll return an error.
    // Every
    if (!req.body.hasOwnProperty('requestType')) {
        res.status(400).json("{\"error\": \"Faulty request. Add 'requestType' parameter to JSON body.\"}");
        return;
    }
    let sqlQuery = null;

    if (req.body.requestType === RequestType.ALL) {

        let resultCount = maxResults;
        let ordered = null;

        // If the body contains a 'results' parameter of type 'number', the server
        // will return that many results from the database.
        if (typeof req.body.results === 'number')
            resultCount = req.body.results;

        // If the provided JSON body contains an 'orderBy' tag of type 'string', and the string
        // is a valid table, as defined above, it will order the query by that table.
        // We have to check whether tables include the tag, otherwise it'll be vulnerable for injection...
        if (typeof req.body.orderBy === 'string' && tables.includes(req.body.orderBy))
            ordered = req.body.orderBy;

        // Table selector for final query
        let tableQuery = null;

        // Check if the provided 'tables' object is of type Array
        if (Array.isArray(req.body.tables)) {
            // Check whether the content of 'req.body.tables' contains acceptable tables
            let filtered = req.body.tables.filter((key) => tables.includes(key));
            if (filtered.length > 0)
                tableQuery = filtered.toString();

            // If the provided 'tables' object contains '*', we want to select all tables, so add it to the query.
        } else if (req.body.tables === "*")
            tableQuery = "*";

        // Check whether we've received a valid tables
        if (tableQuery != null) {

            // SQL query for looking up things from the database.
            // When the user provides tables to look up, it will return the table
            // If the user provides a limit, it will add "LIMIT x" to the query
            // If the user provides 'orderBy' tag, and then provides an appropriate table, it will sort by that table
            // Type checking is done before inserting them into the SQL query, to prevent injection threats
            sqlQuery =
                `SELECT ${tableQuery} FROM userdata${ordered != null ? ` ORDER BY ${ordered} DESC` : ""} ${resultCount < 0 ? "" : `LIMIT ${resultCount}`}`;
        } else {
            // Send a status code 'Unprocessable Entity' with associated error message
            res.status(422).json([{error: "Provided incorrect table format. Use either '[\"table1\", \"table2\", ...\"]' or '\"*\"'."}])
        }
        // Check for type user-data
    } else if (req.body.requestType === RequestType.USER) {
        if (!req.body.hasOwnProperty('user')) {
            res.status(402).json([{error: `User must provide parameter 'user' with request-type '${RequestType.USER}'`}]);
            return;
        }
        // Select the requested data from the provided user.
        sqlQuery = mysql.format('SELECT * FROM userdata WHERE name=? LIMIT 1', req.body.user);
    }
    // Check if we've processed a valid query
    if (sqlQuery != null) {

        // If so, process the query
        (async () => {
            // Open connection and make the produced query
            let connection = await pool.getConnection();
            await connection.query(sqlQuery)
                .then(result => res.status(200).json(result[0]))
                .catch((e) => res.status(400).json([{error: e}]))
            connection.release();
        })();
        return;
    }

    // Default response when user provides incorrect method type
    res.status(400).json([{error: `Provided invalid JSON content.`}]);
});


app.get('/*', (req, res) => {
    consoleLog("GET", "wrong URL"); // Log the request
    res.status(404).json([{ message: 'Wrong URL' }]); // Send status 404 with appropriate JSON-body
});



// Default (wrong URL(POST))
app.post('/*', (req, res) => {
    consoleLog("POST", "wrong URL"); // Log the request
    res.status(404).json([{ message: 'Wrong URL' }]); // Send status 404 with appropriate JSON-body
});



// Default (wrong URL(DELETE))
app.delete('/*', (req, res) => {
    consoleLog("DELETE", "wrong URL"); // Log the request
    res.status(404).json([{ message: 'Wrong URL' }]); // Send status 404 with appropriate JSON-body
});



// Run the API on port 8081
app.listen(port, () => {
    consoleLog(`API Server started on port ${port}`); // Log the request
});  