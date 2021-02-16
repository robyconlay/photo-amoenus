//libraries
const express = require('express');
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const cookie = require('cookie');

//database schemas
const userAuth = require('./middleware/authentication.js');
const User = require("./models/userScheme");
const sanitize = require('mongo-sanitize');

const router = express.Router();

router.get('/', (req, res) => { //admin route
    User.find()
        .select('uid email password')
        .exec()
        .then(users => {
            if (!users) {
                return res.status(404).json({
                    message: 'Error retrieving users',
                    route: '/api/users/',
                    requestType: 'GET',
                    description: `There are no users in database`
                });
            }
            return res.status(200).json({
                users,
                message: 'Users retrieved successfully',
                route: '/api/users/',
                requestType: 'GET',
            });
        })
        .catch(error => {
            res.status(500).json({
                error,
                message: 'Error retrieving users',
                route: '/api/users/',
                requestType: 'GET'
            });
        });
});

/**
 * function for admin use only
 */
router.get('/:id', (req, res) => { //admin route
    var uid = req.params.id;

    if (!uid || !mongoose.isValidObjectId(uid)) {
        return res.status(500).json({
            message: 'Error retrieving user',
            route: '/api/users/:id',
            requestType: 'GET',
            required: "user id",
            description: 'Invalid uid'
        });
    }

    User.findOne({ uid })
        .select('uid email password')
        .exec()
        .then(docs => {
            if (!docs) {
                return res.status(404).json({
                    message: 'Error retrieving users'
                });
            }
            return res.status(200).json(docs);
        })
        .catch(error => {
            return res.status(500).json({
                error
            });
        });
});

router.post('/signup', (req, res, next) => {
    var { email, password, name, surname } = req.body;
    email = sanitize(email);

    User.findOne({ email })
        .exec()
        .then(user => {
            if (user) {
                return res.status(409).json({
                    error,
                    route: "/api/users/signup/",
                    requestType: "POST",
                    message: "This email is already registered"
                });
            }
            bcryptjs.hash(password, 10, (error, hash) => {
                if (error) {
                    return res.status(500).json({
                        error,
                        route: "/api/users/signup/",
                        requestType: "POST",
                        message: "Error creating user"
                    });
                } else {
                    const user = new User({
                        uid: new mongoose.Types.ObjectId(),
                        email: email,
                        password: hash,
                        name,
                        surname,
                        createdAt: new Date()
                    });
                    user
                        .save()
                        .then(result => {
                            const token = jwt.sign({
                                    email: user.email,
                                    uid: user.uid
                                },
                                process.env.JWT_KEY, {
                                    expiresIn: "1h"
                                }
                            );
                            res.setHeader('Set-Cookie', cookie.serialize('token', token)); //maxage?
                            res.setHeader('Set-Cookie', cookie.serialize('uid', user.uid));
                            res.status(201).json({
                                message: 'User created',
                                result,
                                route: "/api/users/signup/",
                                requestType: "POST"
                            });
                        })
                        .catch(error => {
                            return res.status(500).json({
                                error,
                                route: "/api/users/signup/",
                                requestType: "POST",
                                message: "Error creating user"
                            });
                        });
                }
            });
        })
});


router.post("/login", (req, res, next) => {
    var email = sanitize(req.body.email);
    var password = req.body.password;

    if (!email || !password || email == "" || password == "") {
        return res.status(500).json({
            message: 'No email or password given',
            route: "/api/users/login",
            requestType: "POST"
        })
    }
    User.findOne({ email })
        .exec()
        .then(user => {
            if (!user) {
                res.status(500).json({
                    message: "User with this email not found",
                    route: "/api/users/login",
                    requestType: "POST"
                })
            } else {
                bcryptjs.compare(password, user.password, (error, result) => {
                    if (error) {
                        return res.status(401).json({
                            message: "Auth failed",
                            route: "/api/users/login",
                            requestType: "POST"
                        });
                    }
                    if (result) {
                        const token = jwt.sign({
                                email: user.email,
                                uid: user.uid
                            },
                            process.env.JWT_KEY, {
                                expiresIn: "1h"
                            }
                        );
                        res.setHeader('Set-Cookie', cookie.serialize('token', token)); //maxage?
                        res.setHeader('Set-Cookie', cookie.serialize('uid', user.uid));
                        return res.status(200).json({
                            message: "Auth successful",
                            token,
                            uid: user.uid,
                            route: "/api/users/login",
                            requestType: "POST"
                        });
                    }
                    return res.status(401).json({
                        message: "Auth failed",
                        route: "/api/users/login",
                        requestType: "POST"
                    });
                });
            }
        })
        .catch(error => {
            return res.status(401).json({
                error,
                message: 'Not exists user with this email',
                route: "/api/users/login",
                requestType: "POST"
            });
        });
});

/**
 * api to be used from a user to delete their account
 */
router.delete("/", userAuth, (req, res, next) => { //needs to cascade delete everything else related to this account
    var email = sanitize(req.userData.email);

    if (!email || email == "") {
        return res.status(500).json({
            message: "No email given",
            route: "/api/users/",
            requestType: "DELETE",
            required: "user token"
        });
    }

    User.remove({ uid })
        .exec()
        .then(result => {
            return res.status(201).json({
                message: 'User deleted',
                result,
                route: "/api/users/",
                requestType: "DELETE",
                required: "user token"
            });
        })
        .catch(error => {
            return res.status(500).json({
                error,
                message: "Error during removing of user",
                route: "/api/users/",
                requestType: "DELETE",
                required: "user token"
            });
        });
});

/**
 * admin function to delete user
 */
router.delete("/:id", (req, res, next) => { //admin route
    var uid = req.params.id;

    if (mongoose.isValidObjectId(uid)) {
        User.remove({ uid: uid })
            .exec()
            .then(result => {
                return res.status(201).json({
                    message: 'User deleted',
                    result,
                    route: "/api/users/:id",
                    requestType: "DELETE",
                    required: "user token"
                });
            })
            .catch(error => {
                return res.status(500).json({
                    error,
                    message: 'Failed to delete user',
                    route: "/api/users/:id",
                    requestType: "DELETE",
                    required: "uid"
                });
            });
    } else {
        return res.status(404).json({
            message: 'Invalid Id',
            route: "/api/users/:id",
            requestType: "DELETE",
            required: "uid"
        })
    }
});


module.exports = router;