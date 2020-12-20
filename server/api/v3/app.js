const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");

const app = express();

app.use(morgan('dev'));
app.use(express.static('uploads'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

mongoose.connect(process.env.DB_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
)
    .catch(err => {
        console.log(err);
    });
mongoose.Promise = global.Promise;

//Header che permettono al server e client di lavorare da porte diverse
//Grazie agli header controllo i CORS error
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');//Asterisco dà accesso a tutto
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');//Specifico dove posso utilizzarli
    if (req.method === 'OPTIONS') {
        req.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});


app.use('/', express.static('../../../client/build'));     //default path

/* Moduli per la gestione delle richieste alle API */
const locationsRoute = require('./locations.js');
app.use('/api/locations', locationsRoute);      //operations on locations

const favouritesRoutes = require('./favourites.js'); // route for the favourites
app.use('/api/favourites', favouritesRoutes);  // everything that go to /favourites

const userRoutes = require('./users.js'); // route for the registration
app.use('/api/users', userRoutes);  // everything that go to /registration will go to registration.js

const reportRoutes = require('./report.js'); //routes for the report
app.use('/api/reports', reportRoutes);


/*
const checkReports = require('./checkReports.js'); // route to go and check the reports
app.use('/api/checkReports', checkReports);  // everything that go to /checkReports will go to checkReports.js
*/



/* Gestore 404 di default */
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
