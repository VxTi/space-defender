/*========================*\
|Global variables, settings|
\*========================*/


// Libraries
const express = require('express');
const api = express();
const mysql = require("mysql2/promise");
const bodyParser = require('body-parser');
const cors = require('cors');

// Parse JSON and URL-encoded data
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({ extended: true }));
api.use(cors());

// Database connection
const pool = mysql.createPool({
  user: 'koopenj',
  password: 'pSmwQExG/1rux.',
  host: 'oege.ie.hva.nl',
  port: 3306,
  database: 'zkoopenj',
  insecureAuth: false,
  ssl: { rejectUnauthorized: false }, // Necessary to connect to the database!!!
  connectionLimit: 10
});

/*========================*\
|        Functions         |
\*========================*/

// Get the time:
function getTime() {
  let currentDate = new Date();
  let hours = currentDate.getHours(); // Get the hours
  let minutes = currentDate.getMinutes(); // Get the minutes
  let seconds = currentDate.getSeconds(); // Get the seconds

  // Format the time properly (add a 0 if the hours, minutes or seconds contains only 1 digit):
  if (hours < 10) { hours = `0${hours}`; } // Add a 0 if the hours are less than 10
  if (minutes < 10) { minutes = `0${minutes}`; } // Add a 0 if the minutes are less than 10
  if (seconds < 10) { seconds = `0${seconds}`; } // Add a 0 if the seconds are less than 10

  let time = `${hours}:${minutes}:${seconds}`; // Format the time

  return time;
}

// Get the date (US):
function getDateUS() {
  let currentDate = new Date();
  let day = currentDate.getDate(); // Get the day of the month
  let month = currentDate.getMonth() + 1; // Get the month (0-11, so add 1 to get 1-12)
  let year = currentDate.getFullYear(); // Get the year

  // MySQL uses the American date format (YYYY-MM-DD), unfortunately...
  let date = `${year}-${month}-${day}`; // Format the date (YYYY-MM-DD) (Amerikaanse notatie, American notation)

  return date;
}

// Get the date (NL):
function getDateNL() {
  let currentDate = new Date();
  let day = currentDate.getDate(); // Get the day of the month
  let month = currentDate.getMonth() + 1; // Get the month (0-11, so add 1 to get 1-12)
  let year = currentDate.getFullYear(); // Get the year

  let date = `${day}-${month}-${year}`; // Format the date (DD-MM-YYYY) (Nederlandse notatie, Dutch notation)

  return date;
}

// Log requests with formatting:
function consoleLog(request, description) {
  // Get the time and date:
  let time = getTime();
  let date = getDateNL();

  // Log the request:
  console.log(`[${time}, ${date}]: Got a ${request} request for ${description}.`);
}

/*========================*\
|        API Calls         |
\*========================*/

// Get user data of all users
api.get('/api/get/allusers', async (req, res) => {
  consoleLog("GET", "all user data"); // Log the request

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
  res.json(result); // Send the response
  return;
});

// Get user data of a specific user
api.get('/api/get/user', async (req, res) => {

  // Get the data from the request:
  let postData = JSON.stringify(req.body);
  let parsedData = JSON.parse(postData);

  // Get the data from the parsed data:
  let name = parsedData.name;

  consoleLog("GET", `user data for user: ${name}`); // Log the request

  try {
    const conn = await pool.getConnection(); // Get a connection from the pool
    let sql = `SELECT * FROM \`userdata\` WHERE name = ?;`; // SQL query
    let inserts = [name]; // Using the ? to prevent SQL injection
    sql = mysql.format(sql, inserts); // Format the SQL query
    result = await conn.query(sql); // Execute the query

    conn.release(); // Release the connection
    res.status(200); // HTTP Status 200: OK
  } catch (err) {
    res.status(500); // HTTP Status 500: Internal Server Error
    result = [{ message: 'Error' }, { error: err }];
  }
  res.json(result); // Send the response
  return;
});

// Get the user with the highest score
api.get('/api/get/highscore', async (req, res) => {
  consoleLog("GET", "the highest score"); // Log the request

  try {
    const conn = await pool.getConnection(); // Get a connection from the pool
    let sql = `SELECT MAX(highscore) FROM \`userdata\`;`; // SQL query
    maxresult = await conn.query(sql); // Execute the query

    // Now get the name of the user with the highest score:
    let highscore = maxresult[0][0]['MAX(highscore)']; // Get the highest score
    let sql2 = `SELECT name FROM \`userdata\` WHERE highscore = ?;`; // SQL query
    let inserts = [highscore]; // Using the ? to prevent SQL injection
    sql2 = mysql.format(sql2, inserts); // Format the SQL query
    result = await conn.query(sql2); // Execute the query

    conn.release(); // Release the connection
    res.status(200); // HTTP Status 200: OK

    // Combine the results:
    resultJson = JSON.parse(JSON.stringify(result[0][0])); // Convert the result to JSON
    maxresultJson = JSON.parse(JSON.stringify(maxresult[0][0])); // Convert the result to JSON
    resultJson['MAX(highscore)'] = maxresultJson['MAX(highscore)']; // Add the highscore to the result
    result = resultJson; // Set the result to the combined result

  } catch (err) {
    res.status(500); // HTTP Status 500: Internal Server Error
    result = [{ message: 'Error' }, { error: err }];
  }
  res.json(result); // Send the response
  return;
});

// Get the user with the most coins
api.get('/api/get/mostcoins', async (req, res) => {
  consoleLog("GET", "the most coins"); // Log the request

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

  } catch (err) {
    res.status(500); // HTTP Status 500: Internal Server Error
    result = [{ message: 'Error' }, { error: err }];
  }
  res.json(result); // Send the response
  return;
});

// Create a new table (SHOULD ONLY BE USED ONCE)
api.post('/api/post/newtable', async (req, res) => {

  // Get the data from the request:
  let postData = JSON.stringify(req.body);
  let parsedData = JSON.parse(postData);

  // Get the data from the parsed data:
  let name = parsedData.name;
  let data;

  consoleLog("POST", `a new table ${name}`); // Log the request

  try {
    const conn = await pool.getConnection(); // Get a connection from the pool

    // Create a new table for the user:
    let createTableSql = `CREATE TABLE ?? (
                            name VARCHAR(255),
                            time TIME,
                            date DATE,
                            highscore INT,
                            coins INT);`;

    let createTableInserts = [name]; // Using the ?? to prevent SQL injection
    createTableSql = mysql.format(createTableSql, createTableInserts); // Format the SQL query
    result = await conn.query(createTableSql); // Execute the query

    // Set time and date to default values:
    let alterTimeSql = `ALTER TABLE ?? CHANGE \`time\` \`time\` TIME NULL DEFAULT '00:00:00';`; // SQL query
    let alterTimeInserts = [name]; // Using the ?? to prevent SQL injection
    alterTimeSql = mysql.format(alterTimeSql, alterTimeInserts); // Format the SQL query
    await conn.query(alterTimeSql); // Execute the query

    let alterDateSql = `ALTER TABLE ?? CHANGE \`date\` \`date\` DATE NULL DEFAULT '1970-01-01';`; // SQL query
    let alterDateInserts = [name]; // Using the ?? to prevent SQL injection
    alterDateSql = mysql.format(alterDateSql, alterDateInserts); // Format the SQL query
    await conn.query(alterDateSql); // Execute the query

    conn.release(); // Release the connection
    res.status(201); // HTTP Status 201: Created
    data = [{ message: 'Table created' }];
  } catch (err) {
    res.status(500); // HTTP Status 500: Internal Server Error
    data = [{ message: 'Error' }, { error: err }];
  }
  res.json(data); // Send the response
});



// Insert user data
api.post('/api/post/insert', async (req, res) => {

  // Get the data from the request:
  let postData = JSON.stringify(req.body);
  let parsedData = JSON.parse(postData);
  let data;

  // Get the data from the parsed data:
  let name = parsedData.name;
  let time = getTime();
  let date = getDateUS();
  let highscore = parsedData.highscore;
  let coins = parsedData.coins;

  consoleLog("POST", `inserting user data for: ${name}`); // Log the request

  try {
    // Make a connection to the database:
    const conn = await pool.getConnection(); // Get a connection from the pool
    let sql = `INSERT INTO userdata (name, time, date, highscore, coins) VALUES (?, ?, ?, ?, ?);`; // SQL query
    let inserts = [name, time, date, highscore, coins]; // Using the ? to prevent SQL injection
    sql = mysql.format(sql, inserts); // Format the SQL query
    result = await conn.query(sql); // Execute the query
    conn.release(); // Release the connection

    // Send a response:
    res.status(202); // HTTP Status 202: Accepted
    data = [{ message: 'Data inserted' }];
  } catch (err) {
    res.status(500); // HTTP Status 500: Internal Server Error
    data = [{ message: 'Error' }, { error: err }];
  }
  res.json(data); // Send the response
});

// Delete all user data
api.delete('/api/delete/table', async (req, res) => {

  consoleLog("DELETE", `deleting all user data`); // Log the request

  try {
    const conn = await pool.getConnection(); // Get a connection from the pool
    let sql = `DELETE FROM \`userdata\`;`; // SQL query
    await conn.query(sql); // Execute the query

    result = [{ message: 'Table deleted' }]
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
  consoleLog("GET", "test"); // Log the request
  const data = [{ message: 'API Success' }];
  res.status(200); // HTTP Status 200: OK
  res.json(data); // Send the response
});



// Default (wrong URL) 
api.get('/*', (req, res) => {
  consoleLog("GET", "wrong URL"); // Log the request
  const data = [{ message: 'Wrong URL' }];
  res.status(404); // HTTP Status 404: Not Found
  res.json(data); // Send the response
});

api.post('/*', (req, res) => {
  consoleLog("POST", "wrong URL"); // Log the request
  const data = [{ message: 'Wrong URL' }];
  res.status(404); // HTTP Status 404: Not Found
  res.json(data); // Send the response
});

api.listen(8080, () => {
  consoleLog("LISTEN", "running server on port 8080"); // Log the request
});

// Database query, addition, deletion, update,

// SQL: NAAM, TIJD, DATUM, HIGHSCORE, COINS