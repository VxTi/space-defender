/*
  Nodejs Server for hosting the website.

 */

const port = 8080;

const express = require('express');
const { uuid } = require('uuidv5');
const mysql = require('mysql2');
const app = express();
const cors = require('cors');

app.use(express.static('../web/'));
app.use(express.json());
app.use(cors({
    origin: '*'
}));

/* Startup the server on the predefined port at address 0.0.0.0 */
let server = app.listen(port, `0.0.0.0`, () => {
    console.log(`Server has started on port ${server.address().address}:${port}`);

});
var con = mysql.createConnection({
  host: "oege.ie.hva.nl",
  user: "koopenj@oege.ie.hva.nl",
  password: "pSmwQExG/1rux.",
  database: "zkoopenj",
  port: "3306",

});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query("INSERT INTO highscores (score) VALUES (10000)", function (err, result) {
    if (err) throw err;
    console.log("Database created");
  });
});
