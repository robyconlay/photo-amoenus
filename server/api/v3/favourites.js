//libraries
const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");

const Favourites = require('./models/favouriteScheme');
const authentication = require('./middleware/authentication.js');

//variables
const route = '/api/favourites/';


/**
 * get all favourites of all users
 */
router.get('/all', (req, res) => {
    const subroute = route + 'all';
    const requestType = 'GET';

    Favourites.find()
        .select("_id favourites")
        .exec()
        .then(data => {
            if (data) {
                res.status(200).json({
                    data,
                    message: 'Success retrieving favourites',
                    route,
                    subroute,
                    requestType,
                    description: 'Description'
                });
            } else {
                res.status(404).json({
                    message: 'Error retrieving favourites',
                    route,
                    subroute,
                    requestType,
                    description: 'No favourites exist'
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err,
                message: 'Error retrieving favourites',
                route,
                subroute,
                requestType,
                description: 'Error fetching data from database'
            });
        });
});

/**
 * get favourites of 1 user
 */
router.get('/', authentication, (req, res) => {
    var uid = req.userData.uid;

    Favourites.findOne({ _id: uid })
        .select("_id favourites_ids")
        .exec()
        .then(data => {
            if (data && data.favourites_ids.length != 0) {
                res.status(200).json({
                    data,
                    message: `Success retrieving favourites for user with id: ${uid}`,
                    route: '/api/favourites/',
                    requestType: 'GET',
                    required: "user token",
                    description: 'retrieve favourites using token'
                });
            } else {
                res.status(404).json({ //review
                    message: 'User does not have favourites yet',
                    route: '/api/favourites/',
                    requestType: 'GET',
                    required: "user token",
                    description: 'User has not added favourites yet or has removed all of them'
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err,
                message: 'Error retrieving favourites',
                route: '/api/favourites/',
                requestType: 'GET',
                required: "user token",
                description: 'Error fetching data from database'
            });
        });
});

/**
 * expand favourites of a user
 * pass id of locations in body
 */
router.post('/add/:id', authentication, (req, res) => {
    var locationID = req.params.id;
    var uid = req.userData.userId;

    Favourites.findOne({ _id: uid })
        .exec()
        .then(async data => {
            if (!data) {
                //create favourites
                const favourite = new Favourites({
                    _id: uid,
                    favourites_ids: [], //empty array for initialization
                    createdAt: new Date(),
                    updatedAt: null
                });

                await favourite
                    .save()
                    .catch(error => {
                        return res.status(500).json({
                            error,
                            message: 'Error saving favourites',
                            route: '/api/favourites/:id',
                            requestType: 'POST',
                            required: "user token",
                            description: 'Error saving data to database'
                        });
                    });
            } else {
                if (data.favourites.includes(locationID)) {
                    return res.status(409).json({
                        message: "Location is already in user's favourites",
                        route: '/api/favourites/:id',
                        requestType: 'POST',
                        required: "user token",
                        description: 'Duplicate ID'
                    });
                }
            }
        });

    Favourites.updateOne({ _id: id }, { $push: { favourites: locationID, updatedAt: new Date() } })
        .exec()
        .then(result => {
            res.status(200).json({
                result,
                message: "Favourite added with success",
                route: '/api/favourites/:id',
                requestType: 'POST',
                required: "user token",
                description: 'Favourites updated with success'
            });
        })
        .catch(error => {
            res.status(500).json({
                error,
                message: "Error updating favourites",
                route: '/api/favourites/:id',
                requestType: 'POST',
                required: "user token",
                description: 'Error updating database'
            });
        });

});

/**
 * delete one in the favourites of the user
 */
router.delete('/remove/:id', authentication, (req, res) => {
    var locationID = req.params.id;
    var uid = req.userData.userId;

    Favourites.updateOne({ _id: uid }, { $pull: { favourites: locationID } })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Favourite deleted for user',
                result,
                route: '/api/remove/:id',
                requestType: 'DELETE',
                required: "user token",
                description: 'Success deleting favourite'
            });
        })
        .catch(error => {
            res.status(500).json({
                error,
                message: 'Error deleting favourites of user',
                route: '/api/remove/:id',
                requestType: 'DELETE',
                required: "user token",
                description: 'Error updating database'
            });
        });
});

/**
 * delete all favourites in table
 */
router.delete('/all', (req, res) => {
    Favourites.deleteMany({})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'All favourites deleted',
                route: '/api/remove/all',
                requestType: 'DELETE',
                description: 'Success deleting entry in database'
            });
        })
        .catch(error => {
            res.status(500).json({
                error,
                message: 'Error deleting favourites',
                route: '/api/remove/all',
                requestType: 'DELETE',
                description: 'Error deleting entry in database'
            });
        });
});


/**
 * delete all favourites of the user
 */
router.delete('/', authentication, (req, res) => {
    var uid = req.userData.userId;

    Favourites.deleteOne({ _id: uid })
        .exec()
        .then(result => {
            res.status(200).json({
                message: `All favourite of a user deleted with uid: ${uid}`,
                route: '/api/remove/all',
                requestType: 'DELETE',
                required: "user token",
                description: 'Success deleting entry in database'
            });
        })
        .catch(error => {
            res.status(500).json({
                error,
                message: 'Error deleting favourites of user',
                route: '/api/remove/:id',
                requestType: 'DELETE',
                required: "user token",
                description: 'Error updating database'
            });
        });
});


module.exports = router;