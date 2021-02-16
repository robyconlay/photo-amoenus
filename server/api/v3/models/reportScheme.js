//schema model for report table

const mongoose = require('mongoose');

const reportSchema = mongoose.Schema({
    reportID: {
        type: mongoose.ObjectId,
        unique: true,
        required: true
    },
    uid: {
        type: mongoose.ObjectId,
        required: true
    },
    email: {
        type: String,
        index: true,
        required: true
    },
    reportType: {
        type: String,
        required: true
    },
    text: {
        type: String
    },
    id_picture: {
        type: String
    },
    reviewed: {
        type: Boolean,
        default: false
    },
    outcome: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        required: true,
        immutable: true
    },

});

module.exports = mongoose.model('Report', reportSchema);