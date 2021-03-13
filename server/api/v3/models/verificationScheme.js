const mongoose = require('mongoose');

const verificationSchema = mongoose.Schema({
    uid: {
        type: mongoose.ObjectId,
        unique: true,
        required: true
    },
    verificationCode: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        immutable: true
    },
    expired: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('verification', verificationSchema);