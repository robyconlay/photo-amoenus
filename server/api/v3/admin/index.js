const express = require('express');
const app = express();

const locationsRoute = require('./locations.js');
app.use('/locations', locationsRoute);

const favouritesRoute = require('./favourites.js');
app.use('/favourites', favouritesRoute);

const usersRoute = require('./users.js');
app.use('/users', usersRoute);

const reportRoute = require('./report.js');
app.use('/report', reportRoute);

app.use((req, res, next) => {
    const error = new Error('URL not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});


module.exports = app;