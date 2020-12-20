/**
 * This file only change should be app version
 * Start server on environment port or port 8000
 */
require("dotenv").config() //load environment variables


const http = require('http');
const app = require('./api/v3/app');

const port = process.env.PORT || 8000;

const server = http.createServer(app);

server.listen(port, () => {
    console.log('Server listening on port '+ port);
});