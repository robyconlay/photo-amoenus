const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");


const User = require("./models/userScheme");

router.get('/', (req, res) => {
    User.find()
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

router.post('/signup', (req, res, next) => {
    var id;
    if(req.body._id == null){
        id = new mongoose.Types.ObjectId;
    } else {
        id = req.body._id;
    }
    User.findOne({email: req.body.email})
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
                        username: req.body.username,
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
    if(req.body.email == ''){
        return res.status(500).json({
            message: 'No email sent'
        })
    }
    if(req.body.password == ''){
        return res.status(500).json({
            message: 'No password sent' 
        })
    }
    User.findOne({email: req.body.email})     
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
                        token: token
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

router.delete("/:id", (req, res, next) => {
    userId = req.params.id;
    if(userId != null){
        User.remove({_id: userId})
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
