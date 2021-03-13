const jwt = require('jsonwebtoken');
const express = require('express');
const mongoose = require('mongoose');
const url = require('url');

const User = require("../../models/userScheme");

module.exports = (req, res, next) => {
    try {
        let token;
        let uid;
        try {
            token = req.signedCookie('token');
            uid = req.signedCookie('uid');
        } catch (error) {
            return res.status(401).json({
                message: 'Auth failed',
                description: "No token or uid cookie"
            });
        }

        // const token = req.headers.authorization.split(" ")[1];
        // const uid = req.body.uid;

        const decrypted = jwt.verify(token, process.env.JWT_KEY);

        User.findOne({ uid })
            .exec()
            .then(user => {
                if (!user.active) {
                    // return res.redirect(401, url.format({
                    //     pathname: '/error',
                    //     query: {
                    //         verified: user.active
                    //     }
                    // }));
                    return res.status(401).json({
                        message: 'Email is not verified',
                        query: {
                            verified: user.active
                        }
                    })
                }
            })
            .catch(error => {
                return res.status(500).json({
                    error
                });
            });

        decrypted.uid = uid;
        req.userData = decrypted;
        next();

    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed',
            error,
            description: "Invalid token"
        });
    }

};