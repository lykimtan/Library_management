const mongoose = require('mongoose');

const nxbSchema = new mongoose.Schema({
    tennxb: {type: String, required: true},
    diachi: String,
})

module.exports = mongoose.model('NXB', nxbSchema);