const mongoose = require('mongoose');

const imageSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    img: {
        data : Buffer,
        contentType: String
    }
});

module.exports = mongoose.model('Image', imageSchema);