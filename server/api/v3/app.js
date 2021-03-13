//libraries
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const path = require('path');
const rfs = require('rotating-file-stream'); // version 2.x
const cookieParser = require('cookie-parser');

// const winston = require('winston');
// const expressWinston = require('express-winston');

var app = express();

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
app.use(cookieParser(process.env.COOKIE_SECRET));

app.set("view engine", "ejs");


mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .catch(error => {
        console.log({
            message: "Failed to connect to MongoDB",
            error
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

app.use((req, res, next) => {
    const { originalUrl, params, query, body, signedCookies, _startTime, _remoteAddress } = req;
    console.log(originalUrl, params, query, body, signedCookies, _startTime, _remoteAddress);
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


//user routes
const user_locationsRoutes = require('./userRoutes/locations.js');
app.use('/api/locations', user_locationsRoutes);

const user_favouritesRoutes = require('./userRoutes/favourites.js');
app.use('/api/favourites', user_favouritesRoutes);

const user_accountRoutes = require('./userRoutes/account.js');
app.use('/api/account', user_accountRoutes);


//admin routes
const admin_adminsRoutes = require('./adminRoutes/admins.js');
app.use('/api/admin/admins', admin_adminsRoutes);

const admin_locationsRoute = require('./adminRoutes/locations.js');
app.use('/api/admin/locations', admin_locationsRoute);

const admin_favouritesRoutes = require('./adminRoutes/favourites.js');
app.use('/api/admin/favourites', admin_favouritesRoutes);

const admin_usersRoutes = require('./adminRoutes/users.js');
app.use('/api/admin/users', admin_usersRoutes);


// app.use(expressWinston.errorLogger({
//     transports: [
//         new winston.transports.Console()
//     ],
//     format: winston.format.combine(
//         winston.format.colorize(),
//         winston.format.json()
//     )
// }));


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