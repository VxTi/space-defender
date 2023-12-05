var mysql = require('mysql');

var con = mysql.createConnection({
  host: "https://oege.ie.hva.nl/",
  user: "koopenj",
  password: "pSmwQExG/1rux."
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query("CREATE DATABASE mydb", function (err, result) {
    if (err) throw err;
    console.log("Database created");
  });
});