const express = require('express');
const app = express();

app.use(require("cors")({ origin: '*' }));

// Which port to host the server on
const port = 8080;

// How many requests can be made per connection per timeframe
const rateLimit = 100;

// Direct the user automatically to 'index.html' inside /web/
app.use(express.static("../web/"));

// Add rate limiting to every request made from Client to Server.
app.use(require('express-rate-limit')({
    windowMs: 1000, // Milliseconds per window. (1 second)
    max: rateLimit,
    message: '[{"message": "You have exceeded your API rate limit. Please slow down."}]'
}));


/*
 * Start the server on the pre-defined port (default: 8080)
 */
app.listen(port, () => {
    console.log(`Web Server started on port ${port}`);
});