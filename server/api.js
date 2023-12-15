/*========================*\
|Global variables, settings|
\*========================*/


// Libraries
const express = require('express');
const api = express();
const mysql = require("mysql2/promise");
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
var crypto = require("crypto");

// Parse JSON and URL-encoded data
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({ extended: true }));
api.use(cors({
    origin: '*'
}));

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
const timeout = 0.1; // Timeout in seconds

/*========================*\
|        Functions         |
\*========================*/

// Log requests with formatting:
function consoleLog(request, description) {
    let date = new Date();
    console.log(`[${date.toLocaleDateString()} ${date.toLocaleTimeString()}]: Retrieved ${request} request for ${description}`);
}

// Check if the client is rate limited:
function isClientRateLimited(apiKey) {
    let rateLimits = JSON.parse(fs.readFileSync(`${__dirname}/rates.json`)); // Read and parse the rate limit file
    let rateLimitTime = rateLimits[apiKey]; // Get the time of the last request for this API key
    let currentTime = Date.now(); // Get the current time
    let timeDifference = currentTime - (rateLimitTime || 0); // Calculate the time difference
    let timeDifferenceSeconds = timeDifference / 1000; // Convert the time difference to seconds

    if (timeDifferenceSeconds < timeout) {
        return true;
    } else {
        // Update the rate limit file:
        rateLimits[apiKey] = currentTime; // Update the time of the last request for this API key
        fs.writeFileSync(`${__dirname}/rates.json`, JSON.stringify(rateLimits)); // Write the new rate limit file
        return false;
    }
}

/*========================*\
|        API Calls         |
\*========================*/

// Get user data of all users
api.get('/api/get/allusers', async (req, res) => {

    consoleLog("GET", "all user data"); // Log the request

    // Get the post data from the request:
    let postData = JSON.stringify(req.body);
    let parsedData = JSON.parse(postData);
    let key = parsedData.key;

    // Read the keys from the JSON file
    let rawKeys = fs.readFileSync(`${__dirname}/keys.json`);
    let keys = JSON.parse(rawKeys);

    // Check if the API key is correct:
    const validkeys = keys.key;
    if (!validkeys.includes(key)) {
        res.status(401); // HTTP Status 401: Unauthorized
        const data = [{ message: 'Unauthorized' }];
        res.json(data); // Send the response
        return;
    }

    // Check if the client is rate limited:
    if (isClientRateLimited(key)) {
        res.status(429); // HTTP Status 429: Too Many Requests
        const data = [{ message: 'Too many requests' }];
        res.json(data); // Send the response
        return;
    }

    // Continue with the request:
    try {
        const conn = await pool.getConnection(); // Get a connection from the pool
        let sql = `SELECT * FROM \`userdata\`;`; // SQL query
        result = await conn.query(sql); // Execute the query

        conn.release(); // Release the connection
        res.status(200); // HTTP Status 200: OK

    } catch (err) {
        res.status(500); // HTTP Status 500: Internal Server Error
        result = [{ message: 'Error' }, { error: err }];
    }
    res.json(result[0]); // Send the response, only send the data, not the metadata
    return;
});



// Get user data of a specific user
api.get('/api/get/user', async (req, res) => {

    // Check if the client is rate limited:
    if (isClientRateLimited()) {
        res.status(429); // HTTP Status 429: Too Many Requests
        const data = [{ message: 'Too many requests' }];
        res.json(data); // Send the response
        return;
    }

    // Get the data from the request:
    let postData = JSON.stringify(req.body);
    let parsedData = JSON.parse(postData);

    // Get the data from the parsed data:
    let name = parsedData.name;
    let key = parsedData.key;

    // Read the keys from the JSON file
    let rawKeys = fs.readFileSync(`${__dirname}/keys.json`);
    let keys = JSON.parse(rawKeys);

    consoleLog("GET", `user data for user: ${name}`); // Log the request

    // Check if the API key is correct:
    const validkeys = keys.key;
    if (!validkeys.includes(key)) {
        res.status(401); // HTTP Status 401: Unauthorized
        const data = [{ message: 'Unauthorized' }];
        res.json(data); // Send the response
        return;
    }

    // Continue with the request:
    try {
        const conn = await pool.getConnection(); // Get a connection from the pool
        let sql = `SELECT name, time, date, score, coins FROM \`userdata\` WHERE name = ?;`; // SQL query
        let inserts = [name]; // Using the ? to prevent SQL injection
        sql = mysql.format(sql, inserts); // Format the SQL query
        result = await conn.query(sql); // Execute the query

        conn.release(); // Release the connection
        res.status(200); // HTTP Status 200: OK
    } catch (err) {
        res.status(500); // HTTP Status 500: Internal Server Error
        result = [{ message: 'Error' }, { error: err }];
    }
    res.json(result[0]); // Send the response, only send the data, not the metadata
    return;
});



// Get the user with the highest score
api.get('/api/get/mostscore', async (req, res) => {

    // Check if the client is rate limited:
    if (isClientRateLimited()) {
        res.status(429); // HTTP Status 429: Too Many Requests
        const data = [{ message: 'Too many requests' }];
        res.json(data); // Send the response
        return;
    }

    consoleLog("GET", "the highest score"); // Log the request

    // Get the post data from the request:
    let postData = JSON.stringify(req.body);
    let parsedData = JSON.parse(postData);
    let key = parsedData.key;

    // Read the keys from the JSON file
    let rawKeys = fs.readFileSync(`${__dirname}/keys.json`);
    let keys = JSON.parse(rawKeys);

    // Check if the API key is correct:
    const validkeys = keys.key;
    if (!validkeys.includes(key)) {
        res.status(401); // HTTP Status 401: Unauthorized
        const data = [{ message: 'Unauthorized' }];
        res.json(data); // Send the response
        return;
    }

    // Continue with the request:
    try {
        const conn = await pool.getConnection(); // Get a connection from the pool
        let sql = `SELECT MAX(score) FROM \`userdata\`;`; // SQL query
        maxresult = await conn.query(sql); // Execute the query

        // Now get the name of the user with the highest score:
        let score = maxresult[0][0]['MAX(score)']; // Get the highest score
        let sql2 = `SELECT name FROM \`userdata\` WHERE score = ?;`; // SQL query
        let inserts = [score]; // Using the ? to prevent SQL injection
        sql2 = mysql.format(sql2, inserts); // Format the SQL query
        result = await conn.query(sql2); // Execute the query

        conn.release(); // Release the connection
        res.status(200); // HTTP Status 200: OK

        // Combine the results:
        resultJson = JSON.parse(JSON.stringify(result[0][0])); // Convert the result to JSON
        maxresultJson = JSON.parse(JSON.stringify(maxresult[0][0])); // Convert the result to JSON
        resultJson['MAX(score)'] = maxresultJson['MAX(score)']; // Add the score to the result
        result = resultJson; // Set the result to the combined result

        // Encapsulate the result in an array:
        result = [result];

    } catch (err) {
        res.status(500); // HTTP Status 500: Internal Server Error
        result = [{ message: 'Error' }, { error: err }];
    }
    res.json(result); // Send the response, only send the data, not the metadata
    return;
});



// Get the user with the most coins
api.get('/api/get/mostcoins', async (req, res) => {

    // Check if the client is rate limited:
    if (isClientRateLimited()) {
        res.status(429); // HTTP Status 429: Too Many Requests
        const data = [{ message: 'Too many requests' }];
        res.json(data); // Send the response
        return;
    }

    consoleLog("GET", "the most coins"); // Log the request

    // Get the post data from the request:
    let postData = JSON.stringify(req.body);
    let parsedData = JSON.parse(postData);
    let key = parsedData.key;

    // Read the keys from the JSON file
    let rawKeys = fs.readFileSync(`${__dirname}/keys.json`);
    let keys = JSON.parse(rawKeys);

    // Check if the API key is correct:
    const validkeys = keys.key;
    if (!validkeys.includes(key)) {
        res.status(401); // HTTP Status 401: Unauthorized
        const data = [{ message: 'Unauthorized' }];
        res.json(data); // Send the response
        return;
    }

    // Continue with the request:
    try {
        const conn = await pool.getConnection(); // Get a connection from the pool
        let sql = `SELECT MAX(coins) FROM \`userdata\`;`; // SQL query
        maxresult = await conn.query(sql); // Execute the query

        // Now get the name of the user with the most coins:
        let coins = maxresult[0][0]['MAX(coins)']; // Get the most coins
        let sql2 = `SELECT name FROM \`userdata\` WHERE coins = ?;`; // SQL query
        let inserts = [coins]; // Using the ? to prevent SQL injection
        sql2 = mysql.format(sql2, inserts); // Format the SQL query
        result = await conn.query(sql2); // Execute the query

        conn.release(); // Release the connection
        res.status(200); // HTTP Status 200: OK

        // Combine the results:
        resultJson = JSON.parse(JSON.stringify(result[0][0])); // Convert the result to JSON
        maxresultJson = JSON.parse(JSON.stringify(maxresult[0][0])); // Convert the result to JSON
        resultJson['MAX(coins)'] = maxresultJson['MAX(coins)']; // Add the coins to the result
        result = resultJson; // Set the result to the combined result

        // Encapsulate the result in an array:
        result = [result];

    } catch (err) {
        res.status(500); // HTTP Status 500: Internal Server Error
        result = [{ message: 'Error' }, { error: err }];
    }
    res.json(result); // Send the response, only send the data, not the metadata
    return;
});



// Get the top 10 users with the highest score
api.get('/api/get/leaderboard/score', async (req, res) => {

    // Check if the client is rate limited:
    if (isClientRateLimited()) {
        res.status(429); // HTTP Status 429: Too Many Requests
        const data = [{ message: 'Too many requests' }];
        res.json(data); // Send the response
        return;
    }

    consoleLog("GET", "leaderboard score"); // Log the request

    // Get the post data from the request:
    let postData = JSON.stringify(req.body);
    let parsedData = JSON.parse(postData);
    let key = parsedData.key;

    // Read the keys from the JSON file
    let rawKeys = fs.readFileSync(`${__dirname}/keys.json`);
    let keys = JSON.parse(rawKeys);

    // Check if the API key is correct:
    const validkeys = keys.key;
    if (!validkeys.includes(key)) {
        res.status(401); // HTTP Status 401: Unauthorized
        const data = [{ message: 'Unauthorized' }];
        res.json(data); // Send the response
        return;
    }

    // Continue with the request:
    try {
        const conn = await pool.getConnection(); // Get a connection from the pool
        let sql = `SELECT * FROM \`userdata\` ORDER BY \`userdata\`.\`score\` DESC LIMIT 10`; // SQL query
        result = await conn.query(sql); // Execute the query

        conn.release(); // Release the connection
        res.status(200); // HTTP Status 200: OK
    } catch (err) {
        res.status(500); // HTTP Status 500: Internal Server Error
        result = [{ message: 'Error' }, { error: err }];
    }
    res.json(result[0]); // Send the response, only send the data, not the metadata
    return;
});



// Get the top 10 users with the most coins
api.get('/api/get/leaderboard/coins', async (req, res) => {

    // Check if the client is rate limited:
    if (isClientRateLimited()) {
        res.status(429); // HTTP Status 429: Too Many Requests
        const data = [{ message: 'Too many requests' }];
        res.json(data); // Send the response
        return;
    }

    consoleLog("GET", "leaderboard coins"); // Log the request

    // Get the post data from the request:
    let postData = JSON.stringify(req.body);
    let parsedData = JSON.parse(postData);
    let key = parsedData.key;

    // Read the keys from the JSON file
    let rawKeys = fs.readFileSync(`${__dirname}/keys.json`);
    let keys = JSON.parse(rawKeys);

    // Check if the API key is correct:
    const validkeys = keys.key;
    if (!validkeys.includes(key)) {
        res.status(401); // HTTP Status 401: Unauthorized
        const data = [{ message: 'Unauthorized' }];
        res.json(data); // Send the response
        return;
    }

    // Continue with the request:
    try {
        const conn = await pool.getConnection(); // Get a connection from the pool
        let sql = `SELECT * FROM \`userdata\` ORDER BY \`userdata\`.\`coins\` DESC LIMIT 10`; // SQL query
        result = await conn.query(sql); // Execute the query

        conn.release(); // Release the connection
        res.status(200); // HTTP Status 200: OK
    } catch (err) {
        res.status(500); // HTTP Status 500: Internal Server Error
        result = [{ message: 'Error' }, { error: err }];
    }
    res.json(result[0]); // Send the response, only send the data, not the metadata
    return;
});



// Insert user data
api.post('/api/post/insert', async (req, res) => {

    // Check if the client is rate limited:
    if (isClientRateLimited()) {
        res.status(429); // HTTP Status 429: Too Many Requests
        const data = [{ message: 'Too many requests' }];
        res.json(data); // Send the response
        return;
    }

    // Get the data from the request:
    let postData = JSON.stringify(req.body);
    let parsedData = JSON.parse(postData);
    let data;

    // Get the data from the parsed data:
    let name = parsedData.name;
    let time = getTime();
    let date = getDateUS();
    let score = parsedData.score;
    let coins = parsedData.coins;
    let key = parsedData.key;

    consoleLog("POST", `inserting user data for: ${name}`); // Log the request

    // Read the keys from the JSON file
    let rawKeys = fs.readFileSync(`${__dirname}/keys.json`);
    let keys = JSON.parse(rawKeys);

    // Check if the API key is correct:
    const validkeys = keys.key;
    if (!validkeys.includes(key)) {
        res.status(401); // HTTP Status 401: Unauthorized
        data = [{ message: 'Unauthorized' }];
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
        result = await conn.query(sql); // Execute the query
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
api.delete('/api/delete/user', async (req, res) => {

    // Check if the client is rate limited:
    if (isClientRateLimited()) {
        res.status(429); // HTTP Status 429: Too Many Requests
        const data = [{ message: 'Too many requests' }];
        res.json(data); // Send the response
        return;
    }

    // Get the data from the request:
    let postData = JSON.stringify(req.body);
    let parsedData = JSON.parse(postData);

    // Get the data from the parsed data:
    let name = parsedData.name;
    let key = parsedData.key;

    consoleLog("DELETE", `deleting user data for: ${name}`); // Log the request

    // Read the keys from the JSON file
    let rawKeys = fs.readFileSync(`${__dirname}/keys.json`);
    let keys = JSON.parse(rawKeys);

    // Check if the API key is correct:
    const validkeys = keys.key;
    if (!validkeys.includes(key)) {
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
    return;
});



// Test the API
api.get('/api/test', (req, res) => {

    // Check if the client is rate limited:
    if (isClientRateLimited()) {
        res.status(429); // HTTP Status 429: Too Many Requests
        const data = [{ message: 'Too many requests' }];
        res.json(data); // Send the response
        return;
    }

    consoleLog("GET", "test"); // Log the request

    // Get the data from the request:
    let postData = JSON.stringify(req.body);
    let parsedData = JSON.parse(postData);
    let key = parsedData.key;

    // Read the keys from the JSON file
    let rawKeys = fs.readFileSync(`${__dirname}/keys.json`);
    let keys = JSON.parse(rawKeys);

    // Check if the API key is correct:
    const validkeys = keys.key;
    if (!validkeys.includes(key)) {
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
api.get('/api/createkey', (req, res) => {

    // Check if the client is rate limited:
    if (isClientRateLimited()) {
        res.status(429); // HTTP Status 429: Too Many Requests
        const data = [{ message: 'Too many requests' }];
        res.json(data); // Send the response
        return;
    }

    consoleLog("GET", "creating a new API key"); // Log the request

    // Get the data from the request:
    let postData = JSON.stringify(req.body);
    let parsedData = JSON.parse(postData);
    let password = parsedData.password;

    // Check if the password is correct:
    if (password != oegePassword) {
        res.status(401); // HTTP Status 401: Unauthorized
        const data = [{ message: 'Unauthorized' }];
        res.json(data); // Send the response
        return;
    }

    // Authorized, continue with the request:
    // Generate a new API key:
    let key = crypto.randomBytes(12).toString('hex');
    let rawKeys = fs.readFileSync(`${__dirname}/keys.json`);

    // Insert the new key in the JSON file:
    let keys = JSON.parse(rawKeys);
    keys.key.push(key);
    let newKeys = JSON.stringify(keys);
    fs.writeFileSync(`${__dirname}/keys.json`, newKeys);

    // Send the response:
    res.status(201); // HTTP Status 201: Created
    const data = [{ message: 'API key created', key: key }];
    res.json(data); // Send the response
    return;
});



// Delete an API key
api.delete('/api/deletekey', (req, res) => {

    // Check if the client is rate limited:
    if (isClientRateLimited()) {
        res.status(429); // HTTP Status 429: Too Many Requests
        const data = [{ message: 'Too many requests' }];
        res.json(data); // Send the response
        return;
    }

    consoleLog("DELETE", "removing an API key"); // Log the request

    // Get the data from the request:
    let postData = JSON.stringify(req.body);
    let parsedData = JSON.parse(postData);
    let password = parsedData.password;
    let key = parsedData.key;

    // Check if the password is correct:
    if (password != oegePassword) {
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
    return;
});



// Default (wrong URL(GET)) 
api.get('/*', (req, res) => {
    consoleLog("GET", "wrong URL"); // Log the request
    const data = [{ message: 'Wrong URL' }];
    res.status(404); // HTTP Status 404: Not Found
    res.json(data); // Send the response
});



// Default (wrong URL(POST))
api.post('/*', (req, res) => {
    consoleLog("POST", "wrong URL"); // Log the request
    const data = [{ message: 'Wrong URL' }];
    res.status(404); // HTTP Status 404: Not Found
    res.json(data); // Send the response
});



// Default (wrong URL(DELETE))
api.delete('/*', (req, res) => {
    consoleLog("DELETE", "wrong URL"); // Log the request
    const data = [{ message: 'Wrong URL' }];
    res.status(404); // HTTP Status 404: Not Found
    res.json(data); // Send the response
});



// Run the API on port 8080
api.listen(8080, () => {
    consoleLog("LISTEN", "running API on port 8080"); // Log the request
});  