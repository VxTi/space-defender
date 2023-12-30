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

/**
 * Which port to host the server on.
 * Since we're using two servers, one for API calls and one for
 * generic web calls, we must host them on two separate ports.
 */
const port = 8081;

// Maximum amount of requests allowed per time-frame (window size is 1000ms / 1s)
const rateLimit = 10;
// Maximum amount of characters allowed in a request
const characterLimit = 128;

/**
 * Add rate limiting to the application.
 * This prevents users from making too many requests in a short time-frame.
 */
app.use(require('express-rate-limit')({
    windowMs: 1000, // Milliseconds per window. (1 per second)
    max: rateLimit, // Maximum amount of requests allowed per window.
    message: '{"message": "You have exceeded your API rate limit. Please slow down."}' // Message to send when rate limit is exceeded.
}));

// Parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));

/**
 * Remap the default console.log and console.error function to include a timestamp.
 */
const _default_console_log = console.log;
const _default_console_err = console.error;
console.log = (...args) => _default_console_log(`${new Date().toLocaleString('nl-NL')} | LOG |`, ...args);
console.error = (...args) => _default_console_err(`${new Date().toLocaleString('nl-NL')} | ERROR | `, ...args);

/**
 * Since we want to check the API key on every request, we'll use a middleware function.
 */
app.use((req,res,next) => {

    // Check whether the user provided a valid API key (unless the request is a create key request)
    if (isApiKeyInvalid(req.body.key) && !req.url.includes('createkey')) {
        res.status(401).json({ message: 'Invalid API key' });
        console.log('Received faulty request: Invalid API key');
        return;
    }

    // Check whether the request body contains too many characters
    // If this is the case, prevent the request from being processed.
    if (Object.entries(req.body).some(([key, value]) => value.length > characterLimit)) {
        res.status(400).json({ message: 'Bad request' });
        return;
    }

    next();
});


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
        maxWave: 'int DEFAULT 0'
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
        lastWave: 'int DEFAULT 0'
    },
    userData: {
        userId: 'int NOT NULL',
        userName: 'varchar(255) NOT NULL',
    }
}

const pool = mysql.createPool(credentials);

/* - - - - - - - - - - - - *
 |        Functions        |
 * - - - - - - - - - - - - */

/**
 * Function for formatting logging requests with additional information
 * @param {string} type
 * @param {string} message
 * @param {string?} parameters
 */
function log(type, message, ...parameters) {
    // Fix this code please it's ugly


    console.log(`${type === 'REQ' ? 'C -REQ-> S' : `S -${type}-> C`} |`, message, ...parameters);
/*
    switch (true) {
        case type === "REQ" && parameters === undefined:
            console.log(`[C -REQ-> S]: ${message}`);
            break;
        case type === "RES" && parameters === undefined:
            console.log(`[C <-RES- S]: ${message}`);
            break;
        case type === "ERR" && parameters === undefined:
            console.log(`[C <-ERR- S]: ${message}`);
            break;
        case type === "REQ" && parameters !== undefined:
            console.log(`[C -REQ-> S]: ${message}`, parameters);
            break;
        case type === "RES" && parameters !== undefined:
            console.log(`[C <-RES- S]: ${message}`, parameters);
            break;
        case type === "ERR" && parameters !== undefined:
            console.log(`[C <-ERR- S]: ${message}`, parameters);
            break;
        case type === "RUN":
            console.log(`[C <-RUN- S]: ${message}`);
            break;
        default:
            console.log(`[C <-??-> S]: ${message}`, parameters);
            break;
    }*/
}

/**
 * Method for checking whether the provided api key is contained in the database or not.
 * @param {string} apiKey The provided api key to check
 * @returns {boolean} Whether the api key is valid or not
 */
function isApiKeyInvalid(apiKey) {
    let fileData = fs.readFileSync(`${__dirname}/keys.json`); // Read the keys from the JSON file
    let keys = JSON.parse(fileData); // Parse the keys
    return apiKey && !keys.key.includes(apiKey); // Check if the API key is valid
}

isDataTooLong = (...data) => data.some(d => d.length > characterLimit);


/**
 * Method for updating the highscores when they're higher than the last ones.
 * @param {number} userId
 */
async function compareLastScores(userId) {

    const connection = await pool.getConnection();
    // Update the high score and wave if the value is higher than the current high score and wave:
    await connection.query(
        mysql.format('UPDATE highScores SET maxScore = GREATEST(maxScore, (SELECT lastScore FROM lastScores WHERE userId = ?)), maxWave = GREATEST(maxWave, (SELECT lastWave FROM lastScores WHERE userId = ?)) WHERE userId = ?', [userId, userId, userId]))
        .catch(e => console.error('An error occurred whilst attempting to compare last scores', e))
        .finally(() => connection.release());
}

/**
 * Method for updating the last scores of the player in the 'lastScores' table
 * @param {number} userId The user-id to change the data of
 * @param {number} score New score
 * @param {number} wave New wave level value
 */
async function updateLastScore(userId, score, wave) {

    const connection = await pool.getConnection(); // Get a connection from the pool
    await connection.query(mysql.format('UPDATE lastScores SET lastScore = ?, lastWave = ? WHERE userId = ?', [score, wave, userId]))
        .catch(e => console.error('An error occurred whilst attempting to update last score', e))
        .finally(() => connection.release())
}

/**
 * Method for updating the last played time and date of the player in the 'lastPlayed' table
 * @param {number} userId The user to update the data for
 */
async function updateLastPlayed(userId) {

    const connection = await pool.getConnection();
    await connection.query(mysql.format('UPDATE lastPlayed SET time = (CURRENT_TIME), date = (CURRENT_DATE) WHERE userId = ?', userId))
        .then(() => log("RES", `Updated last played for userId ${userId}`))
        .catch(e => console.error('An error occurred whilst attempting to update last played', e))
        .finally(() => connection.release());
}

/**
 * Method for checking whether the database contains a specified user or not
 * @param {number} userId The ID of the user to check
 * @returns {Promise<void>}
 */
async function userIdExists(userId){
    const connection = await pool.getConnection(); // Get a connection from the pool
    return await connection.query(mysql.format('SELECT * FROM userData WHERE userId = ?', [userId]))
        .then(res => res[0].length > 0)
        .catch(e => console.error('Error occurred whilst attempting to check if user exists', e))
        .finally(() => connection.release());
}

/**
 * Method for checking whether a username exists in the database or not
 * @param {string} userName
 * @returns {Promise<boolean | void>}
 */
async function userNameExists(userName) {
    const connection = await pool.getConnection(); // Get a connection from the pool
    return connection.query(mysql.format('SELECT * FROM userData WHERE userName = ?', userName))
        .then(res => res[0].length > 0)
        .catch(e => console.error('Error occurred whilst attempting to check if user exists', e))
        .finally(() => connection.release());
}

/**
 * Method for retrieving the userId by name
 * @param {string} name Name of the user to retrieve the ID from
 * @returns {Promise<number | null | void>} The ID of the user, or undefined if the user doesn't exist
 */
async function getUserIdFromName(name){
    const connection = await pool.getConnection();
    return await connection.query(mysql.format('SELECT userId FROM userData WHERE userName = ?', name))
        .then(res => res[0][0]?.userId || null)
        .catch(e => console.error('Error occurred whilst attempting to retrieve userId by name', e))
        .finally(() => connection.release());
}

/**
 * Method for retrieving user-data from a username
 * @param {string} userName
 * @returns {Promise<void>}
 */
async function getUserDataFromName(userName) {
    return await getUserDataFromId(await getUserIdFromName(userName));
}

/**
 * Method for getting all data from a user.
 * Combines data from all tables into one object.
 * @param {number} userId The ID of the user to retrieve the data from
 * @returns {Promise<Object | void>} An object containing all data from the user
 */
async function getUserDataFromId(userId) {
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

/**
 * Method for creating a new user in the database.
 * Only works if the userdata isn't already present.
 * @param {string} name Name of the user
 */
async function createNewUser(name) {

    const connection = await pool.getConnection(); // Get a connection from the pool

    // Retrieve last userId from the database and increment it by 1
    let userId = await connection.query('SELECT MAX(userId) FROM userData')
        .then(res => (res[0][0]['MAX(userId)'] || 0) + 1)
        .catch(e => console.error('Error occurred whilst attempting to retrieve last userId', e));

    // Insert the new user into all tables
    for (const [tableName, tableColumns] of Object.entries(tables)) {

        // Since tables have default values, we don't have to insert them upon creation.
        // This is why we only insert the userId and userName.
        await connection.query('INSERT INTO ?? (userId, userName) VALUES (?, ?)', [tableName, userId, name])
            .catch(e => console.error(`An error occurred whilst attempting to create new user ${name} in table ${tableName}`, e));
    }
    // Release the connection
    connection.release();

    return userId;
}

/**
 * Method for deleting a user from the database.
 * @param {number} userId
 */
async function deleteUser(userId) {

    const connection = await pool.getConnection(); // Get a connection from the pool

    // Iterate over all tables and then delete user-data from that table
    Object.entries(tables).forEach(([tableName]) => {
        connection.query(mysql.format('DELETE FROM ?? WHERE userId = ?', [tableName, userId]))
            .catch(e => console.error(`An error occurred whilst attempting to delete user-data from table ${tableName}`, e));
    });

    connection.release();

    log("RES", `Deleted user with userId ${userId}`);
}


/**
 * Method for retrieving last published data from a user.
 * @param {number} userId
 * @returns {Promise<object>}
 */
async function getLastScore(userId)  {
    const connection = await pool.getConnection();
    return await connection.query(mysql.format('SELECT * FROM lastScores WHERE userId = ?', userId))
        .then(result => result[0][0])
        .catch(e => console.error('An error occurred whilst attempting to retrieve last score', e))
        .finally(() => connection.release());
}

/**
 * Method for retrieving the last played times from a user
 * @param {number} userId The user to retrieve the data from
 * @returns {Promise<object | void>} An object containing the last played times, or undefined if the user doesn't exist
 */
async function getLastPlayed(userId){
    const connection = await pool.getConnection();
    return await connection.query(mysql.format('SELECT * FROM lastPlayed WHERE userId = ?', userId))
        .then(result => result[0][0])
        .catch(e => console.error('An error occurred whilst attempting to retrieve last played', e))
        .finally(() => connection.release());
}

/**
 * Method for retrieving highscores of a provided user
 * @param {number} userId The
 * @returns {Promise<Object | void>}
 */
async function getHighScore(userId){
    const connection = await pool.getConnection();
    return await connection.query(mysql.format('SELECT * FROM highScores WHERE userId = ?', userId))
        .then(result => result[0][0])
        .catch(e => console.error('An error occurred whilst attempting to retrieve high-scores', e))
        .finally(() => connection.release());
}

/**
 * Method for retrieving the leaderboards from the database
 * @param {string} sortBy
 * @param {number} maxResults
 * @returns {Promise<object>} Promise object containing the leaderboards
 */
async function getLeaderboards(sortBy, maxResults){
    const connection = await pool.getConnection();
    return await connection.query(mysql.format('SELECT * FROM `highScores` ORDER BY ? DESC LIMIT ?', [sortBy, maxResults]))
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
    let password = req.body.password ?? '';

    log("REQ", `Got a create key request.`); // Log the request

    // Check if the password is correct:
    if (password !== credentials.password) {
        res.status(401).json({ message: 'Wrong password' }); // Send status 401 with appropriate JSON-body
        log("RES", "Invalid password");
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
    log("RES", `New API key created: ${newKey}`); // Log the request
});

// Delete an API key:
app.post('/api/deletekey', async (req, res) => {

    // Parse the request body:
    let postData = JSON.parse(JSON.stringify(req.body));
    let key = postData.key;

    log("REQ", `Got a delete key request.`); // Log the request

    // Delete the API key:
    let fileData = fs.readFileSync(`${__dirname}/keys.json`); // Read the keys from the JSON file
    let keys = JSON.parse(fileData); // Parse the keys
    let validkeys = keys.key; // Get the keys from the JSON file
    validkeys = validkeys.filter(item => item !== key); // Remove the key from the list of valid keys
    keys.key = validkeys; // Update the keys
    fs.writeFileSync(`${__dirname}/keys.json`, JSON.stringify(keys)); // Write the new keys to the JSON file

    // Send the result to the client:
    res.status(200).json({ message: 'API key deleted' }); // Send status 200 with appropriate JSON-body
    log("RES", `API key deleted: ${key}`); // Log the request
});

// Update the last score and coins:
app.post('/api/updatescore', async (req, res) => {

    // Parse the request body:
    let postData = JSON.parse(JSON.stringify(req.body));
    let userId = postData.userId;
    let score = postData.score;
    let wave = postData.wave;

    log("REQ", `Got an update score request for userId ${userId} with score ${score} and wave ${wave}`); // Log the request

    // Check if the data is valid:
    if (!userId || !score || !wave) {
        res.status(400).json({ message: 'Invalid data' }); // Send status 400 with appropriate JSON-body
        log("RES", "User did not provide enough data.");
        return;
    }

    // Update the last score and coins:
    await updateLastScore(userId, score, wave);

    // Update the high score and coins if necessary:
    await compareLastScores(userId);

    // Update the last played:
    await updateLastPlayed(userId);

    // Send the result to the client:
    res.status(200).json({ message: 'Last score updated' }); // Send status 200 with appropriate JSON-body
    log("RES", `Last score updated for userId ${userId}`); // Log the request
});

// Create a new user:
app.post('/api/createuser', async (req, res) => {

    // Parse the request body:
    let postData = JSON.parse(JSON.stringify(req.body));
    let key = postData.key;
    let name = postData.name;

    log("REQ", `Got a create user request for name ${name}`); // Log the request

    // Check if the user already exists:
    if (await userNameExists(name)) {
        res.status(400).json({ message: 'User already exists' }); // Send status 401 with appropriate JSON-body
        log("RES", `Create new user failed, user ${name} already exists`); // Log the request
        return;
    }

    // Create a new user:
    let userId = await createNewUser(name);

    // Send the result to the client:
    res.status(200).json({ message: 'New user created', userId: userId }); // Send status 200 with appropriate JSON-body
    log("RES", `New user ${name} created with userId ${userId}`); // Log the request
});

/**
 * POST Request handler for retrieving data from a username
 * Request requires the following parameters:
 * 'key': API key
 * 'name' or 'userId: Name or userId of the user to retrieve the data from
 * If either userId or name are present, then we'll return the appropriate data
 * from the database, that is, if the user exists.
 */
app.post('/api/getuser', async (req, res) => {

    // If the parameters 'name' and 'userId' are bot not present, the request will fail.
    if (!req.body.hasOwnProperty('name') && !req.body.hasOwnProperty('userId')) {
        res.status(400).json({ message: 'Invalid data' });
        return;
    }

    // Check whether the user exists
    if (!await userNameExists(req.body.name) && !await userIdExists(req.body.userId)) {
        res.status(400).json({ message: 'User does not exist' });
        return;
    }

    // Retrieve data from the user based on the provided parameters
    let userData = req.body.hasOwnProperty('userId') ?
        await getUserDataFromId(req.body.userId) :
        await getUserDataFromName(req.body.name);

    // Return appropriate response.
    res.status(200).json({ message: 'User data retrieved', userData: userData });
});

// Check if a user exists:
app.post('/api/checkuser', async (req, res) => {

    // Parse the request body:
    let idOrName = req.body.idorname ?? null;

    log("REQ", `Got a check user request for id or name ${idOrName}`); // Log the request

    // Check if the data is valid:
    if (!idOrName) {
        res.status(400).json({ message: 'Invalid data' }); // Send status 400 with appropriate JSON-body
        log("RES", "Invalid data");
        return;
    }

    // Check whether the request is an id or a name:
    let exists;
    if (isNaN(idOrName))
        exists = await userNameExists(idOrName);
    else
        exists = await userIdExists(idOrName);

    // Send the result to the client:
    res.status(200).json({ message: 'User exists', exists: exists }); // Send status 200 with appropriate JSON-body
    log("RES", `User ${idOrName} exists: ${exists}`); // Log the request
});

// Delete a user:
app.post('/api/deleteuser', async (req, res) => {

    // Parse the request body:
    let userId = req.body.userId ?? null;

    log("REQ", `Got a delete user request for userId ${userId}`); // Log the request

    // Check if the data is valid:
    if (!userId) {
        res.status(400).json({ message: 'Invalid data' }); // Send status 400 with appropriate JSON-body
        log("RES", "Invalid data");
        return;
    }

    // Check if the user exists:
    if (!await userIdExists(userId)) {
        res.status(400).json({ message: 'User does not exist' }); // Send status 400 with appropriate JSON-body
        log("RES", `Delete user failed, user ${userId} does not exist`); // Log the request
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
    let userId = req.body.userId ?? null;

    log("REQ", `Got a get lastscore request for userId ${userId}`); // Log the request

    // Check if the data is valid:
    if (!userId) {
        res.status(400).json({ message: 'Invalid data' }); // Send status 400 with appropriate JSON-body
        log("RES", "Invalid data");
        return;
    }

    // Get the last score and coins:
    let lastScore = await getLastScore(userId); // Get the last score and coins from the database

    // Send the result to the client:
    res.status(200).json({ message: 'Last score retrieved', lastScore: lastScore }); // Send status 200 with appropriate JSON-body
    log("RES", `Last score retrieved for userId ${userId}`); // Log the request
});

// Get high score and coins:
app.post('/api/gethighscore', async (req, res) => {

    // Parse the request body:
    let userId = req.body.userId ?? null;

    log("REQ", `Got a get highscore request for userId ${userId}`); // Log the request

    // Check if the data is valid:
    if (!userId) {
        res.status(400).json({ message: 'Invalid data' }); // Send status 400 with appropriate JSON-body
        log("RES", "Invalid data");
        return;
    }

    // Get the high score and coins:
    let highScore = await getHighScore(userId); // Get the high score and coins from the database

    // Send the result to the client:
    res.status(200).json({ message: 'High score retrieved', highScore: highScore }); // Send status 200 with appropriate JSON-body
    log("RES", `High score retrieved for userId ${userId}`); // Log the request
});

// Get the leaderboards:
app.post('/api/getleaderboards', async (req, res) => {

    // Parse the request body:
    let sortBy = req.body.sortBy;
    let maxResults = req.body.maxResults ?? 10;

    log("REQ", `Got a leaderboards request sorted by ${sortBy} with max results of ${maxResults}`); // Log the request

    // Check if the data is valid:
    if (!maxResults) {
        res.status(400).json({ message: 'Invalid data' }); // Send status 400 with appropriate JSON-body
        log("RES", "Invalid data");
        return;
    }

    // Check whether the 'sortBy' parameter is present in the tables object
    // if this isn't the case, cancel the request.
    if (!Object.keys(tables.highScores).includes(sortBy)) {
        res.status(400).json({ message: 'Invalid sortBy, must be either score or coins' }); // Send status 400 with appropriate JSON-body
        log("RES", "Invalid sortBy");
        return;
    }

    // Get the leaderboards:
    let leaderboards = await getLeaderboards(sortBy, maxResults) // Get the leaderboards from the database

    // Send the result to the client:
    res.status(200).json(leaderboards); // Send status 200 with appropriate JSON-body
    log("RES", `Leaderboards retrieved sorted by ${sortBy} with max results of ${maxResults}`); // Log the request
});

app.get('/*', (req, res) => {
    log("REQ", "wrong URL"); // Log the request
    log("RES", "wrong URL"); // Log the request
    res.status(404).json({ message: 'Wrong URL' }); // Send status 404 with appropriate JSON-body
});


// Default (wrong URL(POST))
app.post('/*', (req, res) => {
    log("REQ", "wrong URL"); // Log the request
    log("RES", "wrong URL"); // Log the request
    res.status(404).json({ message: 'Wrong URL' }); // Send status 404 with appropriate JSON-body
});


// Default (wrong URL(DELETE))
app.delete('/*', (req, res) => {
    log("REQ", "wrong URL"); // Log the request
    log("RES", "wrong URL"); // Log the request
    res.status(404).json({ message: 'Wrong URL' }); // Send status 404 with appropriate JSON-body
});

/**
 * Start the server on the predefined port.
 * Also check whether all the database tables exist, if they don't, create them.
 */
app.listen(port, async () => {
    console.log(`API Server started on port ${port}`);

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