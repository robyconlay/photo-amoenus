const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");

const Favourites = require('./models/favouriteScheme');
const authentication = require('./middleware/authentication.js');

/**
 * get all favourites of all users
 */
router.get('/all', (req, res) => {
    Favourites.find()
        .select("_id favourites")
        .exec()
        .then(docs => {
            if (!docs) {
                res.status(404).json({
                    message: 'Error retrieving favourites'
                });
            } else {
                res.status(200).json(docs);
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

/**
 * get favourites of 1 user
 */
router.get('/', authentication, (req, res) => {
    var id = req.userData.userId;

    Favourites.findOne({ _id: id })
        .select("_id favourites")
        .exec()
        .then(data => {
            if (data == null || data.favourites.length == 0) {
                res.status(404).json({
                    message: 'User does not have favourites yet'
                });
            } else {
                res.status(200).json(data);
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

/**
 * expand favourites of a user
 * pass id of locations in body
 */
router.patch('/add/:id', authentication, (req, res) => {
    var locationID = req.params.id;
    var id = req.userData.userId;


    Favourites.findOne({ _id: id })
        .exec()
        .then(async data => {
            if (data == null) {
                const favourite = new Favourites({
                    _id: id,
                    favourites: [] //empty array for initialization
                });

                await favourite
                    .save()
                    .catch(err => {
                        return res.status(500).json({
                            error: err,
                            message: "saving error"
                        });
                    });

                Favourites.updateOne({ _id: id }, { $push: { favourites: locationID } })
                    .exec()
                    .then(result => {
                        res.status(200).json({
                            message: "Favourite added with success"
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
            } else {
                if (data.favourites.includes(locationID)) {
                    return res.status(409).json({
                        message: "Location is already in user's favourites"
                    });
                } else {
                    Favourites.updateOne({ _id: id }, { $push: { favourites: locationID } })
                        .exec()
                        .then(result => {
                            res.status(200).json({
                                message: "Favourite added with success"
                            });
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({
                                error: err
                            });
                        });
                }
            }
        });


});

/**
 * delete one in the favourites of the user
 */
router.patch('/remove/:id', authentication, (req, res) => {
    var locationID = req.params.id;
    var id = req.userData.userId;

    Favourites.updateOne({ _id: id }, { $pull: { favourites: locationID } })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Favourite deleted for user'
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
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
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});


/**
 * delete all favourites of the user
 */
router.delete('/', authentication, (req, res) => {
    var id = req.userData.userId;

    Favourites.deleteOne({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'All favourite of a user deleted',
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});


module.exports = router;
