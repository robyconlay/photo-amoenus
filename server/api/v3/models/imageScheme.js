const mongoose = require('mongoose');

const imageSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    // location_id: mongoose.Schema.Types.ObjectId,
    img: {
        id: mongoose.Schema.Types.ObjectId,
        data: Buffer,
        contentType: String
    }
});

module.exports = mongoose.model('Image', imageSchema);