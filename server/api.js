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

/*==============================================================*\
|                           API Calls                            |
\*==============================================================*/

// Get all highscores
app.get('/api/get', async (req, res) => {
  const conn = await pool.getConnection();
  result = await conn.execute("SELECT * FROM highscores;");

  console.log(result);
  res.json(result);
  return;
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