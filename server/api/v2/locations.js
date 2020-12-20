const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require('fs');
const path = require('path');

const authentication = require('./middleware/authentication.js');

/**
 * Gestione upload immagini
 */
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/JPG') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});


const Location = require('./models/locationScheme');
const Image = require('./models/imageScheme');

/**
 *Show all locations in database
 */
router.get('/', (req, res, next) => {

    var url_string = req.protocol + "://" + req.get('host') + req.originalUrl;
    var url = new URL(url_string);

    //FILTRI
    const category = url.searchParams.get('category');
    const city = url.searchParams.get('city');
    const raggiungibilita = url.searchParams.get('raggiungibilita');

    //ORDINAMENTO
    const ordinamento = url.searchParams.get('order');

    console.log("Ecco l'elenco dei luoghi");
    Location.find()
        .sort(ordinamento)
        .byCategory(category)
        .byCity(city)
        .byRagg(raggiungibilita)
        .select('_id name city likes ')
        .exec()
        .then(docs => {
            console.log(docs);
            res.status(200).json({
                count: docs.length,
                locations: docs.map(doc => {
                    return {
                        _id: doc._id,
                        name: doc.name,
                        city: doc.city,
                        likes: doc.likes,
                        get: {
                            type: 'GET',
                            url: 'http://localhost:' + process.env.PORT + '/locations/' + doc._id
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
})
    ;

/**
 *Show one location
 */
router.get('/:locationId', (req, res, next) => {
    const idLoc = req.params.locationId;
    if (idLoc != null) {
        Location.findById(idLoc)
            .select('_id name address city description category raggiungibilita locationImage photoDesc hour date likes')
            .exec()
            .then(doc => {
                if (doc) {
                    Image.findById(doc.locationImage)
                        .exec()
                        .then(result => {
                            res.status(200).send({
                                location: doc,
                                file: result
                            });
                        })
                        .catch(errore => {
                            console.log(errore);
                            res.status(500).json({
                                error: errore
                            });
                        });
                } else {
                    console.log('Non è stata trovata location con questo ID');
                    res.status(404).json({
                        message: 'No valid entry'
                    });
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
    }
});

/**
 *Add a location to database
 */
router.post('/', authentication, upload.single('locationImage'), (req, res, next) => {
    console.log(req.file);

    console.log('POST locations/' + req.body.name + ' ' + req.body.description);
    console.log(typeof (req.body.raggiungibilita.split(',')));


    const obj = {
        _id: new mongoose.Types.ObjectId(),
        img: {
            data: req.file.buffer,
            contentType: 'image/png' || 'image/jpeg' || 'image/jpg' || 'image/JPG'

        }
    }
    Image.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        } else {
            console.log(item);
            item.save();
        }
    });


    const location = new Location({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name.toLowerCase(),
        address: req.body.address.toLowerCase(),
        city: req.body.city.toLowerCase(),
        description: req.body.description.toLowerCase(),
        category: req.body.category.toLowerCase(),
        raggiungibilita: req.body.raggiungibilita.toLowerCase().split(','),
        locationImage: obj._id,
        photoDesc: req.body.photoDesc.toLowerCase(),
        hour: req.body.hour.toLowerCase(),
        date: req.body.date.toLowerCase(),
        likes: 0
    });

    location
        .save()
        .then(result => {
            console.log(result);
            res.status(201).location('/location/' + result._id).json({
                message: 'Location created',
                createdLocation: {
                    _id: result._id,
                    name: result.name
                },
                get: {
                    type: 'GET',
                    url: 'http://localhost:' + process.env.PORT + '/locations/' + result._id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

/**
 * Modify a location in the database
 */
router.patch('/:locationId', (req, res) => {
    const id = req.params.locationId;
    console.log(id);
    console.log(req.body);
    const updateOps = {};

    try {
        for (const ops of req.body) {
            updateOps[ops.propName] = ops.value;
        }
    } catch {

    }

    console.log(updateOps);
    if (id != null) {
        //add function check for valid id
        Location.findById(id)
            .update({ _id: id }, { $set: updateOps })
            .exec()
            .then(result => {
                console.log(result);
                res.status(200).json(result);
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
    } else {
        res.status(500).json({
            message: 'No valid Id'
        });
    }
});

/**
 *Delete a location in database
 */
router.delete('/:locationId', (req, res, next) => {
    const id = req.params.locationId;

    Location.findById(id)
        .exec()
        .then(result => {
            Image.remove({ _id: result.locationImage })
                .exec()
                .then(risultato => {
                    Location.remove({ _id: id })
                        .exec()
                        .then(result => {
                            res.status(200).json({
                                message: 'Location and image deleted',
                            });
                        })
                        .catch(err => {
                            console.log("Location");
                            console.log(err);
                            res.status(500).json({
                                error: err
                            });
                        });
                })
                .catch(err => {
                    console.log("Immagine");
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
        })
        .catch(err => {
            console.log("ID Location inesistente");
            res.status(404).json({
                error: err
            });
        });
});

module.exports = router;
