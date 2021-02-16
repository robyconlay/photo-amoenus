const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");

const Favourites = require('./models/favouriteScheme');
const adminAuth = require('./middleware/authentication.js');

/**
 * get all favourites of all users
 * @returns void
 */
router.get('/all', adminAuth, (req, res) => {
    Favourites.find()
        .select("_id favourites")
        .exec()
        .then(data => {
            res.status(200).json({
                data,
                message: `success retrieval of favourites of all users`,
                route: '/api/admin/favourites/all',
                type: 'GET',
            });
        })
        .catch(err => {
            res.status(500).json({
                userId: uid,
                message: `error during retrieval of favourites of user ${uid}`,
                route: '/api/admin/favourites/:id',
                type: 'GET',
                error: err
            });
        });
});

/**
 * get favourites of 1 user
 */
router.get('/:id', adminAuth, (req, res) => {
    const uid = req.params.id;
    Favourites.findOne({ _id: uid })
        .select("_id favourites")
        .exec()
        .then(data => {
            res.status(200).json({
                data,
                userId: uid,
                message: `success retrieval of favourites of user ${uid}`,
                route: '/api/admin/favourites/:id',
                type: 'GET',
            });
        })
        .catch(err => {
            res.status(500).json({
                userId: uid,
                message: `error during retrieval of favourites of user ${uid}`,
                route: '/api/admin/favourites/:id',
                type: 'GET',
                error: err
            });
        });
});


/**
 * delete all favourites in table
 */
router.delete('/all', adminAuth, (req, res) => {
    Favourites.deleteMany({})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'All favourites deleted',
                result: result,
                route: '/api/admin/favourites/all',
                type: 'DELETE',
            });
        })
        .catch(err => {
            res.status(500).json({
                userId: uid,
                message: `error during deletion of favourites of all users`,
                route: '/api/admin/favourites/all',
                type: 'DELETE',
                error: err
            });
        });
});


/**
 * delete all favourites of the user
 */
router.delete('/:id', adminAuth, (req, res) => {
    var uid = req.userData.userId;

    Favourites.deleteOne({ _id: uid })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'All favourites of a user deleted',
                userId: uid,
                result: result
            });
        })
        .catch(err => {
            res.status(500).json({
                userId: uid,
                message: `error during deletion of favourites of user ${uid}`,
                route: '/api/admin/favourites/:id',
                type: 'DELETE',
                error: err
            });
        });
});


module.exports = router;