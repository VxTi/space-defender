const express = require('express');
const app = express();
const mssql = require("mysql");

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
      console.log(retrievedData);

      // Close the database connection
      connection.end();

      // Send a success response
      res.send('Data retrieved from the database and stored in a variable. Check the server console for the data.');
    });
  });
});

let server = app.listen(5000, function () {
  console.log('Server is listening at port 5000...');
});
