const express = require('express');
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");

const authentication = require('./middleware/authentication.js');

const User = require("./models/userScheme");

const router = express.Router();

router.get('/', (req, res) => {
    User.find()
        .select('_id email password')
        .exec()
        .then(docs => {
            if (!docs) {
                console.log('Errore nel trovare gli user');
                res.status(404).json({
                    message: 'Error retrieving users'
                });
            }
            res.status(200).json({
                users: docs
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
 * function for admin use only
 */
router.get('/:id', (req, res) => {
    User.findOne({ _id: req.params.id })
        .select('_id email password')
        .exec()
        .then(docs => {
            if (!docs) {
                console.log('Error in retrieving user');
                res.status(404).json({
                    message: 'Error retrieving users'
                });
            }
            res.status(200).json(docs);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post('/signup', (req, res, next) => {
    var id;
    if (req.body._id == null) {
        id = new mongoose.Types.ObjectId;
    } else {
        id = req.body._id;
    }
    User.findOne({ email: req.body.email })
        .exec()
        .then(user => {
            bcryptjs.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({
                        message: err
                    });
                } else {
                    const user = new User({
                        _id: id,
                        email: req.body.email,
                        password: hash
                    });
                    user
                        .save()
                        .then(result => {
                            console.log(result);
                            res.status(201).json({
                                message: 'User created'
                            });
                        })
                        .catch(err => {
                            res.status(422).json({
                                message: err + 'User with email ' + req.body.email + ' already exists'
                            });
                        });
                }
            });

        })
});


router.post("/login", (req, res, next) => {
    if (req.body.email == '' || req.body.email == null) {
        return res.status(500).json({
            message: 'No email sent'
        })
    }
    if (req.body.password == '' || req.body.password == null) {
        return res.status(500).json({
            message: 'No password sent'
        })
    }
    User.findOne({ email: req.body.email })
        .exec()
        .then(user => {
            bcryptjs.compare(req.body.password, user.password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: "Auth failed"
                    });
                }
                if (result) {
                    const token = jwt.sign(
                        {
                            email: user.email,
                            userId: user._id
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "1h"
                        }
                    );
                    return res.status(200).json({
                        message: "Auth successful",
                        token: token,
                        uid: user._id
                    });
                }
                res.status(401).json({
                    message: "Auth failed"
                });
            });
        })
        .catch(err => {
            console.log('Not exists user with this email, AUTH FAILED');
            res.status(401).json({
                error: err + 'Not exists user with this email'
            });
        });
});

/**
 * api to be used from a user to delete their account
 */
router.delete("/", authentication, (req, res, next) => {
    //also doable with email address
    id = req.userData.uid;
    if (mongoose.isValidObjectId(id)) {
        User.remove({ _id: id })
            .exec()
            .then(result => {
                res.status(201).json({
                    message: 'User deleted'
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
    } else {
        res.status(404).json({
            message: 'No Id passed'
        })
    }
});

/**
 * admin function to delete user
 */
router.delete("/:id", (req, res, next) => {
    id = req.params.id;
    if (mongoose.isValidObjectId(id)) {
        User.remove({ _id: id })
            .exec()
            .then(result => {
                res.status(201).json({
                    message: 'User deleted'
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
    } else {
        res.status(404).json({
            message: 'No Id passed'
        })
    }
});


module.exports = router;
