const express = require('express');
const mongoose = require('mongoose');
const multer = require("multer");

const authentication = require('./middleware/authentication.js');
const Report = require("./models/reportScheme");

const router = express.Router();

/**
 * 
 */
router.get('/', (req, res, next) => {
    console.log("Ecco l'elenco dei reports");

    Report.find()
        .exec()
        .then(docs => {
            console.log(docs);
            res.status(200).json({
                count: docs.length,
                reports: docs.map(doc => {
                    return {
                        _id: doc.id,
                        email: doc.email,
                        text: doc.text,
                        id_picture: doc.id_picture,
                        get: {
                            type: 'GET',
                            url: 'http://localhost:' + process.env.PORT + '/checkReports/' + doc._id
                        }
                    }
                })
            })
        })
        .catch(err => {
            console.log(err);
            res.status(404).json({
                error: err
            });
        });
});

/**
 *Show one report 
 */
router.get('/:repId', (req, res, next) => {
    const repId = req.params.repId;
    console.log("RepID: " + repId);
    Report.findById(repId)
        .select('_id email text id_picture')
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json({
                    report: doc
                });
            } else {
                console.log('Non è stata trovato report con questo ID');
                res.status(404).json({
                    message: 'Valid entry but no locations with this ID'
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err,
                message: 'No valid ID entry'
            });
        });
});

/**
 * 
 */
router.post('/', authentication, (req, res, next) => {
    console.log(req.userData.email);
    const report = new Report({
        _id: new mongoose.Types.ObjectId(),
        email: req.userData.email,
        text: req.body.report,
        id_picture: req.body.id_picture
    });
    if ((report.text == undefined) || (report.id_picture == undefined)) {
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


/**
 * 
 */
//delete report


module.exports = router;
