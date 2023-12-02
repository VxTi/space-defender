/*
  Nodejs Server for hosting the website.

 */

const port = 8080;

const express = require('express');
const { uuid } = require('uuidv5');
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

