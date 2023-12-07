const express = require('express');
const app = express();
const mssql = require("mysql2/promise");

// Config your database credential
const config = {
  user: 'koopenj',
  password: 'pSmwQExG/1rux.',
  host: 'oege.ie.hva.nl',
  port: 3306,
  database: 'zkoopenj',
  insecureAuth: false,
  ssl: { rejectUnauthorized: false }
};

// Connect to your database
const connection = mssql.createConnection(config).then(async (conn) => {
  await conn.connect();
  return conn;
}).catch((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
})

// Get request
app.get('/', async (req, res) => {

  // Query to the database and get the records

  const conn = await connection

  conn.execute()

  const records = await conn.query('SELECT * FROM `highscores` WHERE tom = 1');

  // Here, 'records' contains the data retrieved from the database
  // You can use it in your code as needed
  // For example, let's store it in a variable and log it
  const retrievedData = records[0];
  console.log(`Retrieved data: ${JSON.stringify(retrievedData)}`);

  // Close the database connection
  // connection.end();

  // Send a success response
  res.send('Data retrieved from the database and stored in a variable. Check the server console for the data.');

});

app.listen(8000, function () {
  console.log('Server is listening at port 5000...');
});
