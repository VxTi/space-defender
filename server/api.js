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

  let time = `${hours}:${minutes}:${seconds}`; // Format the time

  return time;
}

// Get the date:
function getDate() {
  let currentDate = new Date();
  let day = currentDate.getDate(); // Get the day of the month
  let month = currentDate.getMonth() + 1; // Get the month (0-11, so add 1 to get 1-12)
  let year = currentDate.getFullYear(); // Get the year

  let date = `${year}-${month}-${day}`; // Format the date

  return date;
}

/*========================*\
|        API Calls         |
\*========================*/

// Get user data of a specific user
api.get('/api/get/user', async (req, res) => {
  // Get the data from the request:
  let postData = JSON.stringify(req.body);
  let parsedData = JSON.parse(postData);

  // Get the data from the parsed data:
  let name = parsedData.name;

  console.log(`Got a GET request for user data of: ${name}`); // Log the request

  try {
    const conn = await pool.getConnection(); // Get a connection from the pool
    let sql = `SELECT * FROM ??;`; // SQL query
    let inserts = [name]; // Using the ?? to prevent SQL injection
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



// Create a new table for a new user
api.post('/api/post/new', async (req, res) => {
  let postData = JSON.stringify(req.body);
  let parsedData = JSON.parse(postData);

  // Get the data from the parsed data:
  let name = parsedData.name;
  let data;

  console.log(`Got a POST request for a new table for user: ${name}`); // Log the request

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
    data = [{ message: 'Message received' }];
  } catch (err) {
    res.status(500); // HTTP Status 500: Internal Server Error
    data = [{ message: 'Error' }, { error: err }];
  }
  res.json(data); // Send the response
});



// Update user data
api.post('/api/post/insert', async (req, res) => {
  console.log("Got a POST request for inserting user data"); // Log the request

  // Get the data from the request:
  let postData = JSON.stringify(req.body);
  let parsedData = JSON.parse(postData);
  let data;

  // Get the data from the parsed data:
  let name = parsedData.name;
  let time = getTime();
  let date = getDate();
  let highscore = parsedData.highscore;
  let coins = parsedData.coins;

  try {
    // Make a connection to the database:
    const conn = await pool.getConnection(); // Get a connection from the pool
    let sql = `INSERT INTO ?? (name, time, date, highscore, coins) VALUES (?, ?, ?, ?, ?);`; // SQL query
    let inserts = [name, name, time, date, highscore, coins]; // Using the ?? to prevent SQL injection
    sql = mysql.format(sql, inserts); // Format the SQL query
    result = await conn.query(sql); // Execute the query
    conn.release(); // Release the connection

    // Send a response:
    res.status(202); // HTTP Status 202: Accepted
    data = [{ message: 'Message received' }];
  } catch (err) {
    res.status(500); // HTTP Status 500: Internal Server Error
    data = [{ message: 'Error' }, { error: err }];
  }
  res.json(data); // Send the response
});



// Test the API
api.get('/api/test', (req, res) => {
  const data = [{ message: 'API Success' }, { success: true }];
  res.status(200); // HTTP Status 200: OK
  res.json(data); // Send the response
});



// Default (wrong URL) 
api.get('/*', (req, res) => {
  const data = [{ message: 'Wrong URL' }];
  res.status(404); // HTTP Status 404: Not Found
  res.json(data); // Send the response
});

api.listen(8080, () => {
  console.log('Server is listening at port 8080...');
});

// Database query, addition, deletion, update,

// SQL: NAAM, TIJD, DATUM, HIGHSCORE, COINS