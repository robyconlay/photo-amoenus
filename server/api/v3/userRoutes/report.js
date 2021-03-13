const express = require('express');
const mongoose = require('mongoose');
const multer = require("multer");

const userAuth = require('./middleware/authentication.js');
const Report = require("../models/reportScheme");

const router = express.Router();

/**
 * 
 */
router.get('/', (req, res, next) => { //admin route
    Report.find()
        .exec()
        .then(reports => {
            res.status(200).json({
                reports,
                count: reports.length,
                route: "/api/reports/",
                requestType: "GET"
            })
        })
        .catch(error => {
            res.status(404).json({
                error,
                route: "/api/reports/",
                requestType: "GET"
            });
        });
});

/**
 *Show one report 
 */
router.get('/:repId', (req, res, next) => { //admin route
    const repId = req.params.repId;

    Report.findById(repId)
        // .select('uid email text id_picture req')
        .exec()
        .then(report => {
            if (report) {
                return res.status(200).json({
                    report,
                    route: "/api/reports/",
                    requestType: "GET"
                });
            } else {
                return res.status(404).json({
                    message: 'Valid entry but no locations with this ID',
                    route: "/api/reports/",
                    requestType: "GET"
                });
            }
        })
        .catch(error => {
            return res.status(500).json({
                error,
                message: 'No valid ID entry',
                route: "/api/reports/",
                requestType: "GET"
            });
        });
});

/**
 * 
 */
router.post('/', userAuth, (req, res, next) => {
    const report = new Report({
        reportID: new mongoose.Types.ObjectId(),
        uid: req.userData.uid,
        email: req.userData.email,
        text: sanitize(req.body.report),
        id_picture: sanitize(req.body.id_picture)
    });
    if (!report.text || !report.id_picture) {
        return res.status(500).json({
            message: 'No valid report text or picture id. Report creation FAILED',
            route: "/api/reports/",
            requestType: "GET"
        })
    }
    report
        .save()
        .then(result => {
            res.status(201).json({
                message: 'Report created',
                result,
                route: "/api/reports/",
                requestType: "GET"
            });
        })
        .catch(error => {
            res.status(500).json({
                error,
                route: "/api/reports/",
                requestType: "GET"
            });
        });
});


/**
 * 
 */
//delete report


module.exports = router;