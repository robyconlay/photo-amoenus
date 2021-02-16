//schema model for logs table

const mongoose = require('mongoose');

const logsSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    route: String,
    type: String,
    uid: mongoose.Schema.Types.ObjectId,
    time: String,
    isAdmin: Boolean,
    userToken: String
});

module.exports = mongoose.model('logs', logsSchema);