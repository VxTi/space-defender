/*
  Nodejs Server for hosting the website.

 */

const port = 8080;

const express = require('express');
const { uuid } = require('uuidv5');
const mssql = require("mysql");
const app = express();
const cors = require('cors');
import { getData } from './database';

app.use(express.static('../web/'));
app.use(express.json());
app.use(cors({
    origin: '*'
}));

/* Startup the server on the predefined port at address 0.0.0.0 */
let server = app.listen(port, `0.0.0.0`, () => {
    console.log(`Server has started on port ${server.address().address}:${port}`);

});

// Get request
app.get('/', function (req, res) {

  // Config your database credential
  const config = {
    user: 'koopenj',
    password: 'pSmwQExG/1rux.',
    server: 'oege.ie.hva.nl',
    database: 'zkoopenj'
  };

  // Connect to your database
  const connection = mssql.createConnection(config);

  connection.connect(function (err) {
    if (err) {
      console.error('Error connecting to database:', err);
      return;
    }

    // Query to the database and get the records
    connection.query('SELECT * FROM `highscores` WHERE tom = 1', function (err, records) {

      if (err) {
        console.error('Error querying database:', err);
        connection.end(); // Close the database connection
        return;
      }

      // Here, 'records' contains the data retrieved from the database
      // You can use it in your code as needed
      // For example, let's store it in a variable and log it
      const retrievedData = records;
      console.log(`Retrieved data: ${retrievedData}`);

      // Close the database connection
      connection.end();

      // Send a success response
      res.send('Data retrieved from the database and stored in a variable. Check the server console for the data.');
    });
  });
});
