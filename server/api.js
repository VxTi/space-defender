const express = require('express');
const app = express();
const mysql = require("mysql2/promise");
const bodyParser = require('body-parser');
const cors = require('cors');

// Parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Config your database credential
const pool = mysql.createPool({
  user: 'koopenj',
  password: 'pSmwQExG/1rux.',
  host: 'oege.ie.hva.nl',
  port: 3306,
  database: 'zkoopenj',
  insecureAuth: false,
  ssl: { rejectUnauthorized: false },
  connectionLimit: 10
});

/*========================*\
|        API Calls         |
\*========================*/

// Get user data of a specific user
app.get('/api/get/user', async (req, res) => {
  let postData = JSON.stringify(req.body);
  let parsedData = JSON.parse(postData);

  let name = parsedData.name;

  console.log(`Got a GET request for user data of: ${name}`);
  try {
    const conn = await pool.getConnection();
    result = await conn.execute(`SELECT * FROM ${name};`);
    conn.release();
    res.status(200); // HTTP Status 200: OK
  } catch (err) {
    res.status(500); // HTTP Status 500: Internal Server Error
    result = [{ message: 'Error' }, { error: err }];
  }
  res.json(result);
  return;
});

// Create a table
app.post('/api/post/new', async (req, res) => {
  let postData = JSON.stringify(req.body);
  let parsedData = JSON.parse(postData);
  let data;

  let name = parsedData.name;

  console.log(`Got a POST request for a new table for user: ${name}`);

  try {
    const conn = await pool.getConnection();
    result = await conn.execute(
      `CREATE TABLE ${name}(
         name VARCHAR(255),
         time TIME,
         date DATE,
         highscore INT,
         coins INT);`);

    await conn.execute(`ALTER TABLE \`${name}\` CHANGE \`time\` \`time\` TIME NULL DEFAULT '00:00:00';`);
    await conn.execute(`ALTER TABLE \`${name}\` CHANGE \`date\` \`date\` DATE NULL DEFAULT '1970-01-01';`);
    conn.release();
    res.status(201); // HTTP Status 201: Created
    data = [{ message: 'Message received' }];
  } catch (err) {
    res.status(500); // HTTP Status 500: Internal Server Error
    data = [{ message: 'Error' }, { error: err }];
  }
  res.json(data);
});

// Insert into a table
app.post('/api/post/insert', async (req, res) => {
  console.log("Got a POST request");

  let postData = JSON.stringify(req.body);
  let parsedData = JSON.parse(postData);
  let data;

  let currentDate = new Date();
  let day = currentDate.getDate(); // Get the day of the month
  let month = currentDate.getMonth() + 1; // Get the month (0-11, so add 1 to get 1-12)
  let year = currentDate.getFullYear(); // Get the year
  let hours = currentDate.getHours(); // Get the hours
  let minutes = currentDate.getMinutes(); // Get the minutes
  let seconds = currentDate.getSeconds(); // Get the seconds

  let name = parsedData.name;
  let time = `${hours}:${minutes}:${seconds}`; // Format the time
  let date = `${year}-${month}-${day}`; // Format the date
  let highscore = parsedData.highscore;
  let coins = parsedData.coins;

  try {
    const conn = await pool.getConnection();
    result = await conn.execute(
      `INSERT INTO ${name} (name, time, date, highscore, coins)
        VALUES ('${name}', '${time}', '${date}', '${highscore}', '${coins}');`);
    conn.release();
    res.status(202); // HTTP Status 202: Accepted
    data = [{ message: 'Message received' }];
  } catch (err) {
    res.status(500); // HTTP Status 500: Internal Server Error
    data = [{ message: 'Error' }, { error: err }];
  }
  res.json(data);
});

// Test the API
app.get('/api/test', (req, res) => {
  const data = [{ message: 'API Success' }, { success: true }];
  res.status(200); // HTTP Status 200: OK
  res.json(data);
});

// Default
app.get('/*', (req, res) => {
  const data = [{ message: 'Wrong URL' }];
  res.status(404); // HTTP Status 404: Not Found
  res.json(data);
});

app.listen(8080, () => {
  console.log('Server is listening at port 8080...');
});

// Database query, addition, deletion, update,

// SQL: NAAM, TIJD, DATUM, HIGHSCORE, COINS