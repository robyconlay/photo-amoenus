const jwt = require('jsonwebtoken');
const express = require('express');
const mongoose = require('mongoose');
const Admin = require("../../models/adminScheme");

// to do
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decrypted = jwt.verify(token, process.env.JWT_KEY);

        var aid = req.body.aid;
        Admin.findOne(aid)
            .then(admin => {
                if (!admin) {
                    return res.status(401).json({
                        message: 'Auth failed'
                    });
                }
            })
            .catch(error => {
                return res.status(500).json({
                    error,
                    message: "Error during auth"
                });
            });

        decrypted.aid = aid;
        req.userData = decrypted;
        next();

    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed'
        });
    }

};