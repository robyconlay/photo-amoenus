//schema model for report table

const mongoose = require('mongoose');

const reportSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: String,
    text: String,
    id_picture : String
});

module.exports = mongoose.model('Report', reportSchema);