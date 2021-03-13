//schema model for admin table
const mongoose = require('mongoose');

const adminSchema = mongoose.Schema({
    aid: {
        type: mongoose.ObjectId,
        unique: true
            // index: true
    },
    adminName: {
        type: String
    },
    password: { //hashed
        type: String
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

module.exports = mongoose.model('admin', adminSchema);