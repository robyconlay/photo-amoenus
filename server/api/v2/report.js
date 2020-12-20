const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authentication = require('./middleware/authentication.js');
const Report = require("./models/reportScheme");

router.post('/', authentication, (req, res, next) => {
    console.log(req.userData.email);
    const report = new Report({
        _id: new mongoose.Types.ObjectId(),
        email: req.userData.email,
        text: req.body.report,
        id_picture: req.body.id_picture
    });
    if((report.text == undefined) || (report.id_picture == undefined)){
        return res.status(500).json({
            message: 'No valid report text or picture id. Report creation FAILED'
        })
    }
    report
    .save()
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Report created'
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: err
        });
     });


});

module.exports = router;
