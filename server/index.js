/**
 * This file only change should be app version
 * Start server on environment port or port 8000
 */
require("dotenv").config() //load environment variables

const apiPath = './api/v3/app';

const http = require('http');
const app = require(apiPath);

const port = process.env.PORT || 8000;

const server = http.createServer(app);

server.listen(port, () => {
    console.log("\x1b[34m");
    console.log(`Starting server on port ${port}`);
    console.log(`The current api path is ${apiPath}`);
    console.log("\x1b[0m");
});