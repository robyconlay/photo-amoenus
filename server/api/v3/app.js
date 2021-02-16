//libraries
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const path = require('path')
const rfs = require('rotating-file-stream') // version 2.x

// const winston = require('winston');
// const expressWinston = require('express-winston');

var app = express()

// create a rotating write stream
var accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, 'log')
})

// setup the logger
// :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"
app.use(morgan('combined', { stream: accessLogStream }))
app.use(express.static('uploads'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");


mongoose.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .catch(err => {
        console.log({
            message: "Failed to connect to MongoDB",
            err
        });
        exit(1);
    });
mongoose.Promise = global.Promise;

//Header che permettono al server e client di lavorare da porte diverse
//Grazie agli header controllo i CORS error
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); //Asterisco dà accesso a tutto
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization'); //Specifico dove posso utilizzarli
    if (req.method === 'OPTIONS') {
        req.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});


app.use('/', express.static('../../../client/build')); //default path


// app.use(expressWinston.logger({
//     transports: [
//         new winston.transports.Console()
//     ],
//     format: winston.format.combine(
//         winston.format.colorize(),
//         winston.format.json()
//     ),
//     meta: true, // optional: control whether you want to log the meta data about the request (default to true)
//     msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
//     expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
//     colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
//     ignoreRoute: function(req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
// }));



/* Moduli per la gestione delle richieste alle API */
const locationsRoute = require('./locations.js');
app.use('/api/locations', locationsRoute); //operations on locations

const favouritesRoutes = require('./favourites.js'); // route for the favourites
app.use('/api/favourites', favouritesRoutes); // everything that go to /favourites

const userRoutes = require('./users.js'); // route for the registration
app.use('/api/users', userRoutes); // everything that go to /registration will go to registration.js

const reportRoutes = require('./report.js'); //routes for the report
// const { exists } = require("./models/userScheme.js");
app.use('/api/reports', reportRoutes);

// const adminRoutes = require('./admin/index.js'); //api for admins
// app.use('/api/admin', adminRoutes);


// app.use(expressWinston.errorLogger({
//     transports: [
//         new winston.transports.Console()
//     ],
//     format: winston.format.combine(
//         winston.format.colorize(),
//         winston.format.json()
//     )
// }));


/*
const checkReports = require('./checkReports.js'); // route to go and check the reports
app.use('/api/checkReports', checkReports);  // everything that go to /checkReports will go to checkReports.js
*/



/* Gestore 404 di default */
app.use((req, res, next) => {
    const error = new Error('The requested URL was not found');
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