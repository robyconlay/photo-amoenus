const jwt = require('jsonwebtoken');
const express = require('express');
const mongoose = require('mongoose');
const User = require("../models/userScheme");


module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decrypted = jwt.verify(token, process.env.JWT_KEY);

        decrypted.uid = req.body.uid;
        req.userData = decrypted;
        next();

    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed'
        });
    }

};
