/*========================*\
|Global variables, settings|
\*========================*/

// TODO: CHARACTER LIMIT OP alle inputs


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
// Maximum amount of characters allowed in a request
const characterLimit = 128;

// Add rate limiting to every request made from Client to Server.
app.use(require('express-rate-limit')({
    windowMs: 1000, // Milliseconds per window. (1 per second)
    max: rateLimit, // Maximum amount of requests allowed per window.
    message: '{"message": "You have exceeded your API rate limit. Please slow down."}' // Message to send when rate limit is exceeded.
}));

// Regular expression for checking email validity
const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/

// Parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));


// Database connection:
const credentials = {
    user: 'koopenj',
    password: 'pSmwQExG/1rux.',
    host: 'oege.ie.hva.nl',
    port: 3306,
    database: 'zkoopenj',
    insecureAuth: true,
    ssl: { rejectUnauthorized: false }, // Necessary to connect to the database!!!
    connectionLimit: 10
};

/**
 * Tables required for the SQL database.
 * These tables will be created on startup if they don't exist.
 * Child objects in the 'tables' object are the columns of the table.
 * The children of the column objects are the column name and the column type.
 */
const tables = {
    highScores: {
        userId: 'int NOT NULL',
        userName: 'varchar(255) NOT NULL',
        maxScore: 'int DEFAULT 0',
        level: 'int DEFAULT 0'
    },
    lastPlayed: {
        userId: 'int NOT NULL',
        userName: 'varchar(255) NOT NULL',
        time: 'TIME DEFAULT (CURRENT_TIME)',
        date: 'DATE DEFAULT (CURRENT_DATE)'
    },
    lastScores: {
        userId: 'int NOT NULL',
        userName: 'varchar(255) NOT NULL',
        lastScore: 'int DEFAULT 0',
        lastLevel: 'int DEFAULT 0'
    }
}

const pool = mysql.createPool(credentials);

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
function consoleLog(type, message, parameters) {
    switch (true) {
        case type === "REQ" && parameters === undefined:
            console.log(`[${getTimeString()}, ${getDateStringNL()}][C -REQ-> S]: ${message}`);
            break;
        case type === "RES" && parameters === undefined:
            console.log(`[${getTimeString()}, ${getDateStringNL()}][C <-RES- S]: ${message}`);
            break;
        case type === "ERR" && parameters === undefined:
            console.log(`[${getTimeString()}, ${getDateStringNL()}][C <-ERR- S]: ${message}`);
            break;
        case type === "REQ" && parameters !== undefined:
            console.log(`[${getTimeString()}, ${getDateStringNL()}][C -REQ-> S]: ${message}`, parameters);
            break;
        case type === "RES" && parameters !== undefined:
            console.log(`[${getTimeString()}, ${getDateStringNL()}][C <-RES- S]: ${message}`, parameters);
            break;
        case type === "ERR" && parameters !== undefined:
            console.log(`[${getTimeString()}, ${getDateStringNL()}][C <-ERR- S]: ${message}`, parameters);
            break;
        case type === "RUN":
            console.log(`[${getTimeString()}, ${getDateStringNL()}][C <-RUN- S]: ${message}`);
            break;
        default:
            console.log(`[${getTimeString()}, ${getDateStringNL()}][C <-??-> S]: ${message}`, parameters);
            break;
    }
}

// Check if the given API key is valid:
isApiKeyInvalid = (apiKey) => {
    let fileData = fs.readFileSync(`${__dirname}/keys.json`); // Read the keys from the JSON file
    let keys = JSON.parse(fileData); // Parse the keys
    let validkeys = keys.key; // Get the keys from the JSON file
    return !validkeys.includes(apiKey); // Check if the API key is valid
}

isDataTooLong = (data) => data !== undefined &&  data.length > characterLimit;


// Compare the last score and coins with the high score and coins:
compareLastScores = async (userId) => {
    try {
        // Create a connection to the database:
        const conn = await pool.getConnection(); // Get a connection from the pool

        // Get the last score and coins from the database:
        let sql1 = `SELECT * FROM lastScores WHERE userId = ?;`; // SQL query
        let inserts1 = [userId]; // Using the ? to prevent SQL injection
        sql1 = mysql.format(sql1, inserts1); // Format the SQL quer

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

// Update the last score and coins:
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

        consoleLog("RES", `Updated last score for userId ${userId}`); // Log the request
    } catch (err) {
        consoleLog("ERR", "Error updating last score", err);
    }
}

// Update the last played:
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

        consoleLog("RES", `Updated last played for userId ${userId}`); // Log the request
    } catch (err) {
        consoleLog("ERR", "Error updating last played", err);
    }
}

/**
 * Method for checking whether the database contains a specified user or not
 * @param {number} userId The ID of the user to check
 * @returns {Promise<void>}
 */
userIdExists = async (userId) => {
    const connection = await pool.getConnection(); // Get a connection from the pool
    return await connection.query(mysql.format('SELECT * FROM userData WHERE userId = ?', userId))
        .then(res => res[0].length > 0)
        .catch(e => console.error('Error occurred whilst attempting to check if user exists', e))
        .finally(() => connection.release());
}

/**
 * Method for checking whether a username exists in the database or not
 * @param {string} userName
 * @returns {Promise<boolean | void>}
 */
userNameExists = async (userName) => {
    const connection = await pool.getConnection(); // Get a connection from the pool
    return connection.query(mysql.format('SELECT * FROM userData WHERE userName = ?', userName))
        .then(res => res[0].length > 0)
        .catch(e => console.error('Error occurred whilst attempting to check if user exists', e))
        .finally(() => connection.release());
}


// Check if a user exists using their name:
checkIfUserNameExists = async (name) => {
    try {
        // Create a connection to the database:
        const conn = await pool.getConnection(); // Get a connection from the pool

        // Check if the user exists in the database:
        let sql = `SELECT * FROM userData WHERE userName = ?;`; // SQL query
        let inserts = [name]; // Using the ? to prevent SQL injection
        sql = mysql.format(sql, inserts); // Format the SQL query

        let result = await conn.query(sql); // Execute the query

        conn.release(); // Release the connection
        return result[0].length !== 0;
    }
    catch (err) {
        consoleLog("ERR", "Error checking if user exists", err);
    }
}

// Get the userId by name:
getUserIdByName = async (name) => {
    try {
        // Create a connection to the database:
        const conn = await pool.getConnection(); // Get a connection from the pool

        // Get the userId from the database:
        let sql = `SELECT userId FROM userData WHERE userName = ?;`; // SQL query
        let inserts = [name]; // Using the ? to prevent SQL injection
        sql = mysql.format(sql, inserts); // Format the SQL query

        let result = await conn.query(sql); // Execute the query

        conn.release(); // Release the connection

        return result[0][0].userId;
    }
    catch (err) {
        consoleLog("ERR", "Error getting userId by name", err);
    }
}

/**
 * Method for getting all data from a user.
 * Combines data from all tables into one object.
 * @param {number} userId The ID of the user to retrieve the data from
 * @returns {Promise<Object | void>} An object containing all data from the user
 */
getUserData = async (userId) => {
    let connection = await pool.getConnection();
    return await connection
        .query(mysql.format(
            'SELECT * FROM userData ' +
                'RIGHT JOIN lastScores ON lastScores.userId = userData.userId ' +
                'RIGHT JOIN lastPlayed ON lastPlayed.userId = userData.userId ' +
                'RIGHT JOIN highScores ON highScores.userId = userData.userId ' +
                'WHERE userData.userId = ?', userId))
        .then(res => res[0][0] || {})
        .catch(e => console.error('Error occurred whilst attempting to retrieve user-data', e))
        .finally(() => connection.release());
}

// Create a new user:
createNewUser = async (name, email) => {
    try {
        // Create a connection to the database:
        const conn = await pool.getConnection(); // Get a connection from the pool

        // Get the highest userId from the database:
        let sql = `SELECT MAX(userId) FROM lastScores;`; // SQL query
        let result = await conn.query(sql); // Execute the query

        // Create a new userId:
        let userId = result[0][0]["MAX(userId)"] + 1;

        // Create a new user in the database:
        let sql1 = `INSERT INTO lastScores (userId, userName, lastScore, lastCoins) VALUES (?, ?, ?, ?);`; // SQL query
        let inserts1 = [userId, name, 0, 0]; // Using the ? to prevent SQL injection
        sql1 = mysql.format(sql1, inserts1); // Format the SQL query
        await conn.query(sql1); // Execute the query

        let sql2 = `INSERT INTO highScores (userId, userName, maxScore, maxCoins) VALUES (?, ?, ?, ?);`; // SQL query
        let inserts2 = [userId, name, 0, 0]; // Using the ? to prevent SQL injection
        sql2 = mysql.format(sql2, inserts2); // Format the SQL query
        await conn.query(sql2); // Execute the query

        let sql3 = `INSERT INTO lastPlayed (userId, userName, time, date) VALUES (?, ?, ?, ?);`; // SQL query
        let inserts3 = [userId, name, getTimeString(), getDateString()]; // Using the ? to prevent SQL injection
        sql3 = mysql.format(sql3, inserts3); // Format the SQL query
        await conn.query(sql3); // Execute the query

        let sql4 = `INSERT INTO userData (userId, userName, email) VALUES (?, ?, ?);`; // SQL query
        let inserts4 = [userId, name, email]; // Using the ? to prevent SQL injection
        sql4 = mysql.format(sql4, inserts4); // Format the SQL query
        await conn.query(sql4); // Execute the query

        conn.release(); // Release the connection
        return userId;
    } catch (err) {
        consoleLog("ERR", "Error creating new user", err);
    }
}

// Delete a user:
deleteUser = async (userId) => {

    const connection = await pool.getConnection(); // Get a connection from the pool

    // Iterate over all tables and then delete user-data from that table
    Object.entries(tables).forEach(([tableName]) => {
        connection.query(mysql.format('DELETE FROM ?? WHERE userId = ?', [tableName, userId]))
            .catch(e => console.error(`An error occurred whilst attempting to delete user-data from table ${tableName}`, e));
    });

    connection.release();

    consoleLog("RES", `Deleted user with userId ${userId}`);
}


/**
 * Method for retrieving last published data from a user.
 * @param {number} userId
 * @returns {Promise<object>}
 */
getLastScore = async (userId) => {
    const connection = await pool.getConnection();
    return await connection.query(mysql.format('SELECT * FROM lastScores WHERE userId = ?', userId))
        .then(result => result[0][0])
        .catch(e => console.error('An error occurred whilst attempting to retrieve last score', e))
        .finally(() => connection.release());
}

// Get the last played:
getLastPlayed = async (userId) => {
    const connection = await pool.getConnection();
    return await connection.query(mysql.format('SELECT * FROM lastPlayed WHERE userId = ?', userId))
        .then(result => result[0][0])
        .catch(e => console.error('An error occurred whilst attempting to retrieve last played', e))
        .finally(() => connection.release());
}

/**
 * Method for retrieving highscores of a provided user
 * @param {number} userId
 * @returns {Promise<Object | void>}
 */
getHighScore = async (userId) => {
    const connection = await pool.getConnection();
    return await connection.query(mysql.format('SELECT * FROM highScores WHERE userId = ?', userId))
        .then(result => result[0][0])
        .catch(e => console.error('An error occurred whilst attempting to retrieve high-scores', e))
        .finally(() => connection.release());
}

// Get leaderboards:
getLeaderboards = async (sortBy, maxResults) => {
    const connection = await pool.getConnection();
    return await connection.query(mysql.format('SELECT * FROM highScores ORDER BY ? DESC LIMIT ?', [sortBy, maxResults]))
        .then(result => result[0])
        .catch(e => console.error('An error occurred whilst attempting to retrieve leaderboards', e))
        .finally(() => connection.release());
}

/* - - - - - - - - - - - - *
 |        API Calls        |
 * - - - - - - - - - - - - */

// Create a new API key:
app.post('/api/createkey', async (req, res) => {

    // Parse the request body:
    let postData = JSON.parse(JSON.stringify(req.body));
    let password = postData.password;

    consoleLog("REQ", `Got a create key request.`); // Log the request

    // Check the length of the password:
    if (isDataTooLong(password)) {
        res.status(401).json({ message: 'Bad request' }); // Send status 400 with appropriate JSON-body
        consoleLog("RES", "Too many characters in request");
        return;
    }

    // Check if the password is correct:
    if (password !== credentials.password) {
        res.status(401).json({ message: 'Wrong password' }); // Send status 401 with appropriate JSON-body
        consoleLog("RES", "Invalid password");
        return;
    }

    // Create a new API key:
    let newKey = crypto.randomBytes(12).toString("hex"); // Generate a new API key
    let fileData = fs.readFileSync(`${__dirname}/keys.json`); // Read the keys from the JSON file
    let keys = JSON.parse(fileData); // Parse the keys
    let validkeys = keys.key; // Get the keys from the JSON file
    validkeys.push(newKey); // Add the new key to the list of valid keys
    keys.key = validkeys; // Update the keys
    fs.writeFileSync(`${__dirname}/keys.json`, JSON.stringify(keys)); // Write the new keys to the JSON file

    // Send the new API key to the client:
    res.status(200).json({ message: 'New API key created', key: newKey }); // Send status 200 with appropriate JSON-body
    consoleLog("RES", `New API key created: ${newKey}`); // Log the request
});

// Delete an API key:
app.post('/api/deletekey', async (req, res) => {

    // Parse the request body:
    let postData = JSON.parse(JSON.stringify(req.body));
    let key = postData.key;

    consoleLog("REQ", `Got a delete key request.`); // Log the request

    // Check if the request data is too long:
    if (isDataTooLong(key)) {
        res.status(400).json({ message: 'Invalid data' }); // Send status 400 with appropriate JSON-body
        consoleLog("RES", "Too many characters in request");
        return;
    }

    // Check if the API key is valid:
    if (isApiKeyInvalid(key)) {
        res.status(401).json({ message: 'Invalid API key' }); // Send status 401 with appropriate JSON-body
        consoleLog("RES", "Invalid API key");
        return;
    }

    // Delete the API key:
    let fileData = fs.readFileSync(`${__dirname}/keys.json`); // Read the keys from the JSON file
    let keys = JSON.parse(fileData); // Parse the keys
    let validkeys = keys.key; // Get the keys from the JSON file
    validkeys = validkeys.filter(item => item !== key); // Remove the key from the list of valid keys
    keys.key = validkeys; // Update the keys
    fs.writeFileSync(`${__dirname}/keys.json`, JSON.stringify(keys)); // Write the new keys to the JSON file

    // Send the result to the client:
    res.status(200).json({ message: 'API key deleted' }); // Send status 200 with appropriate JSON-body
    consoleLog("RES", `API key deleted: ${key}`); // Log the request
});

// Update the last score and coins:
app.post('/api/updatescore', async (req, res) => {

    // Parse the request body:
    let postData = JSON.parse(JSON.stringify(req.body));
    let key = postData.key;
    let userId = postData.userId;
    let score = postData.score;
    let coins = postData.coins;

    consoleLog("REQ", `Got an update score request for userId ${userId} with score ${score} and coins ${coins}`); // Log the request

    // Check if the request data is too long:
    if (isDataTooLong(key) || isDataTooLong(userId) || isDataTooLong(score) || isDataTooLong(coins)) {
        res.status(400).json({ message: 'Invalid data' }); // Send status 400 with appropriate JSON-body
        consoleLog("RES", "Too many characters in request");
        return;
    }

    // Check if the API key is valid:
    if (isApiKeyInvalid(key)) {
        res.status(401).json({ message: 'Invalid API key' }); // Send status 401 with appropriate JSON-body
        consoleLog("RES", "Invalid API key");
        return;
    }

    // Check if the data is valid:
    if (userId == null || score == null || coins == null) {
        res.status(400).json({ message: 'Invalid data' }); // Send status 400 with appropriate JSON-body
        consoleLog("RES", "Invalid data");
        return;
    }

    // Update the last score and coins:
    await updateLastScore(userId, score, coins);

    // Update the high score and coins if necessary:
    await compareLastScores(userId);

    // Update the last played:
    await updateLastPlayed(userId);

    // Send the result to the client:
    res.status(200).json({ message: 'Last score updated' }); // Send status 200 with appropriate JSON-body
    consoleLog("RES", `Last score updated for userId ${userId}`); // Log the request
});

// Create a new user:
app.post('/api/createuser', async (req, res) => {

    // Parse the request body:
    let postData = JSON.parse(JSON.stringify(req.body));
    let key = postData.key;
    let name = postData.name;
    let email = postData.email;

    consoleLog("REQ", `Got a create user request for name ${name} and email ${email}`); // Log the request

    // Check if the request data is too long:
    if (isDataTooLong(key) || isDataTooLong(name) || isDataTooLong(email)) {
        res.status(400).json({ message: 'Invalid data' }); // Send status 400 with appropriate JSON-body
        consoleLog("RES", "Too many characters in request");
        return;
    }

    // Check if the API key is valid:
    if (isApiKeyInvalid(key)) {
        res.status(401).json({ message: 'Invalid API key' }); // Send status 401 with appropriate JSON-body
        consoleLog("RES", "Invalid API key");
        return;
    }

    // Check if the data is valid:
    if (name == null || email == null) {
        res.status(400).json({ message: 'Invalid data' }); // Send status 400 with appropriate JSON-body
        consoleLog("RES", "Invalid data");
        return;
    }

    // Check if the user already exists:
    if (await checkIfUserNameExists(name)) {
        res.status(400).json({ message: 'User already exists' }); // Send status 401 with appropriate JSON-body
        consoleLog("RES", `Create new user failed, user ${name} already exists`); // Log the request
        return;
    }

    // Create a new user:
    userId = await createNewUser(name, email);

    // Send the result to the client:
    res.status(200).json({ message: 'New user created', userId: userId }); // Send status 200 with appropriate JSON-body
    consoleLog("RES", `New user ${name} created with userId ${userId}`); // Log the request
});

// Check if a user exists:
app.post('/api/checkuser', async (req, res) => {

    // Parse the request body:
    let postData = JSON.parse(JSON.stringify(req.body));
    let key = postData.key;
    let idOrName = postData.idorname;

    consoleLog("REQ", `Got a check user request for id or name ${idOrName}`); // Log the request

    // Check if the request data is too long:
    if (isDataTooLong(key) || isDataTooLong(idOrName)) {
        res.status(400).json({ message: 'Invalid data' }); // Send status 400 with appropriate JSON-body
        consoleLog("RES", "Too many characters in request");
        return;
    }

    // Check if the API key is valid:
    if (isApiKeyInvalid(key)) {
        res.status(401).json({ message: 'Invalid API key' }); // Send status 401 with appropriate JSON-body
        consoleLog("RES", "Invalid API key");
        return;
    }

    // Check if the data is valid:
    if (idOrName == null) {
        res.status(400).json({ message: 'Invalid data' }); // Send status 400 with appropriate JSON-body
        consoleLog("RES", "Invalid data");
        return;
    }

    // Check whether the request is an id or a name:
    let method;
    if (isNaN(idOrName)) {
        method = "name";
    } else {
        method = "id";
    }

    // Check if the user exists:
    let exists;
    if (method === "id") {
        exists = await userIdExists(idOrName);
    } else if (method === "name") {
        let userId = await getUserIdByName(idOrName);
        exists = await userIdExists(userId);
    }

    // Send the result to the client:
    res.status(200).json({ message: 'User exists', exists: exists }); // Send status 200 with appropriate JSON-body
    consoleLog("RES", `User ${idOrName} exists: ${exists}`); // Log the request
}
);

// Delete a user:
app.post('/api/deleteuser', async (req, res) => {

    // Parse the request body:
    let postData = JSON.parse(JSON.stringify(req.body));
    let key = postData.key;
    let userId = postData.userId;

    consoleLog("REQ", `Got a delete user request for userId ${userId}`); // Log the request

    // Check if the request data is too long:
    if (isDataTooLong(key) || isDataTooLong(userId)) {
        res.status(400).json({ message: 'Invalid data' }); // Send status 400 with appropriate JSON-body
        consoleLog("RES", "Too many characters in request");
        return;
    }

    // Check if the API key is valid:
    if (isApiKeyInvalid(key)) {
        res.status(401).json({ message: 'Invalid API key' }); // Send status 401 with appropriate JSON-body
        consoleLog("RES", "Invalid API key");
        return;
    }

    // Check if the data is valid:
    if (userId == null) {
        res.status(400).json({ message: 'Invalid data' }); // Send status 400 with appropriate JSON-body
        consoleLog("RES", "Invalid data");
        return;
    }

    // Check if the user exists:
    if (!await userIdExists(userId)) {
        res.status(400).json({ message: 'User does not exist' }); // Send status 400 with appropriate JSON-body
        consoleLog("RES", `Delete user failed, user ${userId} does not exist`); // Log the request
        return;
    }

    // Delete the user:
    await deleteUser(userId);

    // Send the result to the client:
    res.status(200).json({ message: 'User deleted' }); // Send status 200 with appropriate JSON-body
});


// Get the last score and coins:
app.post('/api/getlastscore', async (req, res) => {

    // Parse the request body:
    let postData = JSON.parse(JSON.stringify(req.body));
    let key = postData.key;
    let userId = postData.userId;

    consoleLog("REQ", `Got a get lastscore request for userId ${userId}`); // Log the request

    // Check if request data is too long:
    if (isDataTooLong(key) || isDataTooLong(userId)) {
        res.status(400).json({ message: 'Invalid data' }); // Send status 400 with appropriate JSON-body
        consoleLog("RES", "Too many characters in request");
        return;
    }

    // Check if the API key is valid:
    if (isApiKeyInvalid(key)) {
        res.status(401).json({ message: 'Invalid API key' }); // Send status 401 with appropriate JSON-body
        consoleLog("RES", "Invalid API key");
        return;
    }

    // Check if the data is valid:
    if (userId == null) {
        res.status(400).json({ message: 'Invalid data' }); // Send status 400 with appropriate JSON-body
        consoleLog("RES", "Invalid data");
        return;
    }

    // Get the last score and coins:
    let lastScore = await getLastScore(userId); // Get the last score and coins from the database

    // Send the result to the client:
    res.status(200).json({ message: 'Last score retrieved', lastScore: lastScore }); // Send status 200 with appropriate JSON-body
    consoleLog("RES", `Last score retrieved for userId ${userId}`); // Log the request
});

// Get high score and coins:
app.post('/api/gethighscore', async (req, res) => {

    // Parse the request body:
    let postData = JSON.parse(JSON.stringify(req.body));
    let key = postData.key;
    let userId = postData.userId;

    consoleLog("REQ", `Got a get highscore request for userId ${userId}`); // Log the request

    // Check if the API key is valid:
    if (isApiKeyInvalid(key)) {
        res.status(401).json({ message: 'Invalid API key' }); // Send status 401 with appropriate JSON-body
        consoleLog("RES", "Invalid API key");
        return;
    }

    // Check if the data is valid:
    if (userId == null) {
        res.status(400).json({ message: 'Invalid data' }); // Send status 400 with appropriate JSON-body
        consoleLog("RES", "Invalid data");
        return;
    }

    // Get the high score and coins:
    let highScore = await getHighScore(userId); // Get the high score and coins from the database

    // Send the result to the client:
    res.status(200).json({ message: 'High score retrieved', highScore: highScore }); // Send status 200 with appropriate JSON-body
    consoleLog("RES", `High score retrieved for userId ${userId}`); // Log the request
});

// Get the leaderboards:
app.post('/api/getleaderboards', async (req, res) => {

    console.log('got request')
    // Parse the request body:
    let postData = JSON.parse(JSON.stringify(req.body));
    let key = postData.key;
    let sortBy = postData.sortBy;
    let maxResults = parseInt(postData.maxResults);

    consoleLog("REQ", `Got a leaderboards request sorted by ${sortBy} with max results of ${maxResults}`); // Log the request

    // Check if the API key is valid:
    if (isApiKeyInvalid(key)) {
        res.status(401).json({ message: 'Invalid API key' }); // Send status 401 with appropriate JSON-body
        consoleLog("RES", "Invalid API key");
        return;
    }

    // Check if the data is valid:
    if (maxResults == null) {
        res.status(400).json({ message: 'Invalid data' }); // Send status 400 with appropriate JSON-body
        consoleLog("RES", "Invalid data");
        return;
    }

    // Check if the sortBy is valid:
    if (sortBy !== "score" && sortBy !== "coins") {
        res.status(400).json({ message: 'Invalid sortBy, must be either score or coins' }); // Send status 400 with appropriate JSON-body
        consoleLog("RES", "Invalid sortBy");
        return;
    }

    // Get the leaderboards:
    let leaderboards = await getLeaderboards(sortBy, maxResults).then(r => r); // Get the leaderboards from the database
    console.log(leaderboards)

    // Send the result to the client:
    res.status(200).json(leaderboards); // Send status 200 with appropriate JSON-body
    consoleLog("RES", `Leaderboards retrieved sorted by ${sortBy} with max results of ${maxResults}`); // Log the request
});

app.get('/*', (req, res) => {
    consoleLog("REQ", "wrong URL"); // Log the request
    consoleLog("RES", "wrong URL"); // Log the request
    res.status(404).json({ message: 'Wrong URL' }); // Send status 404 with appropriate JSON-body
});


// Default (wrong URL(POST))
app.post('/*', (req, res) => {
    consoleLog("REQ", "wrong URL"); // Log the request
    consoleLog("RES", "wrong URL"); // Log the request
    res.status(404).json({ message: 'Wrong URL' }); // Send status 404 with appropriate JSON-body
});


// Default (wrong URL(DELETE))
app.delete('/*', (req, res) => {
    consoleLog("REQ", "wrong URL"); // Log the request
    consoleLog("RES", "wrong URL"); // Log the request
    res.status(404).json({ message: 'Wrong URL' }); // Send status 404 with appropriate JSON-body
});

// Run the API on port 8081
app.listen(port, async () => {
    consoleLog("RUN", `API Server started on port ${port}`); // Log the request

    // Check whether tables exist, if they don't, create them.
    let connection = await pool.getConnection();

    // Iterate over all tables, then check whether the table exists.
    // If they don't, create them.
    Object.entries(tables).forEach(([tableName, table]) => {
        connection
            .query(`CREATE TABLE IF NOT EXISTS ${tableName} (${Object.entries(table).map(([key, value]) => `${key} ${value}`).join(', ')})`)
            .catch((e) => console.error(e));
    })
});