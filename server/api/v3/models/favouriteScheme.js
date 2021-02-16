// schema model for favourite locations

const mongoose = require('mongoose');

const favouriteSchema = mongoose.Schema({
    uid: {
        type: mongoose.ObjectId,
        required: true,
        unique: true,
        index: true
    },
    favourites_ids: {
        type: [mongoose.ObjectId],
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

module.exports = mongoose.model('Favourites', favouriteSchema);