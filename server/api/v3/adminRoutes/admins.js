//libraries
const express = require('express');
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const cookie = require('cookie');
// const sanitize = require('mongo-sanitize');

//database schemas
const adminAuth = require('./middleware/authentication.js');
const Admin = require("../models/adminScheme");

const router = express.Router();


router.post('/create', adminAuth, (req, res) => {
    var { adminName, password, privilege } = req.body;
    email = sanitize(email);

    Admin.findOne({ email })
        .exec()
        .then(admin => {
            if (admin) {
                return res.status(409).json({
                    error,
                    route: "/api/admin/admins/create/",
                    requestType: "POST",
                    message: "This email is already registered"
                });
            }
            bcryptjs.hash(password, 10, (error, hash) => {
                if (error) {
                    return res.status(500).json({
                        error,
                        route: "/api/admin/admins/create/",
                        requestType: "POST",
                        message: "Error creating admin"
                    });
                } else {
                    const admin = new Admin({
                        aid: new mongoose.Types.ObjectId(),
                        adminName,
                        email,
                        password: hash,
                        createdAt: new Date()
                    });
                    admin.save()
                        .then(result => {
                            const token = jwt.sign({
                                email: admin.email,
                                aid: admin.aid
                            },
                                process.env.JWT_KEY, {
                                expiresIn: "1h"
                            });
                            res.setHeader('Set-Cookie', cookie.serialize('token', token)); //maxage?
                            res.setHeader('Set-Cookie', cookie.serialize('aid', admin.aid));
                            res.status(201).json({
                                message: 'Admin created',
                                result,
                                route: "/api/admin/admins/create/",
                                requestType: "POST"
                            });
                        })
                        .catch(error => {
                            return res.status(500).json({
                                error,
                                route: "/api/admin/admins/create/",
                                requestType: "POST",
                                message: "Error creating admin"
                            });
                        });
                }
            });
        })
});

router.post("/login", (req, res, next) => {
    var { email, password } = req.body;
    var email = sanitize(email);

    if (!email || !password || email == "" || password == "") {
        return res.status(500).json({
            message: 'No email or password given',
            route: "/api/admin/admins/login",
            requestType: "POST"
        })
    }
    User.findOne({ email })
        .exec()
        .then(admin => {
            if (!admin) {
                res.status(500).json({
                    message: "Admin with this email not found",
                    route: "/api/admin/admins/login",
                    requestType: "POST"
                })
            } else {
                bcryptjs.compare(password, admin.password, (error, result) => {
                    if (error) {
                        return res.status(401).json({
                            error,
                            message: "Auth failed",
                            route: "/api/admin/admins/login",
                            requestType: "POST"
                        });
                    }
                    if (result) {
                        const token = jwt.sign({
                            email: admin.email,
                            aid: admin.aid
                        },
                            process.env.JWT_KEY, {
                            expiresIn: "1h"
                        });
                        res.setHeader('Set-Cookie', cookie.serialize('token', token)); //maxage?
                        res.setHeader('Set-Cookie', cookie.serialize('aid', admin.aid));
                        return res.status(200).json({
                            result,
                            message: "Auth successful",
                            token,
                            aid: admin.aid,
                            route: "/api/admin/admins/login",
                            requestType: "POST"
                        });
                    }
                    return res.status(401).json({
                        message: "Auth failed",
                        route: "/api/admin/admins/login",
                        requestType: "POST"
                    });
                });
            }
        })
        .catch(error => {
            return res.status(401).json({
                error,
                message: 'Not exists user with this email',
                route: "/api/admin/admins/login",
                requestType: "POST"
            });
        });
});

/**
 * api to be used from a admin to delete user's account
 */
router.delete("/", adminAuth, (req, res, next) => { //needs to cascade delete everything else related to this account
    var email = sanitize(req.body.email);

    if (!email || email == "") {
        return res.status(500).json({
            message: "No email given",
            route: "/api/admin/admins",
            requestType: "DELETE"
        });
    }

    Admin.remove({ email })
        .exec()
        .then(result => {
            return res.status(201).json({
                message: 'Admin deleted',
                result,
                route: "/api/admin/admins",
                requestType: "DELETE"
            });
        })
        .catch(error => {
            return res.status(500).json({
                error,
                message: "Error during removing of admin",
                route: "/api/admin/admins",
                requestType: "DELETE"
            });
        });
});

module.exports = router;