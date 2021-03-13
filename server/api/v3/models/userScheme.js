//schema model for user table

const mongoose = require('mongoose');

const accountSchema = mongoose.Schema({
    uid: {
        type: mongoose.ObjectId,
        unique: true
            // index: true
    },
    email: {
        type: String,
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password: { //hashed
        type: String
    },
    name: {
        type: String
    },
    surname: {
        type: String
    },
    active: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        required: true,
        immutable: true
    },
    updatedAt: {
        type: Date,
        required: false,
        default: null
    }
});

module.exports = mongoose.model('account', accountSchema);