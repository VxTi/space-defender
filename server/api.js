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

// Log requests with formatting:
function consoleLog(request, description) {
  let date = new Date();
  console.log(`[${date.toLocaleDateString()} ${date.toLocaleTimeString()}]: Retrieved ${request} request for ${description}`);
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
  res.json(result[0]); // Send the response, only send the data, not the metadata
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
  consoleLog("GET", "the highest score"); // Log the request

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
  consoleLog("GET", "leaderboard score"); // Log the request

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
  consoleLog("GET", "leaderboard coins"); // Log the request

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

  consoleLog("POST", `inserting user data for: ${name}`); // Log the request

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

  // Get the data from the request:
  let postData = JSON.stringify(req.body);
  let parsedData = JSON.parse(postData);

  // Get the data from the parsed data:
  let name = parsedData.name;

  consoleLog("DELETE", `deleting user data for: ${name}`); // Log the request

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
  consoleLog("GET", "test"); // Log the request
  const data = [{ message: 'API Success' }];
  res.status(200); // HTTP Status 200: OK
  res.json(data); // Send the response
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