const express = require('express');
const mongoose = require("mongoose");
const multer = require("multer");
const sanitize = require('mongo-sanitize');
// const firebase = require('firebase');
// require('firebase/storage');
const fs = require('fs');
const path = require('path');

//database schemas
const userAuth = require('./middleware/authentication.js');
const Location = require('./models/locationScheme');
const Image = require('./models/imageScheme');

const router = express.Router();

/**
 * Image upload manager with multer package
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



/**
 *Show all locations in database
 */
router.get('/', (req, res, next) => {

    var url_string = req.protocol + "://" + req.get('host') + req.originalUrl;
    var url = new URL(url_string);

    //FILTRI
    const category = sanitize(url.searchParams.get('category'));
    const city = sanitize(url.searchParams.get('city'));
    const accessibility = sanitize(url.searchParams.get('accessibility'));

    //ORDINAMENTO
    const ordinamento = sanitize(url.searchParams.get('order'));

    Location.find()
        .sort(ordinamento)
        .byCategory(category)
        .byCity(city)
        .byAccess(accessibility)
        .select('locId name city likes ') //all ?
        .exec()
        .then(locations => {
            res.status(200).json({
                locations,
                route: "api/locations/",
                type: "GET",
                message: "success retrieval of locations"
            })
        })
        .catch(error => {
            res.status(404).json({
                error,
                route: "api/locations/",
                type: "GET",
                message: "failure retrieval of locations"
            });
        });
});

/**
 *Show one location
 */
router.get('/:id', (req, res, next) => {
    const locId = sanitize(req.params.id);

    if (locId && mongoose.isValidObjectId(locId)) {
        Location.findById(locId)
            .select('locId name address city slug description category accessibility locationImage photoDesc likes')
            .exec()
            .then(data => {
                if (!data) {
                    return res.status(404).json({
                        message: 'No valid entry',
                        route: "api/locations/:id",
                        type: "GET",
                        message: `failure retrieval of location with id: ${id}`
                    });
                }
                Image.findById(data.locationImage)
                    .exec()
                    .then(result => {
                        return res.status(200).send({
                            location: data,
                            file: result,
                            route: "api/locations/:id",
                            type: "GET",
                            message: `success retrieval of location with id: ${locId}`
                        });
                    })
                    .catch(error => {
                        return res.status(500).json({
                            error,
                            route: "api/locations/:id",
                            type: "GET",
                            message: `failure retrieval of location with id: ${locId}`
                        });
                    });
            })
            .catch(error => {
                return res.status(500).json({
                    error,
                    route: "api/locations/:id",
                    type: "GET",
                    message: `failure retrieval of location with id: ${id}`
                });
            });
    } else {
        return res.status(500).json({
            route: "api/locations/:id",
            type: "GET",
            message: `failure retrieval of location with id: ${id}`
        });
    }
});

/**
 *Add a location to database
 */
router.post('/', userAuth, upload.single('locationImage'), async(req, res, next) => {
    // Set the configuration for your app
    // TODO: Replace with your app's config object
    // const firebaseConfig = {
    //     apiKey: process.env.apiKey,
    //     authDomain: process.env.authDomain,
    //     projectId: process.env.projectId,
    //     storageBucket: process.env.storageBucket,
    //     messagingSenderId: process.env.messagingSenderId,
    //     appId: process.env.appId,
    //     measurementId: process.env.measurementId
    // };
    // firebase.initializeApp(firebaseConfig);

    // // Get a reference to the storage service, which is used to create references in your storage bucket
    // var storageRef = firebase.storage().ref();

    // console.log(req.file); //need 

    //Funzione per convertire il buffer dell'immagine in stringa base64
    function toBase64(arr) {
        arr = new Uint8Array(arr);
        return btoa(
            arr.reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
    }
    const buffer = toBase64(req.file.buffer);
    const type = res.file.type;


    var file = req.file;
    var filename = new Date().toISOString() + file.name;
    // Create the file metadata
    var metadata = {
        contentType: 'image/jpeg'
    };
    // storageRef.child('images/' + filename).put(file, metadata).then(function(snapshot) {
    //     console.log('uploaded a blob or file');
    // });

    var { name, address, city, category, description, category, accessibility, locationImage, photoDesc } = req.body;

    if (!req.body || !name || !address || !city || !category) {
        return res.status(500).json({
            message: `Could not create location`,
            route: '/api/location/',
            requestType: 'POST',
            required: "user token, locName, locAddress, locCity, locCategor",
            optional: "locDescription, locAccessibility, locationImage, photoDesc",
            description: 'Could not create location because not all necessary information was given'
        });
    }

    let slug = (req.body.name + req.body.address + req.body.city).replace(" ", "-");
    let uid = req.userData.uid;
    if (!uid || !mongoose.isValidObjectId(uid)) {
        return res.status(500).json({
            message: `Could not create location`,
            route: '/api/location/',
            requestType: 'POST',
            required: "user token, locName, locAddress, locCity, locCategor",
            optional: "locDescription, locAccessibility, locationImage, photoDesc",
            description: 'Could not create location because the user is missing'
        });
    }

    const location = new Location({
        locId: new mongoose.Types.ObjectId(),
        name: sanitize(name),
        address: sanitize(address),
        city: sanitize(city),
        slug: sanitize(slug),
        description: sanitize(description),
        category: sanitize(category),
        accessibility: sanitize(accessibility.split(',')),
        locationImage: filename,
        photoDesc: sanitize(photoDesc),
        createdByUid: uid, //check validity
        createdAt: new Date()
            // updatedAt: null
    });


    //check that location is not yet in database
    await Location.findOne({ slug })
        .then(result => {
            if (result) {
                return res.status(409).json({
                    message: `Location already exists`,
                    route: '/api/location/',
                    requestType: 'POST',
                    required: "user token, locName, locAddress, locCity, locCategor",
                    optional: "locDescription, locAccessibility, locationImage, photoDesc",
                    description: 'Could not create location because location with same name already exists'
                });
            }
        }).catch(error => {
            return res.status(500).json({
                error,
                message: `Error during creation of location`,
                route: '/api/location/',
                requestType: 'POST',
                required: "user token, locName, locAddress, locCity, locCategor",
                optional: "locDescription, locAccessibility, locationImage, photoDesc",
                description: 'An error occured while creating the location'
            });
        });

    //save location in db
    location
        .save()
        .then(result => {
            return res.status(201).location('/location/' + result.locId).json({
                result,
                locationURL: `/location/${result.locId}`,
                message: 'Location created successfully',
                route: '/api/location/',
                requestType: 'POST',
                required: "user token, locName, locAddress, locCity, locCategor",
                optional: "locDescription, locAccessibility, locationImage, photoDesc",
                description: 'The locations was created'
            });
        })
        .catch(error => {
            return res.status(500).json({
                error,
                message: `Error during creation of location`,
                route: '/api/location/',
                requestType: 'POST',
                required: "user token, locName, locAddress, locCity, locCategor",
                optional: "locDescription, locAccessibility, locationImage, photoDesc",
                description: 'An error occured while creating the location'
            });
        });
});

/**
 * Modify a location in the database
 */
router.patch('/:id', (req, res) => {
    const locId = sanitize(req.params.id);

    if (!locId || !mongoose.isValidObjectId(locId)) {
        return res.status(500).json({
            message: `Error during fetching of location`,
            route: '/api/location/:id',
            requestType: 'PATCH',
            required: "locID",
            description: `The given id is undefined or invalid: ${locId}`
        });
    }
    const updateOps = { updatedAt: new Date() };

    try {
        for (const ops of req.body) {
            updateOps[ops.propName] = sanitize(ops.value);
        }
    } catch (error) {
        return res.status(500).json({
            error,
            message: `Error during fetching of location`,
            route: '/api/location/:id',
            requestType: 'PATCH',
            required: "locID",
            description: `An error occured while updating the location with id ${locId}`
        });
    }

    Location.findById(locId)
        .update({ locId }, { $set: updateOps })
        .exec()
        .then(result => {
            return res.status(200).json({
                result,
                message: 'Location updated successfully',
                route: '/api/location/:id',
                requestType: 'PATCH',
                required: "locID",
                description: 'The locations was updated'
            });
        })
        .catch(error => {
            return res.status(500).json({
                error,
                message: `Error updating location`,
                route: '/api/location/:id',
                requestType: 'PATCH',
                required: "locID",
                description: `An error occured while updating the location with id ${locId}`
            });
        });
});

/**
 *Delete a location in database
 */
router.delete('/:id', userAuth, (req, res, next) => {
    const locId = sanitize(req.params.id);

    if (!locId || !mongoose.isValidObjectId(locId)) {
        return res.status(500).json({
            message: `Error during deletion of location`,
            route: '/api/location/:id',
            requestType: 'DELETE',
            required: "locID, user token",
            description: `The given id is undefined or invalid: ${locId}`
        });
    }

    //improve
    Location.findById(locId)
        .exec()
        .then(async(result) => {
            if (!result) {
                return res.status(404).json({
                    error,
                    message: `Location to be deleting was not found`,
                    route: '/api/location/:id',
                    requestType: 'DELETE',
                    required: "locID, user token",
                    description: `An error occured while deleting the location with id ${locId}`
                });
            }
            await Image.remove({ locId: result.locationImage })
                .exec()
                .catch(error => {
                    return res.status(500).json({
                        error,
                        message: `Error deleting location`,
                        route: '/api/location/:id',
                        requestType: 'DELETE',
                        required: "locID, user token",
                        description: `An error occured while deleting the location with id ${locId}`
                    });
                });
            Location.remove({ locId })
                .exec()
                .then(() => {
                    return res.status(200).json({
                        message: 'Location and image deleted',
                        route: '/api/location/:id',
                        requestType: 'DELETE',
                        required: "locID, user token",
                        description: `Location with id: ${locId} deleted successfully`
                    });
                })
                .catch(error => {
                    return res.status(500).json({
                        error,
                        message: `Error deleting location`,
                        route: '/api/location/:id',
                        requestType: 'DELETE',
                        required: "locID, user token",
                        description: `An error occured while deleting the location with id ${locId}`
                    });
                });
        })
        .catch(error => {
            return res.status(500).json({
                error,
                message: `Error deleting location`,
                route: '/api/location/:id',
                requestType: 'DELETE',
                required: "locID, user token",
                description: `An error occured while deleting the location with id ${locId}`
            });
        });
});

module.exports = router;