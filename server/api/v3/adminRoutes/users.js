//libraries
const express = require('express');
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const cookie = require('cookie');

//database schemas
const adminAuth = require('./middleware/authentication.js');
const User = require("../models/userScheme");
// const sanitize = require('mongo-sanitize');

const router = express.Router();

/**
 * 
 */
router.get('/', adminAuth, (req, res) => {
    User.find()
        .select('uid email password')
        .exec()
        .then(users => {
            if (!users) {
                return res.status(200).json({
                    users,
                    message: 'Users retrieved successfully',
                    route: '/api/admin/users/',
                    requestType: 'GET',
                    description: `There are no users in database`
                });
            }
            return res.status(200).json({
                users,
                message: 'Users retrieved successfully',
                route: '/api/admin/users/',
                requestType: 'GET',
            });
        })
        .catch(error => {
            return res.status(500).json({
                error,
                message: 'Error retrieving users',
                route: '/api/admin/users/',
                requestType: 'GET'
            });
        });
});

/**
 * function for admin use only
 */
router.get('/:id', adminAuth, (req, res) => {
    var uid = req.params.id;

    if (!uid || !mongoose.isValidObjectId(uid)) {
        return res.status(400).json({
            message: 'Error retrieving user',
            route: '/api/admin/users/:id',
            requestType: 'GET',
            required: "user id",
            description: 'Invalid uid'
        });
    }

    User.findOne({ uid })
        .select('uid email password')
        .exec()
        .then(user => {
            if (!user) {
                return res.status(404).json({
                    message: 'User not found',
                    route: '/api/admin/users/:id',
                    requestType: 'GET',
                    required: "user id",
                    description: 'Invalid uid'
                });
            }
            return res.status(200).json({
                user,
                message: 'User retrieved successfully',
                route: '/api/admin/users/:id',
                requestType: 'GET',
                required: "user id"
            });
        })
        .catch(error => {
            return res.status(500).json({
                error,
                message: 'Error retrieving user',
                route: '/api/admin/users/:id',
                requestType: 'GET',
                required: "user id",
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
            route: "/api/admin/users/",
            requestType: "DELETE",
            required: "user token"
        });
    }

    User.remove({ email })
        .exec()
        .then(result => {
            return res.status(201).json({
                message: 'User deleted',
                result,
                route: "/api/admin/users/",
                requestType: "DELETE",
                required: "user token"
            });
        })
        .catch(error => {
            return res.status(500).json({
                error,
                message: "Error during removing of user",
                route: "/api/admin/users/",
                requestType: "DELETE",
                required: "user token"
            });
        });
});

/**
 * admin function to delete user
 */
router.delete("/:id", (req, res, next) => { //admin route
    var uid = sanitize(req.params.id);

    if (mongoose.isValidObjectId(uid)) {
        User.remove({ uid })
            .exec()
            .then(result => {
                return res.status(201).json({
                    message: 'User deleted',
                    result,
                    route: "/api/admin/users/:id",
                    requestType: "DELETE",
                    required: "user token"
                });
            })
            .catch(error => {
                return res.status(500).json({
                    error,
                    message: 'Failed to delete user',
                    route: "/api/admin/users/:id",
                    requestType: "DELETE",
                    required: "uid"
                });
            });
    } else {
        return res.status(404).json({
            message: 'Invalid Id',
            route: "/api/admin/users/:id",
            requestType: "DELETE",
            required: "uid"
        })
    }
});

/**
 * patch ???????????'
 */

module.exports = router;