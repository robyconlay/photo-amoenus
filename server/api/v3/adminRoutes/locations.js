const express = require('express');
const mongoose = require("mongoose");
const multer = require("multer");
const sanitize = require('mongo-sanitize');
// const firebase = require('firebase');
// require('firebase/storage');
const fs = require('fs');
const path = require('path');

//database schemas
const adminAuth = require('./middleware/authentication.js');
const Location = require('../models/locationScheme');
const Image = require('../models/imageScheme');

const router = express.Router();

/**
 *Show all locations in database
 */
router.get('/', adminAuth, (req, res, next) => {

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
router.get('/:id', adminAuth, (req, res, next) => {
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
 * Modify a location in the database
 */
router.patch('/:id', adminAuth, (req, res) => {
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
router.delete('/:id', adminAuth, (req, res, next) => {
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