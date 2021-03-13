//libraries
const express = require('express');
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const cookie = require('cookie');
const cookieParser = require('cookie-parser');
const cryptoRandomString = require('crypto-random-string');
const sanitize = require('mongo-sanitize');

const userAuth = require('./middleware/authentication.js');
//database schemas
const User = require("../models/userScheme");
const Verification = require("../models/verificationScheme");

const router = express.Router();

router.post('/signup', (req, res, next) => {
    var { email, password, name, surname } = req.body;
    email = sanitize(email);

    if (!email || !password || !name || !surname) {
        return res.status(400).json({
            message: 'Missing information',
            route: "/api/account/signup",
            requestType: "POST"
        });
    }

    User.findOne({ email })
        .exec()
        .then(user => {
            if (user) {
                return res.status(409).json({
                    error,
                    route: "/api/account/signup/",
                    requestType: "POST",
                    message: "This email is already registered"
                });
            }
            bcryptjs.hash(password, 10, (error, hash) => {
                if (error) {
                    return res.status(500).json({
                        error,
                        route: "/api/account/signup/",
                        requestType: "POST",
                        message: "Error creating user"
                    });
                } else {
                    const user = new User({
                        uid: new mongoose.Types.ObjectId(),
                        email,
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
                            res.cookie('token', token, { signed: true, maxAge: 60 * 60 });
                            res.cookie('uid', user.uid, { signed: true, maxAge: 60 * 60 });
                            
                            return res.status(201).json({
                                message: 'User created',
                                token,
                                result,
                                route: "/api/account/signup/",
                                requestType: "POST"
                            });
                        })
                        .catch(error => {
                            return res.status(500).json({
                                error,
                                route: "/api/account/signup/",
                                requestType: "POST",
                                message: "Error creating user"
                            });
                        });

                    // const verification = new Verification({
                    //     uid: user.uid,
                    //     verificationCode: cryptoRandomString({ length: 10, type: 'url-safe' }),
                    //     createdAt: new Date()
                    // });

                    // verification.save(); //handle

                    //send email
                }
            });
        })
});


router.post("/login", (req, res, next) => {
    var { email, password } = req.body;
    var email = sanitize(email);

    if (!email || !password || email == "" || password == "") {
        return res.status(400).json({
            message: 'No email or password given',
            route: "/api/account/login",
            requestType: "POST"
        });
    }
    User.findOne({ email })
        .exec()
        .then(user => {
            if (!user) {
                return res.status(500).json({
                    message: "User with this email not found",
                    route: "/api/account/login",
                    requestType: "POST"
                })
            } else {
                bcryptjs.compare(password, user.password, (error, result) => {
                    if (error) {
                        return res.status(401).json({
                            message: "Auth failed",
                            route: "/api/account/login",
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
                        });
                        res.cookie('token', token, { signed: true, maxAge: 60 * 60 });
                        res.cookie('uid', user.uid, { signed: true, maxAge: 60 * 60 });
                        // res.setHeader('Set-Cookie', cookie.serialize('token', token)); //maxage?
                        // res.setHeader('Set-Cookie', cookie.serialize('uid', user.uid));
                        return res.status(200).json({
                            message: "Auth successful",
                            token,
                            uid: user.uid,
                            route: "/api/account/login",
                            requestType: "POST"
                        });
                    }
                    return res.status(401).json({
                        message: "Auth failed",
                        route: "/api/account/login",
                        requestType: "POST"
                    });
                });
            }
        })
        .catch(error => {
            return res.status(401).json({
                error,
                message: 'Not exists user with this email',
                route: "/api/account/login",
                requestType: "POST"
            });
        });
});


router.post("/logout", userAuth, (req, res, next) => {
    res.cookie('token', "", { signed: true, maxAge: 0 });
    res.cookie('uid', "", { signed: true, maxAge: 0 });

    return res.status(200).json({
        message: "Logout successful",
        route: "/api/account/logout",
        requestType: "POST"
    });
});


/**
 * api to be used from a user to delete their account
 */
router.delete("/delete", userAuth, (req, res, next) => { //needs to cascade delete everything else related to this account
    var email = sanitize(req.userData.email);

    if (!email || email == "") {
        return res.status(500).json({
            message: "No email given",
            route: "/api/account/",
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
                route: "/api/account/",
                requestType: "DELETE",
                required: "user token"
            });
        })
        .catch(error => {
            return res.status(500).json({
                error,
                message: "Error during removing of user",
                route: "/api/account/",
                requestType: "DELETE",
                required: "user token"
            });
        });
});

module.exports = router;