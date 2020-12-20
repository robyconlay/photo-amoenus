// schema model for favourite locations

const mongoose = require('mongoose');

const favouriteSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId, //id of user
    favourites: [mongoose.Schema.Types.ObjectId]
});

module.exports = mongoose.model('Favourites', favouriteSchema);