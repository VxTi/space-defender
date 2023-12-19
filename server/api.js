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
const { error } = require('console');
const { compileFunction } = require('vm');
const { get } = require('http');

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
    windowMs: 1000, // Milliseconds per window. (1 per second)
    max: rateLimit, // Maximum amount of requests allowed per window.
    message: '[{"message": "You have exceeded your API rate limit. Please slow down."}]'
}));

// Parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));

// SQL data types for the columns above.
const tables = ["highScores", "lastScores", "lastPlayed", "userNames"]; 

// Database connection:
const credentials = {
    user: 'koopenj',
    password: 'pSmwQExG/1rux.',
    host: '127.0.0.1',
    port: 3306,
    database: 'zkoopenj',
    insecureAuth: true,
    ssl: { rejectUnauthorized: false }, // Necessary to connect to the database!!!
    connectionLimit: 10
};

const pool = mysql.createPool(credentials);
const oegePassword = credentials.password // Password for creating a new API key

/* - - - - - - - - - - - - *
 |        Functions        |
 * - - - - - - - - - - - - */

// Function for retrieving the right year-month-day format for the database
getDateString = () => new Date().toLocaleDateString("fr-CA");

// Function for retrieving the right time format
getTimeString = () => new Date().toLocaleTimeString("nl-NL");

// Function for retrieving the right date format for locale
getDateStringNL = () => new Date().toLocaleDateString("nl-NL");

// Log requests with formatting:
consoleLog = (message, parameters) => {
    if (parameters == null) {console.log(`[${getTimeString()}, ${getDateStringNL()}]: ${message}`);}
    else {console.log(`[${getTimeString()}, ${getDateStringNL()}]: ${message}`, parameters);}
}

// Check if the given API key is valid:
isApiKeyInvalid = (apiKey) => {
    let fileData = fs.readFileSync(`${__dirname}/keys.json`); // Read the keys from the JSON file
    let keys = JSON.parse(fileData); // Parse the keys
    let validkeys = keys.key; // Get the keys from the JSON file
    return !validkeys.includes(apiKey); // Check if the API key is valid
}

createTables = async () => {
    // Create a connection to the database:
    const conn = await pool.getConnection(); // Get a connection from the pool

    // Create the columns if they don't exist:
        let sql1 = `CREATE TABLE IF NOT EXISTS highScores (userId int, maxScore int, maxCoins int);`;
        let sql2 = `CREATE TABLE IF NOT EXISTS lastScores (userId int, lastScore int, lastCoins int);`;
        let sql3 = `CREATE TABLE IF NOT EXISTS lastPlayed (userId int, time time, date date);`;
        let sql4 = `CREATE TABLE IF NOT EXISTS userData (userId int, name varchar(255), email varchar(255));`;
        result1 = await conn.query(sql1)
            .catch((err) => consoleLog("Error creating table1", err)); // Execute the query
        result2 = await conn.query(sql2)
            .catch((err) => consoleLog("Error creating table2", err)); // Execute the query
        result3 = await conn.query(sql3)
            .catch((err) => consoleLog("Error creating table3", err)); // Execute the query
        result4 = await conn.query(sql4)
            .catch((err) => consoleLog("Error creating table4", err)); // Execute the query
        conn.release(); // Release the connection
        return `{result1: ${result1}, result2: ${result2}, result3: ${result3}}`; 
}

compareLastScores = async (userId) => {
    try {
        // Create a connection to the database:
        const conn = await pool.getConnection(); // Get a connection from the pool

        // Get the last score and coins from the database:
        let sql1 = `SELECT * FROM lastScores WHERE userId = ?;`; // SQL query
        let inserts1 = [userId]; // Using the ? to prevent SQL injection
        sql1 = mysql.format(sql1, inserts1); // Format the SQL query

        let result1 = await conn.query(sql1); // Execute the query

        let sql2 = `SELECT * FROM highScores WHERE userId = ?;`; // SQL query
        let inserts2 = [userId]; // Using the ? to prevent SQL injection
        sql2 = mysql.format(sql2, inserts2); // Format the SQL query

        let result2 = await conn.query(sql2); // Execute the query

        conn.release(); // Release the connection
        lastScore = result1[0][0].lastScore;
        lastCoins = result1[0][0].lastCoins;

        highScore = result2[0][0].maxScore;
        highCoins = result2[0][0].maxCoins;

        // Compare the last score and coins with the high score and coins:
        if (lastScore > highScore) {
            // Update the high score if the last score is higher:
            let sql3 = `UPDATE highScores SET maxScore = ? WHERE userId = ?;`; // SQL query
            let inserts3 = [lastScore, userId]; // Using the ? to prevent SQL injection
            sql3 = mysql.format(sql3, inserts3); // Format the SQL query
            await conn.query(sql3); // Execute the query
        }
        
        if (lastCoins > highCoins) {
            // Update the high coins if the last coins is higher:
            let sql4 = `UPDATE highScores SET maxCoins = ? WHERE userId = ?;`; // SQL query
            let inserts4 = [lastCoins, userId]; // Using the ? to prevent SQL injection
            sql4 = mysql.format(sql4, inserts4); // Format the SQL query
            await conn.query(sql4); // Execute the query
        }
    } catch (err) {
        return err;
    }
}

updateLastScore = async (userId, score, coins) => {
    try {
        // Create a connection to the database:
        const conn = await pool.getConnection(); // Get a connection from the pool

        // Update the last score and coins in the database:
        let sql = `UPDATE lastScores SET lastScore = ?, lastCoins = ? WHERE userId = ?;`; // SQL query
        let inserts = [score, coins, userId]; // Using the ? to prevent SQL injection
        sql = mysql.format(sql, inserts); // Format the SQL query
        await conn.query(sql); // Execute the query

        conn.release(); // Release the connection

        consoleLog(`Updated last score for userId ${userId}`); // Log the request
    } catch (err) {
        consoleLog("Error updating last score", err);
    }
}

updateLastPlayed = async (userId) => {
    try {
        // Create a connection to the database:
        const conn = await pool.getConnection(); // Get a connection from the pool

        // Update the last played in the database:
        let sql = `UPDATE lastPlayed SET time = ?, date = ? WHERE userId = ?;`; // SQL query
        let inserts = [getTimeString(), getDateString(), userId]; // Using the ? to prevent SQL injection
        sql = mysql.format(sql, inserts); // Format the SQL query
        await conn.query(sql); // Execute the query

        conn.release(); // Release the connection

        consoleLog(`Updated last played for userId ${userId}`); // Log the request
    } catch (err) {
        consoleLog("Error updating last played", err);
    }
}

checkIfUserIdExists = async (userId) => {
    try {
        // Create a connection to the database:
        const conn = await pool.getConnection(); // Get a connection from the pool

        // Check if the user exists in the database:
        let sql = `SELECT * FROM lastScores WHERE userId = ?;`; // SQL query
        let inserts = [userId]; // Using the ? to prevent SQL injection
        sql = mysql.format(sql, inserts); // Format the SQL query

        result = await conn.query(sql); // Execute the query

        conn.release(); // Release the connection

        if (result[0].length == 0) {
            return false;
        } else {
            return true;
        }
    }
    catch (err) {
        consoleLog("Error checking if user exists", err);
    }
}

checkIfUserNameExists = async (name) => {
    try {
        // Create a connection to the database:
        const conn = await pool.getConnection(); // Get a connection from the pool

        // Check if the user exists in the database:
        let sql = `SELECT * FROM userData WHERE name = ?;`; // SQL query
        let inserts = [name]; // Using the ? to prevent SQL injection
        sql = mysql.format(sql, inserts); // Format the SQL query

        result = await conn.query(sql); // Execute the query

        conn.release(); // Release the connection

        if (result[0].length == 0) {
            return false;
        } else {
            return true;
        }
    }
    catch (err) {
        consoleLog("Error checking if user exists", err);
    }
}


getUserIdByName = async (name) => {
    try {
        // Create a connection to the database:
        const conn = await pool.getConnection(); // Get a connection from the pool

        // Get the userId from the database:
        let sql = `SELECT userId FROM userData WHERE name = ?;`; // SQL query
        let inserts = [name]; // Using the ? to prevent SQL injection
        sql = mysql.format(sql, inserts); // Format the SQL query
        
        result = await conn.query(sql); // Execute the query

        conn.release(); // Release the connection

        return result[0][0].userId;
    }
    catch (err) {
        consoleLog("Error getting userId by name", err);
    }
}

createNewUser = async (name, email) => {
    try {
        // Create a connection to the database:
        const conn = await pool.getConnection(); // Get a connection from the pool

        // Get the highest userId from the database:
        let sql = `SELECT MAX(userId) FROM lastScores;`; // SQL query
        result = await conn.query(sql); // Execute the query

        // Create a new userId:
        let userId = result[0][0]["MAX(userId)"] + 1;

        // Create a new user in the database:
        let sql1 = `INSERT INTO lastScores (userId, lastScore, lastCoins) VALUES (?, ?, ?);`; // SQL query
        let inserts1 = [userId, 0, 0]; // Using the ? to prevent SQL injection
        sql1 = mysql.format(sql1, inserts1); // Format the SQL query
        await conn.query(sql1); // Execute the query

        let sql2 = `INSERT INTO highScores (userId, maxScore, maxCoins) VALUES (?, ?, ?);`; // SQL query
        let inserts2 = [userId, 0, 0]; // Using the ? to prevent SQL injection
        sql2 = mysql.format(sql2, inserts2); // Format the SQL query
        await conn.query(sql2); // Execute the query

        let sql3 = `INSERT INTO lastPlayed (userId, time, date) VALUES (?, ?, ?);`; // SQL query
        let inserts3 = [userId, getTimeString(), getDateString()]; // Using the ? to prevent SQL injection
        sql3 = mysql.format(sql3, inserts3); // Format the SQL query
        await conn.query(sql3); // Execute the query

        let sql4 = `INSERT INTO userData (userId, name, email) VALUES (?, ?, ?);`; // SQL query
        let inserts4 = [userId, name, email]; // Using the ? to prevent SQL injection
        sql4 = mysql.format(sql4, inserts4); // Format the SQL query
        await conn.query(sql4); // Execute the query

        conn.release(); // Release the connection

        consoleLog(`Created new user with userId ${userId}`); // Log the request
        return userId;
    } catch (err) {
        consoleLog("Error creating new user", err);
    }
}

getLastScore = async (userId) => {
    try {
        // Create a connection to the database:
        const conn = await pool.getConnection(); // Get a connection from the pool

        // Get the last score and coins from the database:
        let sql = `SELECT * FROM lastScores WHERE userId = ?;`; // SQL query
        let inserts = [userId]; // Using the ? to prevent SQL injection
        sql = mysql.format(sql, inserts); // Format the SQL query

        result = await conn.query(sql); // Execute the query

        conn.release(); // Release the connection

        return result[0][0];
    } catch (err) {
        consoleLog("Error getting last score", err);
    }
}

getLastPlayed = async (userId) => {
    try {
        // Create a connection to the database:
        const conn = await pool.getConnection(); // Get a connection from the pool

        // Get the last played from the database:
        let sql = `SELECT * FROM lastPlayed WHERE userId = ?;`; // SQL query
        let inserts = [userId]; // Using the ? to prevent SQL injection
        sql = mysql.format(sql, inserts); // Format the SQL query

        result = await conn.query(sql); // Execute the query

        conn.release(); // Release the connection

        return result[0][0];
    } catch (err) {
        consoleLog("Error getting last played", err);
    }
}







/* - - - - - - - - - - - - *
 |        API Calls        |
 * - - - - - - - - - - - - */

// Create a new API key:
app.post('/api/createkey', async (req, res) => {

    // Parse the request body:
    let postData = JSON.parse(JSON.stringify(req.body));
    let password = postData.password;
    let key = postData.key;

    // Check if the API key is valid:
    if (isApiKeyInvalid(key)) {
        res.status(401).json([{ message: 'Invalid API key' }]); // Send status 401 with appropriate JSON-body
        return
    }

    // Check if the password is correct:
    if (password != oegePassword) {
        res.status(401).json([{ message: 'Wrong password' }]); // Send status 401 with appropriate JSON-body
        return;
    }

    // Create a new API key:
    let newKey = crypto.randomBytes(16).toString("hex"); // Generate a new API key
    let fileData = fs.readFileSync(`${__dirname}/keys.json`); // Read the keys from the JSON file
    let keys = JSON.parse(fileData); // Parse the keys
    let validkeys = keys.key; // Get the keys from the JSON file
    validkeys.push(newKey); // Add the new key to the list of valid keys
    keys.key = validkeys; // Update the keys
    fs.writeFileSync(`${__dirname}/keys.json`, JSON.stringify(keys)); // Write the new keys to the JSON file

    // Send the new API key to the client:
    res.status(200).json([{ message: 'New API key created', key: newKey }]); // Send status 200 with appropriate JSON-body
});

// Delete an API key:
app.post('/api/deletekey', async (req, res) => {

    // Parse the request body:
    let postData = JSON.parse(JSON.stringify(req.body));
    let key = postData.key;

    // Check if the API key is valid:
    if (isApiKeyInvalid(key)) {
        res.status(401).json([{ message: 'Invalid API key' }]); // Send status 401 with appropriate JSON-body
        return;
    }

    // Delete the API key:
    let fileData = fs.readFileSync(`${__dirname}/keys.json`); // Read the keys from the JSON file
    let keys = JSON.parse(fileData); // Parse the keys
    let validkeys = keys.key; // Get the keys from the JSON file
    validkeys = validkeys.filter(item => item !== key); // Remove the key from the list of valid keys
    keys.key = validkeys; // Update the keys
    fs.writeFileSync(`${__dirname}/keys.json`, JSON.stringify(keys)); // Write the new keys to the JSON file

    // Send the new API key to the client:
    res.status(200).json([{ message: 'API key deleted' }]); // Send status 200 with appropriate JSON-body
});

// Update the last score and coins:
app.post('/api/updatescore', async (req, res) => {

    // Parse the request body:
    let postData = JSON.parse(JSON.stringify(req.body));
    let key = postData.key;
    let userId = postData.userId;
    let score = postData.score;
    let coins = postData.coins;

    // Check if the API key is valid:
    if (isApiKeyInvalid(key)) {
        res.status(401).json([{ message: 'Invalid API key' }]); // Send status 401 with appropriate JSON-body
        return;
    }

    // Update the last score and coins:
    await updateLastScore(userId, score, coins);

    // Update the high score and coins if necessary:
    await compareLastScores(userId);

    // Update the last played:
    await updateLastPlayed(userId);

    // Send the new API key to the client:
    res.status(200).json([{ message: 'Last score updated' }]); // Send status 200 with appropriate JSON-body
});

// Create a new user:
app.post('/api/createuser', async (req, res) => {

    // Parse the request body:
    let postData = JSON.parse(JSON.stringify(req.body));
    let key = postData.key;
    let name = postData.name;
    let email = postData.email;

    // Check if the API key is valid:
    if (isApiKeyInvalid(key)) {
        res.status(401).json([{ message: 'Invalid API key' }]); // Send status 401 with appropriate JSON-body
        return;
    }

    // Check if the user already exists:
    if (await checkIfUserNameExists(name)) {
        res.status(400).json([{ message: 'User already exists' }]); // Send status 401 with appropriate JSON-body
        return;
    }

    // Create a new user:
    userId = await createNewUser(name, email);

    // Send the new API key to the client:
    res.status(200).json([{ message: 'New user created', userId: userId }]); // Send status 200 with appropriate JSON-body
});

// Check if a user exists:
app.post('/api/checkuser', async (req, res) => {
    
        // Parse the request body:
        let postData = JSON.parse(JSON.stringify(req.body));
        let key = postData.key;
        let idOrName = postData.idorname;
        let method = postData.method;

    
        // Check if the API key is valid:
        if (isApiKeyInvalid(key)) {
            res.status(401).json([{ message: 'Invalid API key' }]); // Send status 401 with appropriate JSON-body
            return;
        }
    
        // Check if the user exists:
        if (method == "id") {
            let exists = await checkIfUserIdExists(idOrName);
            return exists;
        } else if (method == "name") {
            let userId = await getUserIdByName(idOrName);
            let exists = await checkIfUserIdExists(userId);
            return exists;
        }
    
        // Send the new API key to the client:
        res.status(200).json([{ message: 'User exists', exists: exists }]); // Send status 200 with appropriate JSON-body
    }
);

// Get the last score and coins:
app.post('/api/getlastscore', async (req, res) => {

    // Parse the request body:
    let postData = JSON.parse(JSON.stringify(req.body));
    let key = postData.key;
    let userId = postData.userId;

    // Check if the API key is valid:
    if (isApiKeyInvalid(key)) {
        res.status(401).json([{ message: 'Invalid API key' }]); // Send status 401 with appropriate JSON-body
        return;
    }

    // Create a connection to the database:
    const conn = await pool.getConnection(); // Get a connection from the pool

    // Get the last score and coins from the database:
    let sql = `SELECT * FROM lastScores WHERE userId = ?;`; // SQL query
    let inserts = [userId]; // Using the ? to prevent SQL injection
    sql = mysql.format(sql, inserts); // Format the SQL query

    result = await conn.query(sql); // Execute the query

    conn.release(); // Release the connection

    // Send the new API key to the client:
    res.status(200).json([{ message: 'Last score retrieved', lastScore: result[0][0].lastScore, lastCoins: result[0][0].lastCoins }]); // Send status 200 with appropriate JSON-body
});

// Get the high score and coins:
app.post('/api/gethighscore', async (req, res) => {

    // Parse the request body:
    let postData = JSON.parse(JSON.stringify(req.body));
    let key = postData.key;
    let userId = postData.userId;

    // Check if the API key is valid:
    if (isApiKeyInvalid(key)) {
        res.status(401).json([{ message: 'Invalid API key' }]); // Send status 401 with appropriate JSON-body
        return;
    }

    // Create a connection to the database:
    const conn = await pool.getConnection(); // Get a connection from the pool

    // Get the last score and coins from the database:
    let sql = `SELECT * FROM highScores WHERE userId = ?;`; // SQL query
    let inserts = [userId]; // Using the ? to prevent SQL injection
    sql = mysql.format(sql, inserts); // Format the SQL query

    result = await conn.query(sql); // Execute the query

    conn.release(); // Release the connection

    // Send the new API key to the client:
    res.status(200).json([{ message: 'High score retrieved', highScore: result[0][0].maxScore, highCoins: result[0][0].maxCoins }]); // Send status 200 with appropriate JSON-body
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

// On startup, create the columns if they don't exist:
createTables();