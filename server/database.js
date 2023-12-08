const express = require('express');
const app = express();
const mysql = require("mysql2/promise");

// Config your database credential
const pool = mysql.createPool({
  user: 'koopenj',
  password: 'pSmwQExG/1rux.',
  host: 'oege.ie.hva.nl',
  port: 3306,
  database: 'zkoopenj',
  insecureAuth: false,
  ssl: { rejectUnauthorized: false },
  connectionLimit: 10 // Set your desired connection limit
});

// Get request
app.get('/', async (req, res) => {
  try {
    // Get a connection from the pool
    const conn = await pool.getConnection();

    // Query the database and get the records
    const [rows] = await conn.query('SELECT * FROM `highscores` WHERE tom = 1');

    // Release the connection back to the pool
    conn.release();

    // Here, 'rows' contains the data retrieved from the database
    // You can use it in your code as needed
    // For example, let's log it
    console.log(`Raw data retrieved: ${rows}`);
    console.log(`Retrieved data: ${JSON.stringify(rows)}`);

    // Send a success response
    res.send('Data retrieved from the database. Check the server console for the data.');
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send('Error retrieving data from the database'); // HTTP Code 500, internal server error
  }
});

app.listen(8080, () => {
  console.log('Server is listening at port 8080...');
});


// TODO:
// Functies maken om sql queries te maken.