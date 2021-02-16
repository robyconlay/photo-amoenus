// schema model for favourite locations

const mongoose = require('mongoose');

const favouriteSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId, //id of user
    favourites_ids: [mongoose.Schema.Types.ObjectId],
    createdAt: Date,
    updatedAt: Date
});

module.exports = mongoose.model('Favourites', favouriteSchema);